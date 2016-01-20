var PaymentProtocol = require('bitcore-payment-protocol');
var moment = require('moment');


console.log('env is %s ', process.env.BITCOIN_DER_CERT_PATH); 
console.log(process.env); 


/**
 *  create a set of BIP70 PaymentProtocol messages
 */
var paypro = function paypro() {

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
  certificats.set('certificate', [process.env.BITCOIN_DER_CERT_PATH]);
 
  // form the request
  var request = new PaymentRequest().makePaymentRequest();
  request.set('payment_details_version', 1);
  request.set('pki_type', 'x509+sha256');
  request.set('pki_data', certificates.serialize());
  request.set('serialized_payment_details', details.serialize());
  request.sign(process.env.BITCOIN_PRIV_KEY_PATH);

  // serialize the request
  var rawbody = request.serialize();

  // Example HTTP Response Headers:
  // Content-Type: PaymentProtocol.PAYMENT_REQUEST_CONTENT_TYPE
  // Content-Length: request.length
  // Content-Transfer-Encoding: 'binary'

}
    
paypro();


module.exports = {
  paypro: paypro
}