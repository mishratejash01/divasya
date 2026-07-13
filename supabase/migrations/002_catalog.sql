-- ============================================================================
--  DIVASYA migration 002 — full catalog backend
--  Every piece of app content moves into Postgres: deities, mantras,
--  astrologers, temples, pujas, chadhava, festivals, library, shlokas,
--  vastu, naamkaran, horoscope cache. RLS on everything; reads restricted
--  to allow-listed users; writes only via service role.
-- ============================================================================

create table if not exists public.deities (
  id text primary key, name text not null, deva text, tagline text, persona text,
  color text, suggested_mantra_id text, aarti text, sort int default 0
);
create table if not exists public.mantras (
  id text primary key, name text not null, deva text, translit text, deity text,
  default_target int default 108, sort int default 0
);
create table if not exists public.astrologers (
  id text primary key, name text not null, specialty text, tags text[] default '{}',
  exp int, rating numeric, orders_label text, langs text, rate int,
  status text default 'online', wait_label text default 'Free', tint text, sort int default 0
);
create table if not exists public.temples (
  id text primary key, name text not null, deity text, location text, timing text,
  about text, youtube_id text, tint text, sort int default 0
);
create table if not exists public.pujas (
  id text primary key, name text not null, benefit text, price int, sort int default 0
);
create table if not exists public.chadhava_items (
  id text primary key, name text not null, price int, icon text, sort int default 0
);
create table if not exists public.festivals (
  id text primary key, name text not null, date date not null, deva text, about text,
  muhurat text, samagri jsonb default '[]', vidhi jsonb default '[]', icon text default 'flower'
);
create table if not exists public.library_articles (
  id text primary key, title text not null, sub text, read_time text, kind text default 'read',
  content text, tint text, sort int default 0
);
create table if not exists public.shlokas (
  id int primary key, deva text not null, translit text, meaning text, source text, deity text
);
create table if not exists public.vastu_zones (
  dir text primary key, zone text, use_for text, tip text, sort int default 0
);
create table if not exists public.nakshatra_syllables (
  name text primary key, syllables text[] not null, deity text, planet text, sort int default 0
);
create table if not exists public.baby_names (
  name text primary key, gender text not null, meaning text, syllable text not null
);
create table if not exists public.daily_horoscopes (
  date_key date not null, rashi text not null, content text not null,
  created_at timestamptz default now(), primary key (date_key, rashi)
);

do $pol$
declare t text;
begin
  foreach t in array array['deities','mantras','astrologers','temples','pujas','chadhava_items',
    'festivals','library_articles','shlokas','vastu_zones','nakshatra_syllables','baby_names','daily_horoscopes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "catalog read" on public.%I', t);
    execute format('create policy "catalog read" on public.%I for select to authenticated using (public.is_email_allowed())', t);
  end loop;
end
$pol$;

