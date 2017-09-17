'use strict'

var routes = require('./Router').routes;
function controller(path,ctrl){
    routes[path] = ctrl;
    return controller;
}
module.exports = controller;