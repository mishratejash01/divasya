-- Library artwork becomes backend content. Every article row points at a
-- real photograph (Wikimedia Commons / Unsplash, credited in
-- public/library/CREDITS.md) shipped with the app under /library/<id>.jpg.
-- The image column holds a path or a full URL; the client renders whatever
-- is here, so swapping artwork is a database update, not a release.

alter table library_articles add column if not exists image text;

update library_articles set image = '/library/' || id || '.jpg'
where id in (
  'l1','l2','l3','l4','l5','l6',
  'prc-puja','prc-japa','prc-surya',
  'dei-krishna','dei-shiva','dei-durga','dei-ganesha',
  'dei-lakshmi','dei-ram','dei-hanuman','dei-saraswati',
  'wis-dharma','wis-yugas','wis-moksha','wis-gunas','wis-yoga-paths',
  'fes-diwali','fes-holi','fes-navratri','fes-janmashtami','fes-shivratri','fes-ganesh',
  'jyo-kundli','jyo-grahas','jyo-houses','jyo-nakshatras','jyo-dasha','jyo-rashi'
);
