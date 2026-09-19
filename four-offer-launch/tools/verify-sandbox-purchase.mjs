'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://nqcshihyfhthywpseilx.supabase.co';
const DELIVERY_URL = `${SUPABASE_URL}/functions/v1/four-offer-delivery`;
const OFFER_SLUG = 'ai-project-handoff';
const EXPECTED_AMOUNT = '19.00';
const SELLER_EMAIL = 'anastaysia98@gmail.com';

const orderId = String(process.argv[2] || '').trim();
const outputArgIndex = process.argv.indexOf('--output');
const outputPath = outputArgIndex >= 0 ? process.argv[outputArgIndex + 1] : null;

if (!/^[A-Z0-9-]{10,64}$/i.test(orderId)) {
  console.error('Usage: node tools/verify-sandbox-purchase.mjs PAYPAL_ORDER_ID [--output evidence.json]');
  process.exit(64);
}

const requiredEnv = [
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'SUPABASE_SECRET_KEY',
  'DELIVERY_TOKEN_SECRET'
];

const missingEnv = requiredEnv.filter((name) => !String(process.env[name] || '').trim());
if (missingEnv.length) {
  console.error(`FAIL: missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (process.env.PAYPAL_ENV && process.env.PAYPAL_ENV !== 'sandbox') {
  console.error('FAIL: PAYPAL_ENV must be sandbox for this verifier');
  process.exit(1);
}

if (Buffer.byteLength(String(process.env.DELIVERY_TOKEN_SECRET), 'utf8') < 32) {
  console.error('FAIL: DELIVERY_TOKEN_SECRET must be at least 32 bytes');
  process.exit(1);
}

const checks = [];
let failed = false;

function record(name, ok, detail, extra = {}) {
  checks.push({ name, ok, detail, ...extra });
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name} — ${detail}`);
}

function adminHeaders(extra = {}) {
  const key = process.env.SUPABASE_SECRET_KEY;
  const headers = { apikey: key, ...extra };
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;
  return headers;
}

async function supabase(resource, init = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${resource}`, {
    ...init,
    headers: adminHeaders({ ...(init.headers || {}) })
  });
  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return body;
}

async function paypalAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');
  const response = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(`paypal_oauth_${response.status}`);
  return data.access_token;
}

async function paypalOrder(accessToken) {
  const response = await fetch(
    `https://api-m.sandbox.paypal.com/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`paypal_order_${response.status}`);
  return data;
}

function deterministicToken() {
  return crypto
    .createHmac('sha256', process.env.DELIVERY_TOKEN_SECRET)
    .update(`four-offer:${orderId}:${OFFER_SLUG}`)
    .digest('base64url');
}

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function writeEvidence(report) {
  const rendered = JSON.stringify(report, null, 2) + '\n';
  if (outputPath) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, rendered);
    console.log(`Evidence written to ${outputPath}`);
  } else {
    console.log(rendered);
  }
}

