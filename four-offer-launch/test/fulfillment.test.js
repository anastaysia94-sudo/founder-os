'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.SUPABASE_SECRET_KEY = 'sb_secret_test_only';
process.env.DELIVERY_TOKEN_SECRET = '0123456789abcdef0123456789abcdef0123456789abcdef';

const fulfillment = require('../fulfillment');

function emptyResponse(status = 201) {
  return new Response('', { status });
}

test('digital fulfillment stores only the token hash and returns the raw token to the buyer', async () => {
  const calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return emptyResponse();
  };

  const result = await fulfillment.completePayment({
    orderId: 'ORDER-DIGITAL-001',
    captureId: 'CAPTURE-DIGITAL-001',
    offerSlug: 'ai-project-handoff',
    amount: '19.00',
    buyerEmail: 'buyer@example.test',
    digital: true
  });

  assert.ok(result.token);
  assert.ok(result.downloadUrl.includes(encodeURIComponent(result.token)));
  assert.equal(result.token.length > 30, true);

  const tokenCall = calls.find(call => call.url.includes('/four_offer_download_tokens'));
  const paymentCall = calls.find(call => call.url.includes('/four_offer_payments'));
  assert.ok(tokenCall, 'token grant insert missing');
  assert.ok(paymentCall, 'payment ledger upsert missing');

  const tokenBody = JSON.parse(tokenCall.init.body);
  const paymentBody = JSON.parse(paymentCall.init.body);
  const expectedHash = crypto.createHash('sha256').update(result.token).digest('hex');

  assert.equal(tokenBody.token_hash, expectedHash);
  assert.equal(paymentBody.delivery_token_hash, expectedHash);
  assert.equal(tokenBody.max_downloads, 3);
  assert.equal(tokenBody.download_count, 0);
  assert.equal(tokenCall.init.body.includes(result.token), false, 'raw token leaked into token table request');
  assert.equal(paymentCall.init.body.includes(result.token), false, 'raw token leaked into payment table request');
});

test('same verified order deterministically produces the same delivery token', async () => {
  global.fetch = async () => emptyResponse();
  const input = {
    orderId: 'ORDER-IDEMPOTENT-001',
    captureId: 'CAPTURE-IDEMPOTENT-001',
    offerSlug: 'remote-career-diy',
    amount: '29.00',
    buyerEmail: null,
    digital: true
  };

  const first = await fulfillment.completePayment(input);
  const second = await fulfillment.completePayment(input);
  assert.equal(first.token, second.token);
  assert.equal(first.downloadUrl, second.downloadUrl);
});

test('service fulfillment records payment without creating a download grant', async () => {
  const calls = [];
  global.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return emptyResponse();
  };

  const result = await fulfillment.completePayment({
    orderId: 'ORDER-SERVICE-001',
    captureId: 'CAPTURE-SERVICE-001',
    offerSlug: 'cashh-expanded',
    amount: '200.00',
    buyerEmail: 'buyer@example.test',
    digital: false
  });

  assert.equal(result.token, null);
  assert.equal(result.downloadUrl, null);
  assert.equal(calls.some(call => call.url.includes('/four_offer_download_tokens')), false);
  assert.equal(calls.some(call => call.url.includes('/four_offer_payments')), true);
});

test('fulfillment refuses a weak delivery token secret', async () => {
  const original = process.env.DELIVERY_TOKEN_SECRET;
  process.env.DELIVERY_TOKEN_SECRET = 'too-short';
  assert.equal(fulfillment.configured(), false);
  await assert.rejects(
    fulfillment.completePayment({
      orderId: 'ORDER-WEAK-001',
      captureId: 'CAPTURE-WEAK-001',
      offerSlug: 'lnc-expanded',
      amount: '39.00',
      digital: true
    }),
    /fulfillment_not_configured/
  );
  process.env.DELIVERY_TOKEN_SECRET = original;
});

test('fulfillment rejects missing capture references and non-positive amounts', async () => {
  global.fetch = async () => emptyResponse();
  await assert.rejects(
    fulfillment.completePayment({ orderId: 'ORDER-INVALID', captureId: '', offerSlug: 'ai-project-handoff', amount: '19.00', digital: true }),
    /invalid_fulfillment_reference/
  );
  await assert.rejects(
    fulfillment.completePayment({ orderId: 'ORDER-INVALID', captureId: 'CAPTURE-INVALID', offerSlug: 'ai-project-handoff', amount: '0', digital: true }),
    /invalid_fulfillment_amount/
  );
});
