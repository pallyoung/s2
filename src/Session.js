'use strict'
var Cookie = require('./Cookie');
const SessionPool = new Map();

const expires =  1200;

function id() {
    return 'x000000000000000000000000y'.replace(/[0xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c == '0' ? r : (r & 4 | 0xa);
        return v.toString(16);
    });
}

function Session(sessionId) {
    SessionPool.set(sessionId, this);
    this.sessionId = sessionId;
    this._map = new Map();
    this.maxAge = expires;
    this._destory = setTimeout(() => {
        this.destory();
    }, expires);
}

Session.prototype = {
    constructor: Session,
    resetExpires: function () {
        clearTimeout(this._destory);
        this._destory = setTimeout(() => {
            this.destory();
        }, expires*1000);
    },
    get: function (key) {
        return this._map.get(key);
    },
    set: function (key, value) {
        return this._map.set(key, value);
    },
    has: function (key) {
        return this._map.has(key);
    },
    remove: function (key) {
        return this._map.delete(key);
    },
    destory: function () {
        SessionPool.delete(this.sessionId);        
        this._map = null;
        this.expires = 0;
    },
    isLive: function () {
        return this.expires - Date.now() > 0;
    },
    getId: function (params) {
        return this.sessionId;
    }
}

function getSession(sessionId) {
    sessionId = sessionId || id();
    var session = SessionPool.get(sessionId);
    if (!session) {
        session = new Session(sessionId);
    }
    return session;
}

Session.getSession = getSession;

module.exports = Session;