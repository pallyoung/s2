'use strict'
var path = require('path');
var url = require('url');
var fs = require("fs");
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

function iterator(dest,callback){
    for (var o in dest){
        if(dest.hasOwnProperty(o)){
            if(!callback(o,dest[o],dest)){
                continue;
            }else{
                return;
            }
            
        }
    }
}

module.exports = {
    extend:extend,
    getExt:getExt,
    getPathName:getPathName,
    mkdirsSync:mkdirsSync,
    iterator:iterator
}