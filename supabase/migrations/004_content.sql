-- ============================================================
-- Divasya · Migration 004 — Stage 10 content: remedies + dasha-lord profiles
-- Grounded remedy + timing content the AI Jyotishi cites.
-- ============================================================

create table if not exists public.remedies (
  graha_id text primary key,
  mantra text, beej_mantra text, gemstone text, metal text,
  donation text, weekday text, deity text, remedy_note text
);
alter table public.remedies enable row level security;
drop policy if exists "remedies read" on public.remedies;
create policy "remedies read" on public.remedies for select to anon, authenticated using (true);

insert into public.remedies (graha_id, mantra, beej_mantra, gemstone, metal, donation, weekday, deity, remedy_note) values
 ('sun','Om Suryaya Namah','Om Hraam Hreem Hraum Sah Suryaya Namah','Ruby','copper/gold','wheat, jaggery, copper','Sunday','Surya','Offer arghya (water) to the Sun at sunrise; recite Aditya Hridaya Stotra.'),
 ('moon','Om Chandraya Namah','Om Shraam Shreem Shraum Sah Chandraya Namah','Pearl','silver','rice, milk, white cloth','Monday','Shiva','Offer milk on a Shiva lingam on Mondays; keep water by the bedside.'),
 ('mars','Om Angarakaya Namah','Om Kraam Kreem Kraum Sah Bhaumaya Namah','Red Coral','copper','red lentils, jaggery, red cloth','Tuesday','Hanuman','Recite Hanuman Chalisa; donate to those in physical labour.'),
 ('mercury','Om Budhaya Namah','Om Braam Breem Braum Sah Budhaya Namah','Emerald','bronze','green gram, green cloth, books','Wednesday','Vishnu','Feed green fodder to a cow; help a student with education.'),
 ('jupiter','Om Brihaspataye Namah','Om Graam Greem Graum Sah Gurave Namah','Yellow Sapphire','gold','turmeric, chana dal, yellow cloth','Thursday','Brihaspati','Serve teachers and elders; apply a saffron/turmeric tilak.'),
 ('venus','Om Shukraya Namah','Om Draam Dreem Draum Sah Shukraya Namah','Diamond/Opal','silver','white sweets, sugar, white cloth','Friday','Lakshmi','Honour women in the family; offer white flowers to the Goddess.'),
 ('saturn','Om Shanaischaraya Namah','Om Praam Preem Praum Sah Shanaye Namah','Blue Sapphire','iron','black sesame, mustard oil, black cloth','Saturday','Shani/Hanuman','Light a mustard-oil lamp under a Peepal tree; serve the poor and workers.'),
 ('rahu','Om Rahave Namah','Om Bhraam Bhreem Bhraum Sah Rahave Namah','Hessonite (Gomed)','lead/mixed','blanket, black gram, mustard oil','Saturday','Durga','Recite Durga Saptashati; avoid shortcuts and deceit during Rahu periods.'),
 ('ketu','Om Ketave Namah','Om Sraam Sreem Sraum Sah Ketave Namah','Cat''s Eye','lead/mixed','multi-coloured blanket, sesame','Tuesday','Ganesha','Worship Lord Ganesha; feed street dogs; pursue spiritual practice.')
on conflict (graha_id) do nothing;

create table if not exists public.dasha_lord_profiles (
  graha_id text primary key,
  themes text, favorable_for text[], caution_for text[]
);
alter table public.dasha_lord_profiles enable row level security;
drop policy if exists "dasha_lord_profiles read" on public.dasha_lord_profiles;
create policy "dasha_lord_profiles read" on public.dasha_lord_profiles for select to anon, authenticated using (true);

insert into public.dasha_lord_profiles (graha_id, themes, favorable_for, caution_for) values
 ('sun','Authority, recognition, health, father, government and leadership.', ARRAY['career rise','government work','self-confidence','fame'], ARRAY['ego clashes','issues with father/boss','bone/eye health']),
 ('moon','Mind, emotions, mother, public life, travel and nurturing.', ARRAY['emotional growth','public dealings','property','domestic comfort'], ARRAY['mood swings','over-sensitivity','mother''s health']),
 ('mars','Energy, courage, property, siblings, competition and drive.', ARRAY['property/land','athletics','bold initiatives','engineering/army'], ARRAY['anger','accidents','conflicts','blood-related health']),
 ('mercury','Intellect, communication, business, education and skill.', ARRAY['business','writing/speaking','study','trade & analytics'], ARRAY['over-thinking','nervous strain','miscommunication']),
 ('jupiter','Wisdom, wealth, children, fortune, teaching and dharma.', ARRAY['marriage','children','higher study','wealth & fortune','spiritual growth'], ARRAY['over-optimism','weight/liver','complacency']),
 ('venus','Love, marriage, luxury, arts, vehicles and relationships.', ARRAY['marriage & romance','arts & beauty','luxury & comfort','vehicles'], ARRAY['indulgence','relationship drama','reproductive health']),
 ('saturn','Discipline, hard work, career, delays, longevity and karma.', ARRAY['steady long-term career','discipline & structure','service to others','real estate'], ARRAY['delays & setbacks','melancholy','joint/teeth health','overwork']),
 ('rahu','Ambition, foreign lands, sudden gains, technology and obsession.', ARRAY['foreign opportunities','unconventional success','technology','sudden rise'], ARRAY['illusions & shortcuts','anxiety','deception','addictions']),
 ('ketu','Detachment, spirituality, research, past-life and moksha.', ARRAY['spiritual practice','research & mysticism','healing','liberation'], ARRAY['sudden losses','confusion','isolation','sudden endings'])
on conflict (graha_id) do nothing;
