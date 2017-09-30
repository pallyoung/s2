'use strict'
var http = require('http');
var Configuration = require('./Configuration');
var fs = require('fs');
var Request = require('./Request');
var Response = require('./Response');
var route = require('./Router').route;
var Pipe = require('pipexjs');
var url = require('url');
var Cookie = require('./Cookie');
var File = require('./File');
function Server() {
    var httpServer = http.createServer();
    var self = this;
    this.routePipe = Pipe(function (source, next, abort) {
        var pathname = url.parse(source.request.url).pathname;
        var controller = route(pathname);
        if (!controller) {
            pathname = Configuration.assert + pathname;
            source.assert = pathname;
            self.assertPipe.source(source);
        } else {
            source.controller = controller;
            self.controllerPipe.source(source);
        }
        abort();
    });
    this.assertPipe = Pipe(function (source, next, abort) {
        var response = source.response;
        var assert = source.assert;
        var request = source.request;
        if (typeof assert == 'string' && !fs.existsSync(assert)) {
            source.errorMessage = '404';
            self.errorPipe.source(source);
        } else {
            response.file(source.assert);
        }
        abort();
    });
    this.controllerPipe = Pipe(function (source, next, abort) {
        var controller = source.controller;
        try {
            controller(source.request, source.response);
        } catch (e) {
            source.errorMessage = '503';
            this.errorPipe.source(source);
        }
        abort();

    });
    this.errorPipe = Pipe(function (source, next, abort) {
        var response = source.response;
        response.writeHead(source.errorMessage, {
            "content-type": "text/plain;charset=utf-8"
        })
        response.end(source.errorMessage);
        abort();

    });
    httpServer.on('request', function (comingMessage, serverResponse) {
        var request = new Request(comingMessage);
        var response = new Response(serverResponse, request);        
        self.routePipe.source({
            request,
            response
        });

    });
    httpServer.on('clientError', function () {
        this.errorPipe.source('503');
    });
    httpServer.on('error', function () {
        this.errorPipe.source('503');
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
