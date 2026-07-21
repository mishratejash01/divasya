-- ============================================================
-- Divasya · Migration 003 — Phase-1 panchang/jyotish reference data
-- Zero-hardcoding source of truth for all names & classical attributes.
-- ============================================================

create table if not exists public.engine_config (
  key text primary key, value jsonb not null, updated_at timestamptz default now()
);
alter table public.engine_config enable row level security;
drop policy if exists "engine_config read" on public.engine_config;
create policy "engine_config read" on public.engine_config for select to anon, authenticated using (true);
insert into public.engine_config (key, value) values
  ('ayanamsa', '"lahiri"'::jsonb),
  ('node_type', '"mean"'::jsonb),
  ('house_system', '"W"'::jsonb),
  ('sunrise_def', '"upper_limb_refraction"'::jsonb),
  ('year_days', '365.25'::jsonb),
  ('engine_version', '"2.1.0"'::jsonb),
  ('vastu_north', '"magnetic"'::jsonb),
  ('war_rule', '"latitude_venus_exception"'::jsonb),
  ('config_ttl_sec', '60'::jsonb),
  ('panchang_cache_ttl_days', '30'::jsonb)
on conflict (key) do nothing;

create table if not exists public.astro_constants (
  key text primary key, value jsonb not null
);
alter table public.astro_constants enable row level security;
drop policy if exists "astro_constants read" on public.astro_constants;
create policy "astro_constants read" on public.astro_constants for select to anon, authenticated using (true);
insert into public.astro_constants (key, value) values
  ('ayanamsa_lahiri', '{"model":"cubic_T_from_J2000","coeffs":[23.8570923518,1.3968879571,0.0003070908,0.0000000038]}'::jsonb),
  ('combustion_orbs', '{"sun":0,"moon":12,"mars":17,"mercury":14,"mercury_retro":12,"jupiter":11,"venus":10,"venus_retro":8,"saturn":15}'::jsonb),
  ('aspect_sets', '{"mars":[4,7,8],"jupiter":[5,7,9],"saturn":[3,7,10],"default":[7]}'::jsonb),
  ('war_rule', '{"rule":"latitude_venus_exception"}'::jsonb)
on conflict (key) do nothing;