-- ---------------------------------------------------------------- deities
insert into public.deities (id,name,deva,tagline,persona,color,suggested_mantra_id,aarti,sort) values
('krishna','Shri Krishna','श्री कृष्ण','The playful guide of the Gita',$s$You are Bhagwan Shri Krishna speaking warmly and playfully to your devotee, in the spirit of the Bhagavad Gita. You are wise, loving, a little mischievous (makhan-chor charm), and you reassure through the timeless teaching of nishkaam karma. You address the devotee affectionately (e.g. 'vatsa', 'mere priya'). Keep it tender and uplifting.$s$,'#5e7c93','harekrishna','Aarti Kunj Bihari Ki',1),
('shiva','Mahadev','महादेव','The calm of the eternal',$s$You are Bhagwan Shiva — calm, profound, detached yet infinitely compassionate. You speak in few, deep words about stillness, acceptance, and dissolving the ego. You are the Mahayogi. Guidance feels like cool moonlight and the silence of Kailash.$s$,'#7d728f','shiva','Om Jai Shiv Omkara',2),
('hanuman','Hanuman Ji','हनुमान','Courage, strength, devotion',$s$You are Hanuman Ji — the embodiment of courage, strength, selfless seva and unshakeable devotion to Ram. You speak with protective, energising, fearless warmth, banishing fear and doubt. You remind the devotee of their own hidden strength.$s$,'#b07a4e','hanuman','Aarti Kije Hanuman Lala Ki',3),
('durga','Maa Durga','माँ दुर्गा','The fierce protective mother',$s$You are Maa Durga — the divine mother: fierce protector and infinitely tender. You speak with the strength of Shakti and the love of a mother, shielding your child from harm and empowering them.$s$,'#a45e6b','durga','Jai Ambe Gauri',4),
('ganesha','Ganpati Bappa','गणपति','Remover of obstacles',$s$You are Ganpati Bappa — the beloved remover of obstacles (Vighnaharta), bringer of buddhi, riddhi and siddhi. You are jolly, affectionate, encouraging, and you clear the path before every new beginning. Morya!$s$,'#b8954f','ganesha','Sukhkarta Dukhharta',5),
('lakshmi','Maa Lakshmi','माँ लक्ष्मी','Abundance and grace',$s$You are Maa Lakshmi — goddess of abundance, prosperity, grace and auspiciousness. You speak gently of gratitude, cleanliness of heart and home, and the flow of true wealth — dignity and contentment, not only money.$s$,'#c2a868','lakshmi','Om Jai Lakshmi Mata',6)
on conflict (id) do update set name=excluded.name, deva=excluded.deva, tagline=excluded.tagline,
  persona=excluded.persona, color=excluded.color, suggested_mantra_id=excluded.suggested_mantra_id, aarti=excluded.aarti, sort=excluded.sort;

-- ---------------------------------------------------------------- mantras
insert into public.mantras (id,name,deva,translit,deity,default_target,sort) values
('harekrishna','Hare Krishna Maha Mantra','हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे','Hare Krishna Hare Krishna, Krishna Krishna Hare Hare','Krishna',108,1),
('gayatri','Gayatri Mantra','ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं','Om bhur bhuvah svah, tat savitur varenyam…','Surya',108,2),
('shiva','Shiv Mantra','ॐ नमः शिवाय','Om Namah Shivaya','Shiva',108,3),
('mahamrityunjaya','Mahamrityunjaya Mantra','ॐ त्र्यम्बकं यजामहे','Om Tryambakam Yajamahe…','Shiva',108,4),
('hanuman','Hanuman Mantra','ॐ हं हनुमते नमः','Om Han Hanumate Namah','Hanuman',108,5),
('ganesha','Ganesh Mantra','ॐ गं गणपतये नमः','Om Gan Ganpataye Namah','Ganesha',108,6),
('durga','Durga Mantra','ॐ दुं दुर्गायै नमः','Om Dum Durgayai Namah','Durga',108,7),
('lakshmi','Lakshmi Mantra','ॐ श्रीं महालक्ष्म्यै नमः','Om Shreem Mahalakshmyai Namah','Lakshmi',108,8)
on conflict (id) do update set name=excluded.name, deva=excluded.deva, translit=excluded.translit, deity=excluded.deity;

