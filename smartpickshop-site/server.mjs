import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const port = Number(process.env.PORT || 8080);

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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

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
