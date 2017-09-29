/**/
"use strict"
var server = require('./server');
var controller = require('./controller');
var fetch = require('./fetch');
var Pipe = require('pipexjs');
var exports = module.exports = server;

exports.controller = controller;
exports.fetch = fetch;
exports.Pipe = Pipe;