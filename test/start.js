'use strict'
// var fs = require('fs');

// var s = {
//     write:function(){
//         console.log('write')
//         console.log.apply(console,arguments)
//     },
//     writev:function(){
//         console.log('_writev')
//         console.log.apply(console,arguments)
//     },
//     final:function(){
//         console.log('_final')
//         console.log.apply(console,arguments)
//     },
//     on:function(){

//     },
//     once:function(){
        
//     },
//     prependListener:function(){

//     },
//     emit:function(){

//     },
//     end:function(){
//         console.log('end')
//         console.log.apply(console,arguments)
//     }
// }

// fs.createReadStream('index.js').pipe(s)

var s2Server = require('./../index');
s2Server.listen()
