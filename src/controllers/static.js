'use strict'
var url = require('url');
var fs = require('fs');
var Configuration  = require('./../Configuration');
var util = require('./../util/util')
function file(pathname,response){
    var ext = util.getExt(pathname);
    fs.readFile(pathname
        , "binary", function (err, file) {
        if (err) {
            response.writeHead('404',{
                "content-type":"text/plain;charset=utf-8"
            })
            response.write('404');
            response.end();
            return true;
        } else {
            var contentType = Configuration.mime[ext] + ";charset=" + Configuration.unicode || "text/plain;charset=" + Configuration.unicode;
            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, "binary");
            response.end();
        }
    });
}

module.exports = {
    file
}