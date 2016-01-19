var Mailgun = require('mailgun').Mailgun;
var nconf = require('nconf');
nconf.file('./config.json');

var mgKey = nconf.get('MAILGUN_API_KEY');
var adminEmail = nconf.get('ADMIN_EMAIL');
var appEmail = nconf.get('APP_EMAIL') || 'loluwin@cloudserver';

if (typeof(mgKey) === 'undefined') throw new Error('MAILGUN_API_KEY was not defined in config.json');
if (typeof(adminEmail) === 'undefined') throw new Error('ADMIN_EMAIL was not defined in config.json');



var mg = new Mailgun(mgKey);

var notifyAdmin = function notifyAdmin(message, cb) {
  mg.sendText(appEmail, adminEmail, 'loluwin alert', message, cb);
}

module.exports = {
  notifyAdmin: notifyAdmin,
  send: notifyAdmin 
}