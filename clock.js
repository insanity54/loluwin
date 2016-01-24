/**
 * clock process which handles scheduling
 *   - handles what to do when a giveaway ends
 */

var later = require('later');
var notif = require('./notif');
var db = require('./db');
var registry = require('./registry');
var moment = require('moment');
var crypto = require('crypto');
var base64url = require('base64url');
var _ = require('underscore');
var giveaway = require('./giveaway');


// register the clock microservice with the app's consul server
registry.registerService({name: 'loluwin-clock'}, function(err, res) {
  if (err) throw err;
  console.log(res);
});




var processEndedGiveaway = function processEndedGiveaway(giveawayID) {
  
  // load giveaway doc
  // add ended: true
  // create and add token: 'xxx'
  // send notification with token
  // save doc
  
  giveaway.load(giveawayID, function(err, gw) {
    if (gw.ended == true)
      return console.error('tried processing ended giveaway ' + giveawayID + ' but it was already marked as ended');
    if (gw.token)
      return console.error('tried processing ended giveaway ' + giveawayID + ' but token already existed');
    var ended = true;
    var token = base64url(crypto.randomBytes(96));
    
    db.addMembers(giveawayID, {ended: ended, token: token}, function(err, res) {
      if (err) throw err;
      if (!res) throw new Error('no response from db.addMembers');
      
      notif.send(gw.title+' ('+gw.id+') has ended. '+
        'http://{{ host }}:{{ port }}/giveaway/'+gw.id+'/drawing?token='+token);
    });
  });
}


var detectGiveawayEndings = function detectGiveawayEndings() {
  console.log('detecting...');
  db.getAllGiveaways(function(err, gws) {
    if (err) throw err;
    //console.log(gws);
    
    _.forEach(gws, function(gw) {
      // see if giveaway should be marked as ended
      if (!gw.ended && moment(gw.endDate, 'x').isBefore(moment())) {
        processEndedGiveaway(gw.id);
      }
    });
  });
  
  //var result = querystring.stringify({token: ""}); // how to make the querystring containing the token
}


var schedule = later.parse.text('every 5 sec');
var timer = later.setInterval(detectGiveawayEndings, schedule);

