
var fs = require('fs');
var path = require('path');
const CONFIG_FILE = process.cwd() + '/s2.config.js';

var mime = require('./constants/mime');


function Configuration(config) {
    config = config || {};
    this.init(config);
}

Configuration.prototype = {
    init: function (config) {
        this.port = config.port || 3000;
        this.context = config.context || '';
        this.debug = config.debug || false;
        this.index = config.index || 'index.html';
        this.unicode = config.unicode || "utf-8";
        this.mime = config.mime || mime;
        this.assert = process.cwd() + (config.assert || '/assert');
        this.api = process.cwd() + (config.api || '/api');
        this.proxy = config.proxy;
        this.temporary = process.cwd() + (config.temporary || '/temporary');
        this.gzip = config.gzip === undefined ? true : config.gzip;
    },
    load() {
        if (fs.existsSync(CONFIG_FILE)) {
            this.init(require(CONFIG_FILE));
        }
        var dir = this.api + '/controllers/';
        fs.readdirSync(dir).forEach(function (file) {
            require(dir + file);
        })
    }
}
module.exports = new Configuration();