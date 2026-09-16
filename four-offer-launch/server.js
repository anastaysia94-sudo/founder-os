const http = require('http');
const fs = require('fs');
const path = require('path');

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

const CSP = "default-src 'self'; connect-src 'self' https://nqcshihyfhthywpseilx.supabase.co; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://www.paypal.com https://paypal.com;";

function send(res, status, body, type = 'text/plain; charset=utf-8', cache = 'no-store') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': cache,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP
  });
  res.end(body);
}

function runtimeConfig() {
  return {
    sellerEmail: 'anastaysia98@gmail.com',
    analyticsUrl: ANALYTICS_URL,
    deliveryUrl: DELIVERY_URL,
    paypalLinks: {
      'cashh-starter': process.env.PAYPAL_CASHH_STARTER || '',
      'cashh-expanded': process.env.PAYPAL_CASHH_EXPANDED || '',
      'remote-career-diy': process.env.PAYPAL_REMOTE_CAREER_DIY || '',
      'ai-project-handoff': process.env.PAYPAL_AI_HANDOFF || '',
      'lnc-expanded': process.env.PAYPAL_LNC_EXPANDED || ''
    }
  };
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    return send(res, 200, JSON.stringify({ ok: true }), 'application/json; charset=utf-8');
  }

  if (url.pathname === '/config.js') {
    const body = `window.FOUR_OFFER_CONFIG=${JSON.stringify(runtimeConfig())};`;
    return send(res, 200, body, 'application/javascript; charset=utf-8');
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const target = path.normalize(path.join(ROOT, pathname));
  if (!target.startsWith(ROOT)) return send(res, 403, 'Forbidden');

  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) return send(res, 404, 'Not found');
    const type = TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': CSP
    });
    fs.createReadStream(target).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Four Offer launch storefront listening on ${PORT}`);
});
