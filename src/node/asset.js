'use strict'
var fs = require('fs');
function asset(source,next,abort){
    var response = source.response;
    var assert = source.assert;
    var request = source.request;
    var code = 200;
    var success = true;
    var message = '';
    if(!assert){
       return next();
    }else if (typeof assert == 'string' && !fs.existsSync(assert)) {
        code = 404;
        success = false;
        message = '404';
    } else {
        response.file(source.assert);
    }
    source.code = code;
    source.success = success;
    source.message = message;
    next(source);
}

module.exports = asset;