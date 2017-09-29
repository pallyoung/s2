'use strict'
var http = require('http');
var https = require('https');
var Request = require('./Request');
var URL = require('url');
function fetch(url, request) {
    request = new Request(url, request);
    var httpclient = http;
    if (request.protocol === 'https:') {
        httpclient = https;
    }
    return new Promise(function (resolve, reject) {
        var requestClient = httpclient.request(request.serialize(), function (res) {
            resolve(res);
        });
        requestClient.on('error', function (e) {
            reject(e);
        });
        if (request.body) {
            requestClient.write(request.body)
        }
        requestClient.end();
    });


}

module.exports = fetch;
