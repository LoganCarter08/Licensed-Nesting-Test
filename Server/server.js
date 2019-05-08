var express = require("express");
var app = express();
var router = express.Router();
var myParser = require("body-parser");
var path = __dirname + '/pages/';
var net = require('net'); 
var fs = require('fs');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var auth = require('C:/Users/Logan/Desktop/auth.json');


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
    user: auth.email,
    pass: auth.password
  }
});

app.use(myParser.urlencoded({ extended: false }));

// Handle logging in 
app.post('/Modify', (request, response) => {
	
});


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

function padDateZero(val, req, res) {
	if (val.length != 2) {
		return '0' + val;
	}
	return val.toString();
}

function getExpDate(exp, cur, req, res) {
	if (cur == 0) {
		var today = new Date();
		var day = today.getDate();
		var month = today.getMonth() + 1; // indexing starts at 0, fix that for visual representation
		var year = today.getFullYear();
	}
	else {
		var day = cur[1];
		var month = cur[0]; // indexing starts at 0, fix that for visual representation
		var year = cur[2];
	}
	// perm code 
	if (exp == 13 || year == 9999)
		return '12/31/9999';
	// 1, 3, 6, 12 month
	else {
		// went over our year 
		if (parseInt(month) + parseInt(exp) > 12) {
			// day stays the same, months get added and remove 12 to get next year cycle, year gets added. 
			return padDateZero((parseInt(month) + parseInt(exp) - 12)) + '/' + padDateZero(day) + '/' + (parseInt(year) + 1).toString();
		}
		// months get added normally and year does not increase 
		return padDateZero((parseInt(month) + parseInt(exp))) + '/' + padDateZero(day)  + '/' + (year).toString();
	}
}


app.post('/Created', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	//console.log(postBody);
	con.query('SELECT * FROM users WHERE username = \'' + postBody.username + '\' AND pass = \'' + postBody.password + '\';', (err,rows) => {
		if (rows.length != 0) {
			var codeString = "";
			
			// did user enter the values in correctly or forget any? 
			if (!postBody.customer || !postBody.count || isNaN(postBody.count)) {
				response.write("<html><body> Please make sure both customer name and count have a value</body></html>");
				response.end();
				return;
			}
			
			for (var i = 0; i < parseInt(postBody.count, 10); i++) {
				// CODES MUST BE BROKEN INTO 4 SECTIONS TO KEEP FROM EXCEEDING INTEGER SIZE 
				var codes = generate();
				var code1 = codes[0].toString() + codes[1].toString() + codes[2].toString() + codes[3].toString();
				var code2 = codes[4].toString() + codes[5].toString() + codes[6].toString() + codes[7].toString();
				var code3 = codes[8].toString() + codes[9].toString() + codes[10].toString() + codes[11].toString();
				var code4 = codes[12].toString() + codes[13].toString() + codes[14].toString() + codes[15].toString();
				codeString = codeString + " " + code1 + "-" + code2 + "-" + code3 + "-" + code4;
				var exp = getExpDate(postBody.expiration, 0);
				console.log(exp);
				
				var queryString = 'INSERT INTO customers(code1, code2, code3, code4, cust, product, exp, ip) VALUES (' + code1 + ', ' + code2 + ', ' + code3 + ', ' + code4 + ', \'' + postBody.customer + '\', ' + postBody.product + ',\' ' + exp + '\', 0);';
				con.query(queryString, (err,rows) => {
					if(err) throw err;
					});
			}
			response.write("<html><body> Submitted codes: " + codeString + " for " + postBody.customer + " for product " + postBody.product + "</body></html>");
			response.end();
		} else {
			response.write("<html><body>Make sure to enter your username and password. Contact admins if you need an account. </body></html>");
			response.end();
		}
	});
});


function splitCode(code, req, res) {
	code = code.replace("\-", ""); 
	for (var i = 0; i < 2; i++)
	{
		code = code.replace("\-", ""); 
	}
	return code.split('');
}