create table if not exists public.grahas (
  id text primary key, swe_id int, is_node bool, name_en text, name_sa text, name_hi text, nature text, gender text, tattva text, guna text, karakas text[], own_rashis smallint[], exaltation_rashi smallint, exaltation_deg numeric, debilitation_rashi smallint, debilitation_deg numeric, moolatrikona_rashi smallint, moolatrikona_from numeric, moolatrikona_to numeric, special_aspects smallint[], dasha_years int, combustion_orb_deg numeric, weekday smallint, color text, gemstone text, metal text, direction text, sort_order int
);
alter table public.grahas enable row level security;
drop policy if exists "grahas read" on public.grahas;
create policy "grahas read" on public.grahas for select to anon, authenticated using (true);
insert into public.grahas (id, swe_id, is_node, name_en, name_sa, name_hi, nature, gender, tattva, guna, karakas, own_rashis, exaltation_rashi, exaltation_deg, debilitation_rashi, debilitation_deg, moolatrikona_rashi, moolatrikona_from, moolatrikona_to, special_aspects, dasha_years, combustion_orb_deg, weekday, color, gemstone, metal, direction, sort_order) values
  ('sun', 0, false, 'Sun', 'सूर्य', 'सूर्य', 'malefic', 'male', 'fire', 'sattva', ARRAY['soul','father','authority']::text[], ARRAY[4]::smallint[], 0, 10, 6, 10, 4, 0, 20, ARRAY[]::smallint[], 6, 0, 0, 'copper red', 'Ruby', 'copper/gold', 'east', 1),
  ('moon', 1, false, 'Moon', 'चन्द्र', 'चंद्र', 'benefic', 'female', 'water', 'sattva', ARRAY['mind','mother','emotions']::text[], ARRAY[3]::smallint[], 1, 3, 7, 3, 1, 3, 30, ARRAY[]::smallint[], 10, 12, 1, 'white', 'Pearl', 'silver', 'northwest', 2),
  ('mars', 4, false, 'Mars', 'मङ्गल', 'मंगल', 'malefic', 'male', 'fire', 'tamas', ARRAY['courage','siblings','energy']::text[], ARRAY[0,7]::smallint[], 9, 28, 3, 28, 0, 0, 12, ARRAY[4,8]::smallint[], 7, 17, 2, 'red', 'Red Coral', 'copper', 'south', 3),
  ('mercury', 2, false, 'Mercury', 'बुध', 'बुध', 'neutral', 'neuter', 'earth', 'rajas', ARRAY['intellect','speech','commerce']::text[], ARRAY[2,5]::smallint[], 5, 15, 11, 15, 5, 15, 20, ARRAY[]::smallint[], 17, 14, 3, 'green', 'Emerald', 'brass/bronze', 'north', 4),
  ('jupiter', 5, false, 'Jupiter', 'गुरु', 'बृहस्पति', 'benefic', 'male', 'ether', 'sattva', ARRAY['wisdom','children','wealth','guru']::text[], ARRAY[8,11]::smallint[], 3, 5, 9, 5, 8, 0, 10, ARRAY[5,9]::smallint[], 16, 11, 4, 'yellow', 'Yellow Sapphire', 'gold', 'northeast', 5),
  ('venus', 3, false, 'Venus', 'शुक्र', 'शुक्र', 'benefic', 'female', 'water', 'rajas', ARRAY['love','marriage','luxury','arts']::text[], ARRAY[1,6]::smallint[], 11, 27, 5, 27, 6, 0, 15, ARRAY[]::smallint[], 20, 10, 5, 'variegated white', 'Diamond', 'silver', 'southeast', 6),
  ('saturn', 6, false, 'Saturn', 'शनि', 'शनि', 'malefic', 'neuter', 'air', 'tamas', ARRAY['discipline','longevity','sorrow','karma']::text[], ARRAY[9,10]::smallint[], 6, 20, 0, 20, 10, 0, 20, ARRAY[3,10]::smallint[], 19, 15, 6, 'black/blue', 'Blue Sapphire', 'iron', 'west', 7),
  ('rahu', 10, true, 'Rahu', 'राहु', 'राहु', 'malefic', 'female', 'air', 'tamas', ARRAY['obsession','foreign','illusion']::text[], ARRAY[]::smallint[], 1, null, 7, null, null, null, null, ARRAY[]::smallint[], 18, 0, null, 'smoky', 'Hessonite', 'lead', 'southwest', 8),
  ('ketu', -1, true, 'Ketu', 'केतु', 'केतु', 'malefic', 'neuter', 'fire', 'tamas', ARRAY['moksha','detachment','past-life']::text[], ARRAY[]::smallint[], 7, null, 1, null, null, null, null, ARRAY[]::smallint[], 7, 0, null, 'grey', 'Cat''s Eye', 'lead', 'southwest', 9)
on conflict (id) do nothing;

create table if not exists public.rashis (
  id smallint primary key, name_en text, name_sa text, name_hi text, lord_graha_id text, tattva text, modality text, gender text, varna text, body_part text, sort_order int
);
alter table public.rashis enable row level security;
drop policy if exists "rashis read" on public.rashis;
create policy "rashis read" on public.rashis for select to anon, authenticated using (true);
insert into public.rashis (id, name_en, name_sa, name_hi, lord_graha_id, tattva, modality, gender, varna, body_part, sort_order) values
  (0, 'Aries', 'मेष', 'मेष', 'mars', 'fire', 'movable', 'male', 'kshatriya', 'head', 1),
  (1, 'Taurus', 'वृषभ', 'वृषभ', 'venus', 'earth', 'fixed', 'female', 'vaishya', 'face', 2),
  (2, 'Gemini', 'मिथुन', 'मिथुन', 'mercury', 'air', 'dual', 'male', 'shudra', 'arms', 3),
  (3, 'Cancer', 'कर्क', 'कर्क', 'moon', 'water', 'movable', 'female', 'brahmin', 'chest', 4),
  (4, 'Leo', 'सिंह', 'सिंह', 'sun', 'fire', 'fixed', 'male', 'kshatriya', 'heart', 5),
  (5, 'Virgo', 'कन्या', 'कन्या', 'mercury', 'earth', 'dual', 'female', 'vaishya', 'belly', 6),
  (6, 'Libra', 'तुला', 'तुला', 'venus', 'air', 'movable', 'male', 'shudra', 'waist', 7),
  (7, 'Scorpio', 'वृश्चिक', 'वृश्चिक', 'mars', 'water', 'fixed', 'female', 'brahmin', 'genitals', 8),
  (8, 'Sagittarius', 'धनु', 'धनु', 'jupiter', 'fire', 'dual', 'male', 'kshatriya', 'thighs', 9),
  (9, 'Capricorn', 'मकर', 'मकर', 'saturn', 'earth', 'movable', 'female', 'vaishya', 'knees', 10),
  (10, 'Aquarius', 'कुम्भ', 'कुंभ', 'saturn', 'air', 'fixed', 'male', 'shudra', 'calves', 11),
  (11, 'Pisces', 'मीन', 'मीन', 'jupiter', 'water', 'dual', 'female', 'brahmin', 'feet', 12)
