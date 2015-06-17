(function() {
	module.exports = {
        minErr:function(type,msg){

        }
		type404:function(request,response,e){
			response.writeHead(404, {
                'Content-Type': 'text/plain;charset=utf-8'
            });

            response.write("This request URL " + request.url + " was not found on this server.");
            response.write("请求的网址无法访问");
            if(s2.config.debug){
 				response.write(e.toString());
            }           
            response.end();
		}
	}
})()