'use strict'
/**
 * @description
 * 封装Request对象
 **/

var MultipartParser = require('./MultipartParser');
var Utils = require('./Utils');
function S2Request(request) {
    var self = this;
    this._request = request;
    Utils.extend(this, request);
    this.parameters = {};
    this.length = 0;
    this.buffer = new Buffer(0);
    this.type = 0;
    this.multipartParser = null;
    request.on("data", function (chunk) {
        var contenttype = self.headers["content-type"];
        var boundary;
        if (contenttype.indexOf("multipart/form-data") !== -1) {
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

    request.on("end", function () {
        if (self.type == 0) {
            self.parameters = queryString.parse(self.buffer.toString("utf8"));
            self.emit("ready");
        }
    });


};

S2Request.prototype = new EventEmitter();

/**
 * @description
 * 获取get方式提交的数据
 **/

S2Request.prototype.queryString = function (key) {
    return url.parse(this.request.url, true).query[key];
};

/**
 * @description
 * 获取post方式提交的数据
 **/

S2Request.prototype.getParameter = function (key) {
    return this.parameters[key] || null;
};