'use strict'
var routes = {};

function route(pathname) {
    if (routes[pathname]) {
        return routes[pathname];
    }
    return;
}


module.exports = {
    route,
    routes,
};
