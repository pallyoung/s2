'use strict'
var Configuration = require('./../Configuration');
var util = require('./../util/util');
var fs = require('fs');
var Buffer = require('buffer').Buffer,
	File = require('./../File'),
	path = require('path'),
	LF = 10,
	CR = 13,
	SPACE = 32,
	HYPHEN = 45,
	COLON = 58,
	A = 97,
	Z = 122,
	s = 0,
	S = {
		PARSER_UNINITIALIZED: s++,
		START: s++,
		START_BOUNDARY: s++,
		HEADER_FIELD_START: s++,
		HEADER_FIELD: s++,
		HEADER_VALUE_START: s++,
		HEADER_VALUE: s++,
		HEADER_VALUE_ALMOST_DONE: s++,
		STRING: s++,
		FILE: s++,
		CONTENT_TYPE_VALUE_START: s++,
		CONTENT_TYPE_VALUE: s++,
		CONTENT_TYPE_VALUE_DONE: s++,
		HEADERS_ALMOST_DONE: s++,
		PART_DATA_START: s++,
		PART_DATA: s++,
		PART_END: s++,
		END: s++
	},
	f = 1,
	F = {
		PART_BOUNDARY: f,
		LAST_BOUNDARY: f *= 2
	},
	lower = function (c) {
		return c | 0x20;
	};