on conflict (id) do nothing;

create table if not exists public.nakshatras (
  id smallint primary key, name_en text, name_sa text, lord_graha_id text, deity text, symbol text, gana text, yoni_animal text, yoni_gender text, nadi text, is_gandamula bool, tyajya_ghati numeric, rajju_limb text, sort_order int
);
alter table public.nakshatras enable row level security;
drop policy if exists "nakshatras read" on public.nakshatras;
create policy "nakshatras read" on public.nakshatras for select to anon, authenticated using (true);
insert into public.nakshatras (id, name_en, name_sa, lord_graha_id, deity, symbol, gana, yoni_animal, yoni_gender, nadi, is_gandamula, tyajya_ghati, rajju_limb, sort_order) values
  (0, 'Ashwini', 'अश्विनी', 'ketu', 'Ashwini Kumaras', 'Horse''s head', 'deva', 'Horse', 'M', 'adi', true, 50, 'pada', 1),
  (1, 'Bharani', 'भरणी', 'venus', 'Yama', 'Yoni', 'manushya', 'Elephant', 'M', 'madhya', false, 24, 'kati', 2),
  (2, 'Krittika', 'कृत्तिका', 'sun', 'Agni', 'Razor/Flame', 'rakshasa', 'Sheep', 'F', 'antya', false, 30, 'nabhi', 3),
  (3, 'Rohini', 'रोहिणी', 'moon', 'Brahma', 'Cart/Chariot', 'manushya', 'Serpent', 'M', 'antya', false, 40, 'kantha', 4),
  (4, 'Mrigashira', 'मृगशिरा', 'mars', 'Soma', 'Deer''s head', 'deva', 'Serpent', 'F', 'madhya', false, 14, 'siro', 5),
  (5, 'Ardra', 'आर्द्रा', 'rahu', 'Rudra', 'Teardrop', 'manushya', 'Dog', 'F', 'adi', false, 21, 'kantha', 6),
  (6, 'Punarvasu', 'पुनर्वसु', 'jupiter', 'Aditi', 'Bow & quiver', 'deva', 'Cat', 'F', 'adi', false, 30, 'nabhi', 7),
  (7, 'Pushya', 'पुष्य', 'saturn', 'Brihaspati', 'Cow''s udder', 'deva', 'Sheep', 'M', 'madhya', false, 20, 'kati', 8),
  (8, 'Ashlesha', 'आश्लेषा', 'mercury', 'Nagas', 'Coiled serpent', 'rakshasa', 'Cat', 'M', 'antya', true, 32, 'pada', 9),
  (9, 'Magha', 'मघा', 'ketu', 'Pitris', 'Throne', 'rakshasa', 'Rat', 'M', 'adi', true, 30, 'pada', 10),
  (10, 'Purva Phalguni', 'पूर्वाफाल्गुनी', 'venus', 'Bhaga', 'Front legs of bed', 'manushya', 'Rat', 'F', 'madhya', false, 20, 'kati', 11),
  (11, 'Uttara Phalguni', 'उत्तराफाल्गुनी', 'sun', 'Aryaman', 'Back legs of bed', 'manushya', 'Cow', 'F', 'antya', false, 18, 'nabhi', 12),
  (12, 'Hasta', 'हस्त', 'moon', 'Savitar', 'Hand/Fist', 'deva', 'Buffalo', 'F', 'antya', false, 21, 'kantha', 13),
  (13, 'Chitra', 'चित्रा', 'mars', 'Vishvakarma', 'Bright jewel', 'rakshasa', 'Tiger', 'F', 'madhya', false, 20, 'siro', 14),
  (14, 'Swati', 'स्वाति', 'rahu', 'Vayu', 'Coral/Shoot', 'deva', 'Buffalo', 'M', 'adi', false, 14, 'kantha', 15),
  (15, 'Vishakha', 'विशाखा', 'jupiter', 'Indra-Agni', 'Triumphal arch', 'rakshasa', 'Tiger', 'M', 'adi', false, 14, 'nabhi', 16),
  (16, 'Anuradha', 'अनुराधा', 'saturn', 'Mitra', 'Lotus', 'deva', 'Deer', 'F', 'madhya', false, 10, 'kati', 17),
  (17, 'Jyeshtha', 'ज्येष्ठा', 'mercury', 'Indra', 'Earring', 'rakshasa', 'Deer', 'M', 'antya', true, 14, 'pada', 18),
  (18, 'Mula', 'मूल', 'ketu', 'Nirriti', 'Bunch of roots', 'rakshasa', 'Dog', 'M', 'adi', true, 20, 'pada', 19),
  (19, 'Purva Ashadha', 'पूर्वाषाढ़ा', 'venus', 'Apas', 'Fan/Winnow', 'manushya', 'Monkey', 'M', 'madhya', false, 24, 'kati', 20),
  (20, 'Uttara Ashadha', 'उत्तराषाढ़ा', 'sun', 'Vishvadevas', 'Elephant tusk', 'manushya', 'Mongoose', 'F', 'antya', false, 20, 'nabhi', 21),
  (21, 'Shravana', 'श्रवण', 'moon', 'Vishnu', 'Three footprints', 'deva', 'Monkey', 'F', 'antya', false, 10, 'kantha', 22),
  (22, 'Dhanishta', 'धनिष्ठा', 'mars', 'Vasus', 'Drum', 'rakshasa', 'Lion', 'F', 'madhya', false, 10, 'siro', 23),
  (23, 'Shatabhisha', 'शतभिषा', 'rahu', 'Varuna', 'Empty circle', 'rakshasa', 'Horse', 'F', 'adi', false, 18, 'kantha', 24),
  (24, 'Purva Bhadrapada', 'पूर्वाभाद्रपदा', 'jupiter', 'Aja Ekapada', 'Front legs of funeral cot', 'manushya', 'Lion', 'M', 'adi', false, 16, 'nabhi', 25),
  (25, 'Uttara Bhadrapada', 'उत्तराभाद्रपदा', 'saturn', 'Ahirbudhnya', 'Back legs of funeral cot', 'manushya', 'Cow', 'M', 'madhya', false, 24, 'kati', 26),
  (26, 'Revati', 'रेवती', 'mercury', 'Pushan', 'Fish/Drum', 'deva', 'Elephant', 'F', 'antya', true, 30, 'pada', 27)
