var c = document.getElementById("board");
var millis = new Date().getTime();
// to fit with the order of the existing BoS-Java-App the y-axis needs be reversed
var pixel = {
		height:400,
		width:400
	},
	noOfFields = {
		x: 12,
		y: 12
	},
	marginPercent = {
		v: 0.5,
		h: 0.5
	},
	paddingPercent = {
		v: 0.5,
		h: 0.5
	},
	boardProps = {
		pixel,
		noOfFields,
		marginPercent,
		paddingPercent,
		reverseY: true,
		showNum: false,
		numMode: 'coord',
		field: {
			width: pixel.width/(noOfFields.x+marginPercent.h*2+paddingPercent.h*2),
			height: pixel.height/(noOfFields.y+marginPercent.v*2+paddingPercent.v*2)
		}
	};


var c = document.getElementById("board");

// to fit with the order of the existing BoS-Java-App the y-axis needs be reversed
var reverseY = false;

c.height = boardProps.pixel.height;
c.width = boardProps.pixel.width;

var canvas = new fabric.Canvas('board');
fabric.Object.prototype.selectable = false;

var board = [];
var boardBorder;

// // create a rectangle object
// var rect = new fabric.Rect({
// 	left: 100,
// 	top: 100,
// 	fill: 'red',
// 	width: 20,
// 	height: 20
// });

// // "add" rectangle onto canvas
// canvas.add(rect);


// var ctx=c.getContext("2d");


// var canvas = oCanvas.create({
// 	canvas: "#board",
// 	background: "#eee",
// });

// http://stackoverflow.com/questions/25837158/how-to-draw-a-star-by-using-canvas-html5
function drawStar(cx,cy,spikes,outerRadius,innerRadius){
	var rot=Math.PI/2*3-1;
	var x=cx;
	var y=cy;
	var step=Math.PI/spikes;
	var p = [];
	for(i=0;i<spikes;i++){
		x=cx+Math.cos(rot)*outerRadius;
		y=cy+Math.sin(rot)*outerRadius;
		if(i==0) p.push(['m',x,y]);
		p.push(['L',x,y]);
		rot+=step;

		x=cx+Math.cos(rot)*innerRadius;
		y=cy+Math.sin(rot)*innerRadius;
		p.push(['L',x,y]);
		rot+=step;
	}
	p.push(['z']);
	return p;
}

// var pathR = new fabric.Path('M 0 0 L 200 100 L 170 200 z');
// pathR.set({ left: 20, top: 20});
// canvas.add(pathR);

// var pathS = [['m',0,25],['a',25,25,0,1,0,50,0],['a',25,25,0,1,0,-50,0]];
// var path2 = new fabric.Path(pathS);
// path2.set({ left: 20, top: 20});
// canvas.add(path2);

// var newPath = [['M',0,0],['m',0,0],['L',50,0],['L',50,50],['L',0,50],['z']];
// var path3 = new fabric.Path(newPath);
// path3.set({ left: 80, top: 20});
// canvas.add(path3);

// var starPath = drawStar(25,25,8,25,10);
// var star = new fabric.Path(starPath);
// star.set({left:20,top:70});
// canvas.add(star);
var plusDepth = boardProps.field.width*.1;
var path;

