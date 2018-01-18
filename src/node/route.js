'use strict'
var Request = require('./../Request');
var Response = require('./../Response');
var url = require('url');
var Router = require('./../Router');
var Configuration = require('./../Configuration');

function route(source,next,abort){
    var pathname = url.parse(source.request.url).pathname;
    var controller = Router.route(pathname);
    if (!controller) {
        pathname = pathname == '/'?Configuration.assert+'/index.html':Configuration.assert + pathname;
        source.assert = pathname;
    } else {
        source.controller = controller;
    }
    next();
}


var exports = module.exports = route;