-- ---------------------------------------------------------------- astrologers
insert into public.astrologers (id,name,specialty,tags,exp,rating,orders_label,langs,rate,status,wait_label,tint,sort) values
('a1','Acharya Vinod Shastri','Vedic • Marriage • Career','{Vedic,Marriage}',18,4.9,'94k','Hindi, English',22,'online','Free','#C88131',1),
('a2','Jyotishi Meera Joshi','Love • Relationship • Tarot','{Tarot,Love}',12,4.8,'61k','Hindi, Marathi',18,'online','Free','#A45E6B',2),
('a3','Pandit Rajesh Tripathi','Kundli • Remedies • Vastu','{Vastu,Kundli}',25,4.9,'1.2L','Hindi, English',35,'busy','~6 min','#7D728F',3),
('a4','Dr. Ananya Iyer','Numerology • Career','{Numerology}',9,4.7,'33k','English, Tamil',15,'online','Free','#5F8657',4),
('a5','Acharya Suresh Nath','Prashna • Muhurat • Vedic','{Prashna,Vedic}',30,5.0,'1.5L','Hindi, Sanskrit',45,'online','Free','#9C8544',5),
('a6','Jyotishi Kavita Rao','Love • Family • Tarot','{Tarot,Family}',7,4.6,'21k','Hindi, Kannada',12,'online','Free','#5E7C93',6),
('a7','Pandit Devdutt Mishra','KP System • Finance','{KP,Finance}',16,4.8,'72k','Hindi, English',28,'busy','~10 min','#B07A4E',7),
('a8','Guru Maa Saraswati','Spiritual • Remedies','{Spiritual}',22,4.9,'88k','Hindi, Bengali',30,'online','Free','#8F7E9E',8),
('a9','Acharya Hari Om','Vedic • Health • Career','{Vedic,Health}',14,4.7,'47k','Hindi, English',20,'online','Free','#CF924A',9)
on conflict (id) do update set name=excluded.name, specialty=excluded.specialty, tags=excluded.tags,
  exp=excluded.exp, rating=excluded.rating, orders_label=excluded.orders_label, langs=excluded.langs,
  rate=excluded.rate, status=excluded.status, wait_label=excluded.wait_label, tint=excluded.tint, sort=excluded.sort;

-- ---------------------------------------------------------------- temples
insert into public.temples (id,name,deity,location,timing,about,tint,sort) values
('kashi','Kashi Vishwanath','Lord Shiva','Varanasi, UP','Mangala Aarti 3:00 AM','One of the twelve Jyotirlingas, on the banks of the Ganga.','#7D728F',1),
('mahakal','Mahakaleshwar','Lord Shiva','Ujjain, MP','Bhasma Aarti 4:00 AM','The only south-facing Jyotirlinga; famous for the Bhasma Aarti.','#B07A4E',2),
('tirupati','Tirupati Balaji','Lord Venkateswara','Tirumala, AP','Suprabhatam 3:00 AM','The most-visited temple in the world.','#9C8544',3),
('siddhi','Siddhivinayak','Lord Ganesha','Mumbai, MH','Kakad Aarti 5:30 AM','Mumbai''s most beloved Ganpati temple.','#CF924A',4),
('vaishno','Vaishno Devi','Maa Vaishnavi','Katra, J&K','Aarti 6:00 AM & 7:00 PM','The holy cave shrine of the Divine Mother.','#A45E6B',5),
('somnath','Somnath','Lord Shiva','Prabhas Patan, GJ','Aarti 7:00 AM','The first among the twelve Jyotirlingas.','#5E7C93',6)
on conflict (id) do update set name=excluded.name, deity=excluded.deity, location=excluded.location,
  timing=excluded.timing, about=excluded.about, tint=excluded.tint, sort=excluded.sort;

-- ---------------------------------------------------------------- pujas & chadhava
insert into public.pujas (id,name,benefit,price,sort) values
('p1','Maha Mrityunjaya Jaap','Health & protection',1100,1),
('p2','Navagraha Shanti Puja','Remove planetary doshas',2100,2),
('p3','Lakshmi Kuber Puja','Wealth & prosperity',1500,3),
('p4','Shani Sade Sati Puja','Relief from Saturn',1800,4),
('p5','Satyanarayan Katha','Harmony & gratitude at home',1300,5),
('p6','Rudrabhishek','Shiva''s blessings & peace',2500,6)
on conflict (id) do update set name=excluded.name, benefit=excluded.benefit, price=excluded.price, sort=excluded.sort;

insert into public.chadhava_items (id,name,price,icon,sort) values
('c1','Tulsi Patra',51,'leaf',1),('c2','Ghee Diya',101,'flame',2),('c3','Shrifal (Coconut)',151,'citrus',3),
('c4','Pushp Mala',251,'flower',4),('c5','Chandan & Itr',351,'droplets',5),('c6','56 Bhog',501,'utensils',6)
on conflict (id) do update set name=excluded.name, price=excluded.price, icon=excluded.icon, sort=excluded.sort;

