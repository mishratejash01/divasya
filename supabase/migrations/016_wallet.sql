-- ============================================================================
--  DIVASYA migration 016 — the real Divasya Wallet
--  Money is a LEDGER, not a number: wallet_ledger is append-only, written only
--  by the server, and the balance is always the sum of entries. Every entry
--  carries a unique ref so no credit or debit can ever apply twice. Top-ups
--  follow the store's discipline — a row exists before any money moves, and
--  Razorpay's verify + webhook both settle idempotently.
--
--  Closed loop by design: balance is spendable inside Divasya (store orders,
--  puja bookings) and never withdrawable, which is what keeps a merchant
--  wallet outside RBI PPI licensing.
--
--  The old user_state.wallet field was client-writable demo data and is
--  ignored from here on — no value in it was ever paid for.
-- ============================================================================

create table if not exists public.wallet_ledger (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     int  not null,                    -- rupees; positive credit, negative debit
  kind       text not null check (kind in ('topup','spend','release','refund','adjust')),
  note       text,
  ref        text unique,                      -- idempotency: topup:<id> / spend:<order_no> / release:<order_no>
  order_no   text,                             -- the store order or booking this entry belongs to
  created_at timestamptz not null default now()
);
create index if not exists wallet_ledger_user_idx on public.wallet_ledger (user_id, created_at desc);
create index if not exists wallet_ledger_order_idx on public.wallet_ledger (order_no);

alter table public.wallet_ledger enable row level security;
drop policy if exists "own ledger read" on public.wallet_ledger;
create policy "own ledger read" on public.wallet_ledger
  for select to authenticated using (auth.uid() = user_id);
-- writes: service role only, no client policies.

create table if not exists public.wallet_topups (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  order_no       text not null unique,
  amount         int  not null check (amount > 0),
  status         text not null default 'created' check (status in ('created','paid','failed')),
  rzp_order_id   text,
  rzp_payment_id text,
  paid_at        timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists wallet_topups_user_idx on public.wallet_topups (user_id, created_at desc);
create index if not exists wallet_topups_rzp_idx on public.wallet_topups (rzp_order_id);

alter table public.wallet_topups enable row level security;
drop policy if exists "own topups read" on public.wallet_topups;
create policy "own topups read" on public.wallet_topups
  for select to authenticated using (auth.uid() = user_id);

-- how much of an order/booking was paid from the wallet
alter table public.orders            add column if not exists wallet_applied int not null default 0;
alter table public.devpunya_bookings add column if not exists wallet_applied int not null default 0;
