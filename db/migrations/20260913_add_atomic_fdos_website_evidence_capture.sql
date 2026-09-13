create or replace function public.fdos_store_website_evidence(
  p_business_id uuid,
  p_source_url text,
  p_title text,
  p_summary text,
  p_raw jsonb,
  p_proposals jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_evidence_id uuid;
  v_captured_at timestamptz;
  v_proposals jsonb;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.fdos_business_records
    where id = p_business_id and user_id = v_user
  ) then
    raise exception 'Business record not found';
  end if;

  insert into public.fdos_evidence (
    user_id, business_id, evidence_class, source_type,
    source_url, title, summary, raw
  ) values (
    v_user, p_business_id, 'E2', 'website',
    p_source_url, p_title, coalesce(p_summary, ''), coalesce(p_raw, '{}'::jsonb)
  )
  returning id, captured_at into v_evidence_id, v_captured_at;

  with inserted as (
    insert into public.fdos_evidence_proposals (
      user_id, business_id, evidence_id, target_type, title, rationale, payload
    )
    select
      v_user,
      p_business_id,
      v_evidence_id,
      x.target_type,
      x.title,
      coalesce(x.rationale, ''),
      coalesce(x.payload, '{}'::jsonb)
    from jsonb_to_recordset(coalesce(p_proposals, '[]'::jsonb))
      as x(target_type text, title text, rationale text, payload jsonb)
    returning id, target_type, title, rationale, payload, status, created_at
  )
  select coalesce(jsonb_agg(to_jsonb(inserted)), '[]'::jsonb)
  into v_proposals
  from inserted;

  insert into public.fdos_memory (
    user_id, business_id, kind, summary, evidence_class, evidence_id, source_url
  ) values (
    v_user,
    p_business_id,
    'External evidence captured',
    'Captured website evidence and generated reviewable proposals; none were applied automatically.',
    'E2',
    v_evidence_id,
    p_source_url
  );

  return jsonb_build_object(
    'evidence', jsonb_build_object('id', v_evidence_id, 'captured_at', v_captured_at),
    'proposals', v_proposals
  );
end;
$$;

revoke all on function public.fdos_store_website_evidence(uuid,text,text,text,jsonb,jsonb) from public;
grant execute on function public.fdos_store_website_evidence(uuid,text,text,text,jsonb,jsonb) to authenticated;