on conflict (id) do nothing;

create table if not exists public.nakshatra_padas (
  nakshatra_id smallint, pada smallint, syllable_latin text, syllable_dev text, navamsa_rashi_id smallint, primary key(nakshatra_id,pada)
);
alter table public.nakshatra_padas enable row level security;
drop policy if exists "nakshatra_padas read" on public.nakshatra_padas;
create policy "nakshatra_padas read" on public.nakshatra_padas for select to anon, authenticated using (true);
insert into public.nakshatra_padas (nakshatra_id, pada, syllable_latin, syllable_dev, navamsa_rashi_id) values
  (0, 1, 'Chu', 'चु', 0),
  (0, 2, 'Che', 'चे', 1),
  (0, 3, 'Cho', 'चो', 2),
  (0, 4, 'La', 'ला', 3),
  (1, 1, 'Li', 'ली', 4),
  (1, 2, 'Lu', 'लू', 5),
  (1, 3, 'Le', 'ले', 6),
  (1, 4, 'Lo', 'लो', 7),
  (2, 1, 'A', 'अ', 8),
  (2, 2, 'I', 'इ', 9),
  (2, 3, 'U', 'उ', 10),
  (2, 4, 'E', 'ए', 11),
  (3, 1, 'O', 'ओ', 0),
  (3, 2, 'Va', 'वा', 1),
  (3, 3, 'Vi', 'वि', 2),
  (3, 4, 'Vu', 'वु', 3),
  (4, 1, 'Ve', 'वे', 4),
  (4, 2, 'Vo', 'वो', 5),
  (4, 3, 'Ka', 'का', 6),
  (4, 4, 'Ki', 'की', 7),
  (5, 1, 'Ku', 'कु', 8),
  (5, 2, 'Gha', 'घ', 9),
  (5, 3, 'Nga', 'ङ', 10),
  (5, 4, 'Chha', 'छ', 11),
  (6, 1, 'Ke', 'के', 0),
  (6, 2, 'Ko', 'को', 1),
  (6, 3, 'Ha', 'हा', 2),
  (6, 4, 'Hi', 'ही', 3),
  (7, 1, 'Hu', 'हु', 4),
  (7, 2, 'He', 'हे', 5),
  (7, 3, 'Ho', 'हो', 6),
  (7, 4, 'Da', 'डा', 7),
  (8, 1, 'Di', 'डी', 8),
  (8, 2, 'Du', 'डू', 9),
  (8, 3, 'De', 'डे', 10),
  (8, 4, 'Do', 'डो', 11),
  (9, 1, 'Ma', 'मा', 0),
  (9, 2, 'Mi', 'मी', 1),
  (9, 3, 'Mu', 'मू', 2),
  (9, 4, 'Me', 'मे', 3),
  (10, 1, 'Mo', 'मो', 4),
  (10, 2, 'Ta', 'टा', 5),
  (10, 3, 'Ti', 'टी', 6),
  (10, 4, 'Tu', 'टू', 7),
  (11, 1, 'Te', 'ते', 8),
  (11, 2, 'To', 'तो', 9),
  (11, 3, 'Pa', 'पा', 10),
  (11, 4, 'Pi', 'पी', 11),
  (12, 1, 'Pu', 'पू', 0),
  (12, 2, 'Sha', 'ष', 1),
  (12, 3, 'Na', 'ण', 2),
  (12, 4, 'Tha', 'ठ', 3),
  (13, 1, 'Pe', 'पे', 4),
  (13, 2, 'Po', 'पो', 5),
  (13, 3, 'Ra', 'रा', 6),
  (13, 4, 'Ri', 'री', 7),
  (14, 1, 'Ru', 'रू', 8),
  (14, 2, 'Re', 'रे', 9),
  (14, 3, 'Ro', 'रो', 10),
  (14, 4, 'Ta', 'टा', 11),
  (15, 1, 'Ti', 'टी', 0),
  (15, 2, 'Tu', 'टू', 1),
  (15, 3, 'Te', 'ते', 2),
  (15, 4, 'To', 'तो', 3),
  (16, 1, 'Na', 'ण', 4),
  (16, 2, 'Ni', 'नि', 5),
  (16, 3, 'Nu', 'नु', 6),
  (16, 4, 'Ne', 'ने', 7),
  (17, 1, 'No', 'नो', 8),
  (17, 2, 'Ya', 'या', 9),
  (17, 3, 'Yi', 'यी', 10),
  (17, 4, 'Yu', 'यू', 11),
  (18, 1, 'Ye', 'ये', 0),
  (18, 2, 'Yo', 'यो', 1),
  (18, 3, 'Bha', 'भ', 2),
  (18, 4, 'Bhi', 'भी', 3),
  (19, 1, 'Bhu', 'भू', 4),
  (19, 2, 'Dha', 'Dha', 5),
  (19, 3, 'Pha', 'फ', 6),
  (19, 4, 'Dha', 'Dha', 7),
  (20, 1, 'Bhe', 'भे', 8),
  (20, 2, 'Bho', 'भो', 9),
  (20, 3, 'Ja', 'जा', 10),
  (20, 4, 'Ji', 'जी', 11),
  (21, 1, 'Khi', 'खी', 0),
  (21, 2, 'Khu', 'खू', 1),
  (21, 3, 'Khe', 'खे', 2),
  (21, 4, 'Kho', 'खो', 3),
  (22, 1, 'Ga', 'गा', 4),
  (22, 2, 'Gi', 'गी', 5),
  (22, 3, 'Gu', 'गु', 6),
  (22, 4, 'Ge', 'गे', 7),
  (23, 1, 'Go', 'गो', 8),
  (23, 2, 'Sa', 'सा', 9),
  (23, 3, 'Si', 'सी', 10),
  (23, 4, 'Su', 'सू', 11),
  (24, 1, 'Se', 'से', 0),
  (24, 2, 'So', 'सो', 1),
  (24, 3, 'Da', 'डा', 2),
  (24, 4, 'Di', 'डी', 3),
  (25, 1, 'Du', 'डू', 4),
  (25, 2, 'Tha', 'ठ', 5),
  (25, 3, 'Jha', 'झ', 6),
  (25, 4, 'Na', 'ण', 7),
  (26, 1, 'De', 'डे', 8),
  (26, 2, 'Do', 'डो', 9),
  (26, 3, 'Cha', 'चा', 10),
  (26, 4, 'Chi', 'ची', 11)
