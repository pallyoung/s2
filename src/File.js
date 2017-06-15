'use strict'
var util = require('util'),
	fs = require('fs'),
	WriteStream = require('fs').WriteStream,
	ReadStream = fs.ReadStream,
	EventEmitter = require('events').EventEmitter;
function File (properties) {
	this.size = 0;
	this.path = null;
	this.name = null;
	this.type = null;
	this.lastModifiedDate = null;
	this._writeStream = null;
	this._readStream = null;
	for (var key in properties) {
		this[key] = properties[key];
	}

};
util.inherits(File, EventEmitter);

File.prototype.getWriteStream = function () {
	var self = this;
	if (this._writeStream == null) {
		this._writeStream = new WriteStream(this.path);
		this._writeStream.on("finish", function () {
			self._writeStream = null;
			self.lastModifiedDate = new Date();
			self.size = fs.statSync(self.path).size;
		});
	}
	return this._writeStream;
}
File.prototype.getReadStream = function () {
	var self = this;
	if (this._readStream == null) {
		this._readStream = new WriteStream(this.path);
		this._readStream.on("end", function () {
			self._readStream = null;
		});
	}
	return this._readStream;
}
module.exports = File;