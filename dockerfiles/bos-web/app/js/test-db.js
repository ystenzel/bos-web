var socketInit = io('/init');

function createTestdata() {
	var testdata = {
		testuser: {email: "jane@doe.com", firstname: "Jane", lastname : "Doe", secret: "password", username: "janedoe"},
		testprojects: [{
			code:"farben = [RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718]\nfor i in range(0, 130):\n\tfarbe(i, farben[i % len(farben) ] )", 
			compiler: "py", 
			name: "Python test"},{
			code:"int[] farben = { RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718};\nfor(int i=0; i<130; i++ ) {\n    farbe(i, farben[i % farben.length ] );\n}", 
			compiler: "java", 
			name: "Java test"},{
			code:"var farben = [ RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718];\nfor(var i=0; i<130; i++ ) {\n    farbe(i, farben[i % farben.length ] );\n}", 
			compiler: "js", 
			name: "JavaScript test"},{
			code:"int i;\nint farben[] = { RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718};\nfor( i=0; i<130; i++ ) {\n    farbe(i, farben[i % (sizeof( farben) / sizeof( int )) ] );\n}", 
			compiler: "c", 
			name: "C test"}]
	};
	console.log("emit: createTestdata");
	socketInit.emit('createTestdata',testdata);

	var testdata = {
		testuser: {email: "john@doe.com", firstname: "John", lastname : "Doe", secret: "password", username: "johndoe"},
		testprojects: [{
			code:"farben = [RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718]\nfor i in range(0, 110):\n\tfarbe(i, farben[i % len(farben) ] )", 
			compiler: "py", 
			name: "Python test"},{
			code:"int[] farben = { RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718};\nfor(int i=0; i<110; i++ ) {\n    farbe(i, farben[i % farben.length ] );\n}", 
			compiler: "java", 
			name: "Java test"},{
			code:"var farben = [ RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718];\nfor(var i=0; i<110; i++ ) {\n    farbe(i, farben[i % farben.length ] );\n}", 
			compiler: "js", 
			name: "JavaScript test"},{
			code:"int i;\nint farben[] = { RED, BLUE, GREEN, OLIVE, YELLOW, 0xCDD718};\nfor( i=0; i<110; i++ ) {\n    farbe(i, farben[i % (sizeof( farben) / sizeof( int )) ] );\n}", 
			compiler: "c", 
			name: "C test"}]
	};
	socketInit.emit('createTestdata',testdata);
	
}

socketInit.on('createTestdataResponse', function(msg){
	console.log(msg);
});