on conflict (nakshatra_id,pada) do nothing;

create table if not exists public.tithis (
  id smallint primary key, name_en text, paksha text, deity text, category text, is_shubha bool
);
alter table public.tithis enable row level security;
drop policy if exists "tithis read" on public.tithis;
create policy "tithis read" on public.tithis for select to anon, authenticated using (true);
insert into public.tithis (id, name_en, paksha, deity, category, is_shubha) values
  (1, 'Pratipada', 'shukla', 'Agni', 'nanda', true),
  (2, 'Dwitiya', 'shukla', 'Brahma', 'bhadra', true),
  (3, 'Tritiya', 'shukla', 'Gauri', 'jaya', true),
  (4, 'Chaturthi', 'shukla', 'Ganesha', 'rikta', false),
  (5, 'Panchami', 'shukla', 'Nagas', 'purna', true),
  (6, 'Shashthi', 'shukla', 'Kartikeya', 'nanda', true),
  (7, 'Saptami', 'shukla', 'Surya', 'bhadra', true),
  (8, 'Ashtami', 'shukla', 'Shiva/Rudra', 'jaya', true),
  (9, 'Navami', 'shukla', 'Durga', 'rikta', false),
  (10, 'Dashami', 'shukla', 'Yama', 'purna', true),
  (11, 'Ekadashi', 'shukla', 'Vishvadevas', 'nanda', true),
  (12, 'Dwadashi', 'shukla', 'Vishnu', 'bhadra', true),
  (13, 'Trayodashi', 'shukla', 'Kamadeva', 'jaya', true),
  (14, 'Chaturdashi', 'shukla', 'Shiva', 'rikta', false),
  (15, 'Purnima', 'shukla', 'Chandra', 'purna', true),
  (16, 'Pratipada', 'krishna', 'Agni', 'nanda', true),
  (17, 'Dwitiya', 'krishna', 'Brahma', 'bhadra', true),
  (18, 'Tritiya', 'krishna', 'Gauri', 'jaya', true),
  (19, 'Chaturthi', 'krishna', 'Ganesha', 'rikta', false),
  (20, 'Panchami', 'krishna', 'Nagas', 'purna', true),
  (21, 'Shashthi', 'krishna', 'Kartikeya', 'nanda', true),
  (22, 'Saptami', 'krishna', 'Surya', 'bhadra', true),
  (23, 'Ashtami', 'krishna', 'Shiva/Rudra', 'jaya', true),
  (24, 'Navami', 'krishna', 'Durga', 'rikta', false),
  (25, 'Dashami', 'krishna', 'Yama', 'purna', true),
  (26, 'Ekadashi', 'krishna', 'Vishvadevas', 'nanda', true),
  (27, 'Dwadashi', 'krishna', 'Vishnu', 'bhadra', true),
  (28, 'Trayodashi', 'krishna', 'Kamadeva', 'jaya', true),
  (29, 'Chaturdashi', 'krishna', 'Shiva', 'rikta', false),
  (30, 'Amavasya', 'krishna', 'Chandra', 'purna', true)
