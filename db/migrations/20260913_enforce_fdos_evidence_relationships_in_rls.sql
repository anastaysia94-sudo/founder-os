alter policy "fdos values own rows" on public.fdos_value_items
to authenticated
using (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_value_items.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_value_items.evidence_id
        and e.business_id = fdos_value_items.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_value_items.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_value_items.evidence_id
        and e.business_id = fdos_value_items.business_id
        and e.user_id = (select auth.uid())
    )
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
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_decisions.evidence_id
        and e.business_id = fdos_decisions.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_decisions.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_decisions.evidence_id
        and e.business_id = fdos_decisions.business_id
        and e.user_id = (select auth.uid())
    )
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
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_risks.evidence_id
        and e.business_id = fdos_risks.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_risks.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_risks.evidence_id
        and e.business_id = fdos_risks.business_id
        and e.user_id = (select auth.uid())
    )
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
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_opportunities.evidence_id
        and e.business_id = fdos_opportunities.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_opportunities.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_opportunities.evidence_id
        and e.business_id = fdos_opportunities.business_id
        and e.user_id = (select auth.uid())
    )
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
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_memory.evidence_id
        and e.business_id = fdos_memory.business_id
        and e.user_id = (select auth.uid())
    )
  )
)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.fdos_business_records br
    where br.id = fdos_memory.business_id
      and br.user_id = (select auth.uid())
  )
  and (
    evidence_id is null
    or exists (
      select 1 from public.fdos_evidence e
      where e.id = fdos_memory.evidence_id
        and e.business_id = fdos_memory.business_id
        and e.user_id = (select auth.uid())
    )
  )
);
