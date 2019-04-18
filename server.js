var net = require('net'); 
var fs = require('fs');

var HOST = '192.168.2.34'; // parameterize the IP of the Listen 
var PORT = 6969; // TCP LISTEN port 

// Create an instance of the Server and waits for a conexão 
net.createServer(function(sock) { 

	// Receives a connection - a socket object is associated to the connection automatically 
	console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); 

	// Add a 'data' - "event handler" in this socket instance 
	sock.on('data', function(data) { 
		// data was received in the socket 

		
		fs.readFile('codes.txt', 'utf8', function(err, contents) {  
			if (err) 
				throw err;
			
			//console.log('file: ' + contents);
			//console.log('data: ' + String(data));
			if (contents.includes(parseInt(data)))
			{
				sock.write('1 ' + Math.pow(data, 3) + " " + data);
			}
			else
			{
				sock.write('0 ' + data);
			}
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
