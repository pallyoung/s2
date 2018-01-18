'use strict'
module.exports = {
    assertDir:'./assert',
    controllerDir:'./api/controllers',
    proxy:{
        "/api": {
            target:'http://www.ichuangshun.com',
            pathRewrite: {'^/api' : ''}
        }
    }
}