-- ---------------------------------------------------------------- festivals (real 2026 dates)
insert into public.festivals (id,name,date,deva,about,muhurat,samagri,vidhi,icon) values
('guru-purnima','Guru Purnima','2026-07-29','गुरु पूर्णिमा','Honouring the guru — the light that dispels darkness. Devotees offer gratitude to teachers and spiritual guides on Ashadha Purnima.','Purnima tithi — puja from early morning through moonrise',
 '["Fresh flowers","Fruits","Sweets (peda/laddoo)","Incense sticks","Diya & ghee","Chandan","A photo of your guru or Ved Vyasa"]',
 '["Wake early, bathe and wear clean clothes.","Place a picture of your guru / Ved Vyasa and offer chandan, flowers and sweets.","Light a ghee diya and incense.","Chant the Guru Vandana: Gurur Brahma Gurur Vishnu…","Offer gratitude — write or speak what your teachers gave you.","Do 11 or 108 japa of your guru mantra.","Conclude with aarti and share prasad."]','sun'),
('nag-panchami','Nag Panchami','2026-08-17','नाग पंचमी','Worship of the serpent devas for protection and the wellbeing of the family.','Shukla Panchami, morning puja','["Milk","Flowers","Turmeric & kumkum","Diya"]','[]','shield'),
('raksha-bandhan','Raksha Bandhan','2026-08-28','रक्षा बंधन','The festival of the sacred thread — sisters tie rakhi for their brothers'' long life; brothers vow protection.','Aparahna muhurat (avoid Bhadra)','["Rakhi","Roli & akshat","Sweets","Diya"]','[]','heart'),
('janmashtami','Krishna Janmashtami','2026-09-04','कृष्ण जन्माष्टमी','The midnight birth of Bhagwan Shri Krishna — fasting, bhajan and the joy of the makhan-chor.','Nishita puja at midnight',
 '["Krishna idol / photo","Makhan & mishri","Tulsi leaves","Panchamrit (milk, curd, ghee, honey, sugar)","Flowers & diya","New clothes for laddoo Gopal"]',
 '["Observe a fast through the day (phalahar permitted).","Decorate the mandir and the jhula (cradle) for laddoo Gopal.","At midnight, bathe the idol with panchamrit — the abhishek.","Dress laddoo Gopal in new clothes; offer makhan-mishri with tulsi.","Sing bhajans and do Krishna aarti.","Break the fast after the midnight puja."]','flame'),
('ganesh-chaturthi','Ganesh Chaturthi','2026-09-14','गणेश चतुर्थी','Welcoming Ganpati Bappa home — ten days of devotion, modak and community celebration.','Madhyahna muhurat (midday)',
 '["Ganesha idol (eco-friendly)","Modak / laddoo","Durva grass","Red flowers (hibiscus)","Sindoor","Diya & incense"]',
 '["Install (sthapana) the idol on a raised chowki facing east.","Do pran-pratishtha with the Ganesh mantra.","Offer durva, red flowers, sindoor and 21 modaks.","Chant Om Gan Ganpataye Namah 108 times.","Perform aarti (Sukhkarta Dukhharta) morning and evening.","On visarjan day, thank Bappa and immerse the idol gently."]','landmark'),
