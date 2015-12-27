/**
 * command line interface for the admin
 */

var clap = require('tinyclap')();
//var db = require('./db');
var giveaway = require('./giveaway');
console.log(clap);


var usage = function usage() {
  console.log('Usage: node luw.js [COMMAND] [arguments]');
}

if (typeof(clap.cmd) === 'undefined') {
  return usage();
}


if (clap.cmd.toLowerCase() == 'create') {
  // verify args
  var title = clap.argn[0] || 'Generic Giveaway';
  var desc = clap.argn[1] || 'Generic Description';
  var pic = clap.argn[2] || 'https://ipfs.pics/ipfs/Qmah8r8MSVQtWyzTUg4VtFvRqRVv1MpAaGcEfeZiQB57st';
  
  giveaway.create(title, desc, pic, function(err) {
    if (err) throw err;
    return 
  });
  //db.createGiveaway(title, desc, pic);
  
}