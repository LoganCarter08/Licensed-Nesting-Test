var express = require("express");
var app = express();
var router = express.Router();
var myParser = require("body-parser");
var path = __dirname + '/pages/';
var net = require('net'); 
var fs = require('fs');
var mysql = require('mysql');
var nodemailer = require('nodemailer');


/* session id examples
app.post('/login', function(req, res)
{
  var sid = req.sessionID;
  var username = req.body.user;
  var password = req.body.pass;

  users.findOne({username : username, password : password}, function(err, result)
  { 
    ...
    sessionStore.destroy(result.session, function(){
       ...
       users.update({_id: result._id}, {$set:{"session" : sid}});
       ...
    }
    ...
  }
}
*/

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'g',
    pass: 'p'
  }
});


app.use(myParser.urlencoded({ extended: false }));

app.post('/Results', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	console.log(postBody);
	var queryString = 'SELECT * FROM customers WHERE code = ' + postBody.data;
	con.query(queryString, (err,rows) => {
		if(err) throw err;
		console.log('Data received from Db:');
		//console.log(rows);
		if (rows[0])
		{
			//rows = JSON.parse(rows);
			console.log(rows[0]);
			response.write("<html><body>" + rows[0] + "</body></html>");
		}
		else
		{
			response.write("<html><body> Does not exist </body></html>");
		}
		response.end();
	});
});

// generate a 15 digit array of random values 
function generate(req, res) {
	var array = [];
	for (var i = 0; i < 15; i++)
	{
		array.push(Math.floor(Math.random() * (+9)));
	}
	//console.log(array.toString());
	return sum(array);
}

// sum the values in a code for Luhn 
function sum(value, req, res) {
	var sum = 0;
	for (var i = 0; i < 15; i++)
	{
		var dig = value[i];
		if (i % 2 == 1) // check every other digit. starting after 0
		{
			dig = dig* 2;
			if (dig > 9)
			{
				dig = dig - 9; // 1 + dig % 10;
			}
		}
		sum = sum + dig; 
	}
	//System.out.println(sum);
	if (sum % 10 == 0)
		value.push(0);
	else 
		value.push(10 - sum % 10);
	//console.log(sum);
	//console.log(value.toString());
	return value;
}

function customerHash(cust, req, res)
{
	// for now just take ascii values. Will regret this later 
	return cust.charCodeAt(0);
}


app.post('/Created', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	console.log(postBody);
	
	// CODES MUST BE BROKEN INTO 4 SECTIONS TO KEEP FROM EXCEEDING INTEGER SIZE 
	var codes = generate();
	var code1 = codes[0].toString() + codes[1].toString() + codes[2].toString() + codes[3].toString();
	var code2 = codes[4].toString() + codes[5].toString() + codes[6].toString() + codes[7].toString();
	var code3 = codes[8].toString() + codes[9].toString() + codes[10].toString() + codes[11].toString();
	var code4 = codes[12].toString() + codes[13].toString() + codes[14].toString() + codes[15].toString();
	var cust = customerHash(postBody.customer);
	
	
	var queryString = 'INSERT INTO customers(code1, code2, code3, code4, cust, product, expiration) VALUES (' + code1 + ', ' + code2 + ', ' + code3 + ', ' + code4 + ', ' + cust + ', ' + postBody.product + ', ' + postBody.expiration + ');';
	con.query(queryString, (err,rows) => {
		if(err) throw err;
		
		response.write("<html><body> Submitted code: " + code1 + "-" + code2 + "-" + code3 + "-" + code4 + " for " + postBody.customer + " for product " + postBody.product + "</body></html>");
		response.end();
	});
});


function splitCode(code, req, res) {
	code = code.replace("\-", ""); 
	for (var i = 0; i < 2; i++)
	{
		code = code.replace("\-", ""); 
	}
	console.log(code.toString());
	return code.split('');
}

