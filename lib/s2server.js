(function() {

    var http = require('http');
    var path = require('path');
    var url = require('url');
    var util = require("util");
    var queryString = require("querystring");
    var Buffer = require('buffer').Buffer;
    var EventEmitter = require("events").EventEmitter;
    var fs = require("fs");

    var CONFIG = require("./config/config");

    var MINE = require("./config/mine_config");

    var CTRLS = require("./config/ctrls_config");

    var HTTPStatus={
        "404":{
            code:404,
            message:"请求的网址无法访问"
        }
    }

    /**
     * @description
     * 对象继承
     *
     *
     **/

    function extend(dst, source) {
        for (var o in source) {
            dst[o] = source[o];
        }
        return dst;
    }

    function getExt(pathname) {
        var ext = path.extname(pathname);
        ext = ext ? ext.slice(1) : "";
        return ext;
    }

    function getPathName(request) {
        return url.parse(request.url).pathname;
    }

    function loadConfig(module) {
        var _config=require(path.resolve(module));

        CONFIG=extend(CONFIG,_config);

        if(_config.mine){
            MINE = require(path.resolve(_config.mine));
        }

        if(_config.controller){
            CTRLS = require(path.resolve(_config.controller));
        }
    }

    function findController(url) {
        var paths = url.split("\/");
        var path;
        controller = CTRLS;
        for (var i = 0; i < paths.length; i++) {
            path = paths[i];
            if (path === "") {
                continue;
            } else if (controller[path]) {
                controller = controller[path];
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
            return ;
        }
        var pathname = url.parse(request.url).pathname.replace(new RegExp(CONFIG.context), "");
        if (/^\/*$/.test(pathname)) {
            pathname = config.index;
        };
        var ext = getExt(pathname);

        var realPath = decodeURI(path.join(CONFIG.webroot, pathname));
        var s2Request = null;
        var controller;
        if (ext === "") {
            controller = findController(pathname);
            if (null != controller) {
                s2Request = new S2Request(request);
                s2Request.on("end", function() {
                    controller(s2Request, response);
                });
            } else {
                responseError(response, HTTPStatus["404"]);
            }
            return true;
        } else {
            fs.readFile(realPath, "binary", function(err, file) {
                if (err) {
                    responseError(response, HTTPStatus["404"]);
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
    }

    /**
     * @description
     * 封装Request对象
     *
     *
     **/

    function S2Request(request) {
        var self = this;
        this._request = request;
        extend(this, request);
        this.data = "";
        this.length = 0;
        this.buffer = [];

        request.on("data", function(chunk) {
            var contenttype = self.headers["content-type"];
            self.data += chunk;
        });

        request.on("end", function() {
            self.data = queryString.parse(self.data);
            //self.emit("requestend", self);
        });


    };

    S2Request.prototype = new EventEmitter();

    /**
     * @description
     * 获取get方式提交的数据
     **/

    S2Request.prototype.queryString = function(key) {
        return url.parse(this.request.url, true).query[key];
    };

    /**
     * @description
     * 获取post方式提交的数据
     **/

    S2Request.prototype.getParameter = function(key) {
        return this.data[key];
    };


    function s2serverListener(req, res) {
        try {
            route(req, res);
        } catch (e) {
           console.log(util.inspect(e));
            responseError(res,HTTPStatus["404"]);
        }
    }

    function createServer(fn) {
        return http.createServer(fn);
    }

    var server =createServer(s2serverListener);
    module.exports = {
        loadConfig: loadConfig,
        server:server,
        listen: function() {
            server.listen(CONFIG.port);
            console.log("Server is runing.");
            console.log(util.inspect(CONFIG));
        },
    }
})();