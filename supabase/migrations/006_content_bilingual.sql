-- ============================================================================
--  DIVASYA migration 006 — bilingual content + library shelves
--  Adds Hindi (हिं) companion columns to the content tables so every screen can
--  render in English or Hindi, and a category on library articles so the
--  Spiritual Library reads as organised shelves rather than one long grid.
--  All additive and idempotent — safe to re-run. Seeds land in 007+.
-- ============================================================================

-- library: Hindi title/sub/body + a shelf to group by
alter table public.library_articles add column if not exists title_hi   text;
alter table public.library_articles add column if not exists sub_hi     text;
alter table public.library_articles add column if not exists content_hi text;
alter table public.library_articles add column if not exists category   text default 'wisdom';

-- festivals: Hindi name/about/muhurat + Hindi samagri & vidhi lists
alter table public.festivals add column if not exists name_hi    text;
alter table public.festivals add column if not exists about_hi   text;
alter table public.festivals add column if not exists muhurat_hi text;
alter table public.festivals add column if not exists samagri_hi jsonb default '[]';
alter table public.festivals add column if not exists vidhi_hi   jsonb default '[]';

-- shloka: Hindi meaning alongside the English one
alter table public.shlokas add column if not exists meaning_hi text;

-- vastu: Hindi zone name / use / tip
alter table public.vastu_zones add column if not exists zone_hi    text;
alter table public.vastu_zones add column if not exists use_for_hi text;
alter table public.vastu_zones add column if not exists tip_hi     text;

-- deity: Hindi tagline (persona stays English — it is the AI system prompt)
alter table public.deities add column if not exists tagline_hi text;

-- naamkaran: Devanagari name + Hindi deity/planet + Devanagari pada syllables
-- (the app's catalog loader already reads these column names)
alter table public.nakshatra_syllables add column if not exists deva          text;
alter table public.nakshatra_syllables add column if not exists deity_hi      text;
alter table public.nakshatra_syllables add column if not exists planet_hi     text;
alter table public.nakshatra_syllables add column if not exists syllables_deva text[];

-- baby names: Hindi meaning + Devanagari spelling (loader reads meaning_hi, deva)
alter table public.baby_names add column if not exists meaning_hi text;
alter table public.baby_names add column if not exists deva       text;
