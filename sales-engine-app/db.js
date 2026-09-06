const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not set; persistent API routes will fail until a database is configured.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 8,
  idleTimeoutMillis: 30000,
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'owner',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS pipeline_state (
      lead_key TEXT PRIMARY KEY,
      business TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Contact Ready',
      notes TEXT NOT NULL DEFAULT '',
      contacted_at TIMESTAMPTZ,
      replied_at TIMESTAMPTZ,
      paid_at TIMESTAMPTZ,
      fulfilled_at TIMESTAMPTZ,
      do_not_contact_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by BIGINT REFERENCES app_users(id)
    );

    CREATE TABLE IF NOT EXISTS pipeline_audit (
      id BIGSERIAL PRIMARY KEY,
      lead_key TEXT NOT NULL,
      business TEXT NOT NULL,
      from_stage TEXT,
      to_stage TEXT NOT NULL,
      notes_snapshot TEXT NOT NULL DEFAULT '',
      changed_by BIGINT REFERENCES app_users(id),
      changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS pipeline_audit_lead_idx ON pipeline_audit (lead_key, changed_at DESC);
  `);
}

function milestoneColumns(stage) {
  return {
    contacted: ['Contacted','Replied','Negotiating','Won/Paid','Fulfilled','Follow-up'].includes(stage),
    replied: ['Replied','Negotiating','Won/Paid','Fulfilled','Follow-up'].includes(stage),
    paid: ['Won/Paid','Fulfilled','Follow-up'].includes(stage),
    fulfilled: ['Fulfilled','Follow-up'].includes(stage),
    dnc: stage === 'Do Not Contact',
  };
}

async function getPipeline() {
  const { rows } = await pool.query('SELECT * FROM pipeline_state ORDER BY updated_at DESC');
  return rows;
}

async function mergePipeline({ leadKey, business, stage, notes = '', userId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const existingResult = await client.query('SELECT * FROM pipeline_state WHERE lead_key=$1 FOR UPDATE', [leadKey]);
    const existing = existingResult.rows[0] || null;
    const m = milestoneColumns(stage);
    const now = new Date();

    const contactedAt = existing?.contacted_at || (m.contacted ? now : null);
    const repliedAt = existing?.replied_at || (m.replied ? now : null);
    const paidAt = existing?.paid_at || (m.paid ? now : null);
    const fulfilledAt = existing?.fulfilled_at || (m.fulfilled ? now : null);
    const dncAt = existing?.do_not_contact_at || (m.dnc ? now : null);

    const { rows } = await client.query(`
      INSERT INTO pipeline_state (
        lead_key,business,stage,notes,contacted_at,replied_at,paid_at,fulfilled_at,do_not_contact_at,updated_at,updated_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),$10)
      ON CONFLICT (lead_key) DO UPDATE SET
        business=EXCLUDED.business,
        stage=EXCLUDED.stage,
        notes=EXCLUDED.notes,
        contacted_at=COALESCE(pipeline_state.contacted_at, EXCLUDED.contacted_at),
        replied_at=COALESCE(pipeline_state.replied_at, EXCLUDED.replied_at),
        paid_at=COALESCE(pipeline_state.paid_at, EXCLUDED.paid_at),
        fulfilled_at=COALESCE(pipeline_state.fulfilled_at, EXCLUDED.fulfilled_at),
        do_not_contact_at=COALESCE(pipeline_state.do_not_contact_at, EXCLUDED.do_not_contact_at),
        updated_at=NOW(),
        updated_by=EXCLUDED.updated_by
      RETURNING *
    `, [leadKey,business,stage,notes,contactedAt,repliedAt,paidAt,fulfilledAt,dncAt,userId]);

    await client.query(`
      INSERT INTO pipeline_audit (lead_key,business,from_stage,to_stage,notes_snapshot,changed_by)
      VALUES ($1,$2,$3,$4,$5,$6)
    `, [leadKey,business,existing?.stage || null,stage,notes,userId]);

    await client.query('COMMIT');
    return rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function health() {
  const { rows } = await pool.query('SELECT NOW() AS now');
  return rows[0];
}

module.exports = { pool, migrate, getPipeline, mergePipeline, health };
