'use strict'
var fs = require('fs');
var util = require('./util/util');
var Configuration = require('./Configuration');
function Response(serverResponse){
    this._serverResponse = serverResponse;
}
Response.prototype = {
    constructor:Response,
    writeContinue:function(){
        this._serverResponse.writeContinue();
    },
    writeHead:function(statusCode,statusMessage, headers){
        this._serverResponse.writeHead(statusCode,statusMessage,headers);
    },
    write:function(chunk,encoding,callback){
        this._serverResponse.write(chunk,encoding,callback);
    },
    end:function(data,encoding,callback){
        this._serverResponse.end(data,encoding,callback);
    },
    json:function(source){
        this._serverResponse.writeHead('200',{
            'Context-Type':'application/json;charset=utf-8'
        });
        this._serverResponse.end(JSON.stringify(source));
    },
    file:function(path,encoding){
        if(typeof path === 'string'){
            var ext = util.getExt(path);
            var mime = Configuration.mime[ext];
            this.writeHead('200',{
                'Context-Type':mime+';charset=utf-8'
            });
            fs.createReadStream(path,{
                encoding:encoding,
                end:()=>this.end()}).pipe(this._serverResponse);
        }
    },
    text:function(text){
        this.writeHead('200',{
            'Context-Type':'application/json;charset=utf-8'
        });
        this.end(text);
    }


}
module.exports = Response;