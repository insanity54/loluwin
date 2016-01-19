/**
 * clock process which handles scheduling
 *   - handles what to do when a giveaway ends
 */

var later = require('later');
var notif = require('./notif');
var cradle = require('cradle');
var registry = require('./registry');


// register the clock microservice with the app's consul server
registry.registerService({name: 'loluwin-clock'}, function(err, res) {
  if (err) throw err;
  console.log(res);
});






var detectGiveawayEndings = function detectGiveawayEndings() {
  console.log('detecting...');
  
}


var schedule = later.parse.text('every 10 sec');
var timer = later.setInterval(detectGiveawayEndings, schedule);

