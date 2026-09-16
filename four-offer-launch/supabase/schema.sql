-- Four Offer Launch backend schema
-- Reconstructs the private analytics, download vault, token, and PayPal ledger tables.
-- Buyer ZIP bytes are intentionally NOT stored in Git. Load them separately through a trusted
-- server-side process, verify SHA-256, and never expose these tables directly to browser roles.

create table if not exists public.four_offer_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('visitor','page_view','checkout_click','download_click','intake_click')),
  path text not null default '/',
  session_id uuid,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  offer_slug text
);

alter table public.four_offer_events add column if not exists utm_content text;
alter table public.four_offer_events
  drop constraint if exists four_offer_events_utm_content_length_check,
  add constraint four_offer_events_utm_content_length_check
    check (utm_content is null or char_length(utm_content) <= 120);

create table if not exists public.four_offer_downloads (
  offer_slug text primary key,
  title text not null,
  filename text not null check (char_length(filename) between 1 and 180),
  mime_type text not null default 'application/zip',
  file_bytes bytea not null,
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  size_bytes integer not null check (size_bytes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.four_offer_download_tokens (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  offer_slug text not null references public.four_offer_downloads(offer_slug),
  payment_reference text,
  expires_at timestamptz not null,
  max_downloads integer not null default 3 check (max_downloads between 1 and 20),
  download_count integer not null default 0 check (download_count >= 0),
  created_at timestamptz not null default now(),
  last_downloaded_at timestamptz,
  constraint four_offer_download_tokens_expiry_check check (expires_at > created_at)
);

create table if not exists public.four_offer_payments (
  paypal_order_id text primary key,
  paypal_capture_id text unique,
  offer_slug text not null check (offer_slug in ('cashh-starter','cashh-expanded','remote-career-diy','ai-project-handoff','lnc-expanded')),
  amount numeric not null check (amount > 0),
  currency_code text not null default 'USD' check (currency_code = 'USD'),
  status text not null check (status in ('CREATED','APPROVED','COMPLETED','VOIDED','REFUNDED','FAILED')),
  buyer_email text,
  delivery_token_hash text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists four_offer_events_occurred_at_idx
  on public.four_offer_events (occurred_at desc);
create index if not exists four_offer_events_event_type_idx
  on public.four_offer_events (event_type);
create index if not exists four_offer_events_offer_slug_idx
  on public.four_offer_events (offer_slug);
create unique index if not exists four_offer_events_unique_visitor_session
  on public.four_offer_events (session_id)
  where event_type = 'visitor' and session_id is not null;

create index if not exists four_offer_download_tokens_expires_at_idx
  on public.four_offer_download_tokens (expires_at);
create index if not exists four_offer_download_tokens_offer_slug_idx
  on public.four_offer_download_tokens (offer_slug);
create index if not exists four_offer_payments_offer_idx
  on public.four_offer_payments (offer_slug);
create index if not exists four_offer_payments_capture_idx
  on public.four_offer_payments (paypal_capture_id);

alter table public.four_offer_events enable row level security;
alter table public.four_offer_downloads enable row level security;
alter table public.four_offer_download_tokens enable row level security;
alter table public.four_offer_payments enable row level security;

-- These tables are backend-only. There are deliberately no anon/authenticated RLS policies.
revoke all on table public.four_offer_events from anon, authenticated;
revoke all on table public.four_offer_downloads from anon, authenticated;
revoke all on table public.four_offer_download_tokens from anon, authenticated;
revoke all on table public.four_offer_payments from anon, authenticated;
