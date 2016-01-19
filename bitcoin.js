var PaymentProtocol = require('bitcore-payment-protocol');
var moment = require('moment');
var now = moment().unix();

var details = new PaymentProtocol().makePaymentDetails();
details.set('network', 'test');
details.set('outputs', outputs);
details.set('time', now);
details.set('expires', now + 60 * 60 * 24);
details.set('memo', 'A payment request from the merchant.');
details.set('payment_url', 'https://localhost/-/pay');
details.set('merchant_data', new Buffer({size: 7}));

