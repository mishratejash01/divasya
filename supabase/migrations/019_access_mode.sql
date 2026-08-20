-- ============================================================================
--  DIVASYA migration 019 — switchable access mode
--  app_settings.access_mode decides who may enter: 'open' admits any signed-in
--  Google account, 'invite' restricts to the allowed_users table. The switch
--  lives inside is_email_allowed() itself — the single function every catalog
--  RLS policy and the login gate already call — so flipping one row changes
--  the whole app at once, no deploy.
--
--  Flip it any time:
--    update app_settings set value = '"invite"' where key = 'access_mode';
--    update app_settings set value = '"open"'   where key = 'access_mode';
-- ============================================================================

create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
drop policy if exists "settings read" on public.app_settings;
create policy "settings read" on public.app_settings
  for select to authenticated using (true);
-- writes: service role only.

-- launching on the Play Store: open to every signed-in user
insert into public.app_settings (key, value) values ('access_mode', '"open"'::jsonb)
on conflict (key) do nothing;

create or replace function public.is_email_allowed()
returns boolean
language sql stable security definer
set search_path to 'public'
as $function$
  select case
    when coalesce(
           (select value #>> '{}' from public.app_settings where key = 'access_mode'),
           'invite'
         ) = 'open'
      then auth.uid() is not null
    else exists(
      select 1 from public.allowed_users a
      where lower(a.email) = lower(nullif(auth.jwt() ->> 'email',''))
    )
  end;
$function$;
