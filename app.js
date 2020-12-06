const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport')
const config = require('./config/database')
// var env = require('dotenv').load()

//connection to database
// mongoose.connect(config.database, { useNewUrlParser: true });
mongoose.connect(config.mongodbatlas, { useNewUrlParser: true,useUnifiedTopology: true });

//on connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.mongodbatlas);
})

//  on database error
mongoose.connection.on('error', (err) => {
  console.log('Connected to database ' + err);
})


var port_no = process.env.PORT || 8080

const users = require('./routes/users');
const admin = require('./routes/admin');

// Define the port to run on
app.set('port', port_no);

app.use(cors());


// Add middleware to console log every request
app.use(function (req, res, next) {
  console.log(req.method, req.url);
  next();
});

// Set static directory before defining routes and allow angular to be on the same port
app.use(express.static(path.join(__dirname, 'public')));

// Enable parsing of posted forms
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session())


require("./config/passport")(passport);

// Add some routing
app.use('/api/users', users);

app.use('/api/admin', admin);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'))
})

// Listen for requests
var server = app.listen(app.get('port'), function () {
  var port = server.address().port;
  console.log('Magic happens on port ' + port);
});
