var PaymentProtocol = require('bitcore-payment-protocol');
var BitcoreLib = require('bitcore-lib');

var moment = require('moment');
var express = require('express');
var app = express();
//var PaymentProtocol = bitcore.PaymentProtocol;
var Address = bitcoreLib.Address;
var Script = bitcoreLib.Script;
console.log(bitcoreLib);

console.log('env is %s ', process.env.BITCOIN_DER_CERT_PATH); 
console.log(process.env); 
var bitcoin_payment_address = process.env.BITCOIN_PAYMENT_ADDRESS;
if (typeof(bitcoin_payment_address) === 'undefined')
  throw new Error('BITCOIN_PAYMENT_ADDRESS is undefined in environment');








app.get('/paymentrequest', function(err, res) {

  // create PaymentRequest and send to user
  var bitcoin_der_cert_path = process.env.BITCOIN_DER_CERT_PATH || './keys/cert.pem';
  var bitcoin_priv_key_path = process.env.BITCOIN_PRIV_KEY_PATH || './keys/privkey';
  
  // create address that customer will pay to
  var address = Address.fromString(bitcoin_payment_address);
  
  // create the script that specifies how the bitcoin is redeemable
  var script = Script.buildPublicKeyHashOut(address);
  
  // check @todo remove this
  console.log(script.toString());
  
  // create outputs that the customer will send to
  var outputs = new PaymentProtocol().makeOutput();
  outputs.set('amount', 0);
  outputs.set('script', script.toBuffer());
//  
//  var utxo = new UnspentOutput({
//    "txid" : "a0a08e397203df68392ee95b3f08b0b3b3e2401410a38d46ae0874f74846f2e9",
//    "vout" : 0,
//    "address" : "mgJT8iegL4f9NCgQFeFyfvnSw1Yj4M5Woi",
//    "scriptPubKey" : "76a914089acaba6af8b2b4fb4bed3b747ab1e4e60b496588ac",
//    "amount" : 0.00070000
//  });
  
  // make payment details
  var now = moment().unix();
  var details = new PaymentProtocol().makePaymentDetails();
  details.set('network', 'test');
  details.set('outputs', outputs);
  details.set('time', now);
  details.set('expires', moment(now, 'X').add(24, 'hours'));
  details.set('memo', 'A payment request from the merchant.');
  details.set('payment_url', 'https://localhost/-/pay');
  details.set('merchant_data', new Buffer({size: 7}));


  // sign payment request
  var certificates = new PaymentProtocol().makeX509Certificates();
  certificats.set('certificate', [bitcoin_der_cert_path]);
 
  // form the request
  var request = new PaymentRequest().makePaymentRequest();
  request.set('payment_details_version', 1);
  request.set('pki_type', 'x509+sha256');
  request.set('pki_data', certificates.serialize());
  request.set('serialized_payment_details', details.serialize());
  request.sign(bitcoin_priv_key_path);

  // serialize the request
  var rawbody = request.serialize();

  // Example HTTP Response Headers:
  // Content-Type: PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE
  // Content-Length: request.length
  // Content-Transfer-Encoding: 'binary'
  res.set({
    'Content-Type': PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE,
    'Content-Length': request.length,
    'Content-Transfer-Encoding': 'binary'
  });

  res.status(200).send(rawbody);
});


app.listen(5000);
console.log('listening on port 5000');

