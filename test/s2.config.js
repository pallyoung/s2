'use strict'
module.exports = {
    proxy:{
        "/api": {
            target:'http://uatfapi.nxshidai.com',
            pathRewrite: {'^/api' : ''}
        }
    }
}