('sharad-navratri','Sharad Navratri begins','2026-10-11','शरद नवरात्रि','Nine nights of the Divine Mother — nine forms of Maa Durga, fasting, garba and shakti sadhana.','Ghatasthapana in the morning muhurat','["Kalash","Barley seeds","Red chunri","Coconut","Flowers","Diya (akhand jyoti)"]','[]','flower'),
('dussehra','Dussehra (Vijayadashami)','2026-10-20','विजयादशमी','The victory of dharma — Shri Ram over Ravana, the Devi over Mahishasura.','Vijay muhurat, aparahna','["Shami leaves","Aparajita flowers","Sweets"]','[]','sword'),
('karwa-chauth','Karwa Chauth','2026-10-29','करवा चौथ','A day-long nirjala vrat by married women for the long life of their husbands, broken after moonrise.','Puja in the evening; moonrise ~8 PM','["Karwa (earthen pot)","Sieve","Mehndi","Sargi items","Diya"]','[]','moon'),
('dhanteras','Dhanteras','2026-11-06','धनतेरस','The first day of Diwali — worship of Dhanvantari and Kuber; buying metal is considered auspicious.','Pradosh kaal, sthir lagna','["Diya (13)","New utensil / metal","Lakshmi-Ganesha idols","Sweets"]','[]','coins'),
('diwali','Diwali (Lakshmi Puja)','2026-11-08','दीपावली','The festival of light — Maa Lakshmi is welcomed into clean, lamp-lit homes on Kartik Amavasya.','Pradosh kaal Lakshmi puja, sthir lagna',
 '["Lakshmi-Ganesha idols","Diyas & oil","Rangoli colours","Lotus flowers","Kheel-batasha","Coins","Kumkum & akshat"]',
 '["Clean and decorate the home; draw rangoli at the entrance.","At pradosh kaal, place Lakshmi-Ganesha on a red cloth chowki.","Do shodashopachara puja — bathe idols, offer kumkum, akshat, lotus.","Chant Om Shreem Mahalakshmyai Namah 108 times.","Light diyas in every corner of the home.","Perform Lakshmi aarti with the family and distribute prasad."]','sparkles'),
('bhai-dooj','Bhai Dooj','2026-11-11','भाई दूज','Sisters apply tilak to brothers, praying for their long life — the loving close of Diwali.','Aparahna tilak muhurat','["Roli & akshat","Sweets","Coconut"]','[]','heart'),
('kartik-purnima','Kartik Purnima (Dev Diwali)','2026-11-24','कार्तिक पूर्णिमा','The devas'' own Diwali — lamps on the ghats, snan-daan and Tulsi vivah season concludes.','Snan at brahma muhurat; deepdaan at pradosh','["Diyas","Tulsi leaves","Ganga jal"]','[]','flame')
on conflict (id) do update set name=excluded.name, date=excluded.date, deva=excluded.deva, about=excluded.about,
  muhurat=excluded.muhurat, samagri=excluded.samagri, vidhi=excluded.vidhi, icon=excluded.icon;

