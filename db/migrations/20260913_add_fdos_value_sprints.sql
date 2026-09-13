create table if not exists public.fdos_value_sprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.fdos_business_records(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  hypothesis text not null default '',
  action text not null default '',
  measure text not null default '',
  baseline text not null default '',
  target text not null default '',
  result text not null default '',
  status text not null default 'Planned' check (status in ('Planned','Running','Measured','Keep','Revise','Revert')),
  decision text check (decision is null or decision in ('Keep','Revise','Revert')),
  evidence_class text not null default 'E4' check (evidence_class in ('E1','E2','E3','E4','E5','E6','E7','E8')),
  source_url text,
  evidence_id uuid references public.fdos_evidence(id) on delete set null,
  started_at timestamptz,
  measured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fdos_value_sprints_business_created_idx
  on public.fdos_value_sprints (business_id, created_at desc);
create index if not exists fdos_value_sprints_user_idx
  on public.fdos_value_sprints (user_id);
create index if not exists fdos_value_sprints_evidence_idx
  on public.fdos_value_sprints (evidence_id)
  where evidence_id is not null;

alter table public.fdos_value_sprints enable row level security;

drop policy if exists "fdos value sprints own rows" on public.fdos_value_sprints;
create policy "fdos value sprints own rows"
on public.fdos_value_sprints
for all
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.fdos_business_records br
    where br.id = fdos_value_sprints.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1
      from public.fdos_evidence e
      where e.id = fdos_value_sprints.evidence_id
        and e.business_id = fdos_value_sprints.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.fdos_business_records br
    where br.id = fdos_value_sprints.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1
      from public.fdos_evidence e
      where e.id = fdos_value_sprints.evidence_id
        and e.business_id = fdos_value_sprints.business_id
        and e.user_id = (select auth.uid())
    )
  )
);

grant select, insert, update, delete on public.fdos_value_sprints to authenticated;
