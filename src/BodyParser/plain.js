'use strict'
var Buffer = require('buffer').Buffer;
module.exports =function parser(contentType,stream){
    var buffer = new Buffer(0);
    return new Promise(function(resolve,reject){
        stream.on('data',function(chunk){
            buffer = Buffer.concat([buffer,chunk]);
        });
        stream.on('end',function(chunk){
            resolve(buffer.toString('utf8'));
        });
        stream.on('error',function(){
            reject();
        });
    });
    
}