app.post('/Deleted', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	con.query('SELECT * FROM users WHERE username = \'' + postBody.username + '\' AND pass = \'' + postBody.password + '\';', (err,rows) => {
		if (rows.length != 0) {
			//console.log(postBody);
			if (postBody.customer)
			{
				var queryString = 'DELETE FROM customers WHERE cust = \'' + postBody.customer + '\';';
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
		} else {
			response.write("<html><body>Make sure to enter your username and password. Contact admins if you need an account. </body></html>");
			response.end();
		}
	});
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
	con.query('SELECT * FROM users WHERE username = \'' + req.body.username + '\' AND pass = \'' + req.body.password + '\';', (err,rows) => {
		if (rows.length != 0) {
			var queryString = 'SELECT code1, code2, code3, code4, product, exp FROM customers WHERE cust = \'' + req.body.customer + '\';';
			con.query(queryString, (err,rows) => {
				var mailOptions = {
					from: auth.email,
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
		}
		else {
			response.write("<html><body>Make sure to enter your username and password. Contact admins if you need an account. </body></html>");
			response.end();
		}
	});
});
	
app.post('/Renewed', (request, response) => {
	//response.sendFile(path + "users.html");
	const postBody = request.body;
	con.query('SELECT * FROM users WHERE username = \'' + postBody.username + '\' AND pass = \'' + postBody.password + '\';', (err,rows) => {
		if (rows.length != 0) {
			//console.log(postBody);
			if (postBody.customer)
			{
				var queryString = 'SELECT exp FROM customers WHERE cust = \'' + postBody.customer + '\';';
				con.query(queryString, (err,rows) => {	
					if(err) throw err;
					
					for (var i = 0; i < rows.length; i++) {
						var oldDate = rows[i].exp.split('\/');			
						var newDate = getExpDate(postBody.expiration, oldDate);
						var queryString2 = 'UPDATE customers SET exp=\'' + newDate + '\' WHERE cust = \'' + postBody.customer + '\';';
						con.query(queryString2, (err,rows) => {	
							if(err) throw err;
						});
					}
					response.write("<html><body> Renewed all codes for " + postBody.customer + "</body></html>");
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
				
				var queryString = 'SELECT exp FROM customers WHERE code1 = ' + code1 + ' AND code2 = ' + code2 + ' AND code3 = ' + code3 + ' AND code4 = ' + code4 + ';';
				con.query(queryString, (err,rows) => {	
					if(err) throw err;
					var oldDate = rows[0].exp.split('\/');			
					var newDate = getExpDate(postBody.expiration, oldDate);
					var queryString2 = 'UPDATE customers SET exp=\'' + newDate + '\' WHERE code1 = ' + code1 + ' AND code2 = ' + code2 + ' AND code3 = ' + code3 + ' AND code4 = ' + code4 + ';';
					con.query(queryString2, (err,rows) => {
						if(err) throw err;
						response.write("<html><body> Removed code " + code1 + "-" + code2 + "-" + code3 + "-" + code4 + "</body></html>");
						response.end();
					});
				});
			}
		} else {
			response.write("<html><body>Make sure to enter your username and password. Contact admins if you need an account. </body></html>");
			response.end();
		}
	});
	
});



router.use(function (req,res,next) {
	console.log("/" + req.method);
	next();
});

router.get("/",function(req,res){
	res.sendFile(path + "Index.html");
});

router.get("/Renew",function(req,res){
	res.sendFile(path + "Renew.html");
});

router.get("/Email",function(req,res){
	res.sendFile(path + "Email.html");
});

router.get("/Generate",function(req,res){
	res.sendFile(path + "Generate.html");
});

router.get("/Delete",function(req,res){
	res.sendFile(path + "Delete.html");
});


app.use("/",router);

app.use("*",function(req,res){
	res.sendFile(path + "404.html");
});

app.listen(3000,function(){
	console.log("Live at Port 3000");
	//console.log(new Date().getMonth());
});

app.use(myParser.urlencoded({extended : true}));

app.get("/sendmessage", function(request, response) {
	console.log(request.yourFieldName); 
	response.send("Message received.");
});




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////







var con = mysql.createConnection({
	host: auth.host,
	user: auth.user,
	password: auth.sqlPassword,
	database : auth.database
});

con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	 findPublicKey();
});

/*
NOTE NOTE NOTE
These values are technically not "safe" as they are too small. They are easy to do gcd on to decipher the code. This is due to the limitations 
of int sizes in JS. would need to likely break up into several values and piece back together for correct safeness. Keeping this way for now as
it gets the point across. 
*/
function findPublicKey() {
	var max = Math.pow(2, 30);
	var min = Math.pow(2, 15);
	var F = Math.floor(Math.random() * (max - min) + min);
	var q = Math.floor(Math.random() * max);
	var g =  Math.floor(Math.random() * F);
	var a = findGcdOne(q);
	var h = (expMod(g, a, q)); // might need to be mod F
	
	/* questionable decision to drop a table instead of deleting values, but we'll go with it for now */
	var queryString = 'DROP TABLE publicKey;';
	con.query(queryString, (err,rows) => { if(err) throw err; });
	queryString = 'CREATE TABLE publicKey(F int, h int, q int, g int, a int);';
	con.query(queryString, (err,rows) => { if(err) throw err; });
	queryString = 'INSERT INTO publicKey(F, h, q, g, a) VALUES (' + F + ', ' + h + ', ' + q + ', ' + g + ', ' + a + ');';
	con.query(queryString, (err,rows) => { if(err) throw err; });
}

// mod as we square vs doing square then mod. This will prevent overflowing of registers
function expMod (base, exp, mod ) {
  if (exp == 0) 
	return 1;
  if (exp % 2 == 0) {
    return Math.pow(expMod( base, (exp / 2), mod), 2) % mod;
  }
  else {
    return (base * expMod( base, (exp - 1), mod)) % mod;
  }
}



var HOST = require('dns').lookup(require('os').hostname(), function (err, add, fam){})// get the ip address from this computer so I don't have to keep checking it after restarts

var PORT = 6969; // TCP LISTEN port 


function gcd (a, b) {
	if (b) {
		return gcd(b, a % b);
	}	else {
		return Math.abs(a);
	}
}

function findGcdOne(q) {
	var check = Math.floor(Math.random() * (+q)); // probably need low value 
	while (gcd(check, q) != 1) {
		check = Math.floor(Math.random() * (+q));
	}
	return check;
}

function decode(data, a) {
	var vals = data;
	
	/*
		convert from ascii to string then math down below 	
	*/
	
	var p = vals[0];
	var s = Math.pow(p, a);
	var code = (vals[1]).split('\-'); // remember to divide by s to get real value
	var cust = vals[2] / s;
	return [code[0], code[1], code[2], code[3], cust];
}

// Create an instance of the Server and waits for a conexão 
net.createServer(function(sock) { 

	// Receives a connection - a socket object is associated to the connection automatically 
	//console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); 

	// Add a 'data' - "event handler" in this socket instance 
	// data was received in the socket 
	sock.on('data', function(data) { 
		var splitted= data.toString('ascii').split(' ');
		//var splitted = data.split(' ');
		var queryString = 'SELECT * FROM publicKey;';
		if (splitted[0] == 'hello') {
			con.query(queryString, (err,rows) => { 
				if(err) throw err; 
				var mess = rows[0].F + ' ' + rows[0].h + ' ' + rows[0].q + ' ' + rows[0].g;
				console.log('Writing: ' + mess);
				sock.write(mess);
				sock.end();
			});
		} else {
			con.query(queryString, (err,rows) => { 
				if(err) throw err; 
				var recieved = decode(splitted, rows[0].a);
				
				// need to do ip checking here too. 
				queryString = 'SELECT exp FROM customers WHERE code1 = ' + recieved[0] + ' AND code2 = ' + recieved[1] + ' AND code3 = ' + recieved[2] + ' AND code4 = ' + recieved[3] + 'AND cust =' + recieved[4] + ';';
				con.query(queryString, (err,rows) => { 
					if (!rows) {
						sock.write('0');
						sock.end();
					} else { 
						sock.write('1');
						sock.end();
					}
				});
			});
		}
		console.log('Received: ' + data);
		//sock.write(data); 
	}); 

	sock.on('error', function(data) {
		console.log('Connection ended abruptly with ' + sock.remoteAddress);
	});
	// Add a 'close' - "event handler" in this socket instance 
	sock.on('close', function(data) { 
		// closed connection 
		//console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort); 
	}); 

}).listen(PORT, HOST); 

console.log('Server listening on ' + HOST +':'+ PORT);
