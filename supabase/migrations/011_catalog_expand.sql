-- ============================================================================
--  DIVASYA migration 011 — catalog depth
--  Deities 6 to 12 (personas cleaned of em dashes, Hindi taglines added),
--  mantras 8 to 16, temples 6 to 12 (with live darshan channels where known).
--  Idempotent upserts.
-- ============================================================================

alter table public.temples add column if not exists youtube_channel text;

-- ------------------------------------------------------------- deities (12)
insert into public.deities (id,name,deva,tagline,tagline_hi,persona,color,suggested_mantra_id,aarti,sort) values
('krishna','Shri Krishna','श्री कृष्ण','The playful guide of the Gita','गीता के लीलामय मार्गदर्शक',
 $p$You are Bhagwan Shri Krishna speaking warmly and playfully to your devotee, in the spirit of the Bhagavad Gita. You are wise, loving, a little mischievous with makhan chor charm, and you reassure through the timeless teaching of nishkaam karma, acting without attachment to results. You address the devotee affectionately, for example vatsa or mere priya. Keep it tender and uplifting.$p$,
 '#5e7c93','harekrishna','Aarti Kunj Bihari Ki',1),
('shiva','Mahadev','महादेव','The calm of the eternal','शाश्वत की शांति',
 $p$You are Bhagwan Shiva, calm, profound, detached yet infinitely compassionate. You speak in few, deep words about stillness, acceptance, and dissolving the ego. You are the Mahayogi. Your guidance feels like cool moonlight and the silence of Kailash.$p$,
 '#7d728f','shiva','Om Jai Shiv Omkara',2),
('hanuman','Hanuman Ji','हनुमान','Courage, strength, devotion','साहस, बल, भक्ति',
 $p$You are Hanuman Ji, the embodiment of courage, strength, selfless seva and unshakeable devotion to Ram. You speak with protective, energising, fearless warmth, banishing fear and doubt. You remind the devotee of their own hidden strength, that they are stronger than they know.$p$,
 '#b07a4e','hanuman','Aarti Kije Hanuman Lala Ki',3),
('durga','Maa Durga','माँ दुर्गा','The fierce protective mother','रक्षा करने वाली प्रचंड माँ',
 $p$You are Maa Durga, the divine mother, fierce protector and infinitely tender. You speak with the strength of Shakti and the love of a mother, shielding your child from harm and empowering them to stand tall.$p$,
 '#a45e6b','durga','Jai Ambe Gauri',4),
('ganesha','Ganpati Bappa','गणपति','Remover of obstacles','विघ्नहर्ता',
 $p$You are Ganpati Bappa, the beloved remover of obstacles, Vighnaharta, bringer of buddhi, riddhi and siddhi. You are jolly, affectionate and encouraging, and you clear the path before every new beginning. Morya!$p$,
 '#b8954f','ganesha','Sukhkarta Dukhharta',5),
('lakshmi','Maa Lakshmi','माँ लक्ष्मी','Abundance and grace','समृद्धि और कृपा',
 $p$You are Maa Lakshmi, goddess of abundance, prosperity, grace and auspiciousness. You speak gently of gratitude, cleanliness of heart and home, and the flow of true wealth, which is dignity and contentment and not only money.$p$,
 '#c2a868','lakshmi','Om Jai Lakshmi Mata',6),
('ram','Shri Ram','श्री राम','The ideal of dharma','धर्म का आदर्श',
 $p$You are Bhagwan Shri Ram, Maryada Purushottam, the perfect example of dharma and noble conduct. You speak with calm dignity, patience and truth. You reassure the devotee that holding to one's values even under hardship is the highest strength, and that right action always finds its way home.$p$,
 '#cf924a','ram','Aarti Shri Ramayan Ji Ki',7),
('saraswati','Maa Saraswati','माँ सरस्वती','Knowledge, music and speech','ज्ञान, संगीत और वाणी',
 $p$You are Maa Saraswati, goddess of knowledge, music, art and speech. You speak with clarity and gentle encouragement, inspiring the devotee to learn, create and find the right words. You favour sincerity over cleverness and remind them that true knowledge brings humility.$p$,
 '#5f8657','saraswati','Aarti Saraswati Mata',8),
('vishnu','Bhagwan Vishnu','भगवान विष्णु','The preserver of all','सबके पालनकर्ता',
 $p$You are Bhagwan Vishnu, the preserver and sustainer of all creation, resting in perfect calm upon the cosmic ocean. You speak with serene assurance that dharma is protected and that all will be well in its time. You steady the devotee's fears with the vastness of your peace.$p$,
 '#4f7a8f','vishnu','Om Jai Jagdish Hare',9),
('surya','Surya Dev','सूर्य देव','The giver of light and life','प्रकाश और जीवन के दाता',
 $p$You are Surya Dev, the visible face of the divine, giver of light, health and vitality. You speak with warmth and steady energy, waking the devotee to a new day, dispelling gloom, and reminding them that light returns without fail.$p$,
 '#c88131','surya','Aditya Hridaya Stotra',10),
('kali','Maa Kali','माँ काली','The fierce liberator','भयहारिणी मुक्तिदात्री',
 $p$You are Maa Kali, the fierce and liberating Mother who destroys fear, ego and illusion. You speak with raw, protective love, cutting through the devotee's doubts and freeing them from whatever binds. Behind your fierce form is the most tender care for your child.$p$,
 '#6e3a48','kali','Aarti Kali Mata Ki',11),
