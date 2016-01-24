var Mailgun = require('mailgun').Mailgun;
var moment = require('moment');
var nconf = require('nconf');
var nunjucks = require('nunjucks');
nconf.file('./config.json');

var mgKey = nconf.get('MAILGUN_API_KEY');
var adminEmail = nconf.get('ADMIN_EMAIL');
var appEmail = nconf.get('APP_EMAIL') || 'loluwin@cloudserver';
var host = nconf.get('APP_HOST') || '127.0.0.1';
var port = nconf.get('APP_PORT') || '3000';

nunjucks.configure({ autoescape: true });


if (typeof(mgKey) === 'undefined') throw new Error('MAILGUN_API_KEY was not defined in config.json');
if (typeof(adminEmail) === 'undefined') throw new Error('ADMIN_EMAIL was not defined in config.json');



var mg = new Mailgun(mgKey);

var notifyAdmin = function notifyAdmin(message, cb) {
  message = nunjucks.renderString(message, { host: host, port: port });
  mg.sendText(appEmail, adminEmail, 'loluwin alert '+moment().format('YYYY-MM-DD'), message, cb);
}

module.exports = {
  notifyAdmin: notifyAdmin,
  send: notifyAdmin 
}