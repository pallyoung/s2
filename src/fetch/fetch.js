'use strict'
var http = require('http');
var https = require('https');
var Request = require('./Request');
var Response = require('./Response');
var URL = require('url');
function fetch(url, request) {
    request = new Request(url, request);
    console.log(url)
    var httpclient = http;
    if (request.protocol === 'https:') {
        httpclient = https;
    }
    return new Promise(function (resolve, reject) {
        console.log(request.serialize())
        requestClient = httpclient.request(request.serialize(), function (res) {
            new Response(res);
            resolve(new Response(res));
        });
        requestClient.on('error',function(e){
            console.log(e)
            reject();
        });
        if (request.body) {
            request.write(request.body)
        }
        request.end();
    });


}

module.exports = fetch;
