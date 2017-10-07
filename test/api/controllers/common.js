var controller = require('./../../index').controller;
function sayhello(request, response) {
	response.writeHead(200, {
		'Content-Type': 'text/plain;charset=UTF-8',

	});
	response.write("hello," + request.queryString("name") + "!");
	response.end();
}
function saysorry(request, response){	
	var session = request.getSession();
	if(!session.get('uid')){
		session.set('uid',Date.now())		
	}
	response.writeHead(200, {
		'Content-Type': 'text/plain;charset=UTF-8',
	});
	request.body().then(function(body){
		response.write("sorry,"+session.get('uid')+"!");
		response.end();
		
		
	});
	
}

function upload(request, response){
	var file = request.getParameter('file');
	response.file(file);
}
function proxy(request, response){
	// fetch(request.getParameter('url')).then(function(s){
	// 	response.writeHead(s.statusCode,s.statusMessage,s.headers);
	// 	s.on('data',function(chunk){
	// 		response.write(chunk);
	// 	})
	// 	s.on('end',function(){
	// 		response.end()
	// 	})
	// })
}
controller(
	'/sayhello',
	sayhello
)(
	'/saysorry',
	saysorry
)(
	'/upload',
	upload
)(
	'/proxy'
	,proxy
);

