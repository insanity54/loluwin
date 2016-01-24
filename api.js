var path = require('path');
var nunjucks = require('nunjucks');
var giveaway = require('./giveaway');
var moment = require('moment');
var bodyParser = require('body-parser');
var util = require('util');
var server = require('./server');



var authenticate = function authenticate(req, res, next) {
  console.log("AUTHENTICATEOR. user is requesting giveaway id %s", req.loluwin.giveawayID);
  if (typeof(req.loluwin.giveawayID) === 'undefined') {
    if (typeof(req.params.id) === 'undefined')
      return res.status(403).render('error.nunj', {code: 403, message: "giveaway ID must be requested"});
    // authenticate is probably being called out of order. it needs to be called after validateID
    return res.status(500).render('error.nunj', {code: 500, message: "got prams.id but not loluwin.giveawayID. Authenticate is probably being called too soon."});
  }
  if (typeof(req.query.token) === 'undefined')
    return res.status(403).render('error.nunj', {code: 403, message: "token must be requested"});

  giveaway.getToken(req.loluwin.giveawayID, function(err, token) {
    if (err) {
      console.error(err);
      if (/giveaway does not have a token/.test(err))
        return res.status(423).render('error.nunj', {code: 423, message: "The API is not available until the giveaway ends"});
      return res.status(500).render('error.nunj', {code: 500, message: "problem getting giveaway token"})
    }
    // see if the user is requesting the correct token
    if (req.query.token !== token) {
      return res.status(401).render('error.nunj', {code: 401, message: "the token you presented was not authorized"});
    }
    next();
  });
}

var validateEntry = function validateEntry(req, res, next) {
  if (!req.params.eid) return res.status(400).render('error.nunj', { code: 400, message: 'entrant id must be supplied in URL' });
  if (!req.body.id) return res.status(400).render('error.nunj', { code: 400, message: 'entrant id must be supplied in body' });
  if (!req.body.email) return res.status(400).render('error.nunj', { code: 400, message: 'email must be supplied' });
  if (!req.loluwin) return res.status(500).render('error.nunj', { code: 500, message: ' req.loluwin is not defined. is validate being called before setupReq?' });
  req.loluwin.entrantID = req.body.id;
  req.loluwin.entrantEmail = req.body.email;
  next();
}

var updateEntry = function updateEntry(req, res, next) {
  giveaway.updateEntry(req.body, req.loluwin.giveawayID, function(err, gw) {
    if (err) return res.status(500).render('error.nunj', {
      code: 500,
      message: err
    });
    next();
  });
}


/**
 * API v1
 */
server.app.get('/api/v1/giveaway/:id',
  server.setupReq,
  server.validateID,
  server.validateToken,
  authenticate,
  function (req, res) {
    //  res.send('serve');
    giveaway.load(req.loluwin.giveawayID, function (err, gw) {
      if (err) return res.status(500).render('error.nunj', {
        code: 500,
        message: err
      });
      res.status(200).json(gw);
    });
  });



server.app.get('/api/v1/giveaway/:id/entrants',
  server.setupReq,
  server.validateID,
  server.validateToken,
  authenticate,
  function (req, res) {
    giveaway.load(req.loluwin.giveawayID, function (err, gw) {
      if (err) return res.status(500).render('error.nunj', {
        code: 500,
        message: err
      });
      res.status(200).json(gw.entrants);
    });
  });


server.app.put('/api/v1/giveaway/:id/entrants/:eid',
  server.setupReq,
  server.validateID,
  server.validateToken,
  validateEntry,
  authenticate,
  updateEntry,
  function (req, res) {
    res.status(200).end();
  });
//
//server.app.post('/api/v1/giveaway/:id/entrants',
//  server.setupReq,
//  server.validateID,
//  server.validateToken,
//  validateEntry,
//  authenticate,
//  updateEntry,
//  function (req, res) {
//    res.status(200).end();
//  });


module.exports = {
  authenticate: authenticate
}