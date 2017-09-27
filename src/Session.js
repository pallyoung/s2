'use strict'

const SessionPool = new Map();

const expires = 20 * 60 * 1000;

function id() { 
    
}

function Session(sessionId) {
    SessionPool.set(sessionId, this);
    this.sessionId = sessionId;
    this._map = new Map();
    this.expires = expires + Date.now();
}

Session.prototype = {
    constructor: Session,
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
        this._map = null;
        this.expires = 0;
        SessionPool.delete(this.id)
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

getSession.getSession = getSession;

module.exports = Session;