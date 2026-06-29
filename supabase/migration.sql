-- Run this in the Supabase SQL editor, in addition to the tables you already created.

-- 1. Lock down registrations from public access entirely (service role bypasses RLS automatically)
alter table registrations enable row level security;

-- 2. Allow public read-only access to sessions (needed for the homepage to list sessions/capacity)
alter table sessions enable row level security;
create policy "public read sessions" on sessions for select using (true);

-- 3. Atomic, capacity-safe registration function.
-- Locks the relevant session rows, re-checks capacity, inserts the registration,
-- and increments registration counts -- all inside one transaction so concurrent
-- submissions can never oversell a session.
create or replace function submit_registration(
  p_id text,
  p_name text,
  p_email text,
  p_company text,
  p_job_title text,
  p_dietary text,
  p_notes text,
  p_session_ids text[]
) returns void as $$
declare
  sid text;
  v_capacity int;
  v_registrations int;
begin
  perform 1 from sessions where id = any(p_session_ids) for update;

  foreach sid in array p_session_ids loop
    select capacity, registrations into v_capacity, v_registrations
    from sessions where id = sid;

    if v_capacity is null then
      raise exception 'SESSION_NOT_FOUND:%', sid;
    end if;

    if v_registrations >= v_capacity then
      raise exception 'SESSION_FULL:%', sid;
    end if;
  end loop;

  insert into registrations (id, name, email, company, job_title, dietary, notes, sessions, status)
  values (p_id, p_name, p_email, p_company, p_job_title, p_dietary, p_notes, p_session_ids, 'pending');

  update sessions set registrations = registrations + 1
  where id = any(p_session_ids);
end;
$$ language plpgsql security definer;
