-- service_role bypasses RLS, but still needs ordinary Postgres table grants.
-- These appear to be missing, causing "permission denied for table sessions".
grant select, insert, update, delete on public.sessions to service_role;
grant select, insert, update, delete on public.registrations to service_role;
grant execute on function public.submit_registration(text, text, text, text, text, text, text, text[]) to service_role;
