'use strict'
var http = require('http');
var https = require('https');
var Options = require('./Options');
var URL = require('url');

function request(request, response) {
    var options = new Options(request);
    var httpclient = http;
    if (request.protocol === 'https:') {
        httpclient = https;
    }
    var client = httpclient.request(options.serialize(), function (comingMessaage) {
        response.writeHead(comingMessaage.statusCode, comingMessaage.statusMessage, comingMessaage.headers);
        comingMessaage.pipe(response);
    });
    if (request.pipe) {
        request.pipe(client); 
    }else if(request.body){
        client.end(request.body);
        
    }
    return client;
}
module.exports = {
    request
}