'use strict'
var EventEmitter = require("events").EventEmitter;
var queryString = require("querystring");
var bodyParser = require('./BodyParser');
var url = require("url");
var stream, { Readable } = require('stream');
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
    commingMessage.bodyParser;
    var cookies = commingMessage.headers.cookie;
    var cookieJar = {}
    if (cookies) {
        cookies.split(';').forEach(function (c) {
            var cookie = new Cookie(c.trim());
            cookieJar[cookie.getName()] = cookie;
        });
    }
    commingMessage.cookieJar = cookieJar;
    commingMessage._body = null;
    commingMessage.sessionCookie = commingMessage.cookieJar[SESSION_ID];
    return commingMessage;
};

var _proto_ = http.IncomingMessage.prototype;

var prototype = {
    /**
     * @description
     * 获取get方式提交的数据
     **/
    queryString: function (key) {
        return url.parse(this.url, true).query[key];
    },
    /**
     * @description
     * 获取post方式提交的数据
     **/
    body: function () {
        if (!this._bodyParser) {
            this._bodyParser = bodyParser(this.headers['content-type'], this).then((body) => {
                this._body = body;
                return body;
            }, function (err) {
                return err;
            }).catch(function (err) {
                return err;
            });
        }
        return this._bodyParser;
    },
    getCookie: function (name) {
        return this.cookieJar[name];
    },
    getSession: function () {
        var cookie = this.sessionCookie;
        if (cookie) {
            return Session.getSession(cookie.getValue())
        } else {
            let session = Session.getSession();
            cookie = new Cookie(SESSION_ID, session.getId(), session.maxAge);
            this.sessionCookie = cookie;
            return session;
        }
    }
}
Object.assign(_proto_,prototype);

module.exports = Request;