on conflict (id) do nothing;

create table if not exists public.panchang_yogas (
  id smallint primary key, name_sa text, nature text
);
alter table public.panchang_yogas enable row level security;
drop policy if exists "panchang_yogas read" on public.panchang_yogas;
create policy "panchang_yogas read" on public.panchang_yogas for select to anon, authenticated using (true);
insert into public.panchang_yogas (id, name_sa, nature) values
  (0, 'Vishkambha', 'auspicious'),
  (1, 'Priti', 'auspicious'),
  (2, 'Ayushman', 'auspicious'),
  (3, 'Saubhagya', 'auspicious'),
  (4, 'Shobhana', 'auspicious'),
  (5, 'Atiganda', 'inauspicious'),
  (6, 'Sukarma', 'auspicious'),
  (7, 'Dhriti', 'auspicious'),
  (8, 'Shula', 'inauspicious'),
  (9, 'Ganda', 'inauspicious'),
  (10, 'Vriddhi', 'auspicious'),
  (11, 'Dhruva', 'auspicious'),
  (12, 'Vyaghata', 'inauspicious'),
  (13, 'Harshana', 'auspicious'),
  (14, 'Vajra', 'inauspicious'),
  (15, 'Siddhi', 'auspicious'),
  (16, 'Vyatipata', 'inauspicious'),
  (17, 'Variyana', 'auspicious'),
  (18, 'Parigha', 'inauspicious'),
  (19, 'Shiva', 'auspicious'),
  (20, 'Siddha', 'auspicious'),
  (21, 'Sadhya', 'auspicious'),
  (22, 'Shubha', 'auspicious'),
  (23, 'Shukla', 'auspicious'),
  (24, 'Brahma', 'auspicious'),
  (25, 'Indra', 'auspicious'),
  (26, 'Vaidhriti', 'inauspicious')
