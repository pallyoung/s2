'use strict'
/**
 * fetch辅助类
 */
var Headers = require('./Headers');
var URL = require('url');

var REQUEST_KEYS = [
    'mode',
    'method',
    'host',
    'hostname',
    'port',
    'protocol',
    'path',
    'family',
    'agent',
    'createConnection',
    'timeout',
    'auth',
    'localAddress',
    'headers',


];
function Request(url, request) {
    if (url === undefined) {
        throw new Error();
    }
    if (typeof url === 'object') {
        request = url;
        url = '';
    }
    var uri = URL.parse(url);
    request = request || {};
    //Contains the mode of the request (e.g., cors, no-cors, same-origin, navigate.)
    this.mode = request.mode || 'cors';
    //Contains the request's method (GET, POST, etc.)
    this.method = request.method || 'GET';

    this.host = uri.host;
    this.hostname = uri.hostname;
    this.protocol = uri.protocol;
    this.port = uri.port||80;
    this.path = uri.path;
    this.family = request.family;
    this.agent = request.agent;
    this.createConnection = request.createConnection;

    this.timeout = request.timeout;
    this.auth = request.auth;
    this.localAddress = request.localAddress;
    this.socketPath = request.socketPath;
    this.headers = new Headers(request.headers).serialize();
    if(typeof request.body === 'object'){
        this.body = JSON.stringify(request.body);
    }else{
        this.body = request.body;        
    }
    if (!this.headers['Content-Type']) {
        this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

}

Request.prototype = {
    contructor: Request,
    serialize: function () {

        var value = {};
        var self = this;
        REQUEST_KEYS.forEach(function (key) {
            if (self[key]) {
                value[key] = self[key]
            }

        })
        return value;
    }
}
module.exports = Request;