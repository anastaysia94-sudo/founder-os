import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, timingSafeEqual } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const port = Number(process.env.PORT || 8080);
const LOG_API_KEY = process.env.LOG_API_KEY;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'content-type': type,
    'content-length': Buffer.byteLength(body),
    'cache-control': status === 200 ? 'public, max-age=300' : 'no-store',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
    'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  });
  res.end(body);
}

function tokenMatches(provided) {
  if (!LOG_API_KEY || typeof provided !== 'string') return false;
  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(LOG_API_KEY).digest();
  return timingSafeEqual(a, b);
}

async function readBody(req, limit = 64 * 1024) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const err = new Error('payload too large');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function handleLogs(req, res) {
  if (!tokenMatches(req.headers['x-api-key'])) {
    return send(res, 401, JSON.stringify({ error: 'unauthorized' }));
  }
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return send(res, 405, JSON.stringify({ error: 'method not allowed' }));
  }
  let raw;
  try {
    raw = await readBody(req);
  } catch (err) {
    return send(res, err.statusCode || 400, JSON.stringify({ error: err.message }));
  }
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return send(res, 400, JSON.stringify({ error: 'invalid json' }));
  }
  console.log(JSON.stringify({ ts: new Date().toISOString(), source: 'api/logs', payload }));
  return send(res, 202, JSON.stringify({ accepted: true }));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/api/logs') return handleLogs(req, res);

  if (url.pathname === '/health' || url.pathname === '/ready') {
    return send(res, 200, JSON.stringify({
      status: 'ok',
      service: 'smartpickshop-holdings-site',
      domain: 'smartpickshop.dev'
    }));
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const safePath = normalize(pathname).replace(/^([.][.][/\\])+/, '');
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root)) {
    return send(res, 403, JSON.stringify({ error: 'forbidden' }));
  }

  try {
    const data = await readFile(filePath);
    const extension = extname(filePath);
    return send(res, 200, data, mime[extension] || 'application/octet-stream');
  } catch {
    try {
      const fallback = await readFile(join(root, '404.html'));
      return send(res, 404, fallback, 'text/html; charset=utf-8');
    } catch {
      return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    }
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SmartPickShop Holdings site listening on :${port}`);
});
