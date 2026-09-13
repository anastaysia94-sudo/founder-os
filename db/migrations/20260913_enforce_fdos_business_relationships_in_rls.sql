alter policy "fdos values own rows" on public.fdos_value_items
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_value_items.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_value_items.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos decisions own rows" on public.fdos_decisions
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_decisions.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_decisions.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos risks own rows" on public.fdos_risks
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_risks.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_risks.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos opportunities own rows" on public.fdos_opportunities
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_opportunities.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_opportunities.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos memory own rows" on public.fdos_memory
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_memory.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_memory.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos evidence own rows" on public.fdos_evidence
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence.business_id
      and br.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence.business_id
      and br.user_id = (select auth.uid())
  )
);

alter policy "fdos evidence proposals select own" on public.fdos_evidence_proposals
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence_proposals.business_id
      and br.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.fdos_evidence e
    where e.id = fdos_evidence_proposals.evidence_id
      and e.business_id = fdos_evidence_proposals.business_id
      and e.user_id = (select auth.uid())
  )
);

alter policy "fdos evidence proposals insert own" on public.fdos_evidence_proposals
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence_proposals.business_id
      and br.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.fdos_evidence e
    where e.id = fdos_evidence_proposals.evidence_id
      and e.business_id = fdos_evidence_proposals.business_id
      and e.user_id = (select auth.uid())
  )
);

alter policy "fdos evidence proposals update own" on public.fdos_evidence_proposals
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence_proposals.business_id
      and br.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.fdos_evidence e
    where e.id = fdos_evidence_proposals.evidence_id
      and e.business_id = fdos_evidence_proposals.business_id
      and e.user_id = (select auth.uid())
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence_proposals.business_id
      and br.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.fdos_evidence e
    where e.id = fdos_evidence_proposals.evidence_id
      and e.business_id = fdos_evidence_proposals.business_id
      and e.user_id = (select auth.uid())
  )
);

alter policy "fdos evidence proposals delete own" on public.fdos_evidence_proposals
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_evidence_proposals.business_id
      and br.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.fdos_evidence e
    where e.id = fdos_evidence_proposals.evidence_id
      and e.business_id = fdos_evidence_proposals.business_id
      and e.user_id = (select auth.uid())
  )
);
