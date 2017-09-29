'use strict'
var fs = require('fs');
var util = require('./util/util');
var Configuration = require('./Configuration');
var Headers = require('./Headers');
var Buffer = require('buffer').Buffer;
var File = require('./File');
function Response(serverResponse, request) {
    this._serverResponse = serverResponse;
    this.headers = new Headers();
    this.request = request;
    this._headerWrited = false;
    this._canWrite = true;
}
Response.prototype = {
    constructor: Response,
    writeContinue: function () {
        this._serverResponse.writeContinue();
    },
    writeHead: function (statusCode, statusMessage, headers) {
        if(typeof statusMessage!=='string'){
            headers = statusMessage;
            statusMessage = '';
        }
        headers = headers ||{};
        this._headerWrited = true;
        for (var o in headers) {
            this.headers.append(o, headers[o]);
        }
        this.headers.append('Date', new Date().toGMTString());
        this.headers.append('X-Powered-By', 'node-server-s2');
        this._serverResponse.writeHead(statusCode, statusMessage, this.headers.serialize());
    },
    setHeader: function (name, value) {
        this._serverResponse.setHeader(name, value);
    },
    write: function (chunk, charset, callback) {
        if(!this._headerWrited){
            this.writeHead('200');
        }
        this._serverResponse.write(chunk, charset, callback);
    },
    end: function (data, charset, callback) {
        this._serverResponse.end(data, charset, callback);
        this.request.destroy();
    },
    json: function (source) {
        var text = JSON.stringify(source);
        this.headers.append('Content-Type', 'application/json;charset=utf-8');
        this.headers.append('Content-Length', '' + text.length);
        this._serverResponse.writeHead('200', this.headers.serialize());
        this.end(text);
    },
    file: function (file, charset) {
        if (typeof file === 'string') {
            file = new File(file);
        }
        var ext = file.ext.slice(1);
        var mime = Configuration.mime[ext];
        var size = file.size;
        this.headers.append('Content-Type', mime + ';charset=utf-8');
        this.headers.append('Expires', new Date(Date.now() + 30 * 24 * 3600 * 1000).toGMTString());
        this.headers.append('Last-Modified', new Date(file.mtime).toGMTString());
        this.headers.append('Content-Length', '' + size);
        this.writeHead('200');
        var stream = fs.createReadStream(file.path, {
            encoding: charset
        });
        stream.pipe(this._serverResponse,{ end: false });
        stream.on('end', (e) => {
            this.end();
        });
    },
    text: function (text) {
        this.headers.append('Content-Type', 'text/plain;charset=utf-8');
        this.headers.append('Content-Length', '' + text.length);
        this.writeHead('200');
        this.end(text);
    },
    addCookie: function (cookie) {
        this.headers.append('Set-Cookie', cookie.toString());
    },
    removeCookie: function (cookies) {

    }
}
module.exports = Response;