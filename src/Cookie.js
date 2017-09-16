'use strict'
const default_expire = 20 * 60 * 1000;
function setCookie(name, value, expire, path, domain, secure) {
    if (arguments.length < 2) {
        return;
    }
    if (!name) {
        return;
    }
    expire = default_expire;
}
function getCookie() {

}
var Cookie = {

}