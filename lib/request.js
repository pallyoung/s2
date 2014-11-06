(function() {
	var path = s2.path;
	var url = s2.url;
	var util = s2.util;
	var queryString=s2.querystring;
	var Buffer = require('buffer').Buffer;
	var Request= function(request,Obj) {
		var that=this;
		this.request = request;
		for(var o in request) {
			this[o] = request[o];
		}
		for(var o in Obj) {
			this[o] = Obj[o];
		}
		this.data="";
		this.requestEnd=false;
		this.length=0;
		this.buffer=[];

		request.on("data",function(chunk){
			var contenttype=that.headers["content-type"];				
				that.data+=chunk;			
		});

		this.request.on("end",function(){
			that.data=queryString.parse(that.data);
			that.requestEnd=true;
			if(that["end"]){
				that["end"].call(that);
				delete that.end;
			}
		});


	};
	Request.prototype= {
		queryString: function(key) {
			return url.parse(this.request.url, true).query[key];
		},
		getParameter:function(key){
			return this.data[key];
		},
		addEvent:function(event,callback){
			this[event]=callback;
		}
	}
	module.exports = {
		Request:Request
	}
})()