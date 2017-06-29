### BoS-Web available functions

At the moment they are only available in german.

The Board uses two different types of addressing the fields. A linear- and a x-/y-mode. Both can be used in the same project. To show the numbers just run ```n``` as *BoSL-Command* under the Board. The displaying mode can be changed by ```changeNumMode(){}``` typed into the console of the browser window.

Erase the whole board:
```javascript
function loeschen(){}
```

And create a new one:
```javascript
function groesse(int x, int y){}
```

Color the background:
```javascript
function flaeche(hex/string color){}
```

Color the frame of the board:
```javascript
function rahmen(hex/sting color){}
```

Give the fields different colors:
```javascript
function farbe(int i, hex/string color){}
function farbe2(int x, int y, hex/string color){}
// or even all fields at once
function farben(hex/string color){}
```

Or a new shape (actually you can use s,c,\*,rect,circ,star,plus):
```javascript
function form(int i, string shape){}
function form2(int x, int y, string shape){}
// all fields at once
function formen(string shape){}
```

Change the size (0.5 is normal; 1 doubles the size):
```javascript
function symbolGroesse(int i, double/int percent){}
function symbolGroesse2(int x, int y, double/int percent){}
```

Set a background color for each field:
```javascript
function hintergrund(int i, hex/string color){}
function hintergrund2(int x, int y, hex/string color){}
```

Show a text inside the fields:
```javascript
function text(int i, string text){}
function text2(int x, int y, string text){}
```

And color the text:
```javascript
function textFarbe(int i, hex/string color){}
function textFarbe2(int x, int y, hex/string color){}
```

Simply output a string above the Board:
```javascript
function statusText(string text){}
```