on conflict (id) do nothing;

create table if not exists public.karanas (
  id smallint primary key, name_sa text, kind text, is_vishti bool, nature text
);
alter table public.karanas enable row level security;
drop policy if exists "karanas read" on public.karanas;
create policy "karanas read" on public.karanas for select to anon, authenticated using (true);
insert into public.karanas (id, name_sa, kind, is_vishti, nature) values
  (0, 'Bava', 'movable', false, 'auspicious'),
  (1, 'Balava', 'movable', false, 'auspicious'),
  (2, 'Kaulava', 'movable', false, 'auspicious'),
  (3, 'Taitila', 'movable', false, 'auspicious'),
  (4, 'Garaja', 'movable', false, 'auspicious'),
  (5, 'Vanija', 'movable', false, 'auspicious'),
  (6, 'Vishti', 'movable', true, 'inauspicious'),
  (7, 'Shakuni', 'fixed', false, 'auspicious'),
  (8, 'Chatushpada', 'fixed', false, 'auspicious'),
  (9, 'Naga', 'fixed', false, 'auspicious'),
  (10, 'Kimstughna', 'fixed', false, 'auspicious')
on conflict (id) do nothing;

create table if not exists public.vaaras (
  id smallint primary key, name_en text, name_sa text, name_hi text, lord_graha_id text, rahu_kaal_part smallint, gulika_part smallint, yamaganda_part smallint, hora_start_graha_id text, durmuhurta_day smallint[], durmuhurta_night smallint[], chog_day_start smallint, chog_night_start smallint
);
alter table public.vaaras enable row level security;
drop policy if exists "vaaras read" on public.vaaras;
create policy "vaaras read" on public.vaaras for select to anon, authenticated using (true);
insert into public.vaaras (id, name_en, name_sa, name_hi, lord_graha_id, rahu_kaal_part, gulika_part, yamaganda_part, hora_start_graha_id, durmuhurta_day, durmuhurta_night, chog_day_start, chog_night_start) values
  (0, 'Sunday', 'Ravivara', 'रविवार', 'sun', 8, 7, 5, 'sun', ARRAY[14]::smallint[], ARRAY[]::smallint[], 0, 5),
  (1, 'Monday', 'Somavara', 'सोमवार', 'moon', 2, 6, 4, 'moon', ARRAY[9,12]::smallint[], ARRAY[]::smallint[], 3, 1),
  (2, 'Tuesday', 'Mangalavara', 'मंगलवार', 'mars', 7, 5, 3, 'mars', ARRAY[4]::smallint[], ARRAY[8]::smallint[], 6, 4),
  (3, 'Wednesday', 'Budhavara', 'बुधवार', 'mercury', 5, 4, 2, 'mercury', ARRAY[8]::smallint[], ARRAY[]::smallint[], 2, 0),
  (4, 'Thursday', 'Guruvara', 'गुरुवार', 'jupiter', 6, 3, 1, 'jupiter', ARRAY[6,12]::smallint[], ARRAY[]::smallint[], 5, 3),
  (5, 'Friday', 'Shukravara', 'शुक्रवार', 'venus', 4, 2, 7, 'venus', ARRAY[4,12]::smallint[], ARRAY[]::smallint[], 1, 6),
  (6, 'Saturday', 'Shanivara', 'शनिवार', 'saturn', 3, 1, 6, 'saturn', ARRAY[1,2]::smallint[], ARRAY[]::smallint[], 4, 2)
on conflict (id) do nothing;

