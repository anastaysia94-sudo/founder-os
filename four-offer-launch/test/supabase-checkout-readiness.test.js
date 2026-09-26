'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'functions', 'four-offer-checkout', 'index.ts'),
  'utf8'
);

test('Supabase checkout exposes readiness checks for config, PayPal, and delivery assets', () => {
  assert.match(source, /action === 'ready'/);
  assert.match(source, /checkout_config/);
  assert.match(source, /paypal_api/);
  assert.match(source, /delivery_assets/);
  assert.match(source, /remote-career-diy/);
  assert.match(source, /ai-project-handoff/);
  assert.match(source, /lnc-expanded/);
});

test('readiness code avoids returning credential values', () => {
  const readinessStart = source.indexOf('async function readinessState()');
  const readinessEnd = source.indexOf('async function paypalRequest', readinessStart);
  const readiness = source.slice(readinessStart, readinessEnd);
  assert.doesNotMatch(readiness, /paypal_client_secret/);
  assert.doesNotMatch(readiness, /delivery_token_secret/);
});
