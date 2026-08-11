-- ============================================================================
--  DIVASYA migration 015 — verified Live Darshan channels into the DB
--  The verified-stream list belongs on the temple rows, not in code: the
--  screens show a temple under "Live Darshan" only when its row carries a
--  channel. Mahakaleshwar's official channel was verified and two streaming
--  temples join the directory. Verifying a new temple = setting one column.
-- ============================================================================

update public.temples
   set youtube_channel = 'UC7hmH7rEu5HPA8iDT7zkEow'
 where id = 'mahakal' and (youtube_channel is null or youtube_channel = '');

insert into public.temples (id,name,deity,location,timing,about,youtube_channel,tint,sort) values
('shantikunj','Gayatri Teerth Shantikunj','Maa Gayatri','Haridwar, UK','24-hour live darshan',
 'Gayatri Teerth Shantikunj''s official live darshan and spiritual programmes.',
 'UCjzJrnsM3Ar0DMmJhpNMiaw','#9D4C14',13),
('iskcon-bangalore','ISKCON Bangalore','Sri Sri Radha Krishnachandra','Bengaluru, KA','Live darshan & kirtans',
 'Live darshan from ISKCON Bangalore''s Vaikuntha Hill temple.',
 'UCPXnayBvF7ynbG_I3VOTgIg','#275E79',14)
on conflict (id) do update set
  youtube_channel=excluded.youtube_channel, timing=excluded.timing,
  about=excluded.about, tint=excluded.tint, sort=excluded.sort;