function initPaths() {
	path = {
		rect: [['M',0,0],['L',boardProps.field.width,0],['L',boardProps.field.width,boardProps.field.height],['L',0,boardProps.field.height],['z']],
		circ: [['m',0,boardProps.field.height/2],['a',(boardProps.field.width/2),(boardProps.field.height/2),0,1,0,boardProps.field.width,0],['a',(boardProps.field.width/2),(boardProps.field.height/2),0,1,0,-boardProps.field.width,0]],
		star: drawStar(boardProps.field.width/2,boardProps.field.height/2,8,boardProps.field.width/2,boardProps.field.width/5),
		plus: [['M',boardProps.field.width/2 - plusDepth, 0],
				['L',boardProps.field.width/2 - plusDepth, 0],
				['L',boardProps.field.width/2 + plusDepth, 0],
				['L',boardProps.field.width/2 + plusDepth, boardProps.field.height/2 - plusDepth],
				['L',boardProps.field.width, boardProps.field.height/2 - plusDepth],
				['L',boardProps.field.width, boardProps.field.height/2 + plusDepth],
				['L',boardProps.field.width/2 + plusDepth, boardProps.field.height/2 + plusDepth],
				['L',boardProps.field.width/2 + plusDepth, boardProps.field.height],
				['L',boardProps.field.width/2 - plusDepth, boardProps.field.height],
				['L',boardProps.field.width/2 - plusDepth, boardProps.field.height/2 + plusDepth],
				['L',0, boardProps.field.height/2 + plusDepth],
				['L',0, boardProps.field.height/2 - plusDepth],
				['L',boardProps.field.width/2 - plusDepth, boardProps.field.height/2 - plusDepth],
				['z']]
	}
}

initPaths();
	

function fieldObject(shape, fill, top, x, y) {
	var fieldObj = []
	fieldObj.push(new fabric.Rect({
		'top': top-boardProps.field.height/2,
		'fill': 'rgba(0,0,0,0)',
		'height': boardProps.field.height,
		'width': boardProps.field.width,
		textAlign: 'left',
		originX: 'center'
	}));
	
	var fieldShape;
	fieldShape = new fabric.Path(path[shape]);
	fieldShape.set('top', top);
	fieldShape.set('fill', fill);
	fieldShape.set({'originX':'center','originY':'center'});
	fieldObj.push(fieldShape);
	
	if (boardProps.showNum) var col='#2e6bfd'
		else var col='rgba(0,0,0,0)'
	fieldObj.push(new fabric.Text(getNumString({x:x,y:y}),{
		top: top-5,
		fontSize: 10,
		textAlign: 'left',
		originX: 'center',
		fill: col
	}));

	fieldObj.push(new fabric.Text('',{
		top: top-5,
		fontSize:10,
		originX: 'center'
	}));
	
	return new fabric.Group(fieldObj,{
		selectable: false,
		'boardX':x,
		'boardY':y
	});
}

function drawBorder() {
	boardBorder = new fabric.Rect({
		left: paddingPercent.h*boardProps.field.width,
		top: paddingPercent.v*boardProps.field.height,
		strokeWidth: 1,
		stroke: '#bbb',
		fill: 'rgba(0,0,0,0)',
		width: boardProps.pixel.width - paddingPercent.h*boardProps.field.width*2,
		height: boardProps.pixel.height - paddingPercent.v*boardProps.field.height*2
	});
	canvas.add(boardBorder);
}

function drawFields() {
	var startTime = new Date().getTime();
	var w = 0;
	for (var x = 0; x < boardProps.noOfFields.x; x++) {
		board[x] = [];
		var line = [];
		for (var y = 0; y < boardProps.noOfFields.y; y++) {
			// board[x][y] = new fabric.Rect({
			// 	left: (x+boardProps.marginPercent.h+boardProps.paddingPercent.h)*boardProps.field.width,
			// 	top: (y+boardProps.marginPercent.v+boardProps.paddingPercent.v)*boardProps.field.height,
			// 	fill: 'red',
			// 	width: boardProps.field.width,
			// 	height: boardProps.field.height
			// });
			// canvas.add(board[x][y]);
			line[y] = fieldObject('circ', '#eee', ((boardProps.noOfFields.y-y)-1)*boardProps.field.height,x,y);
			line[y].on('mousedown', function(e) {
				// farbe2(e.subTargets[0].boardX,e.subTargets[0].boardY,'#d07373');
				// form2(e.subTargets[0].boardX,e.subTargets[0].boardY,'circ');
				// boardO[e.subTargets[0].boardX].remove(boardO[e.subTargets[0].boardX].getObjects()[e.subTargets[0].boardY]);
				console.log('Field x:'+e.subTargets[0].boardX+' y:'+e.subTargets[0].boardY+' was clicked');
				canvas.renderAll();
			});
		}
		// console.log(line.length);
		var lineGroup = new fabric.Group(line,{
			left: (x+boardProps.marginPercent.h+boardProps.paddingPercent.h)*boardProps.field.width,
			top: boardProps.marginPercent.v+boardProps.paddingPercent.v+boardProps.field.height,
			subTargetCheck: true
		});
		board[x] = line.slice(0);
		canvas.add(lineGroup);
		// console.log(w-(x+boardProps.marginPercent.h+boardProps.paddingPercent.h)*boardProps.field.width);
		w=(x+boardProps.marginPercent.h+boardProps.paddingPercent.h)*boardProps.field.width;
	}
	// console.log(boardProps.noOfFields.x+'x'+boardProps.noOfFields.y+': '+((new Date().getTime()) - startTime)+'ms');
}

