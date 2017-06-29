### BoS-Web available functions

At the moment they are only available in german.

The Board uses two different types of addressing the fields. A linear- and a x-/y-mode. Both can be used in the same project. To show the numbers just run ```n``` as *BoSL-Command* under the Board. The displaying mode can be changed by ```changeNumMode(){}``` typed into the console of the browser window.

Erase the whole board:
```javascript
function loeschen(){}
```

And create a new one:
```javascript
function groesse(x,y){}
```

Color the background:
```javascript
function flaeche(color){}
```

Color the frame of the board:
```javascript
function rahmen(color){}
```

Give the fields different colors:
```javascript
function farbe(i,color){}
function farbe2(x,y,color){}
// or even all fields at once
function farben(color){}
```

Or a new shape (actually you can use s,c,*,rect,circ,star,plus):
```javascript
function form(i,shape){}
function form2(x,y,shape){}
// all fields at once
function formen(shape){}
```

Change the size (0.5 is normal; 1 doubles the size):
```javascript
function symbolGroesse(i,percent){}
function symbolGroesse2(x,y,percent){}
```

Set a background color for each field:
```javascript
function hintergrund(i,color){}
function hintergrund2(x,y,color){}
```

Show a text inside the fields:
```javascript
function text(i,text){}
function text2(x,y,text){}
```

And color the text:
```javascript
function textFarbe(i,color){}
function textFarbe2(x,y,color){}
```

Simply output a string above the Board:
```javascript
function statusText(string){}
```