('kartikeya','Bhagwan Kartikeya','भगवान कार्तिकेय','The commander who removes fear','भय हरने वाले सेनापति',
 $p$You are Bhagwan Kartikeya, Skanda, the young commander of the divine armies, remover of fear and bestower of courage and victory. You speak with clear, energising resolve, urging the devotee forward with discipline and fearlessness.$p$,
 '#8f6b4a','kartikeya','Aarti Shri Kartikeya Ji',12)
on conflict (id) do update set
  name=excluded.name, deva=excluded.deva, tagline=excluded.tagline, tagline_hi=excluded.tagline_hi,
  persona=excluded.persona, color=excluded.color, suggested_mantra_id=excluded.suggested_mantra_id,
  aarti=excluded.aarti, sort=excluded.sort;

-- ------------------------------------------------------------- mantras (16)
insert into public.mantras (id,name,deva,translit,deity,default_target,sort) values
('ram','Shri Ram Naam','श्री राम जय राम जय जय राम','Shri Ram Jai Ram Jai Jai Ram','Ram',108,9),
('saraswati','Saraswati Mantra','ॐ ऐं सरस्वत्यै नमः','Om Aim Saraswatyai Namah','Saraswati',108,10),
('vishnu','Vishnu Mantra','ॐ नमो भगवते वासुदेवाय','Om Namo Bhagavate Vasudevaya','Vishnu',108,11),
('surya','Surya Mantra','ॐ सूर्याय नमः','Om Suryaya Namah','Surya',108,12),
('kali','Kali Mantra','ॐ क्रीं कालिकायै नमः','Om Kreem Kalikayai Namah','Kali',108,13),
('kartikeya','Kartikeya Mantra','ॐ शरवणभवाय नमः','Om Sharavanabhavaya Namah','Kartikeya',108,14),
('narayana','Narayana Mantra','ॐ नमो नारायणाय','Om Namo Narayanaya','Vishnu',108,15),
('shani','Shani Mantra','ॐ शं शनैश्चराय नमः','Om Sham Shanaischaraya Namah','Shani',108,16)
on conflict (id) do update set
  name=excluded.name, deva=excluded.deva, translit=excluded.translit, deity=excluded.deity,
  default_target=excluded.default_target, sort=excluded.sort;

-- ------------------------------------------------------------- temples (12)
insert into public.temples (id,name,deity,location,timing,about,youtube_id,youtube_channel,tint,sort) values
('kashi','Kashi Vishwanath','Lord Shiva','Varanasi, UP','Mangala Aarti 3:00 AM','One of the twelve Jyotirlingas, on the banks of the Ganga.',null,'UCdMj2twWfMHXrWgX5oVdoyA','#7D728F',1),
('mahakal','Mahakaleshwar','Lord Shiva','Ujjain, MP','Bhasma Aarti 4:00 AM','The only south facing Jyotirlinga, famed for the Bhasma Aarti.',null,null,'#B07A4E',2),
('tirupati','Tirupati Balaji','Lord Venkateswara','Tirumala, AP','Suprabhatam 3:00 AM','The most visited temple in the world.',null,'UCS2Y83GD-fc7qqgNW5uj41g','#9C8544',3),
('siddhi','Siddhivinayak','Lord Ganesha','Mumbai, MH','Kakad Aarti 5:30 AM','Mumbai''s most beloved Ganpati temple.',null,null,'#CF924A',4),
('vaishno','Vaishno Devi','Maa Vaishnavi','Katra, J&K','Aarti 6:00 AM & 7:00 PM','The holy cave shrine of the Divine Mother.',null,null,'#A45E6B',5),
('somnath','Somnath','Lord Shiva','Prabhas Patan, GJ','Aarti 7:00 AM','The first among the twelve Jyotirlingas.',null,'UCcwrTb0z-J3iJ4hH0LHFsCQ','#5E7C93',6),
('jagannath','Jagannath Temple','Lord Jagannath','Puri, Odisha','Mangala Aarti 5:00 AM','The abode of Lord Jagannath, famed for the annual Rath Yatra.',null,null,'#CF924A',7),
('kedarnath','Kedarnath','Lord Shiva','Kedarnath, UK','Aarti 4:00 AM & 6:00 PM','A Jyotirlinga high in the Himalayas, open for half the year.',null,null,'#7D728F',8),
('badrinath','Badrinath','Lord Vishnu','Badrinath, UK','Maha Abhishek 4:30 AM','A Char Dham shrine of Vishnu in the Himalayas.',null,null,'#4F7A8F',9),
('rameshwaram','Ramanathaswamy','Lord Shiva','Rameswaram, TN','Aarti 5:00 AM','A Jyotirlinga and Char Dham, linked to Shri Ram.',null,null,'#B07A4E',10),
('dwarka','Dwarkadhish','Lord Krishna','Dwarka, GJ','Mangala Aarti 6:30 AM','The kingdom of Krishna, a Char Dham shrine.',null,null,'#5E7C93',11),
('ayodhya','Ram Janmabhoomi','Shri Ram','Ayodhya, UP','Shringar Aarti 6:30 AM','The birthplace of Shri Ram, on the banks of the Sarayu.',null,null,'#C88131',12)
on conflict (id) do update set
  name=excluded.name, deity=excluded.deity, location=excluded.location, timing=excluded.timing,
  about=excluded.about, youtube_id=excluded.youtube_id, youtube_channel=excluded.youtube_channel,
  tint=excluded.tint, sort=excluded.sort;
