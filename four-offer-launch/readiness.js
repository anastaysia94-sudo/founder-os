'use strict';

const REQUIRED = Object.freeze([
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PUBLIC_BASE_URL',
  'SUPABASE_SECRET_KEY',
  'DELIVERY_TOKEN_SECRET'
]);

function publicBaseValid(raw) {
  if (!raw) return false;
  try {
    const url = new URL(String(raw).trim());
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return false;
    if (url.username || url.password || url.search || url.hash) return false;
    return true;
  } catch {
    return false;
  }
}

function getReadiness(env = process.env) {
  const missing = REQUIRED.filter(name => !String(env[name] || '').trim());
  const invalid = [];

  if (env.PUBLIC_BASE_URL && !publicBaseValid(env.PUBLIC_BASE_URL)) {
    invalid.push('PUBLIC_BASE_URL');
  }

  const deliverySecret = String(env.DELIVERY_TOKEN_SECRET || '');
  if (deliverySecret && Buffer.byteLength(deliverySecret, 'utf8') < 32) {
    invalid.push('DELIVERY_TOKEN_SECRET');
  }

  const paypalEnvironment = env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  const ready = missing.length === 0 && invalid.length === 0;

  return {
    ready,
    paypal_environment: paypalEnvironment,
    missing,
    invalid
  };
}

module.exports = { REQUIRED, getReadiness, publicBaseValid };
