'use strict'
var http = require('http');
var Configuration = require('./Configuration');
var fs = require('fs');
var Request = require('./Request');
var Response = require('./Response');
var Pipe = require('pipexjs');
var url = require('url');
var Cookie = require('./Cookie');
var File = require('./File');

var assertPipe = require('./pipes/asset');
var routePipe = require('./pipes/route');
var controllerPipe = require('./pipes/controller');
var errorPipe = require('./pipes/error');
var proxyPipe = require('./pipes/proxy');
function Server() {
    var httpServer = http.createServer();
    var self = this;

    this.routePipe = routePipe();
    this.assertPipe = assertPipe();
    this.controllerPipe = controllerPipe();
    this.errorPipe = errorPipe();
    this.proxyPipe = proxyPipe();
    this.proxyPipe.after(this.routePipe);
    this.routePipe.after(this.assertPipe);
    this.assertPipe.after(this.controllerPipe);
    this.controllerPipe.after(Pipe(function(source,next,abort){
        if(!source.success){ 
            self.errorPipe.source(source);
        }else{
            abort();
        }
    }));

    httpServer.on('request', function (comingMessage, serverResponse) {
        var request = Request(comingMessage);
        var response = Response(serverResponse, request);    
        self.routePipe.source({
            request,
            response,
            code:0,
            success:undefined,
            asset:undefined,
            controller:undefined
        });

    });
    httpServer.on('clientError', function (e) {
        console.log(e)
    });
    httpServer.on('error', function (e) {
        console.log(e)
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
