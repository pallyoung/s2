/**/
"use strict"
var server = require('./server');
var controller = require('./controller');
var Pipe = require('pipexjs');
var exports = module.exports = server;

exports.controller = controller;
exports.Pipe = Pipe;