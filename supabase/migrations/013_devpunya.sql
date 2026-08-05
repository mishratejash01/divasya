-- ============================================================================
--  DIVASYA migration 013 — DevPunya puja & chadhawa bookings
--  Two tables carry the whole integration:
--    · devpunya_users     our user ↔ their user (phone identity + JWT).
--                         Holds the DevPunya session token, so NO client
--                         policies exist at all — service role only.
--    · devpunya_bookings  one row per booking, written BEFORE any money moves
--                         and never deleted, so a paid ritual can never be
--                         unrecorded. Users may read their own rows (no
--                         secrets live here); all writes go through the server.
--  payment_status is ours (created → paid/failed/refunded, set by Razorpay
--  verify + webhook). ritual_status is theirs (pending → timing_shared →
--  started → conducted → delivered), copied down when we poll their API.
-- ============================================================================

create table if not exists public.devpunya_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  dp_user_id  text,
  phone       text not null,
  isd_code    text not null default '+91',
  fullname    text,
  token       text,
  token_at    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.devpunya_users enable row level security;
-- no policies on purpose: the token column must never reach a browser.

create table if not exists public.devpunya_bookings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  order_no         text not null unique,
  kind             text not null check (kind in ('puja','chadhawa')),
  dp_order_id      text,
  dp_reference_id  text,
  product_id       int  not null,
  product_name     text not null,
  package_id       int  not null,
  package_name     text,
  addon_ids        jsonb not null default '[]',
  amount           numeric not null check (amount > 0),
  currency         text not null default 'INR',
  sankalp          jsonb not null default '[]',
  devotee_name     text,
  wish             text,
  phone            text not null,
  payment_status   text not null default 'created'
                   check (payment_status in ('created','paid','failed','refunded')),
  ritual_status    text,
  -- true once DevPunya has accepted transaction_status=paid; until then the
  -- webhook and the refresh route keep retrying, so a paid booking can never
  -- silently miss its confirmation on their side.
  dp_paid_notified boolean not null default false,
  rzp_order_id     text,
  rzp_payment_id   text,
  paid_at          timestamptz,
  starting_at      timestamptz,
  mandir_name      text,
  image            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists devpunya_bookings_user_idx
  on public.devpunya_bookings (user_id, created_at desc);
create index if not exists devpunya_bookings_rzp_idx
  on public.devpunya_bookings (rzp_order_id);

alter table public.devpunya_bookings enable row level security;
drop policy if exists "own bookings read" on public.devpunya_bookings;
create policy "own bookings read" on public.devpunya_bookings
  for select to authenticated using (auth.uid() = user_id);
-- inserts/updates: service role only (no policies for authenticated).
