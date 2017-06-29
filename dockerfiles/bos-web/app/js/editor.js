function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
var room = getParameterByName('room');
var user = getParameterByName('user');

var userObj;
var caret;
var projects = [];
var project = {id: ""};
var compiledCode = '';

document.getElementById("user-name").innerHTML = user;

// CodeMirror Editor
var cmEditor = CodeMirror.fromTextArea(document.getElementById("editor"), {
	lineNumbers: true,
	indentUnit: 4,
	mode: "js",
	theme: 'xq-dark'
});

// CodeMirror Log-Data
var cmCompileMsg = CodeMirror.fromTextArea(document.getElementById("compile-msg"), {
	lineNumbers: false,
	indentUnit: 4,
	readOnly: "nocursor",
	mode: "js",
	theme: 'xq-dark'
});

var socket = io('/user');

var availableCodeMirrorModes = {
	js: 'text/javascript',
	cpp: 'text/x-c++src',
	py: 'text/x-python',
	c: 'text/x-csrc',
	java: 'text/x-java'
}

function projectChanges(newProject = project) {
	project = newProject;
	// set button config depending on compiler
	if (project.compiler == 'js') {
		btn_run_enable(true);
		btn_compile_enable(false);
	}
	else {
		btn_compile_enable(true);
		if (compiledCode == undefined || compiledCode == '') btn_run_enable(false);
		else btn_run_enable(true);
	}
	// set compiler in option-select and set CodeMirror mode
	$('#compilerSelect').val(project.compiler);
	cmEditor.setOption('mode',availableCodeMirrorModes[project.compiler]);
}


// update database functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// push caret position to DB - important for collaborative implementation
function changeCaret(){
	var newCaret = {
		caretPos: {
			line: cmEditor.getCursor().line,
			ch: cmEditor.getCursor().ch
		},
		rights: "all",
		uid: userObj.id
	};
	if (JSON.stringify(newCaret) !== JSON.stringify(caret) ) {
		caret = newCaret;
		var msg = {
			coworker: caret,
			projId: project.id
		};
		socket.emit('caretUpdate',msg);
	}
}

// copy important project-data -> emit compile
function compile() {
	var msg = {
		userid: userObj.id,
		project: {
			id: project.id,
			version: project.version,
			compiler: project.compiler,
			code: cmEditor.getValue()
		}
	}
	socket.emit('compile',msg);
	compiledCode = '';
	compileProgressBar(35,'copile was sent');
}

// CodeMirror functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// different CodeMirror events may be interesting for collaborative implementation
cmEditor.on('keyup', function () {
	// console.log('keyup');
	changeCaret();
});
// cmEditor.on('cut', function () {
// 	// console.log('cut');
// 	changeCaret();
// });
// cmEditor.on('copy', function () {
// 	// console.log('copy');
// 	changeCaret();
// });
// cmEditor.on('paste', function () {
// 	// console.log('paste');
// 	changeCaret();
// });
cmEditor.on('mousedown', function () {
	// console.log('mousedown');
	changeCaret();
});

// action on CodeMirror Editor change -> emit documentUpdate
cmEditor.on('change', function (cm,changeObj) {
	// console.log(changeObj);
	if (changeObj.origin == "setValue") return;
	if (changeObj.text[0]=="" && changeObj.removed[0]=="" && changeObj.text.length+changeObj.removed.length <= 2) return;

	var msg = {
			projId: project.id,
			code: cmEditor.getValue(),
			user: userObj,

			id: room,
			change: {
				pos: {
					line: changeObj.from.line,
					ch: changeObj.from.ch
				},
				type: changeObj.origin,
				uid: userObj.id,
				time: new Date().getTime()
			}
		}
	if ((changeObj.text[0]+""+changeObj.removed[0]) == "") {
		msg.change.lines = changeObj.text.length+changeObj.removed.length-2;
	} else msg.change.char = changeObj.text[0]+""+changeObj.removed[0];
	socket.emit('documentUpdate',msg);
});

// // code may be usefull for collaborative implementation
// var msg_old;

