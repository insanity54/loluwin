'use strict';

/**
 * registry client. uses Consul to advertize services to a service registry,
 * which the load balancer uses to get addresses of microservices
 */

var consul = require('consul')();
var os = require('os');
var ifaces = os.networkInterfaces();
var stun = require('stun');
var _ = require('underscore');



//consul.status.leader(callback);

consul.agent.service.list(function(err, res) {
  if (err) throw err;
  console.log(res);
});

var registerService = function registerService(options, cb) {

  getExternalIP(function (err, ip) {
    if (err) throw err;
    
    var defaultOpts = {
      tags: ['loluwin'],
      address: ip
    }

    var opts = _.extend({}, defaultOpts, options);

    consul.agent.service.register(opts, function(err, res) {
      if (err) throw err;
      return cb(null, res);
    });

  });
}


  
  
// greets http://stackoverflow.com/a/8440736/1004931
var getLocalIP = function getLocalIP(cb) {

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':' + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
      ++alias;
    });
  });

  // en0 192.168.1.101
  // eth0 10.0.0.101 
}


var getExternalIP = function getExternalIP(cb) {
  //console.log('getting external');
  // STUN Server by Google
  var port = 19302;
  var host = 'stun.l.google.com';

  // Connect to STUN Server
  var client = stun.connect(port, host);
  client.request() //function(err, data) {
//    if (err) throw err;
//    console.log('data: %s', data);
//  });
  
  client.on('response', function(data) {
    //console.log('EVENT: response');
    client.close();
    return cb(null, data.attrs['32'].address);
  });
  
  client.on('error_response', function(err) {
    //console.log('EVENT: error_response');
    client.close();
    return cb(err);
  });
  
  client.on('message', function(data) {
    //console.log('EVENT: message');
    client.close();
    //return cb(null, data);
  });
  
  client.on('error', function(err) {
    //console.log('EVENT: error');
    client.close();
    return cb(err);
  });
}





module.exports = {
  registerService: registerService
}