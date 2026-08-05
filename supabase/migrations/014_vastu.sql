-- ============================================================================
--  DIVASYA migration 014 — Vastu: saved homes, rooms, and Lens snapshots
--  A property is a home/office the user maps once and keeps; each room is a
--  (type, zone) pair the engine judges on device — verdicts and scores are
--  computed, never stored, so a better engine instantly re-grades every
--  saved home. rooms carry `fixed` for the remedy checklist. Snapshots are
--  frozen Lens readings (zone + what stands there) from walking the house.
--  All rows are user-owned; plain client CRUD under RLS, like addresses.
-- ============================================================================

create table if not exists public.vastu_properties (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My home',
  kind       text not null default 'home' check (kind in ('home','office','shop')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vastu_rooms (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.vastu_properties(id) on delete cascade,
  room_type   text not null,
  zone        int  not null check (zone between 0 and 15),
  fixed       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists vastu_rooms_property_idx on public.vastu_rooms (property_id);

create table if not exists public.vastu_snapshots (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  zone       int  not null check (zone between 0 and 15),
  heading    numeric,
  room_type  text,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists vastu_snapshots_user_idx on public.vastu_snapshots (user_id, created_at desc);

do $pol$
declare t text;
begin
  foreach t in array array['vastu_properties','vastu_rooms','vastu_snapshots']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end
$pol$;
