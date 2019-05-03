var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/pages/';

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "index.html");
});

router.get("/about",function(req,res){
  res.sendFile(path + "about.html");
});

router.get("/contact",function(req,res){
  res.sendFile(path + "contact.html");
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var net = require('net'); 
var fs = require('fs');
var mysql = require('mysql');

var mongodb;
try {
    mongodb = require( 'mysql' );
}
catch( e ) {
    if ( e.code === 'MODULE_NOT_FOUND' ) {
        // The module hasn't been found
    }
}

var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'test123',
	database : 'testing'
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
});




var HOST = require('dns').lookup(require('os').hostname(), function (err, add, fam){})// get the ip address from this computer so I don't have to keep checking it after restarts

var PORT = 6969; // TCP LISTEN port 

// Create an instance of the Server and waits for a conexão 
net.createServer(function(sock) { 

	// Receives a connection - a socket object is associated to the connection automatically 
	//console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); 

	// Add a 'data' - "event handler" in this socket instance 
	// data was received in the socket 
	// get g, p, and A 
	sock.on('data', function(data) { 
		// send back Bipc
	
		con.query('SELECT * FROM customers', (err,rows) => {
			if(err) throw err;
			console.log('Data received from Db:');
			rows = JSON.parse(JSON.stringify(rows[0].code));
			console.log(rows);
		});
		

		console.log('Received: ' + data);
		sock.write(data); 
	}); 

	// Add a 'close' - "event handler" in this socket instance 
	sock.on('close', function(data) { 
		// closed connection 
		//console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort); 
	}); 

}).listen(PORT, HOST); 

console.log('Server listening on ' + HOST +':'+ PORT);
