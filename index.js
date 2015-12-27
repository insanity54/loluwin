var path = require('path');
var server = require(path.join(__dirname, 'server'));
var db = require('./db');

server.serve();