'use strict'
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
module.exports = {
    extend:extend
}