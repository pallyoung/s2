'use strict'
var Pipe = require('pipexjs');
function controller(source,next,abort){
    var controller = source.controller;
    var code = 200;
    var success = true;
    var message = ''
    if(!controller){
        next();
        return;
    }
    try {
        controller(source.request, source.response);
    } catch (e) {
        success = false;
        code = 503;
        message = '内部服务器错误';
    }
    source.success = success;
    source.code = code;
    source.message = message;
    next(source);
}

module.exports = function(){
    return new Pipe(controller);
}