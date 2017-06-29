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

		// check if there is a py to compile
		r.db(dbName).table(tableName).changes({includeTypes: true}).run(conn, function(err, cursor) {
			if (err) throw err;
			cursor.each(function(err, row) {
				if (err) throw err;

				if(row.type === 'add' && row.new_val.status === "not compiled" && row.new_val.compiler === "py") {
					
					r.db(dbName).table(tableName).get(row.new_val.id)
						.update({status: "compiling"})
						.run(conn, function(err, res){
							if (err) throw err;
							// console.log('set status to "compiling"');
						});

					$workfolder = '/usr/src/compiler/temp/'+row.new_val.id+'/';
					var cmd = 'mkdir -p '+$workfolder+' && cd '+ $workfolder;
					// console.log(cmd);
					exec(cmd, function(error, stdout, stderr) {

						// save value in temp file
						// http://stackoverflow.com/questions/2496710/writing-files-in-node-js
						fs.writeFile('compile_me.py', row.new_val.code.input, function(err) {
							if(err) {
								return console.log(err);
							}
							// console.log("The file was saved!");

							// bash transcrypt
							var cmd = 'transcrypt -b -n compile_me.py';
							exec(cmd, function(error, stdout, stderr) {

								fs.readFile('__javascript__/compile_me.js', 'utf8', function (err, data) {
									// compile-error is not thrown, so need to check at the end of stdout if it is "Ready" -> successfully compiled
									if (err || stdout.slice(-6).slice(0,-1) != 'Ready') {
										update = {status: "compile error", compileMsg: stdout+stderr };
										console.log('set status to "compile error"');
									} else update = {status: "compiled", code: {compiled: data}, compileMsg: stdout+stderr };
									r.db(dbName).table(tableName).get(row.new_val.id)
										.update(update)
										.run(conn, function(err, res){
											if (err) throw err;
											console.log('set status to "compiled" and copied js to rethinkdb');
											exec('cd /usr/src/compiler/ && rm -r '+$workfolder, function(error, stdout, stderr) {});
										});
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
	console.log('Try to connect jsweet-compiler to DB');
	if (connectToDatabase() == false) {
		setTimeout(tryToConnect, 20000);
		console.log('No connection established. Try again in 20s');
	}
}

tryToConnect();