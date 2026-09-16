'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { getReadiness, publicBaseValid } = require('../readiness');

test('readiness reports only missing variable names when unconfigured', () => {
  const state = getReadiness({ PAYPAL_ENV: 'sandbox' });
  assert.equal(state.ready, false);
  assert.equal(state.paypal_environment, 'sandbox');
  assert.deepEqual(state.invalid, []);
  assert.deepEqual(state.missing, [
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
    'PUBLIC_BASE_URL',
    'SUPABASE_SECRET_KEY',
    'DELIVERY_TOKEN_SECRET'
  ]);
  assert.equal(JSON.stringify(state).includes('secret-value'), false);
});

test('readiness accepts a complete sandbox configuration', () => {
  const state = getReadiness({
    PAYPAL_ENV: 'sandbox',
    PAYPAL_CLIENT_ID: 'client-id',
    PAYPAL_CLIENT_SECRET: 'secret-value',
    PUBLIC_BASE_URL: 'https://store.example.test',
    SUPABASE_SECRET_KEY: 'sb_secret_example',
    DELIVERY_TOKEN_SECRET: '0123456789abcdef0123456789abcdef'
  });
  assert.deepEqual(state, {
    ready: true,
    paypal_environment: 'sandbox',
    missing: [],
    invalid: []
  });
});

test('readiness rejects unsafe production URLs and weak delivery secrets', () => {
  const state = getReadiness({
    PAYPAL_ENV: 'live',
    PAYPAL_CLIENT_ID: 'client-id',
    PAYPAL_CLIENT_SECRET: 'secret-value',
    PUBLIC_BASE_URL: 'http://store.example.test',
    SUPABASE_SECRET_KEY: 'sb_secret_example',
    DELIVERY_TOKEN_SECRET: 'short'
  });
  assert.equal(state.ready, false);
  assert.equal(state.paypal_environment, 'live');
  assert.deepEqual(state.missing, []);
  assert.deepEqual(state.invalid, ['PUBLIC_BASE_URL', 'DELIVERY_TOKEN_SECRET']);
});

test('public base validation permits HTTPS and local HTTP only', () => {
  assert.equal(publicBaseValid('https://store.example.test'), true);
  assert.equal(publicBaseValid('http://localhost:3000'), true);
  assert.equal(publicBaseValid('http://127.0.0.1:3000'), true);
  assert.equal(publicBaseValid('http://store.example.test'), false);
  assert.equal(publicBaseValid('https://user:pass@store.example.test'), false);
  assert.equal(publicBaseValid('https://store.example.test/?token=x'), false);
});
