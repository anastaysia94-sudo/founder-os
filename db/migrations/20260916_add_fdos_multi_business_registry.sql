create or replace function public.fdos_create_business(
  p_name text default 'Untitled business',
  p_stage text default 'Idea'
)
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
  v_name text := nullif(trim(coalesce(p_name, '')), '');
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if p_stage not in (
    'Idea', 'Exploring', 'Validating', 'Building', 'Pre-Launch', 'Launched',
    'Finding Traction', 'Growing', 'Systemizing', 'Scaling', 'Portfolio', 'Dynasty'
  ) then
    raise exception 'Invalid business stage';
  end if;

  insert into public.fdos_business_records (
    user_id,
    name,
    stage,
    purpose,
    problem,
    customer,
    offer,
    revenue_model,
    advantage,
    constraint_text,
    current_goal
  ) values (
    v_user,
    coalesce(v_name, 'Untitled business'),
    p_stage,
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'Reduce the biggest uncertainty first.'
  )
  returning id into v_business;

  insert into public.fdos_memory (
    user_id,
    business_id,
    kind,
    summary,
    evidence_class
  ) values (
    v_user,
    v_business,
    'Workspace created',
    'Founder Dynasty OS created this business record.',
    'E4'
  );

  return v_business;
end;
$$;

revoke all on function public.fdos_create_business(text, text) from public;
grant execute on function public.fdos_create_business(text, text) to authenticated;

create index if not exists fdos_business_records_user_created_idx
  on public.fdos_business_records (user_id, created_at);
