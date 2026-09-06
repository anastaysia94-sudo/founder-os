const path = require('path');
const crypto = require('crypto');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, migrate, getPipeline, mergePipeline, health } = require('./db');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const AUTH_SECRET = process.env.AUTH_SECRET;
const COOKIE = 'growth_os_session';
const ALLOWED_STAGES = new Set(['Contact Ready','Contacted','Replied','Negotiating','Won/Paid','Fulfilled','Follow-up','Lost/Not a Fit','Do Not Contact']);

if (!AUTH_SECRET || AUTH_SECRET.length < 32) {
  console.warn('AUTH_SECRET is missing or too short; authenticated routes will refuse to start securely.');
}

app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

function requireOrigin(req, res, next) {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();
  try {
    const originHost = new URL(origin).host;
    if (originHost !== req.get('host')) return res.status(403).json({ error: 'Cross-origin write blocked.' });
  } catch {
    return res.status(403).json({ error: 'Invalid origin.' });
  }
  next();
}
app.use('/api', requireOrigin);

function sign(user) {
  if (!AUTH_SECRET || AUTH_SECRET.length < 32) throw new Error('AUTH_SECRET_NOT_CONFIGURED');
  return jwt.sign({ sub: String(user.id), email: user.email, role: user.role }, AUTH_SECRET, { expiresIn: '14d', issuer: 'growth-pack-sales-os' });
}

function setSession(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

function auth(req, res, next) {
  try {
    if (!AUTH_SECRET || AUTH_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured.' });
    const token = req.cookies[COOKIE];
    if (!token) return res.status(401).json({ error: 'Authentication required.' });
    req.user = jwt.verify(token, AUTH_SECRET, { issuer: 'growth-pack-sales-os' });
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }
}

function cleanEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

app.get('/api/health', async (_req, res) => {
  try {
    const db = await health();
    res.json({ ok: true, app: 'same-day-customer-growth-pack', persistence: 'postgres', authenticated: true, databaseTime: db.now });
  } catch (error) {
    res.status(503).json({ ok: false, error: 'Database unavailable.' });
  }
});

app.get('/api/auth/status', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM app_users');
    res.json({ setupRequired: rows[0].count === 0 });
  } catch {
    res.status(503).json({ error: 'Database unavailable.' });
  }
});

app.post('/api/auth/setup', async (req, res) => {
  if (!AUTH_SECRET || AUTH_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured.' });
  const email = cleanEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (!email || password.length < 12) return res.status(400).json({ error: 'Use a valid email and a password of at least 12 characters.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('LOCK TABLE app_users IN EXCLUSIVE MODE');
    const count = await client.query('SELECT COUNT(*)::int AS count FROM app_users');
    if (count.rows[0].count !== 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Owner account already exists.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const created = await client.query('INSERT INTO app_users(email,password_hash,role,last_login_at) VALUES($1,$2,$3,NOW()) RETURNING id,email,role', [email,hash,'owner']);
    await client.query('COMMIT');
    setSession(res, sign(created.rows[0]));
    res.status(201).json({ user: created.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('setup failed', error.message);
    res.status(500).json({ error: 'Could not create owner account.' });
  } finally {
    client.release();
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!AUTH_SECRET || AUTH_SECRET.length < 32) return res.status(503).json({ error: 'Authentication is not configured.' });
  const email = cleanEmail(req.body?.email);
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const { rows } = await pool.query('SELECT id,email,role,password_hash FROM app_users WHERE email=$1', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password.' });
  await pool.query('UPDATE app_users SET last_login_at=NOW() WHERE id=$1', [user.id]);
  const safe = { id: user.id, email: user.email, role: user.role };
  setSession(res, sign(safe));
  res.json({ user: safe });
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE, { path: '/' });
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email, role: req.user.role } });
});

app.get('/api/pipeline', auth, async (_req, res) => {
  try {
    res.json({ pipeline: await getPipeline() });
  } catch (error) {
    console.error('pipeline read failed', error.message);
    res.status(503).json({ error: 'Could not read pipeline.' });
  }
});

app.put('/api/pipeline/:leadKey', auth, async (req, res) => {
  const leadKey = String(req.params.leadKey || '').trim().slice(0, 180);
  const business = String(req.body?.business || '').trim().slice(0, 240);
  const stage = String(req.body?.stage || '').trim();
  const notes = String(req.body?.notes || '').trim().slice(0, 5000);
  if (!leadKey || !business || !ALLOWED_STAGES.has(stage)) return res.status(400).json({ error: 'Invalid pipeline update.' });
  try {
    const row = await mergePipeline({ leadKey, business, stage, notes, userId: Number(req.user.sub) });
    res.json({ pipeline: row });
  } catch (error) {
    console.error('pipeline write failed', error.message);
    res.status(503).json({ error: 'Could not save pipeline update.' });
  }
});

app.get('/api/pipeline/:leadKey/audit', auth, async (req, res) => {
  const leadKey = String(req.params.leadKey || '').trim().slice(0, 180);
  const { rows } = await pool.query(`
    SELECT a.lead_key,a.business,a.from_stage,a.to_stage,a.notes_snapshot,a.changed_at,u.email AS changed_by
    FROM pipeline_audit a LEFT JOIN app_users u ON u.id=a.changed_by
    WHERE a.lead_key=$1 ORDER BY a.changed_at DESC LIMIT 100
  `, [leadKey]);
  res.json({ audit: rows });
});

app.use(express.static(__dirname, {
  etag: true,
  maxAge: process.env.NODE_ENV === 'production' ? '5m' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest') || filePath.includes(`${path.sep}data${path.sep}`)) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

async function start() {
  await migrate();
  app.listen(PORT, '0.0.0.0', () => console.log(`Growth Pack Sales OS listening on ${PORT}`));
}

start().catch(error => {
  console.error('Fatal startup error:', error);
  process.exit(1);
});
