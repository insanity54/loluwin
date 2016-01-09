var moment = require('moment');
var db = require('./db');
var _ = require('underscore');



/**
 * create new giveaway
 */
var create = function create(options, cb) {
  var opts = _.extend({}, options);  
  
  var title = opts.title || 'generic title';
  var description = opts.description || 'generic desc';
  var picture = opts.picture || 'https://ipfs.pics/ipfs/Qmah8r8MSVQtWyzTUg4VtFvRqRVv1MpAaGcEfeZiQB57st';
  var drawingDate = moment(opts.drawing).valueOf() || moment().add(14, 'days').valueOf(); 
  var endDate = moment(opts.end).valueOf() || moment().add(7, 'days').valueOf(); // set end time one week from now
  var sponsorAddress = opts.address || '123 Monkey Road';
  var sponsorName = opts.sponsor || 'Tinus Lorvalds';
  var sponsorEmail = opts.email || 'fart@example.com';
  var deliveryMethod = opts.delivery || 'digital transfer via e-mail';
  
  
  if (!moment(endDate).isValid()) throw new Error('end date ' + endDate + ' is not valid. it must be parseable by momentjs, i.e. in the format YYYY-MM-DD');
  if (!moment(drawingDate).isValid()) throw new Error('drawing date ' + drawingDate + ' is not valid. it must be parseable by momentjs, i.e. in the format YYYY-MM-DD');
  
  // save giveaway info
  var give = { 
    type: 'giveaway', 
    title: title, 
    description: description,
    deliverytMethod: deliveryMethod,
    picture: picture,
    endDate: endDate,
    drawingDate: drawingDate,
    sponsorName: sponsorName,
    sponsorEmail: sponsorEmail,
    sponsorAddress: sponsorAddress,
    entrants: [],
    version: 3
  };
  
  db.save(give, function(err, res) {
    if (err) throw new Error('problem saving new giveaway to db ' + err);
    //console.log(res);
    var giveawayID = res.id;
    if (typeof(giveawayID) === 'undefined') throw new Error('giveaway id was undefined! ', res);
    console.log('created giveaway. id is %s', giveawayID);
    return cb(null, giveawayID);
  });
}


/**
 * retrieve a giveaway given its id
 */
var get = function get(id, cb) {
  db.load(id, function(err, doc) {
    if (err) throw err;
    return cb(null, doc);
  });
}


/**
 * retrieve the soonest ending giveaway
 */
var getNext = function getNext(cb) {
  db.getNextGiveaway(function(err, giveaway) {
    if (err) {
      console.error('error with giveaway.getNext() ' + err);
      return cb(new Error('could not get next giveaway'));
    }
    return cb(null, giveaway);
  });
}


/**
 * user entry to the giveaway
 */
var addEntry = function addEntry(entry, giveawayID, cb) {
  if (typeof(giveawayID) === 'undefined') return cb(new Error('addEntry() requires giveaway Id as second param'));
  if (typeof(entry) === 'undefined') return cb(new Error('addEntry() requires entry object as first param'));
  if (typeof(cb) === 'undefined') return cb(new Error('addEntry() requires the third argument to be a callback'));
  
  
  db.loadGiveaway(giveawayID, function(err, giveaway) {
    if (err) return cb(new Error('db.loadGiveaway returned an error while fetching giveaway ID ' + giveawayID + ' err: ' + err));
    if (typeof(giveaway) === 'undefined') return cb(new Error('db.loadGiveaway did not return with a giveaway'));
    
    // add the giveaway entry to the giveaway document
    console.log('giveaway inside addEntry')
    console.log(giveaway);
    
    db.merge(giveawayID, {
      entries: giveaway.entries.push(entry) 
    });
    
    return cb(null);
  });
}



module.exports = {
  create: create,
  get: get,
  load: get,
  getNext: getNext,
  addEntry: addEntry
}