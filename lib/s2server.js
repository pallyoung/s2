/**/
(function() {
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

    var CONFIG = {},MINE,CTRLS,cache;

    var HTTPStatus={
        "404":{
            code:404,
            message:"请求的网址无法访问"
        }
    }

    /**
     * @description
     * 对象继承
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
    function mkdirsSync(dirs){
        var parent='';
        dirs = dirs.split(path.sep);
        parent = dirs.shift();
        if(parent === ""){
            parent = path.sep;
        }
        if(!fs.existsSync(parent)){
            fs.mkdirSync(parent);
        }
        while(dirs.length!==0){
            parent+=path.sep+dirs.shift();
            if(!fs.existsSync(parent)){
                fs.mkdirSync(parent);
            }
        }
        
    }
    function loadConfig(module) {
        var _config;
        if(typeof module === "string"){
            _config=require(path.resolve(module));
        }else{
            _config = module;
        }
        CONFIG=extend(CONFIG,_config);

        if(_config.mine){
            MINE = _config.mine;
        }

        if(_config.controller){
            CTRLS = _config.controller;
        }
        if(_config.cache){
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
            return ;
        }
        var pathname = url.parse(request.url).pathname.replace(new RegExp(CONFIG.context), "");
        if (/^\/*$/.test(pathname)) {
            pathname = CONFIG.index;
        };
        var ext = getExt(pathname);
        var realPath = decodeURI(path.join(CONFIG.webroot, pathname));
        var s2Request = null;
        var controller;
        if (ext === "") {
            controller = findController(pathname);
            if (null != controller) {
                s2Request = new S2Request(request);
                s2Request.on("ready", function() {
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
        this.parameters = {};
        this.length = 0;
        this.buffer = new Buffer(0);
        this.type = 0;
        this.multipartParser=null;
        request.on("data", function(chunk) {
            var contenttype = self.headers["content-type"];
            var boundary;
            if(contenttype.indexOf("multipart/form-data")!==-1){
                self.type = 1;
                if(self.multipartParser==null){
                    if(/boundary=(.+)/i.test(contenttype)){
                        boundary = RegExp.$1;
                    }
                    self.multipartParser =  new MultipartParser(boundary);
                    self.multipartParser.cache =  CONFIG.cache;
                    self.multipartParser.onend=function(){
                        self.parameters  =  self.multipartParser.parameters;
                        self.emit("ready");                     
                    };
                }
                self.multipartParser.pushBufferToParse(chunk);
            }else{
               self.buffer=Buffer.concat([self.buffer,chunk]); 
            }
            self.length+= chunk.length;
            
        });

        request.on("end", function() {
            if(self.type == 0){
                self.parameters = queryString.parse(self.buffer.toString("utf8"));
                 self.emit("ready");
            }                     
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
        return this.parameters[key]||null;
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
    loadConfig(config);
    module.exports = {
        loadConfig: loadConfig,
        server:server,
        listen: function() {
            server.close(function(){
                server.listen(CONFIG.port);
                console.log("Server is runing.");
                console.log(util.inspect(CONFIG));
            });         
        },
        VERSION:VERSION
    }
    module.exports.listen()
})();