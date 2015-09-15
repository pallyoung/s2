/*EventEmitter.js*/
var EventEmitter=require("events").EventEmitter;

function Test () {
	
}

Test.prototype =new EventEmitter();

var test = new Test();

test.on("start",function(){
	console.log("start");
})

test.emit("start");