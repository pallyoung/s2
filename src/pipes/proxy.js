'use strict'
var Pipe = require('pipexjs');
var HttpRequest = require('./../HttpRequest');
var url = require('url')

function proxy(source, next, abort) {
    var proxyCoinfig = require('./../Configuration').proxy || {};
    var keys = Object.keys(proxyCoinfig);
    var request = source.request;
    var uri = url.parse(request.url);
    var paths = uri.path.split('/');
    var config = proxyCoinfig['/'+paths[1]];
    if(config){
        uri.host = config.target;   
        uri.path = uri.path.replace('/'+paths[1],'');     
        request.url = uri.host+'/'+uri.path;
        HttpRequest.request(request,source.response);
        abort();
    }else{
        next();
    }
}
module.exports = function () {
    return new Pipe(proxy);
}