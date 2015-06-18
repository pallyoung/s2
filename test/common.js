(function() {
	// body...
	var url = require("url");
	var queryString = require("querystring");
	var http = require("http");
	var path = require("path");
	var util = require("util");
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
})()