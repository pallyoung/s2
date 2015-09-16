(function() {
	var Buffer = require('buffer').Buffer,
		File = require('./File'),
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
	function getExtName(){

	}
	var MultipartParser = function(boundary) {

		this.boundary = null;
		this.boundaryChars = null;
		this.lookbehind = null;
		this.state = S.PARSER_UNINITIALIZED;
		this.i = 0;
		this.flags = 0;
		this.data=[];
		this.names=[];
		this.parameters = {};
		this.tempData=new Buffer(0);
		this.setBoundary(boundary);
		this.onend = function(){};
		//临时缓存路径
		this.cache="";
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
			var len =  buffer.length;
			var c;
			var l,i;
			var startIndex,endIndex;
			for(i = 0;i<len;i++){
				c = buffer[i];
				switch (this.state){
					case S.PARSER_UNINITIALIZED:
						this.state++;
					case S.START:
						this.state++;
						this.i = 0;
					case S.START_BOUNDARY:
						if(c==this.boundary[this.i]){
							this.i++;
						}else if(this.i==this.boundary.length){
							if(c==CR&&buffer[i+1]==LF){
								this.i = 0;	
								this.state=S.HEADER_FIELD_START;
							}else if(c ==HYPHEN&&buffer[i+1]==HYPHEN){
								this.i = 0;
								this.state = S.END;
							}else{
								throw new Error("解析错误");
							}												
						}else{
							throw new Error("解析错误");
						}
						break;						
					case S.HEADER_FIELD_START:
						this.i = 0;
						if(c == LF){
							this.state++;
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.HEADER_FIELD:
						if(c == COLON){
							this.state++;
						}
						break;
					case S.HEADER_VALUE_START:
						startIndex = i;
						this.state++;
					case S.HEADER_VALUE:
						endIndex = i;
						if(c == CR&&buffer[i+1]==LF){
							this.tempData = Buffer.concat([this.tempData,buffer.slice(startIndex,endIndex)]);
							this.state++;
						}
						break;
					case S.HEADER_VALUE_ALMOST_DONE:
						if(c == LF){
							this.state = this.pasreHeaderValue();
							startIndex = 0;
							endIndex = 0;
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
							startIndex = i+1;
						}
						break;
					case S.CONTENT_TYPE_VALUE:
						endIndex = i;
						if(c == CR&&buffer[i+1]==LF){
							this.tempData = Buffer.concat([this.tempData,buffer.slice(startIndex,endIndex)]);
							this.state++;
						}
						break;
					case S.CONTENT_TYPE_VALUE_DONE:
						if(c == LF){
							this.state =  this.parseContentType();
							startIndex = 0;
							endIndex = 0;
							this.tempData = new Buffer(0);
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.STRING:
						this.state = S.HEADERS_ALMOST_DONE;
					case S.HEADERS_ALMOST_DONE:
						if(c == CR&&buffer[i+1]==LF){
							this.state++;
						}else{
							throw new Error("解析错误");
						}
						break;
						
					case S.PART_DATA_START:
						if(c == LF){
							this.state++;
							startIndex = i+1;
						}else{
							throw new Error("解析错误");
						}
						break;
					case S.PART_DATA:
						this.i = 0;
						while(i<len){
							c = buffer[i];
							if(c===this.boundary[this.i]){
								this.i++;
								if(this.i===this.boundary.length){
									this.tempData = Buffer.concat([this.tempData,buffer.slice(startIndex,endIndex)]);
									this.state++;
									this.i = 0;									
									break;
								}
							}else{
								endIndex = i-1;
								this.i = 0;
							}
							i++;
						}
						break;
					case S.PART_END:
						this.parseValue();
						this.tempData = new Buffer(0);
						if(c == CR&&buffer[i+1]==LF){							
							this.state = S.HEADER_FIELD_START;							
						}else if(c == HYPHEN&&buffer[i+1]==HYPHEN){
							this.state = S.END;
						}else{
							throw new Error("解析错误");
						}
						startIndex = 0;
						endIndex = 0;	
						break;
					case S.END:
						this.end();
						return;
				}
			}
			this.tempData=Buffer.concat([this.tempData,buffer.slice(startIndex,endIndex)]);
		},
		pasreHeaderValue:function(){
			var headerValue = this.tempData.toString('utf8');
			var fields =  headerValue.split(";");
			var name = fields[1].split("=")[1].slice(1,-1);
			this.names.push(name);
			this.parameters[name] = "";
			console.log(name);
			if(fields.length == 3){
				var file = new File();
				file.name = fields[2].split("=")[1].slice(1,-1);
				file.path = path.join(this.cache,Date.now()+file.name);
				this.parameters[name] = file;
				return S.FILE;
			}			
			return S.STRING;
		},
		parseContentType:function(){
			var contentType  = this.tempData.toString("utf8");
			var file = this.parameters[this.names[this.names.length-1]];
			file.type = contentType;		
			return S.HEADERS_ALMOST_DONE;
		},
		parseValue:function(){
			var target  =  this.parameters[this.names[this.names.length-1]];
			var self = this;
			if(typeof target === "string"){
				target += this.tempData.toString('utf8');
			}else{
				target.getWriteStream().end(this.tempData,function(){

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