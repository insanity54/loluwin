var path = require('path');
var server = require(path.join(__dirname, 'server'));
var api = require(path.join(__dirname, 'api'));
var db = require('./db');

server.serve();