var express = require('express');
var bodyParser = require('body-parser');

// create express app
var app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())

// Configuring the database
// var dbConfig = require('./config/database.config.js');
// var mongoose = require('mongoose');

// mongoose.connect(dbConfig.url);

// mongoose.connection.on('error', function() {
//     console.log('Could not connect to the database. Exiting now...');
//     process.exit();
// });

// mongoose.connection.once('open', function() {
//     console.log("Successfully connected to the database");
// });

// define a simple route
app.get('/', function(req, res){
    res.json({"message": "This is an attempt to translate the lets-build-a-blockchain app from Ruby to JavaScript."});
});

// Require Notes routes
require('./app/routes/note.routes.js')(app);


require('./app/haseeb.js')(app);


// listen for requests
app.listen(3000, function(){
    console.log("Server is listening on port 3000");
});
