var path = require('path');
var server = require(path.join(__dirname, 'server'));
var db = require('./db');
var notif = require('./notif');


server.serve();
notif.send('test of the system');