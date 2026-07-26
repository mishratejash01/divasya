-- ============================================================
-- Divasya · Migration 005 — Commerce (catalog, cart, orders, payments)
-- Everything data-driven: products, categories, shipping rules and copy all
-- live here, never in app code.
-- ============================================================

-- ---------- catalog ----------
create table if not exists public.product_categories (
  id text primary key, name text not null, slug text unique not null,
  blurb text, sort int default 0, is_active bool default true
);
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  subtitle text,
  description text,
  category_id text references public.product_categories(id),
  price int not null,                 -- paise-free: whole rupees
  mrp int,
  currency text default 'INR',
  images text[] default '{}',
  badges text[] default '{}',
  is_digital bool default false,
  requires_shipping bool default true,
  stock int default 100,
  sku text,
  is_bestseller bool default false,
  is_active bool default true,
  sort int default 0,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists products_category_idx on public.products(category_id) where is_active;

-- ---------- buying ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, phone text not null,
  line1 text not null, line2 text, city text not null, state text not null,
  pincode text not null, country text default 'India',
  is_default bool default false, created_at timestamptz default now()
);
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  updated_at timestamptz default now()
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id),
  qty int not null default 1 check (qty > 0),
  added_at timestamptz default now(),
  unique (cart_id, product_id)
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',          -- pending|paid|packed|shipped|delivered|cancelled|refunded
  payment_status text not null default 'unpaid',   -- unpaid|paid|failed|refunded
  subtotal int not null, discount int default 0, shipping_fee int default 0,
  tax int default 0, total int not null, currency text default 'INR',
  coupon_code text,
  address jsonb,                                   -- snapshot at purchase
  email text, phone text, note text,
  rzp_order_id text, rzp_payment_id text,
  placed_at timestamptz default now(), paid_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id),
  name text not null, price int not null, qty int not null, total int not null,
  is_digital bool default false, image text
);
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  provider text default 'razorpay',
  provider_order_id text, provider_payment_id text,
  amount int not null, status text not null, method text,
  raw jsonb, created_at timestamptz default now()
);
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  courier text, awb text, status text default 'pending',
  tracking_url text, shipped_at timestamptz, delivered_at timestamptz
);
create table if not exists public.coupons (
  code text primary key, kind text not null default 'percent',  -- percent|flat
  value int not null, min_order int default 0,
  max_uses int, used int default 0,
  valid_from timestamptz, valid_to timestamptz, is_active bool default true
);
create table if not exists public.webhook_events (
  id text primary key, provider text default 'razorpay',
  event_type text, payload jsonb, processed_at timestamptz default now()
);
create table if not exists public.shop_config (
  key text primary key, value jsonb not null
);

-- ---------- RLS ----------
alter table public.product_categories enable row level security;
alter table public.products           enable row level security;
alter table public.shop_config        enable row level security;
alter table public.coupons            enable row level security;
alter table public.addresses          enable row level security;
alter table public.carts              enable row level security;
alter table public.cart_items         enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.payments           enable row level security;
alter table public.shipments          enable row level security;
alter table public.webhook_events     enable row level security;

drop policy if exists "categories read" on public.product_categories;
create policy "categories read" on public.product_categories for select to anon, authenticated using (is_active);
drop policy if exists "products read" on public.products;
create policy "products read" on public.products for select to anon, authenticated using (is_active);
drop policy if exists "shop config read" on public.shop_config;
create policy "shop config read" on public.shop_config for select to anon, authenticated using (true);
drop policy if exists "coupons read" on public.coupons;
create policy "coupons read" on public.coupons for select to anon, authenticated using (is_active);

drop policy if exists "own addresses" on public.addresses;
create policy "own addresses" on public.addresses for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own cart" on public.carts;
create policy "own cart" on public.carts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "own cart items" on public.cart_items;
create policy "own cart items" on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));
drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
drop policy if exists "own order items" on public.order_items;
create policy "own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "own shipments" on public.shipments;
create policy "own shipments" on public.shipments for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
-- payments + webhook_events: service-role only (no policy = no client access)

