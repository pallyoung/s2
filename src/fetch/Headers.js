'use strict'
var util = require('./../util/util');
function fixKey (key){
    return key.toLowerCase().replace(/\b\w/g,function(c){
        return c.toUpperCase();
    });
}
function assignHeaders(headers,dist){
    if(!headers){
        return;
    }
    if(headers instanceof(Headers)){
        var keys =headers.keys();
        keys.forEach(function(key){
            dist.append(key,headers.get(key));
        })
    }else {
        for(var o in headers){
            if(headers.hasOwnProperty(o)){
                dist.append(o,headers[o]);
            }
        }
    }
}
function HeaderPair(key,values){
    this.key = key;
    this._values = values || [];
}
HeaderPair.prototype = {
    HeaderPair:Headers,
    append:function(value){
        this._values.push(value);
    },
    toString(){
        return this._values.join(',');
    }
}
function Headers(headers){
    this._headerPairs = {};
    assignHeaders(headers,this);
}
Headers.prototype = {
    constructor:Headers,
    append:function(key,value){
        key = fixKey(key);
        var headerPair = this._headerPairs[key]||new HeaderPair(key);
        headerPair.append(value);
        this._headerPairs[key] = headerPair;
    },
    delete:function(key){
        key = fixKey(key);
       delete this._headerPairs[key];
    },
    get:function(key){
        key = fixKey(key);
        var headerPair = this._headerPairs[key];
        if(headerPair){
            return headerPair.toString();
        }
        return;
    },
    has:function(key){
        key = fixKey(key);
        return !!this._headerPairs[key];
    },
    keys:function(){
        var keys = [];
        for(var key in this._headerPairs){
            keys.push(key);
        }
        return keys;
    },
    set:function(key,value){
        key = fixKey(key);
        this._headerPairs[key] = new HeaderPair(key,[value]);
    },
    values:function(){
        var values = [];
        for(var key in this._headerPairs){
            var headerPair = this._headerPairs[key];
            values.push(headerPair.toString());
        }
        return values;
    },
    serialize:function(){
        var data = {};
        for(var key in this._headerPairs){
            var headerPair = this._headerPairs[key];
            data[key] = headerPair.toString();
        }
        return data;
    }
}

module.exports = Headers;