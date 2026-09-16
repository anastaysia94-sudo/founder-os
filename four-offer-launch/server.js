const http = require('http');
const fs = require('fs');
const path = require('path');
const paypal = require('./paypal-orders');
const fulfillment = require('./fulfillment');

const PORT = Number(process.env.PORT || 3000);
const ROOT = path.join(__dirname, 'public');
const ANALYTICS_URL = 'https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-analytics';
const DELIVERY_URL = 'https://nqcshihyfhthywpseilx.supabase.co/functions/v1/four-offer-delivery';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const CSP = "default-src 'self'; connect-src 'self' https://nqcshihyfhthywpseilx.supabase.co; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://www.paypal.com https://paypal.com https://www.sandbox.paypal.com;";

function headers(cache = 'no-store') {
  return {
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP
  };
}

function send(res, status, body, type = 'text/plain; charset=utf-8', cache = 'no-store') {
  res.writeHead(status, { 'Content-Type': type, ...headers(cache) });
  res.end(body);
}

function sendJson(res, status, body) {
  return send(res, status, JSON.stringify(body), 'application/json; charset=utf-8');
}

function escapeHtml(value) {
  return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function checkoutReady() {
  return paypal.configured() && fulfillment.configured();
}

function runtimeConfig() {
  return {
    sellerEmail: paypal.SELLER_EMAIL,
    analyticsUrl: ANALYTICS_URL,
    deliveryUrl: DELIVERY_URL,
    paypalApiReady: checkoutReady(),
    paypalEnvironment: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox',
    paypalLinks: {
      'cashh-starter': process.env.PAYPAL_CASHH_STARTER || '',
      'cashh-expanded': process.env.PAYPAL_CASHH_EXPANDED || '',
      'remote-career-diy': process.env.PAYPAL_REMOTE_CAREER_DIY || '',
      'ai-project-handoff': process.env.PAYPAL_AI_HANDOFF || '',
      'lnc-expanded': process.env.PAYPAL_LNC_EXPANDED || ''
    }
  };
}

function configScript() {
  const cfg = JSON.stringify(runtimeConfig());
  return `window.FOUR_OFFER_CONFIG=${cfg};\n(function(){\n  const starter = document.querySelector('.buy[data-offer="cashh-starter"]');\n  if (starter && !document.querySelector('.buy[data-offer="cashh-expanded"]')) {\n    starter.textContent = 'Pay $100 starter';\n    const expanded = starter.cloneNode(true);\n    expanded.dataset.offer = 'cashh-expanded';\n    expanded.dataset.price = '200';\n    expanded.textContent = 'Pay $200 expanded';\n    expanded.setAttribute('aria-label', 'Pay for Cashh Radar Expanded with PayPal');\n    starter.after(expanded);\n  }\n  document.addEventListener('click', async function(event){\n    const button = event.target.closest && event.target.closest('.buy');\n    const config = window.FOUR_OFFER_CONFIG || {};\n    if (!button || !config.paypalApiReady) return;\n    event.preventDefault();\n    event.stopImmediatePropagation();\n    const offer = button.dataset.offer;\n    const original = button.textContent;\n    button.textContent = 'Opening PayPal…';\n    button.classList.add('disabled');\n    try {\n      try {\n        const sid = localStorage.getItem('fourOfferSession') || (crypto.randomUUID ? crypto.randomUUID() : null);\n        fetch(config.analyticsUrl, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_type:'checkout_click',path:location.pathname,session_id:sid,offer_slug:offer}),keepalive:true}).catch(()=>{});\n      } catch (_) {}\n      const response = await fetch('/api/paypal/create-order', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({offer_slug:offer})});\n      const data = await response.json();\n      if (!response.ok || !data.approve_url) throw new Error(data.error || 'checkout_failed');\n      location.href = data.approve_url;\n    } catch (error) {\n      button.textContent = original;\n      button.classList.remove('disabled');\n      const notice = document.getElementById('checkoutNotice');\n      if (notice) { notice.textContent = 'PayPal checkout could not be opened. No payment was taken. Please try again or use the email contact on this page.'; notice.classList.add('show'); }\n    }\n  }, true);\n})();`;
}

async function readJson(req, maxBytes = 16384) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > maxBytes) reject(new Error('request_too_large'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('invalid_json')); }
    });
    req.on('error', reject);
  });
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  const expected = String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '');
  return !origin || !expected || origin === expected;
}

function completePage(offer, downloadUrl) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase complete</title><style>body{margin:0;background:#090414;color:#f7f2ff;font:16px/1.55 system-ui;padding:30px}.box{max-width:680px;margin:8vh auto;background:#180d31;border:1px solid #49306f;border-radius:22px;padding:28px}.btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#ff43d1,#8c5cff);color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:13px}.muted{color:#b9acd0}</style></head><body><main class="box"><p>✅ Payment verified</p><h1>${escapeHtml(offer.title)}</h1><p>Your protected download is unlocked. The link allows up to three downloads and expires after seven days.</p><a class="btn" href="${escapeHtml(downloadUrl)}">Download your ZIP</a><p class="muted">Support: ${paypal.SELLER_EMAIL}</p></main></body></html>`;
}

