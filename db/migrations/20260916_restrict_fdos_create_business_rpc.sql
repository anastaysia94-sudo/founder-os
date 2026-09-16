revoke all on function public.fdos_create_business(text, text) from public;
revoke execute on function public.fdos_create_business(text, text) from anon;
grant execute on function public.fdos_create_business(text, text) to authenticated;
