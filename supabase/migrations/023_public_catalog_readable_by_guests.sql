-- The catalogue is content, not an account feature.
--
-- Every "catalog read" policy was granted to `authenticated` only, and its
-- predicate is_email_allowed() ends in `auth.uid() is not null` under the open
-- access mode. A signed-out visitor therefore read zero rows from all of it.
-- The screens hid the damage: lib/catalog.ts falls back to the constants
-- bundled at build time when a table comes back empty, so a guest quietly got
-- last year's pujas and temples, while the library and the festival calendar --
-- which have no bundled fallback -- rendered completely empty.
--
-- That is precisely what App Store guideline 5.1.1(v) prohibits: an account may
-- not be the price of admission to content that is not account based. These
-- fourteen tables carry no personal data -- festival dates, article text,
-- mantras, temple streams, name syllables, vastu zones -- so they are readable
-- by anyone, signed in or not.
--
-- Nothing here grants writes. Inserts and updates continue to arrive through
-- the service role, which bypasses RLS entirely.

do $$
declare t text;
begin
  foreach t in array array[
    'astrologers', 'baby_names', 'chadhava_items', 'daily_horoscopes',
    'deities', 'festivals', 'library_articles', 'mantras',
    'nakshatra_syllables', 'pujas', 'shlokas', 'temple_streams',
    'temples', 'vastu_zones'
  ] loop
    -- skip anything not present on this project rather than fail the migration
    if to_regclass('public.' || t) is null then
      continue;
    end if;

    execute format('drop policy if exists %I on public.%I', 'catalog read', t);
    execute format('drop policy if exists %I on public.%I', 'catalog public read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      'catalog public read', t
    );
  end loop;
end $$;
