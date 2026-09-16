'use strict';

const crypto = require('crypto');

const SUPABASE_URL = 'https://nqcshihyfhthywpseilx.supabase.co';
const DELIVERY_URL = `${SUPABASE_URL}/functions/v1/four-offer-delivery`;
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_DOWNLOADS = 3;

function configured() {
  const tokenSecret = String(process.env.DELIVERY_TOKEN_SECRET || '');
  return Boolean(process.env.SUPABASE_SECRET_KEY && Buffer.byteLength(tokenSecret, 'utf8') >= 32);
}

function adminHeaders(extra = {}) {
  const key = process.env.SUPABASE_SECRET_KEY || '';
  const headers = { apikey: key, ...extra };
  if (key && !key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function rest(resource, init = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, {
    ...init,
    headers: adminHeaders({ ...(init.headers || {}) })
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return data;
}

function tokenFor(orderId, offerSlug) {
  if (!configured()) throw new Error('fulfillment_not_configured');
  return crypto.createHmac('sha256', process.env.DELIVERY_TOKEN_SECRET)
    .update(`four-offer:${orderId}:${offerSlug}`)
    .digest('base64url');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function validateCompletion({ orderId, captureId, offerSlug, amount }) {
  if (!orderId || !captureId || !offerSlug) throw new Error('invalid_fulfillment_reference');
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('invalid_fulfillment_amount');
  return numericAmount;
}

async function getPayment(orderId) {
  const query = new URLSearchParams({
    select: 'paypal_order_id,paypal_capture_id,offer_slug,amount,currency_code,status,buyer_email,delivery_token_hash',
    paypal_order_id: `eq.${orderId}`,
    limit: '1'
  });
  const rows = await rest(`four_offer_payments?${query.toString()}`, { headers: { Accept: 'application/json' } });
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function recordCreated(orderId, offerSlug, amount) {
  if (!process.env.SUPABASE_SECRET_KEY) return;
  const numericAmount = Number(amount);
  if (!orderId || !offerSlug || !Number.isFinite(numericAmount) || numericAmount <= 0) throw new Error('invalid_payment_record');
  await rest('four_offer_payments?on_conflict=paypal_order_id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      paypal_order_id: orderId,
      offer_slug: offerSlug,
      amount: numericAmount,
      currency_code: 'USD',
      status: 'CREATED',
      updated_at: new Date().toISOString()
    })
  });
}

async function completePayment({ orderId, captureId, offerSlug, amount, buyerEmail, digital }) {
  if (!configured()) throw new Error('fulfillment_not_configured');
  const numericAmount = validateCompletion({ orderId, captureId, offerSlug, amount });
  let token = null;
  let hash = null;

  if (digital) {
    token = tokenFor(orderId, offerSlug);
    hash = tokenHash(token);
    await rest('four_offer_download_tokens?on_conflict=token_hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        token_hash: hash,
        offer_slug: offerSlug,
        payment_reference: orderId,
        expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
        max_downloads: MAX_DOWNLOADS,
        download_count: 0
      })
    });
  }

  await rest('four_offer_payments?on_conflict=paypal_order_id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      paypal_order_id: orderId,
      paypal_capture_id: captureId,
      offer_slug: offerSlug,
      amount: numericAmount,
      currency_code: 'USD',
      status: 'COMPLETED',
      buyer_email: buyerEmail || null,
      delivery_token_hash: hash,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  });

  return { token, downloadUrl: token ? `${DELIVERY_URL}?token=${encodeURIComponent(token)}` : null };
}

module.exports = {
  configured,
  getPayment,
  recordCreated,
  completePayment,
  DELIVERY_URL,
  TOKEN_TTL_MS,
  MAX_DOWNLOADS
};