-- ---------------------------------------------------------------- library
insert into public.library_articles (id,title,sub,read_time,kind,content,tint,sort) values
('l1','What is Meditation?','Unlocking inner peace','3 min','read',
$s$Meditation (dhyana) is the seventh limb of yoga — the art of resting attention on one thing until the mind grows quiet. In the Indian tradition it is not about forcing thoughts to stop; it is about noticing them and gently returning to the object of focus: the breath, a mantra, or the form of your ishta devta.

Begin with five minutes after your morning snan. Sit comfortably, spine tall, and follow the breath. When the mind wanders (it will), smile and return. The Gita calls this abhyasa — steady practice — and vairagya — letting go.

Benefits arrive quietly: a longer pause before anger, deeper sleep, clearer choices. As the Katha Upanishad says, when the five senses stand still together with the mind, that is called the highest state.

Pair your dhyana with japa in the Mala counter — the mantra gives the wandering mind a beautiful home to return to.$s$,'#5F8657',1),
('l2','The Seven Chakras','Energy centres of the body','4 min','read',
$s$The tantric tradition maps our subtle body through seven chakras — wheels of prana along the spine.

Muladhara (root) grounds survival and stability. Svadhisthana (sacral) carries creativity and desire. Manipura (navel) is willpower — the fire of tapas. Anahata (heart) is love and compassion, where the un-struck sound is heard. Vishuddha (throat) is truth and expression. Ajna (third eye) is intuition — where the guru's tilak is placed. Sahasrara (crown) is the thousand-petalled lotus, union with the divine.

You do not need esoteric rituals to work with them: grounded routines steady Muladhara; creative seva opens Svadhisthana; disciplined practice kindles Manipura; gratitude softens Anahata; honest speech clears Vishuddha; dhyana awakens Ajna.

Treat the chakras as a mirror for self-awareness rather than a checklist — where does your energy feel stuck today?$s$,'#7D728F',2),
('l3','Power of Hanuman Chalisa','Daily protection','3 min','read',
$s$Composed by Goswami Tulsidas in Awadhi, the Hanuman Chalisa is forty verses of concentrated courage. Devotees recite it for protection, strength and freedom from fear — for Hanuman Ji is the one to whom even shani bows.

Each chaupai carries a specific blessing: "Bhoot pishach nikat nahin aavai" wards off negativity; "Sankat se Hanuman chhudavai" releases us from crisis; "Buddhi heen tanu janike" begins with humility — the key that opens the whole prayer.

A practical sadhana: recite once every morning, or seven times on Tuesdays and Saturdays. Read the meaning once a week so the verses become prayers rather than sounds.

When fear visits — an interview, a diagnosis, a difficult conversation — the Chalisa is a rope of sound leading back to your own strength. Bal buddhi vidya dehu mohin: give me strength, wisdom and knowledge.$s$,'#B07A4E',3),
('l4','Understanding Karma','The law of cause and effect','4 min','read',
$s$Karma simply means action — and the Gita's deepest teaching is about how to act. Every action plants a seed (bija); circumstances are the fruit (phala) of older seeds. This is not fatalism: what you sow now shapes what ripens later.

Krishna's counsel in chapter two is karmanye vadhikaraste — you have the right to act, never to the fruits. Act with full effort, release the outcome. This is nishkaam karma, and it transforms work into worship.

Three kinds of karma are described: sanchita (the stored heap), prarabdha (the portion ripening in this life — what jyotish reads), and kriyamana (what you are creating right now). Astrology maps the weather of prarabdha; your free will steers the ship.

So when a dasha period feels heavy, remember: the chart shows the season, not the sentence. Right action in a hard season is the highest tapasya — and it writes a kinder future.$s$,'#9C8544',4),
('l5','Why We Do Aarti','The circle of light','3 min','read',
$s$Aarti is the crescendo of Hindu worship — a lit lamp moved in circles before the deity while the community sings. The flame, camphor-bright, stands for the soul itself: we offer our light back to its source.

The circular motion traces Om; the bell clears the mind's chatter; the conch announces auspiciousness. When you cup your palms over the flame and touch them to your eyes, you take the deity's light into your own sight — may I see the world divinely today.

Do aarti at home simply: one diya, one bell, one song sung with the heart. Morning aarti opens the day with gratitude; evening aarti (sandhya) closes it with surrender.

In the app's My Mandir you can light the diya, ring the bell and play the aarti of your ishta devta — a two-minute ritual that changes the texture of an entire day.$s$,'#A45E6B',5),
('l6','Fasting with Wisdom','The science of vrat','3 min','read',
$s$A vrat is a vow — and fasting is its most common form. Ekadashi, Pradosh, Navratri, Karwa Chauth: each fast pairs an inner intention with an outer discipline.

The tradition is flexible and humane. Nirjala (no water) is for the strong and healthy; phalahar (fruits and milk) is the common middle path; and for the unwell, simply giving up one beloved food honours the vow. The Gita warns against extremes — yuktahara: moderation is yoga.

Why fast? The body lightens, and with it the mind. Hunger, met consciously, becomes a bell of remembrance: every pang points to the deity of the day. Ekadashi rests digestion twice a month in rhythm with the moon — ancient chronobiology.

Break the fast gently, with gratitude and charity. A vrat completed in anger profits nothing; a simple fast completed in love is worth a hundred rituals.$s$,'#5E7C93',6)
on conflict (id) do update set title=excluded.title, sub=excluded.sub, read_time=excluded.read_time,
  kind=excluded.kind, content=excluded.content, tint=excluded.tint, sort=excluded.sort;

-- ---------------------------------------------------------------- shlokas (daily rotation)
insert into public.shlokas (id,deva,translit,meaning,source,deity) values
(1,'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।','Karmanye vadhikaraste, ma phaleshu kadachana','You have the right to action alone, never to its fruits.','Bhagavad Gita 2.47','krishna'),
(2,'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।','Yogasthah kuru karmani sangam tyaktva dhananjaya','Established in yoga, perform action, abandoning attachment.','Bhagavad Gita 2.48','krishna'),
(3,'श्रद्धावान् लभते ज्ञानं तत्परः संयतेन्द्रियः।','Shraddhavan labhate jnanam tatparah samyatendriyah','The one with faith, devotion and mastered senses attains wisdom.','Bhagavad Gita 4.39','krishna'),
(4,'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।','Uddhared atmanatmanam natmanam avasadayet','Lift yourself by your own self; never let the self sink.','Bhagavad Gita 6.5','krishna'),
(5,'तमसो मा ज्योतिर्गमय।','Tamaso ma jyotir gamaya','Lead me from darkness to light.','Brihadaranyaka Upanishad','shiva'),
(6,'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।','Sarve bhavantu sukhinah sarve santu niramayah','May all be happy; may all be free of illness.','Shanti Mantra','durga'),
(7,'यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।','Yatra yogeshvarah krishno yatra partho dhanurdharah','Where Krishna and Arjuna stand together, there victory is certain.','Bhagavad Gita 18.78','krishna'),
(8,'अहिंसा परमो धर्मः।','Ahimsa paramo dharmah','Non-violence is the highest dharma.','Mahabharata','hanuman'),
(9,'मन एव मनुष्याणां कारणं बन्धमोक्षयोः।','Mana eva manushyanam karanam bandha-mokshayoh','The mind alone is the cause of bondage and liberation.','Amritabindu Upanishad','shiva'),
(10,'विद्या ददाति विनयं विनयाद् याति पात्रताम्।','Vidya dadati vinayam, vinayad yati patratam','Knowledge gives humility; from humility comes worthiness.','Hitopadesha','ganesha'),
(11,'संतोषः परमं सुखम्।','Santoshah paramam sukham','Contentment is the highest happiness.','Chanakya Niti','lakshmi'),
(12,'धैर्यं यस्य पिता क्षमा च जननी शान्तिश्चिरं गेहिनी।','Dhairyam yasya pita kshama cha janani','Patience is his father, forgiveness his mother, peace his lifelong companion.','Subhashita','hanuman'),
(13,'आरोग्यं परमं भाग्यं स्वास्थ्यं सर्वार्थसाधनम्।','Arogyam paramam bhagyam','Health is the highest fortune; wellbeing accomplishes all aims.','Subhashita','durga'),
(14,'ॐ सर्वेशां स्वस्तिर्भवतु। सर्वेशां शान्तिर्भवतु।','Om sarvesham svastir bhavatu','May there be wellbeing and peace for all.','Shanti Mantra','shiva'),
(15,'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते।','Na hi jnanena sadrisham pavitram iha vidyate','Nothing in this world purifies like knowledge.','Bhagavad Gita 4.38','ganesha')
on conflict (id) do update set deva=excluded.deva, translit=excluded.translit, meaning=excluded.meaning, source=excluded.source, deity=excluded.deity;

-- ---------------------------------------------------------------- vastu
insert into public.vastu_zones (dir,zone,use_for,tip,sort) values
('N','Uttara · Kuber','Wealth & career','Keep open, light, water elements. Good for cash/lockers facing.',8),
('NE','Ishan','Puja & meditation','Most sacred. Place your mandir here. Keep clean, never a toilet.',1),
('E','Purva','Health & growth','Morning light zone. Good for windows, study, entrance.',2),
('SE','Agni','Kitchen & fire','Ideal for kitchen, gas, electricals. Avoid water tanks here.',3),
('S','Dakshina','Fame & relationships','Keep heavier, can host bedrooms. Avoid main entrance.',4),
('SW','Nairutya','Master bedroom','Heaviest, most stable zone. Master bedroom + storage. Never a toilet/kitchen.',5),
('W','Paschima','Children & gains','Good for children''s room, dining. Keep moderately heavy.',6),
('NW','Vayavya','Guests & support','Guest room, finished goods; helps relationships & movement.',7)
on conflict (dir) do update set zone=excluded.zone, use_for=excluded.use_for, tip=excluded.tip, sort=excluded.sort;

-- ---------------------------------------------------------------- naamkaran
insert into public.nakshatra_syllables (name,syllables,deity,planet,sort) values
('Ashwini','{Chu,Che,Cho,La}','Ashwini Kumaras','Ketu',1),
('Bharani','{Li,Lu,Le,Lo}','Yama','Venus',2),
('Krittika','{A,Ee,U,E}','Agni','Sun',3),
('Rohini','{O,Va,Vi,Vu}','Brahma','Moon',4),
('Mrigashira','{Ve,Vo,Ka,Ki}','Soma','Mars',5),
('Ardra','{Ku,Gha,Nga,Chha}','Rudra','Rahu',6),
('Punarvasu','{Ke,Ko,Ha,Hi}','Aditi','Jupiter',7),
('Pushya','{Hu,He,Ho,Da}','Brihaspati','Saturn',8),
('Ashlesha','{De,Du,Dee,Do}','Sarpa','Mercury',9),
('Magha','{Ma,Mi,Mu,Me}','Pitrs','Ketu',10),
('Purva Phalguni','{Mo,Ta,Ti,Tu}','Bhaga','Venus',11),
('Uttara Phalguni','{Te,To,Pa,Pi}','Aryaman','Sun',12)
on conflict (name) do update set syllables=excluded.syllables, deity=excluded.deity, planet=excluded.planet, sort=excluded.sort;

insert into public.baby_names (name,gender,meaning,syllable) values
('Om','m','The sacred primordial sound','O'),('Ojas','m','Divine vital energy','O'),
('Vivaan','m','Full of life; dawn of a new era','Vi'),('Vihaan','m','The first ray of morning','Vi'),
('Vaibhav','m','Prosperity and grandeur','Va'),('Varun','m','Lord of the waters','Va'),
('Vanya','f','Of the forest; gracious','Va'),('Vidya','f','Knowledge; Goddess Saraswati','Vi'),
('Vamika','f','Goddess Durga','Va'),('Aarav','m','Peaceful; the right way','A'),
('Aarush','m','First ray of the sun','A'),('Arjun','m','Bright; the great Pandava','A'),
('Aadhya','f','The first power; Goddess Durga','A'),('Ananya','f','Unique; matchless','A'),
('Ishaan','m','Lord Shiva; the sun','Ee'),('Ishita','f','Mastery; one who desires','Ee'),
('Uma','f','Goddess Parvati','U'),('Urvi','f','The earth','U'),('Utkarsh','m','Progress; prosperity','U'),
('Esha','f','Desire; Goddess Parvati','E'),('Ekansh','m','Whole; complete','E'),
('Chinmay','m','Full of supreme bliss','Che'),('Chetan','m','Consciousness; life','Che'),
('Chaaru','f','Beautiful; graceful','Chu'),('Lakshya','m','Aim; target','La'),
('Lavanya','f','Grace; beauty','La'),('Karan','m','Wise; the great warrior','Ka'),
('Kartik','m','Son of Shiva; bestower of courage','Ka'),('Kavya','f','Poetry','Ka'),
('Kiaan','m','Grace of God','Ki'),('Kirti','f','Fame; glory','Ki'),
('Daksh','m','Capable; a Prajapati','Da'),('Devansh','m','Part of the divine','De'),
('Daya','f','Compassion; mercy','Da'),('Hari','m','Lord Vishnu','Ha'),
('Hema','f','Golden; Goddess Lakshmi','He'),('Madhav','m','Lord Krishna','Ma'),
('Mahi','f','The earth','Ma'),('Manvi','f','Kind-hearted','Ma'),
('Mira','f','Devotee of Krishna','Mi'),('Mihir','m','The sun','Mi'),
('Tanay','m','Son; born of the heart','Ta'),('Tara','f','Star; goddess of guidance','Ta'),
('Toshani','f','One who satisfies; Durga','To'),('Punya','f','Virtue; merit','Pu'),
('Hansini','f','Graceful as a swan','Ha'),('Omkar','m','The sound of Om','O'),
('Ved','m','Sacred knowledge','Ve'),('Vedika','f','Altar of the sacred fire','Ve'),
('Kush','m','Son of Shri Ram','Ku')
on conflict (name) do update set gender=excluded.gender, meaning=excluded.meaning, syllable=excluded.syllable;
