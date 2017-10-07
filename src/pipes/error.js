'use strict'
var Pipe = require('pipexjs');
function error(source,next,abort){
    var response = source.response;
    response.writeHead(source.code, {
        "content-type": "text/plain;charset=utf-8"
    })
    response.end(source.message);
    abort();
}

module.exports = function(){
    return new Pipe(error);
}