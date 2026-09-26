CREATE TABLE IF NOT EXISTS four_offer_payments (
  paypal_order_id TEXT PRIMARY KEY,
  paypal_capture_id TEXT,
  offer_slug TEXT NOT NULL,
  amount REAL NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  buyer_email TEXT,
  delivery_token_hash TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS four_offer_download_tokens (
  token_hash TEXT PRIMARY KEY,
  offer_slug TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  max_downloads INTEGER NOT NULL DEFAULT 3,
  download_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS four_offer_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  session_id TEXT,
  referrer_host TEXT,
  offer_slug TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_four_offer_events_type_created ON four_offer_events(event_type, created_at);