app.post('/Deleted', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	//console.log(postBody);
	if (postBody.customer)
	{
		var cust = customerHash(postBody.customer);
	
		var queryString = 'DELETE FROM customers WHERE cust = ' + cust + ';';
		con.query(queryString, (err,rows) => {
			if(err) throw err;
			
			response.write("<html><body> Removed all codes for " + postBody.customer + "</body></html>");
			response.end();
		});
	} else {
		//console.log(postBody.code);
		if (postBody.code.length < 16) {
			response.write("<html><body>Please enter a valid code delete. Formatting is a 16 digit number or a 16 digit number separated into groups of 4 by a -</body></html>");
			response.end();
			return;
		}
		var codes = splitCode(postBody.code);
		var code1 = codes[0].toString() + codes[1].toString() + codes[2].toString() + codes[3].toString();
		var code2 = codes[4].toString() + codes[5].toString() + codes[6].toString() + codes[7].toString();
		var code3 = codes[8].toString() + codes[9].toString() + codes[10].toString() + codes[11].toString();
		var code4 = codes[12].toString() + codes[13].toString() + codes[14].toString() + codes[15].toString();
		console.log(code1 + "-" + code2 + "-" + code3 + "-" + code4);
	
		var queryString = 'DELETE FROM customers WHERE code1 = ' + code1 + ' AND code2 = ' + code2 + ' AND code3 = ' + code3 + ' AND code4 = ' + code4 + ';';
		con.query(queryString, (err,rows) => {
			if(err) throw err;
			
			response.write("<html><body> Removed code " + code1 + "-" + code2 + "-" + code3 + "-" + code4 + "</body></html>");
			response.end();
		});
	}
	
});

function padZeros(code, req, res) {
	if (code.length == 3)
		return '0' + code;
	else 
		return code;
}

function emailString(rows, req, res) {
	var string = "Your codes are as follows. Please enter the command of activate into the software and paste the following codes to use them.\n";
	console.log(rows[0]);
	for (var i = 0; i < rows.length; i++) {
		string = string + padZeros(rows[i].code1.toString()) +"-" + padZeros(rows[i].code2.toString()) +"-" + padZeros(rows[i].code3.toString()) +"-" + padZeros(rows[i].code4.toString()) + "\t";
		
		if (rows[i].product.toString() == "1")
			string = string + "Nesting 1\t";
		else if (rows[i].product.toString() == "2")
			string = string + "Nesting 2\t";
		else if (rows[i].product.toString() == "3")
			string = string + "DXF Import\t";
		
		if (rows[i].expiration.toString() == "13")
			string = string + "Permanent\n";
		else if (rows[i].expiration.toString() == "1")
			string = string + "1 Month\n";
		else if (rows[i].expiration.toString() == "3")
			string = string + "3 Month\n";
		else if (rows[i].expiration.toString() == "6")
			string = string + "6 Month\n";
		else if (rows[i].expiration.toString() == "12")
			string = string + "1 Year\n";
	}
	return string;
}


app.post("/Sent", (req,res) => {
	
	var queryString = 'SELECT code1, code2, code3, code4, product, expiration FROM customers WHERE cust = ' + customerHash(req.body.customer);
	con.query(queryString, (err,rows) => {
		var mailOptions = {
			from: 'g',
			to: req.body.email,
			subject: 'Nesting Product Codes',
			text: emailString(rows)
		};
		
		transporter.sendMail(mailOptions, function(error, info){
			if (error) {
				console.log(error);
			} else {
				console.log('Email sent: ' + info.response);
			}
		});
		console.log('Email sent to ' + req.body.email);
	});
	res.write("<html><body>Email Sent. Return home to continue modifying tables. </body></html>");
	res.end();
});


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
	//console.log(generate());
});

app.use(myParser.urlencoded({extended : true}));

app.get("/sendmessage", function(request, response) {
	console.log(request.yourFieldName); 
	response.send("Message received.");
});




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////







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
