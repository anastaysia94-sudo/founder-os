-- Founder Dynasty OS strategy and dynasty layer.
-- Every table remains attached to one authenticated user and one shared business record.

create table if not exists public.fdos_business_model_elements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  area text not null check (area in ('Problem','Customer','Value Proposition','Channel','Relationship','Revenue','Cost','Capability','Partner')),
  statement text not null,
  confidence smallint not null default 50 check (confidence between 0 and 100),
  status text not null default 'Hypothesis' check (status in ('Hypothesis','Testing','Supported','Rejected')),
  evidence_class text not null default 'E5',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_customer_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  kind text not null check (kind in ('Segment','Problem','Need','Trigger','Objection','Behavior','Language')),
  statement text not null,
  implication text not null default '',
  evidence_class text not null default 'E4',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_distribution_experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  channel text not null,
  audience text not null default '',
  message text not null default '',
  action text not null default '',
  measure text not null default '',
  result text not null default '',
  status text not null default 'Planned' check (status in ('Planned','Running','Measured','Keep','Revise','Stop')),
  evidence_class text not null default 'E5',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_business_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  kind text not null check (kind in ('Brand','IP','Data','Process','Relationship','Software','Content','License','Physical','Other')),
  name text not null,
  value_reason text not null default '',
  control text not null default '',
  transferability text not null default 'Medium' check (transferability in ('Low','Medium','High')),
  evidence_class text not null default 'E4',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  name text not null,
  premise text not null default '',
  upside text not null default '',
  downside text not null default '',
  early_signal text not null default '',
  decision_rule text not null default '',
  probability smallint not null default 50 check (probability between 0 and 100),
  status text not null default 'Open' check (status in ('Open','Watching','Resolved')),
  evidence_class text not null default 'E7',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_portfolio_theses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  name text not null,
  role text not null default 'Experiment' check (role in ('Core','Experiment','Growth','Cash Engine','Option','Exit Candidate')),
  thesis text not null default '',
  next_capital text not null default '',
  next_attention text not null default '',
  status text not null default 'Explore' check (status in ('Explore','Build','Hold','Harvest','Exit')),
  evidence_class text not null default 'E5',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_attention_blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  area text not null,
  outcome text not null default '',
  weekly_minutes integer not null default 60 check (weekly_minutes between 0 and 10080),
  status text not null default 'Planned' check (status in ('Planned','Active','Stopped')),
  evidence_class text not null default 'E4',
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fdos_business_model_elements_business_idx on public.fdos_business_model_elements(user_id,business_id,area,created_at desc);
create index if not exists fdos_customer_insights_business_idx on public.fdos_customer_insights(user_id,business_id,kind,created_at desc);
create index if not exists fdos_distribution_experiments_business_idx on public.fdos_distribution_experiments(user_id,business_id,status,created_at desc);
create index if not exists fdos_business_assets_business_idx on public.fdos_business_assets(user_id,business_id,kind,created_at desc);
create index if not exists fdos_scenarios_business_idx on public.fdos_scenarios(user_id,business_id,status,created_at desc);
create index if not exists fdos_portfolio_theses_business_idx on public.fdos_portfolio_theses(user_id,business_id,status,created_at desc);
create index if not exists fdos_attention_blocks_business_idx on public.fdos_attention_blocks(user_id,business_id,status,created_at desc);

alter table public.fdos_business_model_elements enable row level security;
alter table public.fdos_customer_insights enable row level security;
alter table public.fdos_distribution_experiments enable row level security;
alter table public.fdos_business_assets enable row level security;
alter table public.fdos_scenarios enable row level security;
alter table public.fdos_portfolio_theses enable row level security;
alter table public.fdos_attention_blocks enable row level security;

drop policy if exists "fdos business model elements own rows" on public.fdos_business_model_elements;
create policy "fdos business model elements own rows" on public.fdos_business_model_elements for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos customer insights own rows" on public.fdos_customer_insights;
create policy "fdos customer insights own rows" on public.fdos_customer_insights for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos distribution experiments own rows" on public.fdos_distribution_experiments;
create policy "fdos distribution experiments own rows" on public.fdos_distribution_experiments for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos business assets own rows" on public.fdos_business_assets;
create policy "fdos business assets own rows" on public.fdos_business_assets for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos scenarios own rows" on public.fdos_scenarios;
create policy "fdos scenarios own rows" on public.fdos_scenarios for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos portfolio theses own rows" on public.fdos_portfolio_theses;
create policy "fdos portfolio theses own rows" on public.fdos_portfolio_theses for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));

drop policy if exists "fdos attention blocks own rows" on public.fdos_attention_blocks;
create policy "fdos attention blocks own rows" on public.fdos_attention_blocks for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())) and (evidence_id is null or exists(select 1 from public.fdos_evidence e where e.id=evidence_id and e.business_id=business_id and e.user_id=(select auth.uid()))));
