'use strict'
var http = require('http');
var CONFIG = require('./CONFIG');
var fs = require('fs');

function Application() {
    var httpServer = http.createServer();
    var self = this;
    httpServer.on('request', function (comingMessage, serverResponse) {
        serverResponse.writeHead(200, {
            'Content-Type': 'text/plain;charset=utf-8'
        });
        serverResponse.write('hello world');
        serverResponse.end();
    });
    httpServer.on('clientError', function () {

    });
    httpServer.on('error', function () {

    })
    this.httpServer = httpServer;

}

Application.prototype = {
    constructor: Application,
    close: function (callback) {
        if (this.httpServer.listening){
            this.httpServer.close(callback);
        }else{
            callback();
        }
    },
    _start:function(){
        var self = this;
        if (this.httpServer.listening){
            this.httpServer.close(function(){
                self.httpServer.listen(CONFIG.port);
            });
        }else{
            self.httpServer.listen(CONFIG.port);
        }    
    },
    start: function () {
        CONFIG.load();
        this._start();
    }
}

var exports = module.exports = new Application();
