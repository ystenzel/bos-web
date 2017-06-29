var r = require('rethinkdb');
var fs = require('fs');
var exec = require('child_process').exec;

var dbHost = process.env.hasOwnProperty('DBHOST') ? process.env.DBHOST : 'rethinkdb';
var dbName = process.env.hasOwnProperty('DBNAME') ? process.env.DBNAME : 'development';
var tableName = 'compile';

function connectToDatabase() {
	r.connect({ host: dbHost, port: 28015 }, function(err, conn) {
		if(err) throw err;

		r.db(dbName).tableList().run(conn, function(err, response){
			if(response.indexOf(tableName) > -1) console.log('Connected to rethinkdb and found tables');
			else console.log('Unable to find tables in rethinkdb');
		});

		// check if there is a cpp to compile
		r.db(dbName).table(tableName).changes({includeTypes: true}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.each(function(err, row) {
				if (err) throw err;

				if(row.type === 'add' && row.new_val.status === "not compiled" && (row.new_val.compiler === "cpp" || row.new_val.compiler === "c")) {
					
					r.db(dbName).table(tableName).get(row.new_val.id)
						.update({status: "compiling"})
						.run(conn, function(err, res){
							if (err) throw err;
							// console.log('set status to "compiling"');
						});

					var compFiles;
					switch (row.new_val.compiler) {
						case "cpp":
							compFiles = {
								head: "comp-cpp/comp-head.cpp",
								foot: "comp-cpp/comp-foot.cpp",
								nrOfLinesHead: 146
							}
							break;
						case "c":
							compFiles = {
								head: "comp-c/comp-head.c",
								foot: "comp-c/comp-foot.c",
								nrOfLinesHead: 150
							}
							break;
						default:
							console.log('Error: Compiler not defined');
							return;
					}

					var workFolder = 'comp-temp/'+row.new_val.id+'/';
					exec('mkdir ' + workFolder, function(error, stdout, stderr) {

						// save value in temp.cpp file
						// http://stackoverflow.com/questions/2496710/writing-files-in-node-js
						fs.writeFile(workFolder+"comp-temp", row.new_val.code.input, function(err) {
							if(err) return console.log(err);
							// console.log("The file was saved!");

							// merge cpp with base-cpp
							// http://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js
							// var cmd = 'cat comp-head.cpp comp-temp comp-foot.cpp > compile-me.cpp;
							var cmd = 'cat '+compFiles.head+' '+workFolder+'comp-temp '+compFiles.foot+' > '+workFolder+'compile-me.'+row.new_val.compiler;
							exec(cmd, function(error, stdout, stderr) {

								// bash emcc compile
								var cmd = 'emcc '+workFolder+'compile-me.'+row.new_val.compiler+' -o '+workFolder+'compiled.js';
								// console.log(cmd);
								exec(cmd, function(error, stdout, stderr) {
										

									if (stderr != "") {
										// console.log(stderr);
										// strerr: "compile-me.cpp:146:6: error: [...]"
										// should be: "1:6: error: [...]"
										stderr = stderr.substring((workFolder+'compile-me.'+row.new_val.compiler).length + 1);
										var stderrArray = stderr.split(':');
										stderrArray[0] = (parseInt(stderrArray[0])-compFiles.nrOfLinesHead)+1;
										stderr = stderrArray.join(':');
										var update = {status: "compile error", compileMsg: stdout+stderr };
										r.db(dbName).table(tableName).get(row.new_val.id)
											.update(update)
											.run(conn, function(err, res){
												if (err) throw err;
												console.log('set status to "compile error"');
												exec('rm -r ' + workFolder, function(error, stdout, stderr) {});
											});
									} else {
										// write asm.js to rethinkdb
										fs.readFile(workFolder+'compiled.js', 'utf8', function (err, data) {
											if (err) throw err;
											r.db(dbName).table(tableName).get(row.new_val.id)
												.update({status: "compiled", code: {compiled: data}, compileMsg: stdout+stderr })
												.run(conn, function(err, res){
													if (err) throw err;
													console.log('set status to "compiled" and copied asm.js to rethinkdb');
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
	});
}

function tryToConnect() {
	// Try every 20s to connect to DB
	console.log('Try to connect emscripten-compiler to DB');
	if (connectToDatabase() == false) {
		setTimeout(tryToConnect, 20000);
		console.log('No connection established. Try again in 20s');
	}
}

tryToConnect();