create table if not exists public.hindu_months (
  id smallint primary key, name_amanta text, name_purnimanta text, name_sa text, solar_name text, ritu_vedic text, sort_order int
);
alter table public.hindu_months enable row level security;
drop policy if exists "hindu_months read" on public.hindu_months;
create policy "hindu_months read" on public.hindu_months for select to anon, authenticated using (true);
insert into public.hindu_months (id, name_amanta, name_purnimanta, name_sa, solar_name, ritu_vedic, sort_order) values
  (1, 'Chaitra', 'Chaitra', 'चैत्र', 'Mesha', 'Vasanta', 1),
  (2, 'Vaishakha', 'Vaishakha', 'वैशाख', 'Vrishabha', 'Vasanta', 2),
  (3, 'Jyeshtha', 'Jyeshtha', 'ज्येष्ठ', 'Mithuna', 'Grishma', 3),
  (4, 'Ashadha', 'Ashadha', 'आषाढ़', 'Karka', 'Grishma', 4),
  (5, 'Shravana', 'Shravana', 'श्रावण', 'Simha', 'Varsha', 5),
  (6, 'Bhadrapada', 'Bhadrapada', 'भाद्रपद', 'Kanya', 'Varsha', 6),
  (7, 'Ashwina', 'Ashwina', 'आश्विन', 'Tula', 'Sharad', 7),
  (8, 'Kartika', 'Kartika', 'कार्तिक', 'Vrishchika', 'Sharad', 8),
  (9, 'Margashirsha', 'Margashirsha', 'मार्गशीर्ष', 'Dhanu', 'Hemanta', 9),
  (10, 'Pausha', 'Pausha', 'पौष', 'Makara', 'Hemanta', 10),
  (11, 'Magha', 'Magha', 'माघ', 'Kumbha', 'Shishira', 11),
  (12, 'Phalguna', 'Phalguna', 'फाल्गुन', 'Meena', 'Shishira', 12)
on conflict (id) do nothing;

create table if not exists public.samvatsaras (
  id smallint primary key, name_sa text
);
alter table public.samvatsaras enable row level security;
drop policy if exists "samvatsaras read" on public.samvatsaras;
create policy "samvatsaras read" on public.samvatsaras for select to anon, authenticated using (true);
insert into public.samvatsaras (id, name_sa) values
  (1, 'Prabhava'),
  (2, 'Vibhava'),
  (3, 'Shukla'),
  (4, 'Pramoda'),
  (5, 'Prajapati'),
  (6, 'Angirasa'),
  (7, 'Shrimukha'),
  (8, 'Bhava'),
  (9, 'Yuva'),
  (10, 'Dhata'),
  (11, 'Ishvara'),
  (12, 'Bahudhanya'),
  (13, 'Pramathi'),
  (14, 'Vikrama'),
  (15, 'Vrisha'),
  (16, 'Chitrabhanu'),
  (17, 'Subhanu'),
  (18, 'Tarana'),
  (19, 'Parthiva'),
  (20, 'Vyaya'),
  (21, 'Sarvajit'),
  (22, 'Sarvadhari'),
  (23, 'Virodhi'),
  (24, 'Vikriti'),
  (25, 'Khara'),
  (26, 'Nandana'),
  (27, 'Vijaya'),
  (28, 'Jaya'),
  (29, 'Manmatha'),
  (30, 'Durmukha'),
  (31, 'Hevilambi'),
  (32, 'Vilambi'),
  (33, 'Vikari'),
  (34, 'Sharvari'),
  (35, 'Plava'),
  (36, 'Shubhakritu'),
  (37, 'Shobhakritu'),
  (38, 'Krodhi'),
  (39, 'Vishvavasu'),
  (40, 'Parabhava'),
  (41, 'Plavanga'),
  (42, 'Kilaka'),
  (43, 'Saumya'),
  (44, 'Sadharana'),
  (45, 'Virodhikritu'),
  (46, 'Paridhavi'),
  (47, 'Pramadi'),
  (48, 'Ananda'),
  (49, 'Rakshasa'),
  (50, 'Nala'),
  (51, 'Pingala'),
  (52, 'Kalayukti'),
  (53, 'Siddharthi'),
  (54, 'Raudra'),
  (55, 'Durmati'),
  (56, 'Dundubhi'),
  (57, 'Rudhirodgari'),
  (58, 'Raktakshi'),
  (59, 'Krodhana'),
  (60, 'Akshaya')
on conflict (id) do nothing;