var status = {
	uninit: 0,
	parse: 1,
	pause: 2,
	completed: 3
}
function MultipartParser(boundary) {

	this.boundary = null;
	this.boundaryChars = null;
	this.state = S.PARSER_UNINITIALIZED;
	this.status = status.uninit;
	this.buffer = new Buffer(0);
	this.current = '';
	this.body = {};
	this.index = -1;
	this.partStart = 0;
	this.partIndex = 0;
	this.partEnd = 0;

	this.setBoundary(boundary);
	this.onend = function () { };

	//临时缓存路径
	this.cache = Configuration.temporary;
};
MultipartParser.prototype = {
	constructor: MultipartParser,
	setBoundary: function (str) {
		this.boundary = new Buffer(str.length + 2);
		this.boundary.write('--', 0, 'ascii');
		this.boundary.write(str, 2, 'ascii');
		this.state = S.START;
		this.boundaryChars = {};
		for (var i = 0; i < this.boundary.length; i++) {
			this.boundaryChars[this.boundary[i]] = true;
		}
	},
	pushBufferToParse: function (buffer) {
		this.buffer = Buffer.concat([this.buffer, buffer]);
		return this.run();
	},
	run: function () {
		if (this.status === status.parse) {
			return;
		} else {
			this.status = status.parse;
			return this.next();
		}
	},
	parseChar(c, i, buffer) {
		switch (this.state) {
			case S.PARSER_UNINITIALIZED:
				this.state++;
			case S.START:
				this.state++;
				this.partIndex = 0;
			case S.START_BOUNDARY:
				if (c == this.boundary[this.partIndex]) {
					this.partIndex++;
				} else if (this.partIndex == this.boundary.length) {
					if (c == CR && buffer[i + 1] == LF) {
						this.partIndex = 0;
						this.state = S.HEADER_FIELD_START;
					} else if (c == HYPHEN && buffer[i + 1] == HYPHEN) {
						this.partIndex = 0;
						this.state = S.END;
					} else {
						throw new Error("解析错误");
					}
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.HEADER_FIELD_START:
				this.partIndex = 0;
				if (c == LF) {
					this.state++;
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.HEADER_FIELD:
				if (c == COLON) {
					this.state++;
				}
				return;
			case S.HEADER_VALUE_START:
				this.partStart = i;
				this.state++;
			case S.HEADER_VALUE:
				if (c == CR && buffer[i + 1] == LF) {
					this.state++;
				} else {
					this.partEnd = i;
				}
				return;
			case S.HEADER_VALUE_ALMOST_DONE:
				if (c == LF) {
					this.setHeaderValue(buffer.slice(this.partStart, this.partEnd + 1));
					this.partStart = 0;
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.FILE:
				this.state++;
			case S.CONTENT_TYPE_VALUE_START:
				if (c == COLON) {
					this.state++;
					this.partStart = i + 1;
				}
				return;
			case S.CONTENT_TYPE_VALUE:
				this.partEnd = i;
				if (c == CR && buffer[i + 1] == LF) {
					this.state++;
				}
				return;
			case S.CONTENT_TYPE_VALUE_DONE:
				if (c == LF) {
					this.setContentType(buffer.slice(this.partStart, this.partEnd));
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.STRING:
				this.state = S.HEADERS_ALMOST_DONE;
			case S.HEADERS_ALMOST_DONE:
				if (c == CR && buffer[i + 1] == LF) {
					this.state++;
				} else {
					throw new Error("解析错误");
				}
				return;

			case S.PART_DATA_START:
				if (c == LF) {
					this.state++;
					this.partStart = i + 1;
					this.partIndex = 0;
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.PART_DATA:
				if (c === this.boundary[this.partIndex]) {
					this.partIndex++;
					if (this.partIndex === this.boundary.length) {
						this.state++;
						this.partIndex = 0;
						return this.setPartValue(buffer.slice(this.partStart, this.partEnd - 1));
					}
				} else {
					this.partEnd = i;
					this.partIndex = 0;
				}
				return;
			case S.PART_END:
				if (c == CR && buffer[i + 1] == LF) {
					this.state = S.HEADER_FIELD_START;
				} else if (c == HYPHEN && buffer[i + 1] == HYPHEN) {
					this.state = S.END;
				} else {
					throw new Error("解析错误");
				}
				return;
			case S.END:
				if(this.index==this.buffer.length-1){
					this.end();
				}
				return;
		}
	},
	setHeaderValue: function (headerValue) {
		var headerValue = headerValue.toString('utf8');
		var fields = headerValue.split(";");
		var name = fields[1].split("=")[1].slice(1, -1);
		this.current = name;
		this.body[name] = "";
		if (fields.length == 3) {
			var filename = fields[2].split("=")[1].slice(1, -1);
			
			var filepath = path.join(this.cache, Date.now() + filename);
			var file = new File(filepath);
			this.body[name] = file;
			this.state = S.FILE;
		} else {
			this.state = S.STRING;
		}
	},
	setContentType: function (value) {

		var contentType = value.toString("utf8").trim();
		var file = this.body[this.current];
		file.mime = contentType;
		this.state = S.HEADERS_ALMOST_DONE;
	},
	setPartValue: function (value) {
		var target = this.body[this.current] || '';
		var self = this;
		if (typeof target === "string") {
			target += value.toString('utf8');
			this.body[this.current] = target;
		} else {
			//'todo';
			if (!fs.existsSync(target.dir)) {
				util.mkdirsSync(target.dir);
			}
			target.size = value.length;

			var stream = fs.createWriteStream(target.path);
			return stream.end(value, () => {
				target.size = value.length;
				return this.next();
			});
			return true;
		}

	},
	next: function (i) {
		if (i) {
			this.index = i;
		} else {
			i = ++this.index;
		};		
		var buffer = this.buffer;
		while (this.index < this.buffer.length) {
			i = this.index;
			if(this.parseChar(this.buffer[i], i, this.buffer)){
				break;
			}else{
				this.index++;
			}
		}
		this.status = status.pause;
		this.index--;
	},
	end: function () {
		this.status = status.completed;
		this.onend();
	}
}

module.exports = function parser(contentType, stram) {
	return new Promise(function (resolve, reject) {
		try {
			var boundary;
			if (/boundary=(.+)/i.test(contentType)) {
				boundary = RegExp.$1;
			}
			var multipartParser = new MultipartParser(boundary);
			multipartParser.onend = function () {
				// multipartParser.buffer = null;
				resolve(multipartParser.body);
			};
			stram.on("data", function (chunk) {
				multipartParser.pushBufferToParse(chunk);
			});
			stram.on("error", function () {
				reject()
			});
			stram.on("end", function (chunk) {
				//multipartParser.pushBufferToParse(chunk);
			});
		} catch (e) {
			console.log(e)
		}
	});
};