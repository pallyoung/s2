'use strict'
var EventEmitter = require("events").EventEmitter;
var queryString = require("querystring");
var bodyParser = require('./BodyParser');
var url = require("url");
var stream,{Readable} = require('stream');
var http = require('http');
var IncomingMessage = http.IncomingMessage;
var Session = require('./Session');

const SESSION_ID = 'S2SESID';
/**
 * @description
 * 封装Request对象
 **/

var util = require('./util/util');

var Cookie = require('./Cookie');
function Request(commingMessage) {
    var self = this;
    Object.assign(this,commingMessage);
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
    this.bodyParser;
    var cookies = this.headers.cookie;
    var cookieJar = {}
    if(cookies){
        cookies.split(';').forEach(function(c){
            var cookie = new Cookie(c.trim());
            cookieJar[cookie.getName()] = cookie;
        });
    }
    this.cookieJar = cookieJar;
    this._body = null;  
    this.sessionCookie = this.cookieJar[SESSION_ID];
};

Request.prototype = http.IncomingMessage.prototype;


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
Request.prototype.body = function(){
    if(!this._bodyParser){
        this._bodyParser =  bodyParser(this.headers['content-type'], this).then((body)=>{
            this._body = body;
            return body;
        },function(err){
            return err;
        }).catch(function(err){
            return err;
        });
    }
    return this._bodyParser;
}

Request.prototype.getCookie = function(name){
    return this.cookieJar[name];
}

Request.prototype.getSession=function(){
    var cookie = this.sessionCookie;
    if(cookie){
        return Session.getSession(cookie.getValue())        
    }else{
        let session = Session.getSession();
        cookie = new Cookie(SESSION_ID,session.getId(),session.maxAge);
        this.sessionCookie = cookie;
        return session;
    }
}

module.exports = Request;