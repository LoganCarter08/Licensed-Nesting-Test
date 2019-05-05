var express = require('express');
var app = express();

app.post('/LEDon', function(req, res) {
    console.log('LEDon button pressed!');
    // Run your LED toggling code here
});

app.listen(1337);