'use strict'

var fs = require('fs');
var url = require('url');
var Configuration = require('./Configuration');
var Request = require('./Request');
var staticControllers = require('./controllers/static');

function fixUrl(url){
    
}
function matchContext(pathname){
    if(pathname == ''||pathname == '/'){
        return true;
    }
    return pathname.startsWith(Configuration.context);
}
function route(comingMessage,serverResponse){
    var uri = url.parse(comingMessage.url);
    var pathname = Configuration.webRoot + uri.pathname;
    var request = new Request(comingMessage);
    if(fs.existsSync(pathname)){
        staticControllers.file(pathname,serverResponse);
    }else{
        staticControllers.file(pathname,serverResponse);
    }
}

  module.exports = {
      route,
  }
