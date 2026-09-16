'use strict';

const crypto = require('crypto');

const SELLER_EMAIL = 'anastaysia98@gmail.com';

const OFFERS = Object.freeze({
  'cashh-starter': { title: 'Cashh Radar Opportunity Intelligence Brief — Starter', price: '100.00', kind: 'service' },
  'cashh-expanded': { title: 'Cashh Radar Opportunity Intelligence Brief — Expanded', price: '200.00', kind: 'service' },
  'remote-career-diy': { title: 'Remote Career Command Center DIY', price: '29.00', kind: 'digital' },
  'ai-project-handoff': { title: 'AI Project Handoff Pack', price: '19.00', kind: 'digital' },
  'lnc-expanded': { title: 'L.N.C. 40 Project Printable — Expanded', price: '39.00', kind: 'digital' }
});

let tokenCache = { value: '', expiresAt: 0 };

function configured() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PUBLIC_BASE_URL);
}

function apiBase() {
  return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

function publicBase() {
  return String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
}

async function accessToken() {
  if (tokenCache.value && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  const credentials = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(`paypal_oauth_${response.status}`);
  tokenCache = { value: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 300) * 1000 };
  return tokenCache.value;
}

async function request(endpoint, init = {}) {
  const token = await accessToken();
  const response = await fetch(`${apiBase()}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function createOrder(offerSlug) {
  const offer = OFFERS[offerSlug];
  if (!offer) throw new Error('invalid_offer');
  if (!configured()) throw new Error('paypal_not_configured');

  const item = {
    name: offer.title,
    unit_amount: { currency_code: 'USD', value: offer.price },
    quantity: '1'
  };
  if (offer.kind === 'digital') item.category = 'DIGITAL_GOODS';

  const payload = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: offerSlug,
      custom_id: `four-offer:${offerSlug}`,
      description: offer.title,
      amount: {
        currency_code: 'USD',
        value: offer.price,
        breakdown: { item_total: { currency_code: 'USD', value: offer.price } }
      },
      items: [item]
    }],
    application_context: {
      brand_name: 'SmartPickShop Holdings',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'PAY_NOW',
      return_url: `${publicBase()}/paypal/return?offer=${encodeURIComponent(offerSlug)}`,
      cancel_url: `${publicBase()}/paypal/cancel?offer=${encodeURIComponent(offerSlug)}`
    }
  };

  const { response, data } = await request('/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': crypto.randomUUID(), Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  if (!response.ok || !data.id) throw new Error(`paypal_create_${response.status}`);
  const approval = Array.isArray(data.links) ? data.links.find(x => x.rel === 'approve' || x.rel === 'payer-action') : null;
  if (!approval?.href) throw new Error('paypal_missing_approval_url');
  return { orderId: data.id, approveUrl: approval.href, offer };
}

async function captureOrder(orderId, offerSlug) {
  const offer = OFFERS[offerSlug];
  if (!offer) throw new Error('invalid_offer');
  const { response, data } = await request(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `capture-${orderId}` },
    body: '{}'
  });
  if (!response.ok) throw new Error(`paypal_capture_${response.status}`);

  const unit = Array.isArray(data.purchase_units) ? data.purchase_units[0] : null;
  const capture = unit?.payments?.captures?.[0];
  if (data.status !== 'COMPLETED' || capture?.status !== 'COMPLETED') throw new Error('paypal_not_completed');
  if (unit?.reference_id !== offerSlug || unit?.custom_id !== `four-offer:${offerSlug}`) throw new Error('paypal_offer_mismatch');
  const paid = capture.amount || unit.amount || {};
  if (paid.currency_code !== 'USD' || Number(paid.value).toFixed(2) !== Number(offer.price).toFixed(2)) throw new Error('paypal_amount_mismatch');

  const receiver = String(capture.payee?.email_address || unit.payee?.email_address || '').toLowerCase();
  if (receiver && receiver !== SELLER_EMAIL.toLowerCase()) throw new Error('paypal_receiver_mismatch');

  return { order: data, capture, offer };
}

module.exports = { OFFERS, SELLER_EMAIL, configured, createOrder, captureOrder };
