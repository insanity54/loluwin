var path = require('path');
var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var giveaway = require('./giveaway');
var moment = require('moment');
var bodyParser = require('body-parser')
//app.use( bodyParser.json() );       // to support JSON-encoded bodies
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
    //res.send('hello');
    res.redirect('/giveaway/next');
  });


  /**
   * get the end date of the next giveaway
   */
  app.get('/giveaway/next', function (req, res) {
    giveaway.getNext(function(err, g) {
      if (err) res.status(500).render('error.nunj', {code: 500, message: 'could not get next giveaway'});
      console.log(g);
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
          drawingDate: drawingDate,
          sponsorName: sponsorName,
          sponsorAddress: sponsorAddress,
          sponsorEmail: sponsorEmail,
          rulesLink: g.id+'/rules',
          giveawayID: g._id
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
    
    giveaway.addEntry(entry, entry.giveawayID, function(err) {
      if (err) return res.status(403).send('nope');
      return res.status(202).send('roger that');
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