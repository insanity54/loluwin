var path = require('path');
var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var giveaway = require('./giveaway');

nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, '/client/views'), {
  autoescape: true
}));
nunjucksEnv.express(app);
var port = 3000;

app.use(express.static(path.join(__dirname, 'client')));


var validateID = function validateID(req, res, next) {
  var giveawayID = req.params.id.toLowerCase();
  if (giveawayID.match(/[a-f0-9]{32}/)) {
    console.log('getting giveaway %s', giveawayID);
    req.loluwin.giveawayID = giveawayID;
    next();
  } else res.status(402).send('invalid id. <a href="/">home</a>');
}

var setupReq = function setupReq(req, res, next) {
  req.loluwin = {};
  next();
}


var serve = function serve() {
  app.listen(port);
  console.log('server listening on port %s', port);

  /**
   * home page
   */
  app.get('/', function (req, res) {
    return res.send('hello');
  });


  /**
   * get the end date of the next giveaway
   */
  app.get('/giveaway/next/date', function (req, res) {

  });
  
  
  /**
   * get the rules for a specific giveaway
   */
  app.get('/giveaway/:id/rules',
    setupReq,
    validateID,
    function (req, res) {

      // get giveaway details
      giveaway.load(req.loluwin.giveawayID, function (err, g) {
        if (err) throw err;

        console.log('got giveaway', g);
        var title = g.title || 'untitled giveaway';
        var description = g.description || 'undescribed giveaway';
        var picture = g.picture || 'https://ipfs.pics/ipfs/QmbbzFoLVEN3PyfTRLkW4dusFp5PeTYs3mULGmmsWbgY2v';


        res.render('rules.nunj', {
          giveawayTitle: title,
          giveawayDescription: description,
          giveawayPicture: picture
        });
      });
    });

  
  /**
   * get details of a specific giveaway
   */
  app.get('/giveaway/:id',
    setupReq,
    validateID,
    function (req, res) {
      giveaway.load(req.loluwin.giveawayID, function (err, g) {
        if (err) throw err;

        console.log('got givway', g);

        var title = g.title;
        var description = g.description;
        var picture = g.picture;
        var end = g.end;
         
        res.render('giveaway.nunj', {
          title: title,
          description: description,
          picture: picture,
          end: end
        })
      });
    });

}

module.exports = {
  serve: serve
}




//
//
//var path = require('path');
//var express = require('express');
//var app = express();
//
//
//
//var port = 8083;
//
//
//app.use(express.static(path.join(__dirname, 'client')));
//
//
//
//console.log('serving on port ' + port);
//app.listen(port);