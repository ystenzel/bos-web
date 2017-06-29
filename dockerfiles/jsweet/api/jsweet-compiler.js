var r = require('rethinkdb');
var fs = require('fs');
var exec = require('child_process').exec;
var cheerio = require('cheerio');

var dbHost = process.env.hasOwnProperty('DBHOST') ? process.env.DBHOST : 'rethinkdb';
var dbName = process.env.hasOwnProperty('DBNAME') ? process.env.DBNAME : 'development';
var tableName = 'compile';

function connectToDatabase() {
	// Setup Database
	r.connect({ host: dbHost, port: 28015 }, function(err, conn) {
		// if(err) throw err;
		if (err) return false;
		console.log('Connection established ...');
		
		r.db(dbName).tableList().run(conn, function(err, response){
			if(response.indexOf(tableName) > -1) console.log('Connected to rethinkdb and found tables');
			else {
				console.log('Unable to find table in rethinkdb');
				return false;
			}
		});

		// check if there is a java to compile
		r.db(dbName).table(tableName).changes({includeTypes: true}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.each(function(err, row) {
				if (err) throw err;

				if(row.type === 'add' && row.new_val.status === "not compiled" && row.new_val.compiler === "java") {
					
					// console.log('lets go!! '+row.new_val.id);
					r.db(dbName).table(tableName).get(row.new_val.id)
						.update({status: "compiling"})
						.run(conn, function(err, res){
							if (err) throw err;
							console.log('status was set to "compiling"');
						});

					var compFiles = {
						head: "comp-java/comp-head.java",
						foot: "comp-java/comp-foot.java"
					};

					var workFolder = 'comp-temp/'+row.new_val.id+'/';
					var cmd = 'mkdir -p ' + workFolder + 'src/main/java/ && cp -r comp-java/def '+workFolder+'src/main/java/';
					// console.log(cmd);
					exec(cmd, function(error, stdout, stderr) {
						
						fs.readFile('comp-java/pom.xml', 'utf8', function (err, data) {
							if (err) throw err;
							// xmlMode for case sensitive xml
							var $ = cheerio.load(data, {
								normalizeWhitespace: true,
								xmlMode: true});

							$('outDir').text(workFolder + 'target/js');
								
							fs.writeFile(workFolder + 'pom.xml', $.html(), function(err) {
								if(err) return console.log(err);
							});
						});


						// save value in temp file
						// http://stackoverflow.com/questions/2496710/writing-files-in-node-js
						fs.writeFile(workFolder+"comp-temp", row.new_val.code.input, function(err) {
							if(err) return console.log(err);
							// console.log("The file was saved!");

							// merge java with base-java
							// http://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
							// var cmd = 'cat comp-head.java comp-temp comp-foot.java > compile-me.java;
							var cmd = 'cat '+compFiles.head+' '+workFolder+'comp-temp '+compFiles.foot+' > '+workFolder+'src/main/java/CompileMe.'+row.new_val.compiler;
							exec(cmd, function(error, stdout, stderr) {

								// bash jsweet mvn
								var cmd = 'mvn -f '+workFolder+'pom.xml generate-sources';
								// console.log(cmd);
								exec(cmd, function(error, stdout, stderr) {

									if (stderr != "") var update = {status: "compile error", compileMsg: stdout+stderr };
									else {
										// write js to rethinkdb
										fs.readFile(workFolder+'target/js/CompileMe.js', 'utf8', function (err, data) {
											if (err) {
												update = {status: "compile error", compileMsg: stdout+stderr };
												console.log('set status to "compile error"');
												exec('rm -r ' + workFolder, function(error, stdout, stderr) {});
											} else update = {status: "compiled", code: {compiled: data}, compileMsg: stdout+stderr };
											// console.log(data);
											r.db(dbName).table(tableName).get(row.new_val.id)
												.update(update)
												.run(conn, function(err, res){
													if (err) throw err;
													console.log('set status to "compiled" and copied js to rethinkdb');
													exec('rm -r ' + workFolder, function(error, stdout, stderr) {});
												});
										});
									}

								});
							});
						});
					});

				} else {
					console.log("changes at table but nothing to compile");
				}
			});
		});

		return true;
	});
}

function tryToConnect() {
	// Try every 20s to connect to DB
	console.log('Try to connect jsweet-compiler to DB');
	if (connectToDatabase() == false) {
		setTimeout(tryToConnect, 20000);
		console.log('No connection established. Try again in 20s');
	}
}

tryToConnect();