'use strict'
var EventEmitter = require("events").EventEmitter;
var queryString = require("querystring");
var url = require("url");
/**
 * @description
 * 封装Request对象
 **/

var MultipartParser = require('./multipart_parser');
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
    this._cookies = this.getCookies(); 
    this.body = null;   
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
    if(typeof this.body == 'object'){
        return this.body[key];
    }
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

Request.prototype.getSession=function(){
    
}

module.exports = Request;