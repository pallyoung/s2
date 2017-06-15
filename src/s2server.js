/**/
"use strict"
var http = require('http');
var path = require('path');
var url = require('url');
var util = require("util");
var queryString = require("querystring");
var Buffer = require('buffer').Buffer;
var EventEmitter = require("events").EventEmitter;
var fs = require("fs");
var MultipartParser = require("./multipart_parser");
var config = require("./config/config");
/**
* @description
* version
**/
var VERSION = "0.2.3";

var CONFIG = {}, MINE, CTRLS, cache;

var HTTPStatus = {
    "404": {
        code: 404,
        message: "请求的网址无法访问"
    }
}

function getExt(pathname) {
    var ext = path.extname(pathname);
    ext = ext ? ext.slice(1) : "";
    return ext;
}

function getPathName(request) {
    return url.parse(request.url).pathname;
}
function mkdirsSync(dirs) {
    var parent = '';
    dirs = dirs.split(path.sep);
    parent = dirs.shift();
    if (parent === "") {
        parent = path.sep;
    }
    if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent);
    }
    while (dirs.length !== 0) {
        parent += path.sep + dirs.shift();
        if (!fs.existsSync(parent)) {
            fs.mkdirSync(parent);
        }
    }

}
function loadConfig(module) {
    var _config;
    if (typeof module === "string") {
        _config = require(path.resolve(module));
    } else {
        _config = module;
    }
    CONFIG = extend(CONFIG, _config);

    if (_config.mine) {
        MINE = _config.mine;
    }

    if (_config.controller) {
        CTRLS = _config.controller;
    }
    if (_config.cache) {
        cache = _config.cache;
        mkdirsSync(cache);
    }
}

function findController(url) {
    var paths = url.split(path.sep);
    var _path;
    var controller = CTRLS;
    for (var i = 0; i < paths.length; i++) {
        _path = paths[i];
        if (_path === "") {
            continue;
        } else if (controller[_path]) {
            controller = controller[_path];
        } else {
            return null;
        }
    }
    return controller;
}

function responseError(response, status, error) {
    response.writeHead(status.code, {
        'Content-Type': 'text/plain;charset=utf-8'
    });
    response.write(status.message);
    response.end();
}

function route(request, response) {
    if (!new RegExp(CONFIG.context).test(url.parse(request.url).pathname)) {
        responseError(response, HTTPStatus["404"]);
        return;
    }
    var pathname = url.parse(request.url).pathname.replace(new RegExp(CONFIG.context), "");
    if (/^\/*$/.test(pathname)) {
        pathname = CONFIG.index;
    };
    var realPath = decodeURI(path.join(CONFIG.webroot, pathname));
    var s2Request = null;
    var controller;

    fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
            controller = findController(pathname);
            if (null != controller) {
                s2Request = new S2Request(request);
                s2Request.on("ready", function () {
                    controller(s2Request, response);
                });
            } else {
                responseError(response, HTTPStatus["404"]);
            }
            return true;
        } else {
            var contentType = MINE[ext] + ";charset=" + CONFIG.unicode || "text/plain" + ";charset=" + CONFIG.unicode;
            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, "binary");
            response.end();
        }
    });
}




function s2serverListener(req, res) {
    try {
        route(req, res);
    } catch (e) {
        console.log(util.inspect(e));
        responseError(res, HTTPStatus["404"]);
    }
}

function createServer(fn) {
    return http.createServer(fn);
}

var server = createServer(s2serverListener);
loadConfig(config);
module.exports = {
    loadConfig: loadConfig,
    server: server,
    listen: function () {
        server.close(function () {
            server.listen(CONFIG.port);
            console.log("Server is runing.");
            console.log(util.inspect(CONFIG));
        });
    },
    VERSION: VERSION
}