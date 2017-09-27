'use strict'
var Buffer = require('buffer').Buffer;
var plain = require('./plain');
var queryString = require("querystring");
module.exports = function parser(contentType,stram){
    return plain(contentType,stram).then(function(content){
        return queryString.parse(content)
    },function(content){
        return content;
    });
}