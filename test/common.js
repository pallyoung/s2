(function () {
	// body...
	var url=require("url");
	var queryString=require("querystring");
	var http=require("http");
	var path=require("path");
	var util=require("util");
	var proxy=require("../../proxy").proxy;
	exports.controller={
		"sayhello":function(request,response){
			response.writeHead(200, {
         		'Content-Type': 'text/plain;charset=UTF-8',

     		});
    		response.write("hello,"+request.queryString("name")+"!");
    		response.end();
		},
		"saysorry":function(request,response){
			response.writeHead(200, {
         			'Content-Type': 'text/plain;charset=UTF-8',
     			});
     		// response.write("i miss you,"+request.getParameter("name")+"!");
     		response.write(JSON.stringify(request.headers)+JSON.stringify(request.data));
    		response.end();    		
    		
		 },
		"ajaxproxy":function(request,response){
			var wd=request.queryString("wd");
			var cont="wd="+wd;
			cont=encodeURI(cont);
			var opt="http://www.baidu.com/s?"+cont;
			// var opt={
			// 	protocol:"http:",
			// 	host:"localhost:3001",
			// 	hostname:"localhost",
			// 	pathname:"/notes/common/saysorry",
			// 	//search:"?"+cont,
			// 	method:"POST",
			// 	headers:{
			// 		'Content-Type': 'application/x-www-form-urlencoded', 
			// 		'Content-Length' : cont.length 
			// 	}
			// };
			proxy.request(opt,cont,function(res){
				var data="";
				res.on("data",function(chunk){
					data+=chunk;
				});
				res.on("end",function(chunk){
					console.log(res.statusCode);
					response.writeHead(200, {
         			'Content-Type': 'text/html;charset=UTF-8',
     				});
    				response.write(data);
    				response.end();
				});
			});

		}
	}})()