// socket.on functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
socket.on('projectChange', function(msg){
	if (msg.new_val != null) {
		// code may be usefull for collaborative implementation
		// var l = msg.new_val.changes.length -1;
		// if(msg.new_val.id === project.id && msg.new_val.changes[l].uid != userObj.id) {
		// 	var current_pos = cmEditor.getCursor();
		// 	cmEditor.getDoc().setValue(msg.new_val.code);
		// 	// console.log(msg);
		// 	if (msg_old && msg_old.new_val.code == msg.new_val.code) {
		// 	} else {
		// 		if (current_pos.line >= msg.new_val.changes[l].pos.line && current_pos.ch >= msg.new_val.changes[l].pos.ch) {
		// 			// console.log("same line and before");
		// 			change_pos = getChangeChars(msg.new_val.changes[l]);
		// 			current_pos.ch += change_pos.ch;
		// 			current_pos.line += change_pos.line;
		// 		}
		// 	}
		// 	cmEditor.setCursor(current_pos);
		// 	msg_old = msg;
		// }

		// if(msg.new_val.id === project.id) {
		// 	for (var i = 0; i < msg.new_val.coworkers.length-1; i++) {
		// 		if (msg.new_val.coworkers[i].uid != userObj.id) {
		// 			var caretPos = cmEditor.charCoords(msg.new_val.coworkers[i].caretPos);
		// 			if (document.getElementById('_'+msg.new_val.coworkers[i].uid) == null) {
		// 				$('body').append('<div class="caret pulse" id="_'+msg.new_val.coworkers[i].uid+'"></div>');
		// 			} else $('div.caret#_'+msg.new_val.coworkers[i].uid).css({"left": caretPos.left+"px", "top": caretPos.top+"px"});
		// 		}
		// 	}
		// }

		if(msg.new_val.id === project.id && msg.new_val.uid != userObj.id) {
			var current_pos = cmEditor.getCursor();
			cmEditor.getDoc().setValue(msg.new_val.code);
		}

		// console.log(project.compiler);
		projectChanges(msg.new_val);
		project.changes = [];
	}

});

socket.on('compileFinish', function (msg) {
	// console.log(msg);
	if (compiledCode === '' &&
		msg.new_val != null &&
		msg.new_val.uid === userObj.id && 
		msg.new_val.projId === project.id) {
		if (msg.new_val.status === "compiled" && 
			msg.new_val.code.compiled !== undefined) {
			// console.log('load compiled');
			compiledCode = msg.new_val.code.compiled;
			if (msg.new_val.compileMsg !== '') cmCompileMsg.getDoc().setValue(msg.new_val.compileMsg);
			else cmCompileMsg.getDoc().setValue("compile successfully ...");
			btn_run_enable(true);
			// autorun after compile
			btn_run();
			socket.emit('compiledDelete',msg.new_val.id);
			compileProgressBar(100,'compile finished','bg-success');
		} else if (msg.new_val.status === "compile error") {
			// console.log('compile error');
			cmCompileMsg.getDoc().setValue(msg.new_val.compileMsg);
			btn_run_enable(false);
			socket.emit('compiledDelete',msg.new_val.id);
			compileProgressBar(100,'compile error','bg-danger');
		}
		
	}
})

socket.on('loginResponse', function(msg){
	console.log('Login response: '+msg.success);
	if (msg.success == 'success') {
		$('#user-name').html(msg.user.name);
		$('#user-id').html("("+msg.user.id+")");
		userObj = msg.user;
		$('#overlay').remove();
		$('#loginModal').modal('hide');
		socket.emit('getProjectsOfUser',userObj.id);
	}
});

socket.on('projectResponse', function(msg) {
	// console.log(msg);
	cmEditor.setValue(msg.code);
	projectChanges(msg);
	updateProjectList();
	$( "#projectSelect" ).val(msg.id);
});

socket.on('returnProjectsOfUser', function(msg) {
	var exists = false;
	projects.forEach(function(val,key){
		if (val.id == msg.id) exists = true;
	});
	if (!exists) projects.push(msg);	
	updateProjectList();
});

// // code may be usefull for collaborative implementation
// function getChangeChars(change){
// 	text = change.text;
// 	switch(change.type) {
// 		case '+input':
// 			return {ch: (change.char === undefined) ? 0 : change.char.length, line: (change.lines === undefined) ? 0 : change.lines};
// 			break;
// 		case '+delete':
// 			return {ch: (change.char === undefined) ? 0 : change.char.length*-1, line: (change.lines === undefined) ? 0 : change.lines*-1};
// 			break;
// 		default:
// 			return {ch: 0,line: 0};
// 	}
// }

