var path = require('path');
var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var giveaway = require('./giveaway');
var moment = require('moment');
var bodyParser = require('body-parser');
var util = require('util');
var querystring = require('querystring');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, '/client/views'), {
  autoescape: true
}));
nunjucksEnv.express(app);
var port = 3000;

app.use(express.static(path.join(__dirname, 'client')));


var validateID = function validateID(req, res, next) {
  if (typeof(req.params.id) === 'undefined')
    return res.status(403).render('error.nunj', {code: 403, message: 'id required'});
  var giveawayID = req.params.id.toLowerCase();
  if (giveawayID.match(/[a-f0-9]{32}/)) {
    console.log('getting giveaway %s', giveawayID);
    req.loluwin.giveawayID = giveawayID;
    next();
  } else res.status(403).render('error.nunj', {code: 403, message: 'invalid id.'});
}

var validateToken = function validateToken(req, res, next) {
  if (typeof(req.loluwin) === 'undefined')
    return res.status(403).render('error.nunj', {code: 500, message: 'wrongly initiated request'});
  
  // make sure there is a token in the query
  if (typeof(req.query.token) === 'undefined')
    return res.status(403).render('error.nunj', {code: 403, message: 'token required'});
  
  var token = req.query.token;
  if (/[A-Za-z0-9-_]{128}/.test(token)) {
    // valid token string
    req.loluwin.token = token;
    next();
  }
  else res.status(403).render('error.nunj', {code: 403, message: 'invalid token.'});
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
    giveaway.getActiveList(function(err, activeList) {
      console.log(activeList);
      
      giveaway.getPastList(function(err, pastList) {
        res.render('home.nunj', {
          giveawayList: activeList,
          pastGiveawayList: pastList
        });
        
      });
    });
    //res.redirect('/giveaway/next');
  });


  /**
   * get the end date of the next giveaway
   */
  app.get('/giveaway/next', function (req, res) {
    giveaway.getNext(function(err, g) {
      if (err) res.status(500).render('error.nunj', {code: 500, message: 'could not get next giveaway'});
      if (typeof(g) === 'undefined')
        res.redirect('/');
      else
        res.redirect('/giveaway/' + g.id);
    });
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

//        console.log('got giveaway', g);
//        var title = g.title || 'untitled giveaway';
//        var description = g.description || 'undescribed giveaway';
//        var picture = g.picture || 'https://ipfs.pics/ipfs/QmbbzFoLVEN3PyfTRLkW4dusFp5PeTYs3mULGmmsWbgY2v';
//        var sponsorName = g.sponsorName || '';
//        var sponsorAddress = g.sponsorAddress || '';
//        var endDate = g.endDate;
        
        if (!g.title) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no title'});
        if (!g.description) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no description'});
        if (!g.picture) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no picture'});
        if (!g.endDate) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no end date'});
        if (!g.drawingDate) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no drawing date'});
        if (!g.sponsorName) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor name'});
        if (!g.sponsorEmail) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor email'});
        if (!g.sponsorAddress) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor address'});
        if (!g.deliveryMethod) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no delivery method'});
        
        var endDate = moment(g.endDate).format('YYYY-MM-DD');
        var drawingDate = moment(g.drawingDate).format('YYYY-MM-DD');

        res.render('rules.nunj', {
          title: g.title,
          description: g.description,
          picture: g.picture,
          endDate: endDate,
          drawingDate: drawingDate,
          sponsorName: g.sponsorName,
          sponsorAddress: g.sponsorAddress,
          sponsorEmail: g.sponsorEmail,
          deliveryMethod: g.deliveryMethod
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
        var endDate = g.endDate;
        var drawingDate = g.drawingDate;
        var sponsorName = g.sponsorName;
        var sponsorAddress = g.sponsorAddress;
        var sponsorEmail = g.sponsorEmail;
        var winnerIGN = g.winnerIGN;
        var ended = g.ended || moment(endDate).isBefore(moment());
        var numberOfEntries = g.entrants.length;
         
        if (!title) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no title'});
        if (!description) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no description'});
        if (!picture) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no picture'});
        if (!endDate) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no end date'});
        if (!drawingDate) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no drawing date'});
        if (!sponsorName) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor name'});
        if (!sponsorEmail) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor email'});
        if (!sponsorAddress) return res.status(500).render('error.nunj', {code: 500, message: 'giveaway has no sponsor address'});
        
        res.render('giveaway.nunj', {
          title: title,
          description: description,
          picture: picture,
          endDate: moment(endDate).format(),
          endDateUnix: endDate,
          drawingDate: moment(drawingDate).format(),
          drawingDateUnix: drawingDate,
          sponsorName: sponsorName,
          sponsorAddress: sponsorAddress,
          sponsorEmail: sponsorEmail,
          rulesLink: g.id+'/rules',
          giveawayID: g._id,
          winnerIGN: winnerIGN,
          ended: ended,
          numberOfEntries: numberOfEntries
        });
      });
    });

  
  /**
   * accept giveaway submissions
   */
  app.post('/giveaway/entry', function(req, res) {
    console.log(req.body);

    var entry = {};
    entry.ign = req.body.ign;
    entry.email = req.body.email;
    entry.giveawayID = req.body.giveawayID;
    entry.valid = true;
    
    giveaway.addEntry(entry, entry.giveawayID, function(err) {
      if (err) {
        //console.log(util.inspect(err));
        console.log(err.message);
        if (/The email format is invalid/.test(err.message))
          return res.status(403).send({"valid":0,"message":"The email format is invalid"});
        
        if (/The email field is required/.test(err.message))
          return res.status(403).send({"valid":0,"message":"The email field is required"});
        
        if (/The ign field is required/.test(err.message))
          return res.status(403).send({"valid":0,"message":"The in-game-name field is required"});
        
        if (/duplicate e-mail already/.test(err.message))
          return res.status(403).send({"valid":0,"message":"This e-mail has already entered!"});
        
        if (/the giveaway has ended/.test(err.message))
          return res.status(403).send({"valid":0,"message":"This giveaway has ended so you cannot enter it."});
        
        return res.status(403).send({"valid":0,"message":"error with your entry"});
      }
      return res.status(202).send({"valid":1,"message":"thanks for entering!"});
    });
  });
  
  
  /**
   * get the drawing view of a specific giveaway.
   * this is the screen that 
   *   - loluwin sends a one-time secret link to admin
   *     - via email
   *     - GET params contain secret token
   *   - admin sees right before starting drawing
   *   - admin visually busts any punks
   *   - admin presses "DRAW" or a link to database editor
   */
  app.get('/giveaway/:id/drawing',
    setupReq,
    validateID,
    validateToken,
    function (req, res) {
      // load the giveaway details
      giveaway.load(req.loluwin.giveawayID, function (err, g) {
        
        res.status(200).render('drawing.nunj', {
          giveawayID: g.id,
          token: req.loluwin.token
        });
      });
  });
  
  
  
  /**
   * serve privacy page
   */
  app.get('/privacy', function(req, res) {
    return res.render('privacy.nunj');
  });
  
  /**
   * redirect to contact page
   */
  app.get('/contact', function(req, res) {
    return res.redirect('http://grimtech.net/contact');
  });
  
  
  app.get('/donate', function(req, res) {
    return res.render('donate.nunj');
  });
}

module.exports = {
  serve: serve,
  app: app,
  validateID: validateID,
  validateToken: validateToken,
  setupReq: setupReq
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