'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.PAYPAL_CLIENT_ID = 'sandbox-client';
process.env.PAYPAL_CLIENT_SECRET = 'sandbox-secret';
process.env.PUBLIC_BASE_URL = 'https://store.example.test';
process.env.PAYPAL_ENV = 'sandbox';

const paypal = require('../paypal-orders');

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

test('createOrder keeps price server-side and uses current PayPal wallet experience context', async () => {
  const calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith('/v1/oauth2/token')) {
      return jsonResponse({ access_token: 'sandbox-access', expires_in: 3600 });
    }
    if (String(url).endsWith('/v2/checkout/orders')) {
      return jsonResponse({
        id: 'ORDER123456789',
        status: 'CREATED',
        links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com/checkoutnow?token=ORDER123456789' }]
      }, 201);
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  const result = await paypal.createOrder('remote-career-diy');
  assert.equal(result.orderId, 'ORDER123456789');

  const orderCall = calls.find(call => call.url.endsWith('/v2/checkout/orders'));
  assert.ok(orderCall, 'create-order API call missing');
  const body = JSON.parse(orderCall.init.body);

  assert.equal(body.intent, 'CAPTURE');
  assert.equal(body.purchase_units[0].reference_id, 'remote-career-diy');
  assert.equal(body.purchase_units[0].custom_id, 'four-offer:remote-career-diy');
  assert.equal(body.purchase_units[0].amount.currency_code, 'USD');
  assert.equal(body.purchase_units[0].amount.value, '29.00');
  assert.equal(body.purchase_units[0].items[0].category, 'DIGITAL_GOODS');
  assert.equal(body.payment_source.paypal.experience_context.shipping_preference, 'NO_SHIPPING');
  assert.equal(body.payment_source.paypal.experience_context.user_action, 'PAY_NOW');
  assert.equal(body.payment_source.paypal.experience_context.return_url, 'https://store.example.test/paypal/return?offer=remote-career-diy');
  assert.equal(body.payment_source.paypal.experience_context.cancel_url, 'https://store.example.test/paypal/cancel?offer=remote-career-diy');
  assert.equal(body.application_context, undefined);
  assert.match(orderCall.init.headers['PayPal-Request-Id'], /^[0-9a-f-]{36}$/i);
});

test('captureOrder accepts only the expected completed offer and amount', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('/v2/checkout/orders/ORDER123456789/capture')) {
      return jsonResponse({
        id: 'ORDER123456789',
        status: 'COMPLETED',
        payment_source: { paypal: { email_address: 'buyer@example.test' } },
        purchase_units: [{
          reference_id: 'remote-career-diy',
          custom_id: 'four-offer:remote-career-diy',
          amount: { currency_code: 'USD', value: '29.00' },
          payments: {
            captures: [{
              id: 'CAPTURE123456789',
              status: 'COMPLETED',
              amount: { currency_code: 'USD', value: '29.00' },
              payee: { email_address: 'anastaysia98@gmail.com' }
            }]
          }
        }]
      }, 201);
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  const paid = await paypal.captureOrder('ORDER123456789', 'remote-career-diy');
  assert.equal(paid.capture.status, 'COMPLETED');
  assert.equal(paid.capture.amount.value, '29.00');
});

test('captureOrder rejects an amount mismatch', async () => {
  global.fetch = async (url) => {
    if (String(url).includes('/v2/checkout/orders/ORDERBADAMOUNT/capture')) {
      return jsonResponse({
        id: 'ORDERBADAMOUNT',
        status: 'COMPLETED',
        purchase_units: [{
          reference_id: 'remote-career-diy',
          custom_id: 'four-offer:remote-career-diy',
          payments: {
            captures: [{
              id: 'CAPTUREBADAMOUNT',
              status: 'COMPLETED',
              amount: { currency_code: 'USD', value: '1.00' },
              payee: { email_address: 'anastaysia98@gmail.com' }
            }]
          }
        }]
      }, 201);
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  await assert.rejects(
    paypal.captureOrder('ORDERBADAMOUNT', 'remote-career-diy'),
    /paypal_amount_mismatch/
  );
});

test('configured fails closed for an unsafe public return URL', () => {
  const original = process.env.PUBLIC_BASE_URL;
  process.env.PUBLIC_BASE_URL = 'http://example.com';
  assert.equal(paypal.configured(), false);
  process.env.PUBLIC_BASE_URL = original;
});
