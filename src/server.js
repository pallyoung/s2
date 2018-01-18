'use strict'
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var Configuration = require('./Configuration');
var fs = require('fs');
var Request = require('./Request');
var Response = require('./Response');
var url = require('url');
var Cookie = require('./Cookie');
var File = require('./File');


var assert = require('./node/asset');
var route = require('./node/route');
var controller = require('./node/controller');
var error = require('./node/error');
var proxy = require('./node/proxy');

function Server() {
    EventEmitter.call(this);
    var httpServer = http.createServer();
    var self = this;
    this.server = Server;
    this._errorPipe = new Pipe(error);
    this._requestPipe.append(proxy);
    this._requestPipe.append(route);
    this._requestPipe.append(assert);
    this._requestPipe.append(controller);
    this._requestPipe.append(function (source, next, abort) {
        if (!source.success) {
            self.errorPipe.source(source);
        } else {
            abort();
        }
    });

    httpServer.on('request', function (comingMessage, serverResponse) {
        var request = Request(comingMessage);
        var response = Response(serverResponse, request);
        self.routePipe.source({
            request,
            response,
            code: 0,
            success: undefined,
            asset: undefined,
            controller: undefined
        });

    });
    httpServer.on('clientError', function (e) {
        console.log(e)
        self.emit('clientError');
    });
    httpServer.on('error', function (e) {
        console.log(e)
        self.emit('error')
    })
    this.httpServer = httpServer;

}

var prototype = {
    constructor: Server,
    insertNodeBefore:function(targetNode,beforeNode){

    },
    appendNode:function(targetNode){

    },
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
Server.prototype = new EventEmitter();

for(var prop in prototype){
    Server.prototype[prop] = prototype[prop];
}

var server = new Server();
var exports = module.exports = server;
