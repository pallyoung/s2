(function() {
	var path = s2.path;
	var url = s2.url;
	var fs = s2.fs;
	var util = s2.util;
	var config = s2.config;
	var mine = s2.mine;
	var controllers = s2.controllers;
	var statusCode = [0, 200, 304, 404, 500];
	module.exports = {
		getExt: function(pathname) {
			var ext = path.extname(pathname);
			ext = ext ? ext.slice(1) : "";
			return ext;
		},
		getPathName: function(request) {
			return url.parse(request.url).pathname;
		},
		do :
		function(request, response, observer) {
			if (!new RegExp(s2.config.context).test(url.parse(request.url).pathname)) {
				s2.error.type404(request, thisresponse,"route error");
				return 404;
			}
			var pathname = url.parse(request.url).pathname.replace(new RegExp(s2.config.context), "");
			if (/^\/*$/.test(pathname)) {
				pathname = s2.config.index;
			};
			var ext = this.getExt(pathname);
			var paths = pathname.split("\/");
			var temp = "";
			var controller = s2.controllers;
			var realPath = decodeURI(path.join(s2.config.webroot, pathname));
			var thisresponse = response;
			var _request = null;
			if (ext === "") {
				for (var i = 0; i < paths.length; i++) {
					temp = paths[i];
					if (temp === "") {
						continue;
					} else if (controller[temp]) {
						controller = controller[temp];
					} else {
						s2.error.type404(request, thisresponse,"route error");
						return false;
					}
				}
				_request = new s2.request.Request(request, {
					end: function() {
						controller(_request, response);
					}
				});
				return true;
			} else {
				fs.exists(realPath, function(exists) {
					if (!exists) {
						 s2.error.type404(request, thisresponse,"route error");
						return false;
					} else {
						fs.readFile(realPath, "binary", function(err, file) {
							if (err) {
								 s2.error.type404(request, thisresponse,"route error");
							} else {
								var contentType = s2.mine[ext] + ";charset=" + s2.config.unicode || "text/plain" + ";charset=" + s2.config.unicode;
								thisresponse.writeHead(200, {
									'Content-Type': contentType
								});
								thisresponse.write(file, "binary");
								thisresponse.end();
							}
						});
					}
				});
			}

		},
		route: function(request, response) {
			this.do(request, response);
			return;
		}
	}
})()