function servicePage(offer, orderId) {
  const subject = encodeURIComponent(`${offer.title} — paid intake`);
  const body = encodeURIComponent(`PayPal order: ${orderId}\n\nBusiness/service:\nCustomer type:\nGeography/remote:\nMinimum project value:\nRequired contact method:\nExclusions:\nExisting outreach/clients to exclude:\nDeadline:\nBuyer-supplied facts I may quote:\n`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment verified</title><style>body{margin:0;background:#090414;color:#f7f2ff;font:16px/1.55 system-ui;padding:30px}.box{max-width:680px;margin:8vh auto;background:#180d31;border:1px solid #49306f;border-radius:22px;padding:28px}.btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#ff43d1,#8c5cff);color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:13px}.muted{color:#b9acd0}</style></head><body><main class="box"><p>✅ Payment verified</p><h1>${escapeHtml(offer.title)}</h1><p>Send the written intake so the custom research can be scoped and fulfilled.</p><a class="btn" href="mailto:${paypal.SELLER_EMAIL}?subject=${subject}&body=${body}">Send paid intake</a><p class="muted">Order reference: ${escapeHtml(orderId)}</p></main></body></html>`;
}

function cancelPage(offerSlug) {
  const offer = paypal.OFFERS[offerSlug];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Checkout cancelled</title><style>body{margin:0;background:#090414;color:#f7f2ff;font:16px/1.55 system-ui;padding:30px}.box{max-width:680px;margin:8vh auto;background:#180d31;border:1px solid #49306f;border-radius:22px;padding:28px}a{color:#37e9ff}</style></head><body><main class="box"><h1>Checkout cancelled</h1><p>No payment was captured and no download was unlocked.</p><p>${offer ? escapeHtml(offer.title) : 'The selected offer'} remains available on the <a href="/">storefront</a>.</p></main></body></html>`;
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    return sendJson(res, 200, { ok: true, paypal_api_ready: checkoutReady(), paypal_environment: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox' });
  }

  if (url.pathname === '/config.js') {
    return send(res, 200, configScript(), 'application/javascript; charset=utf-8');
  }

  if (url.pathname === '/api/paypal/create-order') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'method_not_allowed' });
    if (!sameOrigin(req)) return sendJson(res, 403, { error: 'origin_not_allowed' });
    if (!checkoutReady()) return sendJson(res, 503, { error: 'paypal_checkout_not_configured' });
    const body = await readJson(req);
    const offerSlug = String(body.offer_slug || '');
    const offer = paypal.OFFERS[offerSlug];
    if (!offer) return sendJson(res, 400, { error: 'invalid_offer' });
    const order = await paypal.createOrder(offerSlug);
    await fulfillment.recordCreated(order.orderId, offerSlug, offer.price);
    return sendJson(res, 201, { order_id: order.orderId, approve_url: order.approveUrl });
  }

  if (url.pathname === '/paypal/return') {
    if (!checkoutReady()) return sendJson(res, 503, { error: 'paypal_checkout_not_configured' });
    const offerSlug = url.searchParams.get('offer') || '';
    const offer = paypal.OFFERS[offerSlug];
    const orderId = url.searchParams.get('token') || '';
    if (!offer || !/^[A-Z0-9]{10,40}$/i.test(orderId)) return sendJson(res, 400, { error: 'invalid_return_parameters' });

    const existing = await fulfillment.getPayment(orderId);
    let fulfilled;
    if (existing?.status === 'COMPLETED' && existing.offer_slug === offerSlug) {
      fulfilled = await fulfillment.completePayment({ orderId, captureId: existing.paypal_capture_id, offerSlug, amount: offer.price, buyerEmail: existing.buyer_email, digital: offer.kind === 'digital' });
    } else {
      const paid = await paypal.captureOrder(orderId, offerSlug);
      const buyerEmail = paid.order.payment_source?.paypal?.email_address || paid.order.payer?.email_address || null;
      fulfilled = await fulfillment.completePayment({ orderId, captureId: paid.capture.id, offerSlug, amount: offer.price, buyerEmail, digital: offer.kind === 'digital' });
    }

    return send(res, 200, offer.kind === 'digital' ? completePage(offer, fulfilled.downloadUrl) : servicePage(offer, orderId), 'text/html; charset=utf-8');
  }

  if (url.pathname === '/paypal/cancel') {
    return send(res, 200, cancelPage(url.searchParams.get('offer') || ''), 'text/html; charset=utf-8');
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const target = path.normalize(path.join(ROOT, pathname));
  if (!target.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');
    const type = TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, ...headers('public, max-age=300') });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(error => {
    console.error('request failed', error.message);
    if (!res.headersSent) sendJson(res, 500, { error: 'internal_error' });
    else res.end();
  });
});

server.listen(PORT, '0.0.0.0', () => console.log(`Four Offer launch storefront listening on ${PORT}`));
