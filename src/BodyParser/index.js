'use strict'

var json = require('./json');
var plain = require('./plain');
var urlencoded = require('./urlencoded');
var multipart = require('./multipart');

var PARSER_MAP = {

}
function addParser(type,parser){
    PARSER_MAP[type] = parser;
}
function parse(contentType, stream) {
    contentType = contentType || 'text/plain';
    var parser = getParserByContentType(contentType) || plain;
    return parser(contentType, stream);
}
function getParserByContentType(contentType) {
    var type = contentType.split(';')[0];
    if(PARSER_MAP[type]){
        return PARSER_MAP[type]
    }else{
        return plain;
    }
}

addParser('application/json',json);
addParser('text/plain',plain);
addParser('application/x-www-form-urlencoded',urlencoded);
addParser('application/x-www-form-urlencoded',multipart);

module.exports = {
    parse,
    addParser
}