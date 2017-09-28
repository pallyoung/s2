'use strict'
var util = require('util');
var fs = require('fs');
var path = require('path');
var Configuration = require('./Configuration');
function File(filepath) {
	if (!filepath) {
		throw new Error('filepath is null');
	}
	
	var stat;

	try{
		stat = fs.statSync(filepath);		
	}catch(e){
		var now = new Date().toGMTString();
		stat = {
			size:0,
			ctime:now,
			birthtime:now,
			mtime:now
		}
	}
	this._stat = stat;
	this.size = stat.size;
	this.ctime = stat.ctime;
	this.birthtime = stat.birthtime;
	this.mtime = stat.mtime;

	var uri = path.parse(filepath);
	this.path = filepath;
	this.ext = uri.ext;
	this.name = uri.name;
	this.root = uri.root;
	this.base = uri.base;
	this.dir = uri.dir;
	this.mime = Configuration.mime[this.ext];	

};
module.exports = File;