drawBorder();
drawFields();
			

function getCorrectColor(color) {
	if (color === parseInt(color, 10)) {
		var initial = '#000000';
		color = color.toString (16);
		color = initial.substring(0, initial.length - color.length) + color;
		return color;
	}
	if (color.length == 7 || color.length == 4) return color;		
}

function getCoordReverse(pos){
	return {x: pos.x, y: (boardProps.noOfFields.y-pos.y)-1};
}

function getCoordForInt(i) {
	var x = i % boardProps.noOfFields.x;
	var y = (i - x) / boardProps.noOfFields.y;
	return {x: x, y: y};
}

			function getField(pos) {
				if (reverseY) pos = getCoordReverse(pos);
				return board[pos.x][pos.y];
			}

			function getFieldLayer(pos,layer) {
				return getField(pos).getObjects()[layer];
			}

function eachField(layer,setParam) {
	for (var x = 0; x < board.length; x++) {
		for (var y = 0; y < board[x].length; y++) {
			board[x][y].getObjects()[layer].set(setParam);
		}
	}
}

function modifyField(pos,layer,setParam) {
	if (reverseY) pos = getCoordReverse(pos);
	if (pos.x < board.length && pos.y < board[0].length) {
		board[pos.x][pos.y].getObjects()[layer].set(setParam);
	} else {
		statusText('board index out of range');
	}
}

function getNumString(pos) {
	if (boardProps.numMode == 'coord') return pos.x+','+pos.y
	else return (pos.x + pos.y*board.length).toString()
}
function changeNumVisible(){
	if (boardProps.showNum){
		boardProps.showNum = false;
		eachField(2,{'fill': 'rgba(0,0,0,0)'});
	} else {
		boardProps.showNum = true;
		eachField(2,{'fill': '#2e6bfd'});
	}
	canvas.renderAll();
}
function changeNumMode(){
	if (boardProps.numMode == 'coord'){
		boardProps.numMode = 'lin';
	} else {
		boardProps.numMode = 'coord';
	}
	for (var x = 0; x < board.length; x++) {
		for (var y = 0; y < board[x].length; y++) {
			board[x][y].getObjects()[2].set({'text': getNumString({x: x, y: y})});
		}
	}
	canvas.renderAll();
}


function loeschen() {
	canvas.clear();
	board = [];
	statusText('loeschen');
}

