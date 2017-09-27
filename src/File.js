'use strict'
var util = require('util');
var fs = require('fs');
var path = require('path');

function File(filepath) {
	if (!filepath) {
		throw new Error('filepath is null');
	}
	
	var stat = fs.statSync(filepath);
	this._stat = stat;
	this.size = stat.size;
	this.ctime = stat.ctime;
	this.isFile = stat.isFile;
	this.birthtime = stat.birthtime;
	this.mtime = stat.mtime;
	this.ctime = stat.ctime;

	var uri = path.parse(filepath);
	this.path = filepath;
	this.ext = uri.ext;
	this.name = uri.name;
	this.root = uri.root;
	this.base = uri.base;
	this.dir = uri.dir;

};
module.exports = File;