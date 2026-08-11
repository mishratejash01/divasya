-- ============================================================================
--  DIVASYA migration 017 — Live Darshan stream health
--  A temple can carry several stream sources in priority order (official
--  channel first, trusted broadcasters after). The server-side checker writes
--  what it PROVED — the exact live video id, embeddability, when it looked —
--  and the app shows a temple as Live only from those proofs. A wrong id or a
--  dark channel can never render a broken player; it simply never lights up.
-- ============================================================================

create table if not exists public.temple_streams (
  id            uuid primary key default gen_random_uuid(),
  temple_id     text not null references public.temples(id) on delete cascade,
  yt_type       text not null default 'channel' check (yt_type in ('channel','video')),
  yt_id         text not null,
  label         text default 'Official',
  priority      int  not null default 1,
  -- health, written only by the server checker
  is_live       boolean not null default false,
  live_video_id text,
  embeddable    boolean,
  checked_at    timestamptz,
  created_at    timestamptz not null default now(),
  unique (temple_id, yt_id)
);
create index if not exists temple_streams_temple_idx on public.temple_streams (temple_id, priority);

alter table public.temple_streams enable row level security;
drop policy if exists "catalog read" on public.temple_streams;
create policy "catalog read" on public.temple_streams
  for select to authenticated using (public.is_email_allowed());
-- writes: service role only.

-- deity grouping for the searchable directory chips
alter table public.temples add column if not exists deity_group text default 'other';

update public.temples set deity_group = 'shiva'   where id in ('kashi','mahakal','somnath','kedarnath','rameshwaram');
update public.temples set deity_group = 'vishnu'  where id in ('tirupati','badrinath','jagannath','dwarka','iskcon-bangalore','ayodhya');
update public.temples set deity_group = 'devi'    where id in ('vaishno','shantikunj');
update public.temples set deity_group = 'ganesha' where id in ('siddhi');

-- existing verified channels become priority-1 sources
insert into public.temple_streams (temple_id, yt_id, priority, label)
select id, youtube_channel, 1, 'Official'
  from public.temples
 where youtube_channel is not null and youtube_channel <> ''
on conflict (temple_id, yt_id) do nothing;