function farbe(i,color) {
	// getFieldLayer(getCoordForInt(i),1).set('fill', getCorrectColor(color));
	modifyField(getCoordForInt(i),1,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}

function farbe2(x,y,color) {
	// getFieldLayer({x: x, y: y},1).set('fill', getCorrectColor(color));
	modifyField({x: x, y: y},1,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}

function farben(color) {
	eachField(1,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}

function flaeche(color){
	canvas.backgroundColor = getCorrectColor(color);
	canvas.renderAll();
}

function form(i,shape) {
	// getFieldLayer(getCoordForInt(i),1).set('path',path[shape]);
	modifyField(getCoordForInt(i),1,{'path': path[shape]});
	canvas.renderAll();
}

function form2(x,y,shape) {
	// getFieldLayer({x: x, y: y},1).set('path',path[shape]);
	modifyField({x: x, y: y},1,{'path': path[shape]});
	canvas.renderAll();
}

function formen(shape) {
	eachField(1,{'path': path[shape]});
	canvas.renderAll();
}

function rahmen(color) {
	boardBorder.set('stroke',color);
	// console.log('rahmen');
	canvas.renderAll();
}

function symbolGroesse(i,percent) {
	// getFieldLayer(getCoordForInt(i),1).set({
	// 	'scaleX':percent,
	// 	'scaleY':percent
	// });
	modifyField(getCoordForInt(i),1,{
		'scaleX':percent,
		'scaleY':percent
	});
	canvas.renderAll();
}

function symbolGroesse2(x,y,percent) {
	// getFieldLayer({x: x, y: y},1).set({
	// 	'scaleX':percent,
	// 	'scaleY':percent
	// });
	modifyField({x: x, y: y},1,{
		'scaleX':percent,
		'scaleY':percent
	});
	canvas.renderAll();
}

function hintergrund(i,color) {
	// getFieldLayer(getCoordForInt(i),0).set('fill',getCorrectColor(color));
	modifyField(getCoordForInt(i),0,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}

function hintergrund2(x,y,color) {
	// getFieldLayer({x: x, y: y},0).set('fill',getCorrectColor(color));
	modifyField({x: x, y: y},0,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}


function statusText(string) {
	document.getElementById('statusText').value = string;
}


function groesse(x,y) {
	boardProps.noOfFields = {x: x, y: y};
	boardProps.field = {
		width: boardProps.pixel.width/(boardProps.noOfFields.x+boardProps.marginPercent.h*2+boardProps.paddingPercent.h*2),
		height: boardProps.pixel.height/(boardProps.noOfFields.y+boardProps.marginPercent.v*2+boardProps.paddingPercent.v*2)
	};
	console.log("new board");
	
	loeschen();
	drawBorder();
	initPaths();
	drawFields();
}


function text(i,text) {
	// getFieldLayer(getCoordForInt(i),3).set('text',text);
	modifyField(getCoordForInt(i),3,{'text': text});
	canvas.renderAll();
}

function text2(x,y,text) {
	// getFieldLayer({x: x, y: y},3).set('text',text);
	modifyField({x: x, y: y},3,{'text': text});
	canvas.renderAll();
}

function textFarbe(i,color) {
	// getFieldLayer(getCoordForInt(i),3).set('fill',getCorrectColor(color));
	modifyField(getCoordForInt(i),3,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}

function textFarbe2(x,y,color) {
	// getFieldLayer({x: x, y: y},3).set('fill',getCorrectColor(color));
	modifyField({x: x, y: y},3,{'fill': getCorrectColor(color)});
	canvas.renderAll();
}


var BLACK = "#000000", 
	NAVY    = "#000080",
	DARKBLUE = "#00008B",
	MEDIUMBLUE = "#0000CD",
	BLUE = "#0000FF",
	DARKGREEN = "#006400",
	GREEN = "#008000",
	TEAL = "#008080",
	DARKCYAN = "#008B8B",
	DEEPSKYBLUE = "#00BFFF",
	DARKTURQUOISE = "#00CED1",
	MEDIUMSPRINGGREEN = "#00FA9A",
	LIME = "#00FF00",
	SPRINGGREEN = "#00FF7F",
	AQUA = "#00FFFF",
	CYAN = "#00FFFF",
	MIDNIGHTBLUE = "#191970",
	DODGERBLUE = "#1E90FF",
	LIGHTSEAGREEN = "#20B2AA",
	FORESTGREEN = "#228B22",
	SEAGREEN = "#2E8B57",
	DARKSLATEGRAY = "#2F4F4F",
	LIMEGREEN = "#32CD32",
	MEDIUMSEAGREEN = "#3CB371",
	TURQUOISE = "#40E0D0",
	ROYALBLUE = "#4169E1",
	STEELBLUE = "#4682B4",
	DARKSLATEBLUE = "#483D8B",
	MEDIUMTURQUOISE = "#48D1CC",
	INDIGO  = "#4B0082",
	DARKOLIVEGREEN = "#556B2F",
	CADETBLUE = "#5F9EA0",
	CORNFLOWERBLUE = "#6495ED",
	REBECCAPURPLE = "#663399",
	MEDIUMAQUAMARINE = "#66CDAA",
	DIMGRAY = "#696969",
	SLATEBLUE = "#6A5ACD",
	OLIVEDRAB = "#6B8E23",
	SLATEGRAY = "#708090",
	LIGHTSLATEGRAY = "#778899",
	MEDIUMSLATEBLUE = "#7B68EE",
	LAWNGREEN = "#7CFC00",
	CHARTREUSE = "#7FFF00",
	AQUAMARINE = "#7FFFD4",
	MAROON = "#800000",
	PURPLE = "#800080",
	OLIVE = "#808000",
	GRAY = "#808080",
	SKYBLUE = "#87CEEB",
	LIGHTSKYBLUE = "#87CEFA",
	BLUEVIOLET = "#8A2BE2",
	DARKRED = "#8B0000",
	DARKMAGENTA = "#8B008B",
	SADDLEBROWN = "#8B4513",
	DARKSEAGREEN = "#8FBC8F",
	LIGHTGREEN = "#90EE90",
	MEDIUMPURPLE = "#9370DB",
	DARKVIOLET = "#9400D3",
	PALEGREEN = "#98FB98",
	DARKORCHID = "#9932CC",
	YELLOWGREEN = "#9ACD32",
	SIENNA = "#A0522D",
	BROWN = "#A52A2A",
	DARKGRAY = "#A9A9A9",
	LIGHTBLUE = "#ADD8E6",
	GREENYELLOW = "#ADFF2F",
	PALETURQUOISE = "#AFEEEE",
	LIGHTSTEELBLUE = "#B0C4DE",
	POWDERBLUE = "#B0E0E6",
	FIREBRICK = "#B22222",
	DARKGOLDENROD = "#B8860B",
	MEDIUMORCHID = "#BA55D3",
	ROSYBROWN = "#BC8F8F",
	DARKKHAKI = "#BDB76B",
	SILVER = "#C0C0C0",
	MEDIUMVIOLETRED = "#C71585",
	INDIANRED  = "#CD5C5C",
	PERU = "#CD853F",
	CHOCOLATE = "#D2691E",
	TAN = "#D2B48C",
	LIGHTGRAY = "#D3D3D3",
	THISTLE = "#D8BFD8",
	ORCHID = "#DA70D6",
	GOLDENROD = "#DAA520",
	PALEVIOLETRED = "#DB7093",
	CRIMSON = "#DC143C",
	GAINSBORO = "#DCDCDC",
	PLUM = "#DDA0DD",
	BURLYWOOD = "#DEB887",
	LIGHTCYAN = "#E0FFFF",
	LAVENDER = "#E6E6FA",
	DARKSALMON = "#E9967A",
	VIOLET = "#EE82EE",
	PALEGOLDENROD = "#EEE8AA",
	LIGHTCORAL = "#F08080",
	KHAKI = "#F0E68C",
	ALICEBLUE = "#F0F8FF",
	HONEYDEW = "#F0FFF0",
	AZURE = "#F0FFFF",
	SANDYBROWN = "#F4A460",
	WHEAT = "#F5DEB3",
	BEIGE = "#F5F5DC",
	WHITESMOKE = "#F5F5F5",
	MINTCREAM = "#F5FFFA",
	GHOSTWHITE = "#F8F8FF",
	SALMON = "#FA8072",
	ANTIQUEWHITE = "#FAEBD7",
	LINEN = "#FAF0E6",
	LIGHTGOLDENRODYELLOW = "#FAFAD2",
	OLDLACE = "#FDF5E6",
	RED = "#FF0000",
	FUCHSIA = "#FF00FF",
	MAGENTA = "#FF00FF",
	DEEPPINK = "#FF1493",
	ORANGERED = "#FF4500",
	TOMATO = "#FF6347",
	HOTPINK = "#FF69B4",
	CORAL = "#FF7F50",
	DARKORANGE = "#FF8C00",
	LIGHTSALMON = "#FFA07A",
	ORANGE = "#FFA500",
	LIGHTPINK = "#FFB6C1",
	PINK = "#FFC0CB",
	GOLD = "#FFD700",
	PEACHPUFF = "#FFDAB9",
	NAVAJOWHITE = "#FFDEAD",
	MOCCASIN = "#FFE4B5",
	BISQUE = "#FFE4C4",
	MISTYROSE = "#FFE4E1",
	BLANCHEDALMOND = "#FFEBCD",
	PAPAYAWHIP = "#FFEFD5",
	LAVENDERBLUSH = "#FFF0F5",
	SEASHELL = "#FFF5EE",
	CORNSILK = "#FFF8DC",
	LEMONCHIFFON = "#FFFACD",
	FLORALWHITE = "#FFFAF0",
	SNOW = "#FFFAFA",
	YELLOW = "#FFFF00",
	LIGHTYELLOW = "#FFFFE0",
	IVORY = "#FFFFF0",
	WHITE = "#FFFFFF";




// BoSL to JS translation
function getShape(s) {
	switch (s) {
		case "s":
			return "rect";
			break;
		case "c":
			return "circ";
			break;
		case "d":
			return "diamond";
			break;
		case "*":
			return "star";
			break;
		case "r":
			return "rand";
			break;
		default:
			console.log("Err: can't find symbol");
			break;
	};
}

function checkColorVar(color) {
	try {
		eval(color);
	} catch (e) {
		console.log(e.message);
		return false;
	}
	return true;
}

var shapes = /[s,c,d,*,r]/;
// func color is missing!!
function boslToJs(boslString) {
	cmd = boslString.split(" ");
	// need to regex these commands
	switch (true) {
		case /^c$/.test(boslString):
			loeschen();
			break;
		case /^r\s\d+\s\d+$/.test(boslString):
			groesse(parseInt(cmd[1]),parseInt(cmd[2]));
			break;
		case (new RegExp((/^f\s/).source + shapes.source + (/$/).source)).test(boslString):
			formen(getShape(cmd[1]));
			break;
		case (new RegExp((/^fi\s\d+\s/).source + shapes.source + (/$/).source)).test(boslString):
			form(parseInt(cmd[1]),getShape(cmd[2]));
			break;
		case (new RegExp((/^#fi\s\d+\s\d+\s/).source + shapes.source + (/$/).source)).test(boslString):
			form2(parseInt(cmd[1]),parseInt(cmd[2]),getShape(cmd[3]));
			break;
		case /^s\s\d+\s[\d+.\d,\d]+$/.test(boslString):
			symbolGroesse(parseInt(cmd[1]),cmd[2]);
			break;
		case /^#s\s\d+\s\d+\s[\d+.\d,\d]$/.test(boslString):
			symbolGroesse2(parseInt(cmd[1]),parseInt(cmd[2]),cmd[3]);
			break;
		case /^ba\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[1])) break;
			flaeche(/^[A-Z]+$/.test(cmd[1]) ? eval(cmd[1]) : cmd[1]);
			break;
		case /^bo\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[1])) break;
			rahmen(/^[A-Z]+$/.test(cmd[1]) ? eval(cmd[1]) : cmd[1]);
			break;
		case /^b\s\d+\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[2])) break;
			hintergrund(parseInt(cmd[1]), /^[A-Z]+$/.test(cmd[2]) ? eval(cmd[2]) : cmd[2]);
			break;
		case /^#b\s\d+\s\d+\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[3])) break;
			hintergrund2(parseInt(cmd[1]),parseInt(cmd[2]), /^[A-Z]+$/.test(cmd[3]) ? eval(cmd[3]) : cmd[3]);
			break;
		case /^T\s\d+\s.+$/.test(boslString):
			// to get the whole text, splice "T" "n" and join the array
			text(parseInt(cmd[1]),(cmd.splice(2)).join(" "));
			break;
		case /^#T\s\d+\s\d+\s.+$/.test(boslString):
			// to get the whole text, splice "T" "x" "y" and join the array
			text2(parseInt(cmd[1]),parseInt(cmd[2]),(cmd.splice(3)).join(" "));
			break;
		case /^TC\s\d+\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[2])) break;
			textFarbe(parseInt(cmd[1]), /^[A-Z]+$/.test(cmd[2]) ? eval(cmd[2]) : cmd[2]);
			break;
		case /^#TC\s\d+\s\d+\s(?:[A-Z]+|#\w{3}|#\w{6})$/.test(boslString):
			if (!checkColorVar(cmd[3])) break;
			textFarbe2(parseInt(cmd[1]),parseInt(cmd[2]), /^[A-Z]+$/.test(cmd[3]) ? eval(cmd[3]) : cmd[3]);
			break;
		case /^t\s.+$/.test(boslString):
			statusText((cmd.splice(1)).join(" "));
			break;
		case /^p/.test(boslString):
			// get last command
			break;

		case /^n/.test(boslString):
			changeNumVisible();
			break;
		default:
			console.log('Err: cannot find BoSL-Command "'+boslString+'"');
			statusText('Err: cannot find BoSL-Command "'+boslString+'"');
			break;
	}
}


// // func color is missing!!
// function boslToJs(boslString) {
// 	cmd = boslString.split(" ");
// 	// need to regex these commands
// 	switch (cmd[0]) {
// 		case "c":
// 			loeschen();
// 			break;
// 		case "r":
// 			groesse(parseInt(cmd[1]),parseInt(cmd[2]));
// 			break;
// 		case "f":
// 			formen(getShape(cmd[1]));
// 			break;
// 		case "fi":
// 			form(parseInt(cmd[1]),getShape(cmd[2]));
// 			break;
// 		case "#fi":
// 			form2(parseInt(cmd[1]),parseInt(cmd[2]),getShape(cmd[3]));
// 			break;
// 		case "s":
// 			symbolGroesse(parseInt(cmd[1]),cmd[2]);
// 			break;
// 		case "#s":
// 			symbolGroesse2(parseInt(cmd[1]),parseInt(cmd[2]),cmd[3]);
// 			break;
// 		case "ba":
// 			flaeche(cmd[1]);
// 			break;
// 		case "bo":
// 			rahmen(cmd[1]);
// 			break;
// 		case "b":
// 			hintergrund(parseInt(cmd[1]),cmd[2]);
// 			break;
// 		case "#b":
// 			hintergrund2(parseInt(cmd[1]),parseInt(cmd[2]),cmd[3]);
// 			break;
// 		case "T":
// 			// to get the whole text, splice "T" "n" and join the array
// 			text(parseInt(cmd[1]),(cmd.splice(2)).join(" "));
// 			break;
// 		case "#T":
// 			// to get the whole text, splice "T" "x" "y" and join the array
// 			text2(parseInt(cmd[1]),parseInt(cmd[2]),(cmd.splice(3)).join(" "));
// 			break;
// 		case "TC":
// 			textFarbe(parseInt(cmd[1]),cmd[2]);
// 			break;
// 		case "#TC":
// 			textFarbe2(parseInt(cmd[1]),parseInt(cmd[2]),cmd[3]);
// 			break;
// 		case "t":
// 			statusText((cmd.splice(1)).join(" "));
// 			break;
// 		case "p":
// 			// get last command
// 			break;

// 		case "n":
// 			changeNumVisible();
// 			break;
// 		default:
// 			console.log('Err: cannot find BoSL-Command "'+boslString+'"');
// 			statusText('Err: cannot find BoSL-Command "'+boslString+'"');
// 			break;
// 	}
// }

