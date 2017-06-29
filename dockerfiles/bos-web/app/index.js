var r = require('rethinkdb');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var dbHost = process.env.hasOwnProperty('DBHOST') ? process.env.DBHOST : 'rethinkdb';
var dbName = process.env.hasOwnProperty('DBNAME') ? process.env.DBNAME : 'development';
var port = process.env.hasOwnProperty('PORT') ? process.env.PORT : '4000';
var ip = process.env.hasOwnProperty('IP') ? process.env.IP : '0.0.0.0';

var connection = null;
// connect to database
r.connect({ host: dbHost, port: 28015 }, function(err, conn) {
	if(err) throw err;

	connection = conn;

	// create DB
	r.dbList().contains(dbName)
		.do(function(databaseExists) {
			return r.branch(
				databaseExists,
				{ dbs_created: 0 },
				r.dbCreate(dbName)
			);
		}).run(conn, function(err,res){
			if (err) throw err;
			if (res.dbs_created == 0) listenDB();
			else {
				// create Tables afterwards
				console.log('create tables');
				createTable('users','username');
				createTable('projects','uid');
				createTable('compile');
			}
		});

	
			
	console.log('new db connection');

	var ioBoS = io.of('/user');

	// socket stuff
	ioBoS.on('connection', function(socket){
		console.log('a user connected');
		socket.on('disconnect', function(){
			console.log('user disconnected');
			console.log(io.engine.clientsCount);
		});
		socket.on('document-update', function(msg){
			// console.log(msg);
			console.log('document-updated');

			var update = {
				code: msg.code,
				lastmodified: new Date().getTime(),
				uid: msg.user.id
			};

			r.db(dbName).table('projects').get(msg.projId)
				.update(update)
				.run(conn, function(err, res) {
					if (err) throw err;
					// console.log(JSON.stringify(res, null, 2));
				});
		});

		socket.on('compiler-update', function(msg){
			r.db(dbName).table('projects').get(msg.projId)
				.update(msg.update)
				.run(conn, function(err, res) {
					if (err) throw err;
				});
		});

		socket.on('caret-update', function(msg){
			console.log('caret-update');

			r.db(dbName).table('projects').get(msg.projId)
				.update(function(row){
					return row('coworkers').offsetsOf(function(x){
						return x('uid').eq(msg.coworker.uid)
					})(0)
					.do(function(index){
						return {
							coworkers: row('coworkers').changeAt(index,
								row('coworkers')(index).merge({caretPos: {line: msg.coworker.caretPos.line, ch: msg.coworker.caretPos.ch}})
								)
						}
					})
				})
				.run(conn, function(err, res) {
					if (err) throw err;
					console.log('db-update');
					// console.log(JSON.stringify(res, null, 2));
				});
		});

		socket.on('compile', function(msg){
			var compileTable = "compile";
			r.db(dbName).table(compileTable).insert({
				projId: msg.project.id,
				uid: msg.userid,
				version: msg.project.version,
				compiler: msg.project.compiler,
				status: "not compiled",
				code: {
					input: msg.project.code
				},
				timestamp: new Date().getTime()
				})
				.run(conn, function(err, res){
					if (err) throw err;
					console.log(res);
					console.log('copied to compile table');
				});
		});

		socket.on('loginRequest', function (msg) {
			var response = {success: 'failed'};
			r.db(dbName).table('users').getAll(
				msg.username,
				{index:'username'})
				.run(conn, function(err, cursor) {
					if (err) throw err;
					cursor.each(function(err, userReq) {
						if (err) throw err;
						if (userReq.secret == msg.secret) {
							response = {
								success: 'success',
								user: {
									id: userReq.id,
									name: userReq.username,
									email: userReq.email
								}
							}
						} else response = {success: 'wrong password'}
						ioBoS.emit('loginResponse',response);
					});
					
				});
		});

		socket.on('getProjectsOfUser', function (uid) {
			r.db(dbName).table('projects').getAll(uid,{index:'uid'}).run(conn, function (err, cursor) {
				if(err) throw err;
				cursor.each(function(err, res) {
					if(err) throw err;
					ioBoS.emit('returnProjectsOfUser',{name: res.name, id: res.id, compiler: res.compiler, lastmodified: res.lastmodified});
				});
			});
		});

		socket.on('projectRequest', function(projId){
			r.db(dbName).table('projects').get(projId).run(conn, function(err, res) {
				if (err) throw err;
				socket.emit('projectResponse',res);
			})
		});

		socket.on('projectCreate', function(msg) {
			var lastmodified = new Date().getTime();
			r.db(dbName).table('projects').insert({changes:[],code:"", compiler: 'js', coworkers:[], 
				lastmodified:lastmodified, name: msg.projName, options: [{public: false}],
				uid: msg.uid, version: '1.1'}).run(conn, function(err, res) {
					if (err) throw err;
					var id = res.generated_keys[0];
					r.db(dbName).table('projects').get(id).run(conn, function(err, res) {
						if (err) throw err;
						socket.emit('projectResponse',res);
					});
				});
		})

		socket.on('projectDelete', function (id) {
			r.db(dbName).table('projects').get(id).delete().run(conn, function(err, res){
				if (err) throw err;
				console.log('project deleted: '+id);
			});
		});

		socket.on('deleteCompiled', function (id) {
			r.db(dbName).table('compile').get(id).delete().run(conn, function(err, res){
				if (err) throw err;
				console.log('compile deleted: '+id);
			});
		});

	});

	// init stuff start
	var ioBoSinit = io.of('/init');
	ioBoSinit.on('connection', function(socket){
		console.log('a user connected');
		socket.on('disconnect', function(){
			console.log('user disconnected');
			console.log(io.engine.clientsCount);
		});
		socket.on('create-testdata', function(msg){
			console.log('create-testdata');

			r.db(dbName).table('users')
				.insert(msg.testuser)
				.run(conn, function(err, res) {
					if (err) throw err;
					var userId = res.generated_keys[0];
					for (var i = msg.testprojects.length - 1; i >= 0; i--) {
						var lastmodified = new Date().getTime();
						r.db(dbName).table('projects').insert({
							changes:[],
							code:msg.testprojects[i].code,
							compiler: msg.testprojects[i].compiler,
							coworkers:[], 
							lastmodified:lastmodified,
							name: msg.testprojects[i].name,
							options: [{public: false}],
							uid: userId,
							version: '1.1'}).run(conn, function(err, res) {
								if (err) throw err;
								var id = res.generated_keys[0];
								r.db(dbName).table('projects').get(id).run(conn, function(err, res) {
									if (err) throw err;
									socket.emit('create-testdata-response',res);
								});
							});
					}
				});
		});
	});
	// init stuff end


	function listenDB(){
		r.db(dbName).table('projects').changes().run(conn).then( function(cursor) {
			// if (err) throw err;
			console.log('cursor');
			cursor.each(function(err, row) {
				if (err) throw err;
				ioBoS.emit('docnew', row);
			});
		});

		r.db(dbName).table('compile').changes({includeTypes: true}).run(conn, function(err, cursor) {
			if (err) throw err;
			var c = 0;
			cursor.each(function(err, row) {
				if (err) throw err;
				if (row.type === "change" && row.new_val.status !== 'compiling') {
					console.log(row.new_val.id + "  " +c+" "+ row.type);
					c = c + 1;
					ioBoS.emit('compileFinish', row);
				}
			});
		});
	};


	var dbo = [];
	function checkDB(obj){
		dbo.push(obj);
		// for (var i = 0; i < dbo.length; i++) {
		// 	dbo[i]
		// }
		if (dbo.length > 4) listenDB();
		return false;
	}

	function createTable(tableName,secondIndex='') {
		console.log(tableName);
		r.db(dbName).tableList().run(conn, function(err, response){
			if(response.indexOf(tableName) < 0){
				// if table does not exist, create it...
				r.db(dbName).tableCreate(tableName).run(conn, function(err, res){
					if(err) throw err;
					console.log('create table '+tableName);
					console.log('index name '+secondIndex);
					checkDB({table:tableName});
					if (secondIndex != '') {
						console.log('create index '+secondIndex);
						r.db(dbName).table(tableName).indexCreate(secondIndex).run(conn, function(err,res){
							if(err) throw err;
							console.log(res);
							checkDB({index:secondIndex});
						})
					};
				});
			}
		});
	}
});


// Serve HTML
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.use('/bower_components', express.static('bower_components'));
app.use('/js', express.static('js'));



function createTableFuck(conn,dbName,tableName,secondIndex='') {
	console.log(tableName);
	r.db(dbName).tableList().run(conn, function(err, response){
		if(response.indexOf(tableName) < 0){
			// if table does not exist, create it...
			r.db(dbName).tableCreate(tableName).run(conn, function(err, res){
				if(err) throw err;
				console.log('create table '+tableName);
				console.log('index name '+secondIndex);
				if (secondIndex != '') {
					console.log('create index '+secondIndex);
					r.db(dbName).table(tableName).indexCreate(secondIndex).run(conn, function(err,res){
						if(err) throw err;
						console.log(res);
					})
				};
			});
		}
	});
}

// Setup Express Listener
http.listen(port, ip, function(){
  console.log('listening on:  ' + ip + ':' + port);
});
