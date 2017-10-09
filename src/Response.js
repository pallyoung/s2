'use strict'
var fs = require('fs');
var util = require('./util/util');
var Configuration = require('./Configuration');
var Headers = require('./Headers');
var Buffer = require('buffer').Buffer;
var File = require('./File');
var { EventEmitter } = require('events');
var http = require('http');
var zlib = require('zlib');

const gzip = zlib.createGzip();

function Response(serverResponse, request) {
    serverResponse.request = request;
    serverResponse.headers = new Headers();
    return serverResponse;
}

var _proto_ = http.ServerResponse.prototype;

var writeHead = _proto_.writeHead;
var end = _proto_.end;
var write = _proto_.write;
var prototype = {

    writeHead: function (statusCode, statusMessage, headers) {
        if (typeof statusMessage !== 'string') {
            headers = statusMessage;
            statusMessage = '';
        }
        headers = headers || {};
        this._headerWrited = true;
        for (var o in headers) {
            this.headers.append(o, headers[o]);
        }
        this.headers.append('X-Powered-By', 'node-server-s2');
        if (Configuration.gzip) {
            this.headers.append('content-encoding', 'gzip');
        }
        if (this.request.sessionCookie) {
            var scookie = this.request.sessionCookie;
            var session = this.request.getSession();
            session.resetExpires();
            scookie.setMaxAge(session.maxAge);
            this.addCookie(scookie);
        }
        writeHead.call(this, statusCode, statusMessage, this.headers.serialize());
    },
    write: function (chunk, encoding, cb) {
        if (Configuration.gzip) {
            write.call(this,zlib.gzipSync(chunk),encoding, cb);
        } else {
            write.call(this, chunk, encoding, cb);
        }
    },
    end: function (data, charset, callback) {
        end.call(this, data, charset, callback);
        // this.request.destroy();
    },
    json: function (source) {
        var text = JSON.stringify(source);
        this.headers.append('Content-Type', 'application/json;charset=utf-8');
        this.headers.append('Content-Length', '' + text.length);
        this.writeHead('200');
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
        stream.pipe(this);
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

Object.assign(_proto_, prototype);

module.exports = Response;