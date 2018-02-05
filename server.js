var express = require('express');
var bodyParser = require('body-parser');

let args = process.argv.slice(2);
let port = args[0];

// create express app
var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// define a simple route
app.get('/', function(req, res){
    res.json({"message": "This is an attempt to translate the lets-build-a-blockchain app from Ruby to JavaScript."});
});


// listen for requests
app.listen(port, function(){
    console.log(`Server is listening on port ${port}`);

    require('./app/haseebCoin.js')(app);
});
