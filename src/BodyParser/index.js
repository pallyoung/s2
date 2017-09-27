'use strict'

var json = require('./json');
var plain = require('./plain');
var urlencoded = require('./urlencoded');
var multipart = require('./multipart');
function getParserByContentType(contentType) {
    var type = contentType.split(';')[0];
    switch (type) {
        case 'application/json':
            return json;
        case 'text/plain':
            return plain;
        case 'application/x-www-form-urlencoded':
            return urlencoded;
        case 'multipart/form-data':
            return multipart;
    }
}

module.exports = function parser(contentType, stream) {
    contentType = contentType || 'text/plain';
    var parser = getParserByContentType(contentType) || plain;
    return parser(contentType, stream);
}