var path = require("path");
module.exports={
	"port":3000,
	"webroot":"",
	"context":"",
	"debug":true,
	"index":"test.html",
	"unicode":"utf-8",
	"controller":require("./ctrls_config"),
	"mine":require("./mine_config"),
	"cache":path.resolve("./","test/temp"),
	"proxy":null
};