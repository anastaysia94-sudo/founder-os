create or replace function public.fdos_ensure_business()
returns uuid
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_business uuid;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('fdos_business:' || v_user::text, 0));

  select id
    into v_business
    from public.fdos_business_records
   where user_id = v_user
   order by created_at asc
   limit 1;

  if v_business is not null then
    return v_business;
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
    'Untitled business',
    'Idea',
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

revoke all on function public.fdos_ensure_business() from public;
grant execute on function public.fdos_ensure_business() to authenticated;