(async () => {
  const startedAt = new Date().toISOString();
  let captureId = null;
  let zipSha256 = null;
  let zipSize = null;
  let tokenCountBefore = null;
  let tokenCountAfter = null;

  try {
    const accessToken = await paypalAccessToken();
    record('PayPal sandbox authentication', true, 'OAuth access token obtained');

    const order = await paypalOrder(accessToken);
    const unit = Array.isArray(order.purchase_units) ? order.purchase_units[0] : null;
    const capture = unit?.payments?.captures?.[0] || null;
    captureId = capture?.id || null;

    record('PayPal order completed', order.status === 'COMPLETED', `status=${order.status || 'missing'}`);
    record('PayPal offer reference', unit?.reference_id === OFFER_SLUG, `reference_id=${unit?.reference_id || 'missing'}`);
    record('PayPal custom reference', unit?.custom_id === `four-offer:${OFFER_SLUG}`, `custom_id=${unit?.custom_id || 'missing'}`);
    record('PayPal capture completed', capture?.status === 'COMPLETED', `capture_status=${capture?.status || 'missing'}`);
    record('PayPal currency', capture?.amount?.currency_code === 'USD', `currency=${capture?.amount?.currency_code || 'missing'}`);
    record(
      'PayPal amount',
      Number(capture?.amount?.value).toFixed(2) === EXPECTED_AMOUNT,
      `amount=${capture?.amount?.value || 'missing'}`
    );
    const payee = String(capture?.payee?.email_address || unit?.payee?.email_address || '').toLowerCase();
    record('PayPal seller', !payee || payee === SELLER_EMAIL.toLowerCase(), payee ? 'seller email matches' : 'PayPal did not return payee email');

    const paymentQuery = new URLSearchParams({
      select: 'paypal_order_id,paypal_capture_id,offer_slug,amount,currency_code,status,delivery_token_hash,completed_at',
      paypal_order_id: `eq.${orderId}`,
      limit: '1'
    });
    const payments = await supabase(`four_offer_payments?${paymentQuery.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const payment = Array.isArray(payments) ? payments[0] : null;

    record('Ledger row exists', Boolean(payment), payment ? 'payment ledger row found' : 'payment ledger row missing');
    record('Ledger status completed', payment?.status === 'COMPLETED', `status=${payment?.status || 'missing'}`);
    record('Ledger offer', payment?.offer_slug === OFFER_SLUG, `offer_slug=${payment?.offer_slug || 'missing'}`);
    record('Ledger amount', Number(payment?.amount).toFixed(2) === EXPECTED_AMOUNT, `amount=${payment?.amount ?? 'missing'}`);
    record('Ledger currency', payment?.currency_code === 'USD', `currency=${payment?.currency_code || 'missing'}`);
    record('Ledger capture matches PayPal', Boolean(captureId) && payment?.paypal_capture_id === captureId, captureId ? 'capture IDs match' : 'PayPal capture ID missing');
    record('Ledger completion timestamp', Boolean(payment?.completed_at), payment?.completed_at || 'missing');

    const token = deterministicToken();
    const hash = tokenHash(token);
    record('Ledger stores only token hash', payment?.delivery_token_hash === hash, 'delivery token hash matches deterministic grant');

    const tokenQuery = new URLSearchParams({
      select: 'token_hash,offer_slug,payment_reference,expires_at,max_downloads,download_count,last_downloaded_at',
      token_hash: `eq.${hash}`,
      limit: '1'
    });
    const tokenRowsBefore = await supabase(`four_offer_download_tokens?${tokenQuery.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const grantBefore = Array.isArray(tokenRowsBefore) ? tokenRowsBefore[0] : null;
    tokenCountBefore = grantBefore ? Number(grantBefore.download_count) : null;

    record('Delivery grant exists', Boolean(grantBefore), grantBefore ? 'hashed grant found' : 'grant missing');
    record('Delivery grant offer', grantBefore?.offer_slug === OFFER_SLUG, `offer_slug=${grantBefore?.offer_slug || 'missing'}`);
    record('Delivery grant payment reference', grantBefore?.payment_reference === orderId, 'payment reference matches PayPal order');
    record('Delivery grant unexpired', grantBefore && new Date(grantBefore.expires_at).getTime() > Date.now(), `expires_at=${grantBefore?.expires_at || 'missing'}`);
    record('Delivery grant has remaining use', grantBefore && tokenCountBefore < Number(grantBefore.max_downloads), `download_count=${grantBefore?.download_count ?? 'missing'}, max=${grantBefore?.max_downloads ?? 'missing'}`);

    const fileQuery = new URLSearchParams({
      select: 'offer_slug,filename,mime_type,sha256,size_bytes,active',
      offer_slug: `eq.${OFFER_SLUG}`,
      active: 'eq.true',
      limit: '1'
    });
    const fileRows = await supabase(`four_offer_downloads?${fileQuery.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const expectedFile = Array.isArray(fileRows) ? fileRows[0] : null;
    record('Private ZIP metadata exists', Boolean(expectedFile), expectedFile ? expectedFile.filename : 'metadata missing');
    record('Private ZIP active', expectedFile?.active === true, `active=${String(expectedFile?.active)}`);

    if (failed) {
      const report = {
        schema: 'smartpickshop.four-offer-sandbox-purchase.v1',
        checked_at: new Date().toISOString(),
        started_at: startedAt,
        paypal_environment: 'sandbox',
        offer_slug: OFFER_SLUG,
        amount_usd: EXPECTED_AMOUNT,
        paypal_order_id: orderId,
        paypal_capture_id: captureId,
        verdict: 'NOT_ACCEPTED',
        checks
      };
      writeEvidence(report);
      process.exit(1);
    }

    const downloadStartedAt = new Date().toISOString();
    const downloadResponse = await fetch(`${DELIVERY_URL}?token=${encodeURIComponent(token)}`, {
      headers: { 'User-Agent': 'SmartPickShop-Four-Offer-Sandbox-Acceptance/1.0' }
    });
    const zip = Buffer.from(await downloadResponse.arrayBuffer());
    zipSha256 = sha256(zip);
    zipSize = zip.byteLength;

    record('Protected ZIP HTTP 200', downloadResponse.status === 200, `HTTP ${downloadResponse.status}`);
    record('Protected ZIP MIME', downloadResponse.headers.get('content-type') === (expectedFile?.mime_type || 'application/zip'), `content-type=${downloadResponse.headers.get('content-type') || 'missing'}`);
    record('ZIP byte length', zipSize === Number(expectedFile?.size_bytes), `actual=${zipSize}, expected=${expectedFile?.size_bytes ?? 'missing'}`);
    record('ZIP SHA-256', zipSha256 === expectedFile?.sha256, `actual=${zipSha256}, expected=${expectedFile?.sha256 || 'missing'}`);
    record('ZIP SHA header', downloadResponse.headers.get('x-content-sha256') === expectedFile?.sha256, 'X-Content-SHA256 matches private metadata');

    const tokenRowsAfter = await supabase(`four_offer_download_tokens?${tokenQuery.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const grantAfter = Array.isArray(tokenRowsAfter) ? tokenRowsAfter[0] : null;
    tokenCountAfter = grantAfter ? Number(grantAfter.download_count) : null;
    record('Download counter increments exactly once', tokenCountAfter === tokenCountBefore + 1, `before=${tokenCountBefore}, after=${tokenCountAfter}`);
    record('Last download timestamp recorded', Boolean(grantAfter?.last_downloaded_at), grantAfter?.last_downloaded_at || 'missing');

    const eventQuery = new URLSearchParams({
      select: 'id,occurred_at,event_type,offer_slug,path',
      event_type: 'eq.download_click',
      offer_slug: `eq.${OFFER_SLUG}`,
      occurred_at: `gte.${downloadStartedAt}`,
      order: 'occurred_at.desc',
      limit: '10'
    });
    const events = await supabase(`four_offer_events?${eventQuery.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    const downloadEvent = Array.isArray(events)
      ? events.find((event) => event.event_type === 'download_click' && event.offer_slug === OFFER_SLUG)
      : null;
    record('Server-side download analytics recorded', Boolean(downloadEvent), downloadEvent?.occurred_at || 'event missing');

    const report = {
      schema: 'smartpickshop.four-offer-sandbox-purchase.v1',
      checked_at: new Date().toISOString(),
      started_at: startedAt,
      paypal_environment: 'sandbox',
      offer_slug: OFFER_SLUG,
      amount_usd: EXPECTED_AMOUNT,
      paypal_order_id: orderId,
      paypal_capture_id: captureId,
      zip: {
        filename: expectedFile?.filename || null,
        size_bytes: zipSize,
        sha256: zipSha256
      },
      download_count: {
        before: tokenCountBefore,
        after: tokenCountAfter
      },
      verdict: failed ? 'NOT_ACCEPTED' : 'SANDBOX_PURCHASE_ACCEPTED',
      checks
    };

    writeEvidence(report);

    if (failed) process.exit(1);
    console.log('VERDICT: SANDBOX PURCHASE ACCEPTED.');
    console.log('Do not switch to PAYPAL_ENV=live until this evidence is retained and reviewed.');
  } catch (error) {
    const report = {
      schema: 'smartpickshop.four-offer-sandbox-purchase.v1',
      checked_at: new Date().toISOString(),
      started_at: startedAt,
      paypal_environment: 'sandbox',
      offer_slug: OFFER_SLUG,
      amount_usd: EXPECTED_AMOUNT,
      paypal_order_id: orderId,
      paypal_capture_id: captureId,
      verdict: 'ERROR',
      error: error instanceof Error ? error.message : String(error),
      checks
    };
    writeEvidence(report);
    console.error(`ERROR: ${report.error}`);
    process.exit(1);
  }
})();