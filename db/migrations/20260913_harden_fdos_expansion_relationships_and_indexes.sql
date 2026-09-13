-- Harden the expanded Founder Dynasty OS tables after advisor review.
-- Goals:
-- 1. every business_id / evidence_id foreign key has a covering index;
-- 2. workbench Evidence links must belong to the same authenticated user and Business Record;
-- 3. preserve existing evidence semantics without changing any user data.

-- Build & Run Workbench foreign-key coverage.
create index if not exists fdos_financial_assumptions_business_fk_idx on public.fdos_financial_assumptions(business_id);
create index if not exists fdos_financial_assumptions_evidence_fk_idx on public.fdos_financial_assumptions(evidence_id) where evidence_id is not null;
create index if not exists fdos_offer_hypotheses_business_fk_idx on public.fdos_offer_hypotheses(business_id);
create index if not exists fdos_offer_hypotheses_evidence_fk_idx on public.fdos_offer_hypotheses(evidence_id) where evidence_id is not null;
create index if not exists fdos_initiatives_business_fk_idx on public.fdos_initiatives(business_id);
create index if not exists fdos_initiatives_evidence_fk_idx on public.fdos_initiatives(evidence_id) where evidence_id is not null;

-- Strategy / Dynasty foreign-key coverage.
create index if not exists fdos_business_model_elements_business_fk_idx on public.fdos_business_model_elements(business_id);
create index if not exists fdos_business_model_elements_evidence_fk_idx on public.fdos_business_model_elements(evidence_id) where evidence_id is not null;
create index if not exists fdos_customer_insights_business_fk_idx on public.fdos_customer_insights(business_id);
create index if not exists fdos_customer_insights_evidence_fk_idx on public.fdos_customer_insights(evidence_id) where evidence_id is not null;
create index if not exists fdos_distribution_experiments_business_fk_idx on public.fdos_distribution_experiments(business_id);
create index if not exists fdos_distribution_experiments_evidence_fk_idx on public.fdos_distribution_experiments(evidence_id) where evidence_id is not null;
create index if not exists fdos_business_assets_business_fk_idx on public.fdos_business_assets(business_id);
create index if not exists fdos_business_assets_evidence_fk_idx on public.fdos_business_assets(evidence_id) where evidence_id is not null;
create index if not exists fdos_scenarios_business_fk_idx on public.fdos_scenarios(business_id);
create index if not exists fdos_scenarios_evidence_fk_idx on public.fdos_scenarios(evidence_id) where evidence_id is not null;
create index if not exists fdos_portfolio_theses_business_fk_idx on public.fdos_portfolio_theses(business_id);
create index if not exists fdos_portfolio_theses_evidence_fk_idx on public.fdos_portfolio_theses(evidence_id) where evidence_id is not null;
create index if not exists fdos_attention_blocks_business_fk_idx on public.fdos_attention_blocks(business_id);
create index if not exists fdos_attention_blocks_evidence_fk_idx on public.fdos_attention_blocks(evidence_id) where evidence_id is not null;

-- Strengthen Build & Run Workbench relationship-aware RLS to match the rest of FDOS.
drop policy if exists "fdos financial assumptions own rows" on public.fdos_financial_assumptions;
create policy "fdos financial assumptions own rows" on public.fdos_financial_assumptions
for all to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_financial_assumptions.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_financial_assumptions.evidence_id
        and e.business_id = fdos_financial_assumptions.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_financial_assumptions.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_financial_assumptions.evidence_id
        and e.business_id = fdos_financial_assumptions.business_id
        and e.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "fdos offer hypotheses own rows" on public.fdos_offer_hypotheses;
create policy "fdos offer hypotheses own rows" on public.fdos_offer_hypotheses
for all to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_offer_hypotheses.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_offer_hypotheses.evidence_id
        and e.business_id = fdos_offer_hypotheses.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_offer_hypotheses.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_offer_hypotheses.evidence_id
        and e.business_id = fdos_offer_hypotheses.business_id
        and e.user_id = (select auth.uid())
    )
  )
);

drop policy if exists "fdos initiatives own rows" on public.fdos_initiatives;
create policy "fdos initiatives own rows" on public.fdos_initiatives
for all to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_initiatives.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_initiatives.evidence_id
        and e.business_id = fdos_initiatives.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records b
    where b.id = fdos_initiatives.business_id
      and b.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_initiatives.evidence_id
        and e.business_id = fdos_initiatives.business_id
        and e.user_id = (select auth.uid())
    )
  )
);