insert into public.product_categories (id,name,slug,blurb,sort) values
  ('rudraksha','Rudraksha','rudraksha','Certified beads, 1 to 14 mukhi',1),
  ('rashi','Rashi Bracelets','rashi','One for each of the twelve rashis',2),
  ('mulank','Mulank Bracelets','mulank','Chosen by your birth number',3),
  ('bracelets','Bracelets','bracelets','Pyrite and money magnet',4),
  ('malas','Malas','malas','For japa and for wearing',5),
  ('anklets','Anklets','anklets','Worn at the ankle',6),
  ('studio','Divasya Studio','studio','Cards, charts and wallpapers',7)
on conflict (id) do nothing;

insert into public.products (id,slug,name,subtitle,category_id,price,mrp,badges,is_bestseller,is_digital,requires_shipping,sort) values
  ('rud-1-mukhi','rud-1-mukhi','1 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',4999,12999,ARRAY['With Certification']::text[],false,false,true,1),
  ('rud-2-mukhi','rud-2-mukhi','2 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',799,1999,ARRAY['Govt Lab Certified']::text[],false,false,true,2),
  ('rud-3-mukhi','rud-3-mukhi','3 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',799,1899,ARRAY['Govt Lab Certified']::text[],false,false,true,3),
  ('rud-4-mukhi','rud-4-mukhi','4 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',799,1899,ARRAY['Govt Lab Certified']::text[],false,false,true,4),
  ('rud-5-mukhi','rud-5-mukhi','5 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',799,1899,ARRAY['Govt Lab Certified']::text[],true,false,true,5),
  ('rud-6-mukhi','rud-6-mukhi','6 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',799,1899,ARRAY['Govt Lab Certified']::text[],false,false,true,6),
  ('rud-7-mukhi','rud-7-mukhi','7 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',999,2499,ARRAY['Govt Lab Certified']::text[],false,false,true,7),
  ('rud-8-mukhi','rud-8-mukhi','8 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',3499,4999,ARRAY['Govt Lab Certified']::text[],false,false,true,8),
  ('rud-9-mukhi','rud-9-mukhi','9 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',3999,7999,ARRAY['Govt Lab Certified']::text[],false,false,true,9),
  ('rud-10-mukhi','rud-10-mukhi','10 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',4299,7999,ARRAY['Govt Lab Certified']::text[],false,false,true,10),
  ('rud-11-mukhi','rud-11-mukhi','11 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',4999,7999,ARRAY['Govt Lab Certified']::text[],false,false,true,11),
  ('rud-12-mukhi','rud-12-mukhi','12 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',5999,9999,ARRAY['Govt Lab Certified']::text[],false,false,true,12),
  ('rud-13-mukhi','rud-13-mukhi','13 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',7999,9999,ARRAY['Govt Lab Certified']::text[],false,false,true,13),
  ('rud-14-mukhi','rud-14-mukhi','14 Mukhi Rudraksha','Original Nepali bead, lab tested','rudraksha',18999,37999,ARRAY['Govt Lab Certified']::text[],false,false,true,14),
  ('rashi-mesha','rashi-mesha','Aries (Mesha) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,1),
  ('rashi-vrishabh','rashi-vrishabh','Taurus (Vrishabh) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,2),
  ('rashi-mithun','rashi-mithun','Gemini (Mithun) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,3),
  ('rashi-karka','rashi-karka','Cancer (Karka) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,4),
  ('rashi-simha','rashi-simha','Leo (Simha) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,5),
  ('rashi-kanya','rashi-kanya','Virgo (Kanya) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,6),
  ('rashi-tula','rashi-tula','Libra (Tula) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,7),
  ('rashi-vrishchik','rashi-vrishchik','Scorpio (Vrishchik) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,8),
  ('rashi-dhanu','rashi-dhanu','Sagittarius (Dhanu) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,9),
  ('rashi-makar','rashi-makar','Capricorn (Makar) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,10),
  ('rashi-kumbh','rashi-kumbh','Aquarius (Kumbh) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,11),
  ('rashi-meen','rashi-meen','Pisces (Meen) Crystal Bracelet','Stones chosen for your rashi','rashi',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,12),
  ('mulank-1','mulank-1','Mulank 1 Crystal Bracelet','For those born under number 1','mulank',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,1),
  ('mulank-2','mulank-2','Mulank 2 Crystal Bracelet','For those born under number 2','mulank',899,1499,ARRAY['Govt Lab Certified']::text[],true,false,true,2),
  ('mulank-3','mulank-3','Mulank 3 Crystal Bracelet','For those born under number 3','mulank',899,1499,ARRAY['Govt Lab Certified']::text[],true,false,true,3),
  ('mulank-4','mulank-4','Mulank 4 Crystal Bracelet','For those born under number 4','mulank',899,1599,ARRAY['Govt Lab Certified']::text[],true,false,true,4),
  ('mulank-5','mulank-5','Mulank 5 Crystal Bracelet','For those born under number 5','mulank',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,5),
  ('mulank-6','mulank-6','Mulank 6 Crystal Bracelet','For those born under number 6','mulank',899,1599,ARRAY['Govt Lab Certified']::text[],true,false,true,6),
  ('mulank-7','mulank-7','Mulank 7 Crystal Bracelet','For those born under number 7','mulank',899,1799,ARRAY['Govt Lab Certified']::text[],true,false,true,7),
  ('mulank-8','mulank-8','Mulank 8 Crystal Bracelet','For those born under number 8','mulank',899,1799,ARRAY['Govt Lab Certified']::text[],true,false,true,8),
  ('mulank-9','mulank-9','Mulank 9 Crystal Bracelet','For those born under number 9','mulank',899,1699,ARRAY['Govt Lab Certified']::text[],true,false,true,9),
  ('money-magnet-bracelet','money-magnet-bracelet','Money Magnet Crystal Bracelet','Worn for wealth and flow','bracelets',899,1799,ARRAY['Govt Lab Certified']::text[],true,false,true,1),
  ('fancy-raw-pyrite-bracelet','fancy-raw-pyrite-bracelet','Fancy Raw Pyrite Bracelet','Raw pyrite, uncut','bracelets',1299,2499,ARRAY['100% Original with Certificate']::text[],false,false,true,2),
  ('pyrite-bracelet','pyrite-bracelet','Pyrite Bracelet','Polished pyrite beads','bracelets',799,1699,ARRAY['100% Original with Certificate']::text[],false,false,true,3),
  ('pyrite-anklet','pyrite-anklet','Pyrite Anklet','Worn at the ankle, in a pair','anklets',749,1499,ARRAY['100% Original with Certificate']::text[],false,false,true,1),
  ('karungali-mala-8mm','karungali-mala-8mm','Karungali Mala 8mm','Ebony wood, 108 beads','malas',899,1499,'{}'::text[],false,false,true,1),
  ('rudraksha-mala','rudraksha-mala','Rudraksha Mala','108 beads for japa','malas',899,1999,'{}'::text[],false,false,true,2),
  ('manifestation-cards','manifestation-cards','Manifestation Cards','Hand illustrated 49 card deck','studio',1499,null,'{}'::text[],false,false,true,1),
  ('kundali-card','kundali-card','Kundali Card','Your birth chart, cast and printed','studio',199,null,'{}'::text[],false,true,false,2),
  ('sacred-wallpapers','sacred-wallpapers','Wallpapers · Health & Finance','A set of three for your phone','studio',299,null,'{}'::text[],false,true,false,3)
on conflict (id) do nothing;

insert into public.shop_config (key,value) values
  ('shipping','{"flat_fee":79,"free_above":999,"cod_enabled":false}'::jsonb),
  ('store','{"name":"Divasya Store","currency":"INR","ships_to":"India","support_email":"","support_phone":""}'::jsonb),
  ('copy','{"tagline":"Sacred objects, handmade and posted with care.","shipping_note":"Ships across India in 3 to 6 days."}'::jsonb)
on conflict (key) do nothing;
