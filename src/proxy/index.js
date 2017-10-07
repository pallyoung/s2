'use strict'
var http = require('http');
var https = require('https');
var URL = require('url');

var Options = require('./Options');
function proxy(request,response){
    var options = new Options(request);
    var httpclient = http;
    if (request.protocol === 'https:') {
        httpclient = https;
    }
    var client = httpclient.request(options.serialize(),function(comingMessaage){
        response.writeHeader(comingMessaage.statusCode,comingMessaage.statusMessage,comingMessaage.headers);
        comingMessaage.pipe(response);
    });
    request.pipe(client);
}