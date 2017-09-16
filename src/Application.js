'use strict'
var http = require('http');
var Configuration = require('./Configuration');
var fs = require('fs');
function Application() {
    var httpServer = http.createServer();
    var self = this;
    httpServer.on('request', function (comingMessage, serverResponse) {
        require('./Router').route(comingMessage,serverResponse);
        //delete require.cache['/Users/Spencer/workspace/s2/src/Router.js']
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
                self.httpServer.listen(Configuration.port);
            });
        }else{
            self.httpServer.listen(Configuration.port);
        }    
    },
    start: function () {
        Configuration.load();
        this._start();
    }
}

var exports = module.exports = new Application();
