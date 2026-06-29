-- Adds a small settings table for the hero image, plus a public storage bucket
-- to hold the actual uploaded file. Uploads only ever happen through the
-- admin-only Netlify function (service_role), never directly from the browser.

create table if not exists site_settings (
  key text primary key,
  value text
);

alter table site_settings enable row level security;
create policy "public read site_settings" on site_settings for select using (true);

grant select, insert, update on public.site_settings to service_role;

insert into storage.buckets (id, name, public)
values ('conference-images', 'conference-images', true)
on conflict (id) do nothing;
