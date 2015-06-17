s2 = {
    http: require('http'),
    path: require('path'),
    url: require('url'),
    fs: require('fs'),
    util: require("util"),
    querystring:require("querystring")
    // config: require("./config").config,
    // routers: require("./router").routers,
    // request: require("./request").request,
    // mine: require("./mine").mine,
    // error: require("./error").error,
    // controllers: require("./router_config").controllers,
};
s2.config = require("./config/config");
s2.request = require("./request");
s2.mine = require("./config/mine_config");
s2.error = require("./error");
s2.controllers = require("./config/router_config");
s2.routers = require("./router");
(function() {

    var server = s2.http.createServer(function(req, res) {
        try {
            s2.routers.route(req, res);
        } catch(e) {
            s2.error.type404(req, res, e);
        }


    });
    module.exports = {
        setWebConfig: function(path) {
            s2.config = require(s2.path.resolve(path));
        },
        setMine: function(path) {
            s2.mine = require(s2.path.resolve(path));
        },
        setControllers: function(path) {
            s2.controllers = require(s2.path.resolve(path));
        },
        setError: function(path) {
            s2.mine = require(s2.path.resolve(path));
        },
        listen: function() {
            server.listen(s2.config.port);
            console.log("Server is runing.");
            console.log(s2.util.inspect(s2.config));
        },
    }
})();