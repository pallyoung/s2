'use strict'
var fs = require('fs');
var util = require('./util/util');
var Configuration = require('./Configuration');
var Headers = require('./Headers');
function Response(serverResponse,request){
    this._serverResponse = serverResponse;
    this.headers = new Headers();
    this.request = request;
}
Response.prototype = {
    constructor:Response,
    writeContinue:function(){
        this._serverResponse.writeContinue();
    },
    writeHead:function(statusCode,statusMessage, headers){
        for(var o in headers){
            this.headers.append(o,headers[o]);
        }
        this._serverResponse.writeHead(statusCode,statusMessage,this.headers.serialize());
    },
    setHeader:function(name, value){
        this._serverResponse.setHeader(name, value);
    },
    write:function(chunk,encoding,callback){
        this._serverResponse.write(chunk,encoding,callback);
    },
    end:function(data,encoding,callback){
        this._serverResponse.end(data,encoding,callback);
    },
    json:function(source){
        this.headers.append('Context-Type','application/json;charset=utf-8');
        this._serverResponse.writeHead('200',this.headers.serialize());
        this._serverResponse.end(JSON.stringify(source));
    },
    file:function(assert,encoding){
        if(typeof assert === 'string'){
            var ext = util.getExt(assert);
            var mime = Configuration.mime[ext];
            this.headers.append('Context-Type',mime+';charset=utf-8');
            this.writeHead('200',this.headers.serialize());
            fs.createReadStream(assert,{
                encoding:encoding,
                end:()=>this.end()}).pipe(this._serverResponse);
        }else{
            assert.pipe(this._serverResponse);
            this.end();
        }
    },
    text:function(text){
        this.headers.append('Context-Type','application/json;charset=utf-8');
        this.writeHead('200',this.headers.serialize());
        this.end(text);
    },
    addCookie:function(cookie){
        this.headers.append('Set-Cookie',cookie.toString());
    },
    removeCookie:function(cookies){

    }
}
module.exports = Response;