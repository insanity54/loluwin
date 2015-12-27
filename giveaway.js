var moment = require('moment');
var db = require('./db');



/**
 * create new giveaway
 */
var create = function create(title, description, picture, cb) {
  // set drawing time one week from now
  var drawingDate = moment().add(1, 'week').valueOf();
  
  var t = title || 'generic title';
  var d = description || 'generic desc';
  var p = picture || 'https://ipfs.pics/ipfs/Qmah8r8MSVQtWyzTUg4VtFvRqRVv1MpAaGcEfeZiQB57st';
  var e = drawingDate;
  
  // save giveaway info
  var give = { 
    type: 'giveaway', 
    title: t, 
    description: d, 
    picture: p,
    end: e
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


module.exports = {
  create: create,
  get: get,
  load: get
}