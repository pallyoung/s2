(function() {
	var Buffer = require('buffer').Buffer,
		File=require('./File'),
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
			STRING:s++,
			FILE:s++,
			CONTENT_TYPE_VALUE_START:s++,
			CONTENT_TYPE_VALUE:s++,
			CONTENT_TYPE_VALUE_DONE:s++,
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
		lower = function(c) {
			return c | 0x20;
		};

	var MultipartParser = function(boundary) {

		this.boundary = null;
		this.boundaryChars = null;
		this.lookbehind = null;
		this.state = S.PARSER_UNINITIALIZED;
		this.index = 0;
		this.flags = 0;
		this.data=[];
		this.names=[];
		this.parameters = {};
		this.tempData=new Buffer(0);
		this.setBoundary(boundary);
		this.onend = function(){};
	};
	MultipartParser.prototype = {
		setBoundary : function(str) {
			this.boundary = new Buffer(str.length + 2);
			this.boundary.write('--', 0,'ascii');
			this.boundary.write(str, 2,'ascii');
			this.state = S.START;

			this.boundaryChars = {};
			for (var i = 0; i < this.boundary.length; i++) {
				this.boundaryChars[this.boundary[i]] = true;
			}
		},
		pushBufferToParse:function(buffer){
			this.data.push(buffer);
			this.run();
		},
		run: function() {
			var buffer;
			while((buffer=this.data.shift())!=null){
				this.parse(buffer);
			}

		},
		parse:function(buffer){
			console.log(buffer.toString())
			var len =  buffer.length;
			var c;
			var tempData;
			for(var i = 0;i<len;i++){
				c = buffer[i];
				switch (this.state){
					case S.PARSER_UNINITIALIZED:
						this.state++;
					case S.START:
						this.state++;
					case S.START_BOUNDARY:
						if(this.boundary[this.index] == c){
							this.index++;
							break;
						}else if(c == CR){
							this.state++;
						}else if(c == HYPHEN){
							this.state = S.END;
						}
						this.index = 0;
					case S.HEADER_FIELD_START:
						if(c == CR){
							this.state++;
						}
						break;
					case S.HEADER_FIELD:
						if(c == COLON){
							this.state++;
						}
						break;
					case S.HEADER_VALUE_START:
						this.index = i;
						this.state++;
					case S.HEADER_VALUE:
						if(c == CR){
							this.tempData = Buffer.concat([this.tempData,buffer.slice(this.index,i)]);
							this.state++;
						}
						break;
					case S.HEADER_VALUE_ALMOST_DONE:
						if(c == LF){
							this.state = this.pasreHeaderValue();
							this.index = 0;
							this.tempData = new Buffer(0);
						}else{
							throw new Error("解析错误");
						}						
						break;
					case S.FILE:
						this.state++;
					case S.CONTENT_TYPE_VALUE_START:
						if(c == COLON){
							this.state++;
							this.index = i+1;
						}
						break;
					case S.CONTENT_TYPE_VALUE:
						if(c == CR){
							this.tempData = Buffer.concat([this.tempData,buffer.slice(this.index,i)]);
							this.state++;
						}
						break;
					case S.CONTENT_TYPE_VALUE_DONE:
						if(c = LF){
							this.state ==  this.parseContentType();
							this.index = 0;
							this.tempData = new Buffer(0);
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.STRING:
						this.state = S.HEADERS_ALMOST_DONE;
					case S.HEADERS_ALMOST_DONE:
						if(c == CR){
							this.state++;
						}else{
							throw new Error("解析错误");
						}
						break;
						
					case S.PART_DATA_START:
						if(c == LF){
							this.state++;
							this.index = i+1;
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.PART_DATA:
						if(c == CR){
							this.tempData = Buffer.concat([this.tempData,buffer.slice(this.index,i)]);
							this.state++;
						}
						break;
					case S.PART_END:
						if(c == LF){
							this.state = this.parseValue();
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.END:
						this.end();
						return;

				}
			}
		},
		pasreHeaderValue:function(){
			var headerValue = this.tempData.toString('utf8');
			var fields =  headerValue.split(";");
			var name = fields[1].split("=")[1].slice(1,-1);
			this.names.push(name);
			this.parameters[name] = "";
			
			if(fields.length == 3){
				var file = new File();
				file.name = fields[2].split("=")[1]
				this.parameters[name] = file;
				return S.FILE;
			}
			console.log(name);
			return S.STRING;
		},
		parseContentType:function(){
			var contentType  = this.tempData.toString("utf8");
			this.parameters[this.names[this.names.length-1]].type = contentType;
			return S.HEADERS_ALMOST_DONE;
		},
		parseValue:function(){
			var target  =  this.parameters[this.names[this.names.length-1]];
			var self = this;
			console.log(this.tempData.toString('utf8'));
			if(typeof target === "string"){
				target += this.tempData.toString('utf8');
			}else{
				target.write(this.tempData,function(){

				});
			}
			this.parameters[this.names[this.names.length-1]] = target;
			return  S.START;
		},
		end: function() {
			this.onend();
		}
	}
	module.exports = MultipartParser;
})()