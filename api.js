var path = require('path');
var nunjucks = require('nunjucks');
var giveaway = require('./giveaway');
var moment = require('moment');
var bodyParser = require('body-parser');
var util = require('util');
var server = require('./server');




var authenticate = function authenticate(req, res, next) {
  next(); // @todo
}


/**
 * API v1
 */
server.app.get('/api/v1/giveaway/:id',
  server.setupReq,
  authenticate,
  server.validateID,
  server.validateToken,
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
  authenticate,
  server.validateID,
  server.validateToken,
  function (req, res) {
    giveaway.load(req.loluwin.giveawayID, function (err, gw) {
      if (err) return res.status(500).render('error.nunj', {
        code: 500,
        message: err
      });
      res.status(200).json(gw.entrants);
    });
  });



module.exports = {
  authenticate: authenticate
}