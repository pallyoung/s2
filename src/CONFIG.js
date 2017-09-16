
var mineTypes = require('./mineTypes');
var fs = require('fs');
const CONFIG_FILE = process.cwd() + '/s2.config.js';
function S2Config(config) {
    config = config || {};
    this.port = config.port || 3000;
    this.context = config.context || '';
    this.debug = config.debug || false;
    this.index = config.index || 'index.html';
    this.unicode = config.unicode || "utf-8",
        this.mineTypes = config.mineTypes || mineTypes
    this.proxy = config.proxy;
    this.temporary = config.temporary || process.cwd() + '/temporary';
}


function Config(config) {
    S2Config.call(this);
}

Config.prototype = {
    load() {
        if (fs.existsSync(CONFIG_FILE)) {
            S2Config.call(this, require(CONFIG_FILE));
        }
    }
}
module.exports = new Config();