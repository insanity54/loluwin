/**
 * finds cheaters and deletes their entries
 */

var giveaway = require('./giveaway');




var run = function run(cb) {
  giveaway.getActiveList(function(err, list) {
    if (err) return cb(err);
    
    console.log(list);
    return cb(null, list);
  });
}





module.exports = {
  run: run
}