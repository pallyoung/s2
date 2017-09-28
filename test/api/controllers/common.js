var controller = require('./../../index').controller;
function sayhello(request, response) {
	response.writeHead(200, {
		'Content-Type': 'text/plain;charset=UTF-8',

	});
	response.write("hello," + request.queryString("name") + "!");
	response.end();
}
function saysorry(request, response){
	response.writeHead(200, {
		'Content-Type': 'text/plain;charset=UTF-8',
	});
	response.write("sorry,"+request.getParameter("name")+"!");
	response.end();
}

function upload(request, response){
	var file = request.getParameter('file');
	response.file(file);
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
);

