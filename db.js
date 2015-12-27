var path = require('path');
var nconf = require('nconf');
var cradle = require('cradle');
var underscore = require('underscore');


nconf.file(path.join(__dirname, 'config.json'));

var couchHost = nconf.get('COUCH_HOST');
var couchPort = nconf.get('COUCH_PORT');

var db = new(cradle.Connection)().database('hellocouch');


// create db if not exists
db.exists(function(err, exists) {
  if (err) {
    throw err;
  } else if (exists) {
    //console.log('db exists');
  } else {
    //console.log('db does not exist');
    db.create();
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




module.exports = {
  save: save,
  load: load,
  saveWinner: saveWinner
}