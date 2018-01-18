'use strict'
function error(source,next,abort){
    var response = source.response;
    response.writeHead(source.code, {
        "content-type": "text/plain;charset=utf-8"
    })
    response.end(source.message);
    abort();
}

module.exports = error;