'use strict'
var EventEmitter = require("events").EventEmitter;
var queryString = require("querystring");
var url = require("url");
/**
 * @description
 * 封装Request对象
 **/

// var MultipartParser = require('./MultipartParser');
var util = require('./util/util');

var Cookie = require('./Cookie');
function Request(commingMessage) {
    EventEmitter.call(this);
    var self = this;
    this._commingMessage = commingMessage;
    this.httpVersion = commingMessage.httpVersion;
    this.method = commingMessage.method;
    this.rawHeaders = commingMessage.rawHeaders;
    this.rawTrailers;
    this.socket = commingMessage.socket;
    this.url = commingMessage.url;
    this.headers = commingMessage.headers;
    this.parameters = {};
    this.length = 0;
    this.type = 0;
    this.multipartParser = null;
    this.buffer = new Buffer(0);   
    commingMessage.on("data", function (chunk) {
        var contenttype = self.headers["content-type"];
        var boundary;
        if (false&&contenttype.indexOf("multipart/form-data") !== -1) {
            self.type = 1;
            if (self.multipartParser == null) {
                if (/boundary=(.+)/i.test(contenttype)) {
                    boundary = RegExp.$1;
                }
                self.multipartParser = new MultipartParser(boundary);
                self.multipartParser.cache = CONFIG.cache;
                self.multipartParser.onend = function () {
                    self.parameters = self.multipartParser.parameters;
                    self.emit("ready");
                };
            }
            self.multipartParser.pushBufferToParse(chunk);
        } else {
            self.buffer = Buffer.concat([self.buffer, chunk]);
        }
        self.length += chunk.length;

    });

    commingMessage.on("end", function () {
        if (self.type == 0) {
            self.parameters = queryString.parse(self.buffer.toString("utf8"));
            self.emit("ready");
        }
    });


};

Request.prototype = new EventEmitter();

/**
 * @description
 * 获取get方式提交的数据
 **/

Request.prototype.queryString = function (key) {
    return url.parse(this.url, true).query[key];
};

/**
 * @description
 * 获取post方式提交的数据
 **/

Request.prototype.getParameter = function (key) {
    return this.parameters[key] || null;
};
Request.prototype.destroy = function(){
    this._commingMessage.destroy();
}
Request.prototype.getCookies = function(){
    var cookies = this.headers.cookie;
    if(cookies){
        return cookies.split(';').map(function(cookie){
            return new Cookie(cookie);
        });
    }
}
module.exports = Request;