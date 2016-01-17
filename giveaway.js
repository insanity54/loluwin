var moment = require('moment');
var db = require('./db');
var _ = require('underscore');
var Validator = require('validatorjs');
var util = require('util'); 

var submissionRules = {
	ign: 'required',
	email: 'required|email',
};

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
 * returns list of active giveaways
 *
 * returns an client-safe array of giveaway objects like so
 * [
 *   {
 *     title: "super giveaway 001",
 *     id: "204db28c2a98062e81fc28f11e00110e",
 *     thumbnail: "http://ipfs.pics/a38ura938983",
 *     endDate: "2016-02-18 00:00:01"
 *   },
 *   {
 *     title: "super giveaway 002",
 *     id: "304db28c2a98062e81fc28f11e00110f",
 *     thumbnail: "http://ipfs.pics/u38838y384",
 *     endDate: "2016-02-24 00:00:01"
 *   }
 * ]
 *
 */
var getActiveList = function getActiveList(cb) {
  db.getAllGiveaways(function(err, rawGiveaways) {
    if (err) {
      console.error('error when getting all (active) giveaways: ' + err);
      return cb(err);
    }
    //console.log(rawGiveaways);
    var giveawaysList = [];
    _.forEach(rawGiveaways, function(giveaway) {
      // if giveaway end time is valid
      if (moment(giveaway.value.endDate).isValid()) {
        // if giveaway is still active (ending in the future)
        if (moment(giveaway.value.endDate).isAfter(moment())) {
          var gw = {};
          gw['title'] = giveaway.value.title;
          gw['id'] = giveaway.value._id;
          gw['thumbnail'] = giveaway.value.picture;
          gw['endDate'] = moment(giveaway.value.endDate).fromNow();
          giveawaysList.push(gw);
        }
      }
    });
    return cb(null, giveawaysList);
  });
}

var getEndedList = function getEndedList(cb) {
  db.getAllGiveaways(function(err, rawGiveaways) {
    if (err) {
      console.error('error when getting all (ended) giveaways: ' + err);
      return cb(err);
    }
    
    var endedGiveawaysList = [];
    _.forEach(rawGiveaways, function(giveaway) {
      // if giveaway end time is valid
      if (moment(giveaway.value.endDate).isValid()) {
        // if giveaway has ended
        if (moment(giveaway.value.endDate).isBefore(moment())) {
          var gw = {};
          gw['title'] = giveaway.value.title;
          gw['id'] = giveaway.value._id;
          gw['thumbnail'] = giveaway.value.picture;
          gw['endDate'] = moment(giveaway.value.endDate).fromNow();
          endedGiveawaysList.push(gw);
        }
      }
    });
    return cb(null, endedGiveawaysList);
  });
}

/**
 * user entry to the giveaway
 */
var addEntry = function addEntry(entry, giveawayID, cb) {
  if (typeof(giveawayID) === 'undefined') return cb(new Error('addEntry() requires giveaway Id as second param'));
  if (typeof(entry) === 'undefined') return cb(new Error('addEntry() requires entry object as first param'));
  if (typeof(cb) === 'undefined') return cb(new Error('addEntry() requires the third argument to be a callback'));
  
  // validate giveaway details
  //   - if entering for a giveaway that has ended, reject entry
  //   - if giveaway id is not listed in the database as giveaway, reject entry
  db.load(giveawayID, function(err, gw) {
    if (err) return cb(new Error('problem retrieving giveaway id'));
    if (gw.type !== 'giveaway') return cb(new Error('invalid giveaway id'));
    if (typeof(gw.endDate) === 'undefined') return cb(new Error('the giveaway you are entering has no end date'));
    if (moment(gw.endDate, 'x').isBefore(moment())) return cb(new Error('the giveaway has ended so you cannot enter it')); 
    
    // validate form values
    // i.e. make sure e-mail is an e-mail, and name is not undefined
    var validation = new Validator(entry, submissionRules);

    if (validation.fails()) {
      return cb(new Error(util.inspect(validation.errors.all())));
    }

    else {
      db.addEntry(entry, giveawayID, function(err) {
        if (err) return cb(err);
        return cb(null);
      });
    }
  });
}



module.exports = {
  create: create,
  get: get,
  load: get,
  getNext: getNext,
  getActiveList: getActiveList,
  getList: getActiveList,
  getPastList: getEndedList,
  getEndedList: getEndedList,
  addEntry: addEntry
}