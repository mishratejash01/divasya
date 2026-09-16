-- The wallet's one race: two checkouts debiting the same balance at the same
-- instant could each read the old sum and overdraw. This guard closes it at
-- the only layer races cannot cheat. Every debit first takes a per-user
-- advisory lock (serializing that user's ledger writes for the transaction),
-- then re-sums the ledger and refuses any debit that would go below zero.
-- Credits (top-ups, releases, refunds) pass straight through.

create or replace function wallet_guard_non_negative()
returns trigger
language plpgsql
security definer
as $$
declare
  bal numeric;
begin
  if new.amount >= 0 then
    return new;
  end if;
  perform pg_advisory_xact_lock(hashtext('wallet:' || new.user_id::text));
  select coalesce(sum(amount), 0) into bal
    from wallet_ledger where user_id = new.user_id;
  if bal + new.amount < 0 then
    raise exception 'wallet_insufficient: balance % cannot cover %', bal, -new.amount;
  end if;
  return new;
end;
$$;

drop trigger if exists wallet_non_negative on wallet_ledger;
create trigger wallet_non_negative
  before insert on wallet_ledger
  for each row execute function wallet_guard_non_negative();
