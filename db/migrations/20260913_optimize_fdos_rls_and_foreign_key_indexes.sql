-- Founder Dynasty OS 10.0
-- Mirrors the production Supabase migration applied 2026-09-13.
-- Purpose: preserve owner isolation semantics while avoiding per-row auth.uid()
-- re-evaluation and add covering indexes for FDOS foreign keys.

create index if not exists fdos_business_records_user_idx on public.fdos_business_records(user_id);
create index if not exists fdos_value_items_user_idx on public.fdos_value_items(user_id);
create index if not exists fdos_decisions_user_idx on public.fdos_decisions(user_id);
create index if not exists fdos_risks_user_idx on public.fdos_risks(user_id);
create index if not exists fdos_opportunities_user_idx on public.fdos_opportunities(user_id);
create index if not exists fdos_memory_user_idx on public.fdos_memory(user_id);
create index if not exists fdos_evidence_user_idx on public.fdos_evidence(user_id);
create index if not exists fdos_evidence_proposals_business_fk_idx on public.fdos_evidence_proposals(business_id);
create index if not exists fdos_evidence_proposals_evidence_fk_idx on public.fdos_evidence_proposals(evidence_id);

alter policy "fdos business own rows" on public.fdos_business_records
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos values own rows" on public.fdos_value_items
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos decisions own rows" on public.fdos_decisions
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos risks own rows" on public.fdos_risks
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos opportunities own rows" on public.fdos_opportunities
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos memory own rows" on public.fdos_memory
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos evidence own rows" on public.fdos_evidence
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos evidence proposals select own" on public.fdos_evidence_proposals
  using ((select auth.uid()) = user_id);

alter policy "fdos evidence proposals insert own" on public.fdos_evidence_proposals
  with check ((select auth.uid()) = user_id);

alter policy "fdos evidence proposals update own" on public.fdos_evidence_proposals
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "fdos evidence proposals delete own" on public.fdos_evidence_proposals
  using ((select auth.uid()) = user_id);
