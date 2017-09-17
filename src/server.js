'use strict'
var http = require('http');
var Configuration = require('./Configuration');
var fs = require('fs');
var Request = require('./Request');
var Response = require('./Response');
var route = require('./Router').route;
var Pipe = require('pipexjs');
var url = require('url');
function Server() {
    var httpServer = http.createServer();
    var self = this;
    this.routePipe = Pipe(function (source, next, abort) {
        var pathname =url.parse(source.request.url).pathname;
        var controller = route(pathname);
        if(!controller){
            pathname = Configuration.assert+pathname;
            source.assert = pathname;
            self.assertPipe.source(source);
        }else{
            source.controller = controller;
            self.controllerPipe.source(source);
        }
        abort();
    });
    this.assertPipe = Pipe(function (source, next, abort) {
        var response = source.response;
        response.file(source.assert);
        abort();
    });
    this.controllerPipe = Pipe(function(source, next, abort){
        var controller = source.controller;
        controller(source.request,source.response);
        abort();

    });
    this.errorPipe = Pipe(function(source, next, abort){
        var response = source.response;
        response.writeHead('404',{
            "content-type":"text/plain;charset=utf-8"
        })
        response.write('404');
        response.end();
        abort();

    });
    httpServer.on('request', function (comingMessage, serverResponse) {
        self.routePipe.source({
            request: new Request(comingMessage),
            response: new Response(serverResponse)
        });
    });
    httpServer.on('clientError', function () {

    });
    httpServer.on('error', function () {

    })
    this.httpServer = httpServer;

}

Server.prototype = {
    constructor: Server,

    close: function (callback) {
        if (this.httpServer.listening) {
            this.httpServer.close(callback);
        } else {
            callback();
        }
    },
    _listen: function () {
        var self = this;
        if (this.httpServer.listening) {
            this.httpServer.close(function () {
                self.httpServer.listen(Configuration.port);
            });
        } else {
            self.httpServer.listen(Configuration.port);
        }
    },
    listen: function () {
        Configuration.load();
        this._listen();
    }
}

var exports = module.exports = new Server();
