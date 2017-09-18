'use strict'
const default_expire = 20 * 60 * 1000;
function parse(cookie) {
    if (typeof cookie === 'string') {
        var pairs = cookie.split(';');
        var pair = pairs.shift().split('=');
        cookie = {};

        cookie.name = pair[0];
        cookie.value = pair[1];

        
        pairs.forEach(function (item, i) {
            var pair = item.split('=');
            var key = pair[0].trim();
            var value =  true;
            if(pair[1]){
                value = pair[1].trim();
            }
            cookie[key] = value;
        });
    }
    var name = cookie.name;
    var value = cookie.value;
    var maxAge = cookie.maxAge;
    var domain = cookie.domain;
    var path = cookie.path;
    var secure = cookie.secure;
    var httpOnly = cookie.httpOnly;

    return new Cookie(name, value, maxAge, domain, path, secure, httpOnly);
}

function Cookie(name, value, maxAge, domain, path, secure, httpOnly) {
    if(arguments.length==1){
        return parse(name);
    }
    this._name = name;
    this._value = value;
    this._maxAge = isNaN(Number(maxAge)) ? undefined : maxAge;
    this._domain = domain;
    this._path = path;
    this._secure = secure;
    this._httpOnly = httpOnly;
    this._hostOnly = !domain;
}
Cookie.prototype = {
    constructor: Cookie,
    setValue: function (value) {
        this._value = value;
    },
    getValue: function () {
        return this._value;
    },
    setMaxAge: function (maxAge) {
        maxAge = Number(maxAge);
        if (isNaN(maxAge)) {
            throw new Error('max age can\'t be NaN');
        } else {
            this._persistent = true;
            this._maxAge = maxAge;
        }

    },
    setPath: function (path) {
        this._path = path;
    },
    setDomain: function (domain) {
        this._domain = domain;
        this._hostOnly = false;
    },
    setSecure: function (secure) {
        this._secure = secure;
    },
    setName: function (name) {
        this._name = name;
    },
    setHttpOnly: function (isHttpOnly) {
        this._httpOnly = isHttpOnly;
    },
    getName: function () {
        return this._name;
    },
    toString: function () {
        var result = [this._name, '=', this._value];

        if (this._maxAge === 0) {
            result.push('; max-age');
            result.push('=');
            result.push('0');
        } else if (this._maxAge !== undefined) {
            result.push('; expires');
            result.push('=');
            result.push(new Date(Date.now() + this._maxAge * 1000).toGMTString());
        }

        if (!this._hostOnly && this._domain) {
            result.push('; domain=');
            result.push(this._domain);
        }
        result.push('; path=');
        result.push(this._path || '/');
        if (this._secure) {
            result.push('; secure');
        }
        if (this._httpOnly) {
            result.push('; httpOnly');
        }
        result.push(';')
        return result.join('');
    },
    hashCode: function () {

    }
}
Cookie.parse = parse;

module.exports = Cookie;