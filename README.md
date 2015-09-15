### s2Server
基于nodejs的轻量级http服务器。

***
#### 特点

*  通过js文件来配置服务器。
*  提供了路由功能。
*  扩展了Request对象，用来获取get或者post请求的数据。

***
#### DEMO
1. 启动服务器
 var s2=require("s2server");
 s2.listen();

2. 配置服务器
新建一个js文件，内容如下:
module.exports={
	"port":3000,
	"webroot":"webroot",
	"context":"",
	"index":"test.html",
	"unicode":"utf-8",
	"controller":"./config/router_config",
	"mine":"./config/mine_config",
}; 
port：端口号
webroot：项目的根路径
context：项目上下文路径
index：项目首页
unicode：编码类型
controller：控制器配置文件
mine：mine配置文件
如果某项不需要自定义，可以省略。
在启动服务器前调用s2\.loadConfig(modulepath)方法加载配置。

3. controller配置文件
module.exports= {
	"common":require("../../test/common")
}

4. controller

controller在被调用的时候默认会传入两个参数，第一个参数是S2Request类型，第二个参数是Response类型。

	module.exports = {
		"sayhello": function(request, response) {
			response.writeHead(200, {
				'Content-Type': 'text/plain;charset=UTF-8',

			});
			response.write("hello," + request.queryString("name") + "!");
			response.end();
		},
		"saysorry": function(request, response) {
			response.writeHead(200, {
				'Content-Type': 'text/plain;charset=UTF-8',
			});
			response.write("sorry,"+request.getParameter("name")+"!");
			response.end();

		}
	}
