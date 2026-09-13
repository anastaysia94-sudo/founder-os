revoke execute on function public.fdos_ensure_business() from anon;
revoke execute on function public.fdos_apply_evidence_proposal(uuid) from anon;
revoke execute on function public.fdos_store_website_evidence(uuid,text,text,text,jsonb,jsonb) from anon;

revoke all on function public.fdos_ensure_business() from public;
revoke all on function public.fdos_apply_evidence_proposal(uuid) from public;
revoke all on function public.fdos_store_website_evidence(uuid,text,text,text,jsonb,jsonb) from public;

grant execute on function public.fdos_ensure_business() to authenticated;
grant execute on function public.fdos_apply_evidence_proposal(uuid) to authenticated;
grant execute on function public.fdos_store_website_evidence(uuid,text,text,text,jsonb,jsonb) to authenticated;
