var net = require('net'); 
var fs = require('fs');

var HOST = '192.168.2.35'; // parameterize the IP of the Listen 
var PORT = 6969; // TCP LISTEN port 

// Create an instance of the Server and waits for a conexão 
net.createServer(function(sock) { 

	// Receives a connection - a socket object is associated to the connection automatically 
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); 

	// Add a 'data' - "event handler" in this socket instance 
	// data was received in the socket 
	// get g, p, and A 
	sock.on('data', function(data) { 
		// send back B
		var splitData = String(data).split(" ");
		console.log("g = " + splitData[0]);
		console.log("g = " + splitData[1]);
		console.log("g = " + splitData[2]);
		// calculate s 
		sock.write(data);
		
		
		sock.on('code', function(code) { 
			fs.readFile('codes.txt', 'utf8', function(err, contents) {  
				if (err) 
					throw err;
				
				//console.log('file: ' + contents);
				//console.log('data: ' + String(data));
				if (contents.includes(parseInt(code)))
				{
					sock.write(Math.pow(code, 3) + " " + code);
				}
				else
				{
					sock.write(Math.pow(code, 5) + " " + code);
				}
			});
		});
		

		//console.log('Received: ' + data);
		//sock.write('bad'); 
	}); 

	// Add a 'close' - "event handler" in this socket instance 
	sock.on('close', function(data) { 
		// closed connection 
		console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort); 
	}); 

}).listen(PORT, HOST); 

console.log('Server listening on ' + HOST +':'+ PORT);
