var path = require('path');
var nconf = require('nconf');
var cradle = require('cradle');
var _ = require('underscore');
var moment = require('moment');
var util = require('util');


nconf.file(path.join(__dirname, 'config.json'));
var couchHost = nconf.get('COUCH_HOST') || '127.0.0.1';
var couchPort = nconf.get('COUCH_PORT') || 5984;


isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};

var db = new(cradle.Connection)(couchHost, couchPort, {cache: false}).database('hellocouch');


// create db if not exists
db.exists(function(err, exists) {
  if (err) {
    console.error(' >>> is database running?? <<<');
    throw err;
  } else if (exists) {
    //console.log('db exists');
  } else {
    //console.log('db does not exist');
    db.create();
  }
});


// create couchDB views our app will use
db.save('_design/giveaway', {
    all: {
        map: function (doc) {
            if (doc.type == 'giveaway') {
              if (doc.endDate && doc.title && doc.picture && doc.sponsorName) emit(doc.title, doc);
            }
        }
    },
    endDates: {
        map: function (doc) {
          if (doc.type == 'giveaway') {
            if (doc.endDate) {
              emit(null, doc.endDate);
            }
          }
        }
    }
});


//var client = couchdb.createClient(couchPort, couchHost);
//var db      = client.db('helloCouch');



/**
 * save a document to the database
 */
var save = function save(doc, cb) {
  db.save(doc, function(err, res) {
    if (err) return cb(err);
    return cb(null, res);
  });
}


/**
 * load document from the database
 */
var load = function load(id, cb) {
  db.get(id, function(err, doc) {
    if (err) return cb(err);
    return cb(null, doc);
  });
}


var saveWinner = function saveWinner() {
  //var doc = { _id: 'winner', text: 'Hello Winner!' };

  db.save('skywalker', {
    force: 'light',
    name: 'Luke Skywalker'
  }, function (err, res) {
    if (err) {
      throw err;
    } else {
      console.log('good save');
    
      db.get('skywalker', function(err, doc) {
        console.log(JSON.stringify(doc));
      });
    }

  });
}

/**
 * get the soonest ending (next) giveaway
 */
var getNextGiveaway = function getNextGiveaway(cb) {
  db.view('giveaway/endDates', function(err, res) {
    if (!res) return cb(new Error('no response from db.getNextGiveaway'));
    console.log(res[res.length-1]);
    console.log(moment(res[res.length-1].value).isAfter(moment()));
    var times = _.chain(res)
      .filter(function(item) {
        // return only giveaways with valid timestamp
        return moment(item.value).isValid();
      })
      .filter(function(item) {
        // return only giveaways that haven't ended
        return moment(item.value).isAfter(moment());
      })
      //.tap(console.log)
      .sortBy(res, function(item) {
        //console.log(item);
        return moment(item.value).valueOf();
      })
      .first()
      .value();
    console.log(times);
    return cb(null, times);
  });
}

/**
 * add an entry to the giveaway
 */
var addEntry = function addEntry(entry, giveawayID, cb) {
  
  load(giveawayID, function(err, giveaway) {
    if (err) return cb(new Error('db.loadGiveaway returned an error while fetching giveaway ID ' + giveawayID + ' err: ' + err));
    if (typeof(giveaway) === 'undefined') return cb(new Error('db.loadGiveaway did not return with a giveaway'));
    
    // some validation of the giveaway k/v
    if (typeof(giveaway.entrants) === 'undefined') return cb(new Error('giveaway had no entrants key'));
    
    // ensure entry e-mail is unique
    var existingEmails = _.pluck(giveaway.entrants, 'email');
    if (_.contains(existingEmails, entry.email)) return cb(new Error('duplicate e-mail already entered'));
    
    // add the giveaway entry to the giveaway document and save
    db.merge(giveawayID, {
      entrants: giveaway.entrants.concat(entry)
    }, function(err, res) {
      if (err) return err;
      if (!res) return new Error('no response when adding new entry to giveaway document');
      return cb(null);
    });
  });
}

/**
 * update an entry in the giveaway
 *
 * entry.id must be defined
 * 
 * @param {object} entry
 * @param {number} entry.id
 * @param {hex} giveawayID
 * @callback cb
 */
var updateEntry = function updateEntry(entry, giveawayID, cb) {
  load(giveawayID, function(err, gw) {
    if (err) return cb(new Error(err));
    if (typeof(gw) === 'undefined') return cb(new Error('db.loadGiveaway did not return with a giveaway'));
    
    // find the index of the entry based on the entry ID
    index = _.findIndex(gw.entrants, function(ent) { return ent.id == entry.id });

    // merge putted entry with gw.entrants
    gw.entrants[index] = entry;

    db.merge(giveawayID, {
      entrants: gw.entrants
    }, function(err, res) {
      if (err) return err;
      if (!res) return new Error('no response when updating entry');
      return cb(null);
    });
  });
}



/**
 * get list of giveaways
 * !!! WARNING !!! NOT SAFE FOR SENDING TO CLIENT (contains entrants emails & names)
 */
var getAllGiveaways = function getActiveGiveaways(cb) {
  db.view('giveaway/all', function(err, res) {
    if (err) return cb(err);
    if (!res) return cb(new Error('no response from db.getAllGiveaways'));
    return cb(null, res);
  });
}

//var getEndedGiveaways = function getEndedGiveaways(cb) {
//  db.view('giveaway/endDates', function(err, res) {
//    if (err) return cb(err);
//    if (!res) return cb(new Error('no response from db.getEndedGiveaways'));
//    return cb(null, res);
//  }); 
//}


/**
 * return whether or not giveaway is still accepting entries
 */
var isGiveawayRunning = function isGiveawayRunning(id) {
  
}

/**
 * a way to add key/values to an existing document.
 *
 * used by the clock module to add doc.ended and doc.token
 *
 * @param {string} giveawayID - couchDB document ID
 * @param {object} members - object of k/v to add
 * @callback cb (err, res)
 */
var addMembers = function addMembers(giveawayID, members, cb) {
  db.merge(giveawayID, members, cb);
}


module.exports = {
  save: save,
  addMembers: addMembers,
  load: load,
  loadGiveaway: load,
  saveWinner: saveWinner,
  getNextGiveaway: getNextGiveaway,
  addEntry: addEntry,
  updateEntry: updateEntry,
  getAllGiveaways: getAllGiveaways
}