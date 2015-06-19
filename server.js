var express = require('express');
var app = express();

app.use(express.static(__dirname + "/dist"));

var port = process.env.PORT || 8080

app.listen(port, function() {
	console.log("On port " + port);
});