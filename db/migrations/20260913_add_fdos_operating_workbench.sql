-- Founder Dynasty OS operating workbench schema.

create table if not exists public.fdos_financial_assumptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  title text not null,
  kind text not null check (kind in ('Revenue','Cost','Price','Margin','Cash','Funding','Other')),
  value_text text not null default '',
  confidence smallint not null default 50 check (confidence between 0 and 100),
  evidence_class text not null default 'E6',
  source_url text,
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_offer_hypotheses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  name text not null,
  customer text not null default '',
  problem text not null default '',
  promise text not null default '',
  delivery text not null default '',
  price_text text not null default '',
  status text not null default 'Draft' check (status in ('Draft','Testing','Active','Retired')),
  evidence_class text not null default 'E5',
  source_url text,
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fdos_initiatives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  title text not null,
  outcome text not null default '',
  status text not null default 'Planned' check (status in ('Planned','Active','Blocked','Done')),
  priority smallint not null default 3 check (priority between 1 and 5),
  owner_text text not null default '',
  due_date date,
  evidence_class text not null default 'E4',
  source_url text,
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fdos_financial_assumptions_business_idx on public.fdos_financial_assumptions(user_id,business_id,created_at desc);
create index if not exists fdos_offer_hypotheses_business_idx on public.fdos_offer_hypotheses(user_id,business_id,created_at desc);
create index if not exists fdos_initiatives_business_idx on public.fdos_initiatives(user_id,business_id,status,priority,created_at desc);

alter table public.fdos_financial_assumptions enable row level security;
alter table public.fdos_offer_hypotheses enable row level security;
alter table public.fdos_initiatives enable row level security;

create policy "fdos financial assumptions own rows" on public.fdos_financial_assumptions
for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())));

create policy "fdos offer hypotheses own rows" on public.fdos_offer_hypotheses
for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())));

create policy "fdos initiatives own rows" on public.fdos_initiatives
for all to authenticated
using ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())))
with check ((select auth.uid())=user_id and exists(select 1 from public.fdos_business_records b where b.id=business_id and b.user_id=(select auth.uid())));
