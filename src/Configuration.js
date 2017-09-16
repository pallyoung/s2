
var fs = require('fs');
var path = require('path');
const CONFIG_FILE = process.cwd() + '/s2.config.js';

var mime = require('./constants/mime');


function Configuration(config) {
    config = config || {};
    this.init(config);
}

Configuration.prototype = {
    init:function(config){
        this.port = config.port || 3000;
        this.context = config.context || '';
        this.debug = config.debug || false;
        this.index = config.index || 'index.html';
        this.unicode = config.unicode || "utf-8";
        this.mime = config.mime || mime;
        this.webRoot = process.cwd() + (config.webRoot ||'/assert');
        this.controllers = process.cwd() + (config.controllers ||'/controllers');
        this.proxy = config.proxy;
        this.temporary = config.temporary || process.cwd() + '/temporary';
    },
    load() {
        if (fs.existsSync(CONFIG_FILE)) {
            this.init(require(CONFIG_FILE));
        }
    }
}
module.exports = new Configuration();