// update UI functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function compileProgressBar(percent,msg="",style="bg-info") {
	var display = $("#compileProgress"),
		currentValue = parseInt(display.attr('aria-valuenow')),
		nextValue = percent,
		diff = nextValue - currentValue,
		step = (0 < diff ? 1 : -1);
	if (nextValue == 0) {
		$(display).css("padding", "0");
	} else {
		$(display).css("color", "#fff").animate({
			"width": nextValue + "%"
		}, "slow");
		display.attr('aria-valuenow', nextValue);
	}

	for (var i = 0; i < Math.abs(diff); ++i) {
		setTimeout(function () {
			currentValue += step
			display.html(msg);
		}, 20 * i);
	}

	// https://stackoverflow.com/questions/2644299/jquery-removeclass-wildcard
	$(display).removeClass (function (index, className) {
		return (className.match (/(^|\s)bg-\S+/g) || []).join(' ');
	});
	$(display).addClass(style);
}
	
function updateProjectList() {
	var values = $("#projectSelect>option").map(function() { return {id: $(this).val(), name: $(this).text()}; });

	projects.forEach(function(val,key) {
		var exists = false;
		values.each(function (){
			if(val.id == this.id){ exists = true }
		});
		if (!exists) {
			// console.log('add: '+projects[key].id);
			$('#projectSelect').append($('<option>', {
				value: val.id,
				text: val.name
			}));
			if (project.id == "") {
				socket.emit('projectRequest',val.id);
				project.id = " ";
			}
		}
	});
}

// btn_functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function btn_run() {
	switch(project.compiler){
		case 'js':
			eval(cmEditor.getValue());
			break;
		case 'cpp':
			eval(compiledCode);
			break;
		case 'c':
			eval(compiledCode);
			break;
		case 'py':
			eval(compiledCode);
			break;
		case 'java':
			eval(compiledCode);
			break;
		default:
			break;
	} 
}

function btn_compile() {
	compile();
}

function btn_boslCommand() {
	var cmd = document.getElementById('boslCommand').value;
	eval(boslToJs(cmd));
}

function btn_login() {
	if ($('#loginUsername').val() !== "" && $('#loginPassword').val() !== "") {
		var msg = {
			username: $('#loginUsername').val(),
			secret: $('#loginPassword').val()
		}
		socket.emit('loginRequest',msg);
	}
}

function btn_projectCreate(){
	if ($('#projectManageFilename').val() !== "") {
		var msg = {projName: $('#projectManageFilename').val(), uid: userObj.id};
		socket.emit('projectCreate', msg);
		$('#projectManageModal').modal('hide');
		socket.emit('getProjectsOfUser',userObj.id);
	}
}

function btn_projectDelete() {
	var newSelectedProjId;
	// delete select option
	$( "#projectSelect option:selected" ).each(function() {
		$(this).remove();
	});
	projects.forEach(function(val,key){
		if (val.id == project.id) projects.splice(key);
	});
	$( "#projectSelect option:selected" ).each(function() {
		newSelectedProjId = $(this).val();
	});
	socket.emit('projectDelete',project.id);
	socket.emit('projectRequest',newSelectedProjId);
	socket.emit('getProjectsOfUser',userObj.id);
}

// btn_functions change mode
function btn_compile_enable(bool) {
	if (bool) $('#btn_compile').prop('disabled','');
	else $('#btn_compile').prop('disabled','disabled');
}

function btn_run_enable(bool) {
	if (bool) $('#btn_run').prop('disabled','');
	else $('#btn_run').prop('disabled','disabled');
}

// select.change functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
$("#compilerSelect").change(function() {
	var compiler = "";
	$( "#compilerSelect option:selected" ).each(function() {
		compiler = $(this).val();
	});
	project.compiler = compiler
	projectChanges();
	socket.emit('compilerUpdate',{projId: project.id, update: {compiler: project.compiler}});
});

$("#projectSelect").change(function() {
	var projId = "";
	$( "#projectSelect option:selected" ).each(function() {
		projId = $(this).val();
	});
	socket.emit('projectRequest',projId);
});


// caret-test data - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var caret_test = document.createElement('div');
$(caret_test).addClass('caret pulse');
$(caret_test).prop('id','lappen');
$(caret_test).html(" ");

