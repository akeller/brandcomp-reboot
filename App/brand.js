/************************************************************************
						BRAND COMPARISON
*************************************************************************/
// Importing required modules

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').globalAgent.maxSockets = Infinity
var index = require('./routes/index');
var dotenv = require('dotenv').config();

var app = express();
var HTTP_HOST   = process.env.HOST || '127.0.0.1';
var HTTP_PORT   = process.env.PORT || 5000;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Calling main app functions, updating
app.get('/', function (req, res) {
  var keys = {
      publish_key : process.env.PUBLISH_KEY,
      subscribe_key : process.env.SUBSCRIBE_KEY
  };

  res.render('index', { keys: keys });
});

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap


app.listen(HTTP_PORT);
console.log("BrandComp server running on host:port => "+HTTP_HOST+":"+HTTP_PORT);
