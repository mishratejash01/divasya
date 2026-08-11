-- ============================================================================
--  DIVASYA migration 018 — Live Darshan directory expansion
--  Five streaming temples join, every channel id verified during this build
--  against YouTube's own live pages (Khatu Shyam, ISKCON Vrindavan, Vrindavan
--  Chandrodaya and the Shirdi broadcaster were proven LIVE at verification
--  time; Shri Ganga Sabha Haridwar and the Shyam Mandir Committee channels
--  were identity-confirmed and stream at aarti hours). The runtime checker
--  remains the gate: nothing shows as Live until it proves itself again.
-- ============================================================================

insert into public.temples (id,name,deity,location,timing,about,tint,sort,deity_group) values
('shirdi','Shirdi Sai Baba','Sai Baba','Shirdi, MH','Kakad Aarti 4:30 AM',
 'The Samadhi Mandir of Sai Baba of Shirdi; darshan streams through the day.','#8A3B08',15,'other'),
('khatushyam','Khatu Shyam Ji','Khatu Shyam (Shri Krishna)','Khatu, Sikar, RJ','Aarti darshan through the day',
 'Barbarika''s shrine, where Shyam Baba hears the defeated first.','#153C6B',16,'vishnu'),
('iskcon-vrindavan','ISKCON Vrindavan','Sri Sri Krishna Balaram','Vrindavan, UP','Mangala Aarti 4:30 AM',
 'The Krishna Balaram Mandir; darshans, classes and kirtans stream live.','#275E79',17,'vishnu'),
('chandrodaya','Vrindavan Chandrodaya Mandir','Sri Sri Radha Krishna','Vrindavan, UP','Live darshan & aarti',
 'Live darshan from the Chandrodaya Mandir of Vrindavan.','#4A2472',18,'vishnu'),
('haridwar','Ganga Aarti · Har Ki Pauri','Maa Ganga','Haridwar, UK','Ganga Aarti at sunrise & sunset',
 'Shri Ganga Sabha''s aarti at Brahmakund, held since 1916.','#0F4F49',19,'ganga')
on conflict (id) do update set
  name=excluded.name, deity=excluded.deity, location=excluded.location, timing=excluded.timing,
  about=excluded.about, tint=excluded.tint, sort=excluded.sort, deity_group=excluded.deity_group;

insert into public.temple_streams (temple_id, yt_id, priority, label) values
('shirdi','UCstmnfIOcvO-6DONnfKhAPg',1,'Darshan broadcaster'),
('khatushyam','UCQHKI4hRBBk6BraL8VGV5fw',1,'Darshan stream'),
('khatushyam','UCT-3fEwrrxlwMrWgMvoqt-w',2,'Shri Shyam Mandir Committee'),
('iskcon-vrindavan','UCAA6IsLVfbHrP1I_lzxv09Q',1,'Official'),
('chandrodaya','UCFi2lv2x3yo8Ha2jciDzD2w',1,'Official'),
('haridwar','UCKi6NnIyqlz3jBqcCQJ4b0A',1,'Shri Ganga Sabha (Official)')
on conflict (temple_id, yt_id) do update set priority=excluded.priority, label=excluded.label;
