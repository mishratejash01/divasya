// ============================================================================
//  DIVASYA — wallet ledger (server only)
//  The only code that moves wallet money. Balance is always SUM(ledger); no
//  stored balance exists to drift or be tampered with. Every entry carries a
//  unique ref, so retries, double webhooks and races can never apply a credit
//  or debit twice — the database's unique constraint is the final referee.
//
//  Spending happens BEFORE the gateway opens (the order row records
//  wallet_applied). If the remainder payment then fails or is abandoned, the
//  spend comes back automatically: the failure webhook releases it at once,
//  and releaseStaleSpends() releases anything still attached to an unpaid
//  order after two hours, run every time a balance is read — self-healing.
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";

export type LedgerEntry = {
  id: string; amount: number; kind: string; note: string | null;
  order_no: string | null; created_at: string;
};

const STALE_MS = 2 * 60 * 60 * 1000;

/** Insert one ledger row; a duplicate ref is silently a no-op (idempotent). */
async function post(
  sb: SupabaseClient, userId: string, amount: number,
  kind: "topup" | "spend" | "release" | "refund" | "adjust",
  ref: string, note: string, orderNo?: string | null
): Promise<boolean> {
  const { error } = await sb.from("wallet_ledger").insert({
    user_id: userId, amount, kind, ref, note, order_no: orderNo ?? null,
  });
  if (!error) return true;
  if (String(error.code) === "23505") return false; // ref already applied
  throw new Error(`wallet post failed: ${error.message}`);
}

/** Release spends stuck on orders/bookings that never got paid. */
export async function releaseStaleSpends(sb: SupabaseClient, userId: string): Promise<void> {
  const cutoff = new Date(Date.now() - STALE_MS).toISOString();
  const { data: spends } = await sb
    .from("wallet_ledger")
    .select("amount, order_no")
    .eq("user_id", userId).eq("kind", "spend")
    .lt("created_at", cutoff);
  for (const s of spends ?? []) {
    if (!s.order_no) continue;
    const [{ data: order }, { data: booking }] = await Promise.all([
      sb.from("orders").select("payment_status").eq("order_no", s.order_no).maybeSingle(),
      sb.from("devpunya_bookings").select("payment_status").eq("order_no", s.order_no).maybeSingle(),
    ]);
    const status = order?.payment_status ?? booking?.payment_status;
    // release only when the purchase demonstrably never completed
    if (status === "unpaid" || status === "created" || status === "failed" || status == null) {
      await post(sb, userId, -s.amount, "release", `release:${s.order_no}`,
        "Returned — the purchase was not completed", s.order_no);
    }
  }
}

/** The balance: heal stale holds, then sum the record. */
export async function walletBalance(sb: SupabaseClient, userId: string): Promise<number> {
  await releaseStaleSpends(sb, userId);
  const { data } = await sb.from("wallet_ledger").select("amount").eq("user_id", userId);
  return (data ?? []).reduce((n, r) => n + Number(r.amount), 0);
}

/** Credit a paid top-up. Safe to call from verify AND webhook. */
export async function creditTopup(
  sb: SupabaseClient,
  topup: { id: string; user_id: string; order_no: string; amount: number; status: string },
  paymentId: string | null
): Promise<void> {
  await post(sb, topup.user_id, topup.amount, "topup", `topup:${topup.id}`,
    "Wallet top-up", topup.order_no);
  if (topup.status !== "paid") {
    await sb.from("wallet_topups").update({
      status: "paid", rzp_payment_id: paymentId, paid_at: new Date().toISOString(),
    }).eq("id", topup.id);
  }
}

/**
 * Debit toward a purchase, capped at the live balance. Returns what was
 * actually applied (0 if nothing available). The ref is the order number, so
 * a retried checkout can never double-charge the wallet for the same order.
 */
export async function spendForOrder(
  sb: SupabaseClient, userId: string, orderNo: string, want: number, label: string
): Promise<number> {
  if (want <= 0) return 0;
  let balance = await walletBalance(sb, userId);
  // Two tries: if a concurrent debit wins the race between our balance read
  // and our insert, the database guard (migration 022) refuses the overdraft;
  // we re-read what is actually left and take that instead. A second refusal
  // means the wallet is drained — apply nothing and let the gateway carry
  // the full amount, which is always money-safe.
  for (let attempt = 0; attempt < 2; attempt++) {
    const applied = Math.min(balance, want);
    if (applied <= 0) return 0;
    try {
      const fresh = await post(sb, userId, -applied, "spend", `spend:${orderNo}`, label, orderNo);
      if (!fresh) {
        // this order already debited once — read back what it took
        const { data } = await sb.from("wallet_ledger")
          .select("amount").eq("ref", `spend:${orderNo}`).maybeSingle();
        return Math.abs(Number(data?.amount ?? 0));
      }
      return applied;
    } catch (e) {
      if (!(e instanceof Error) || !e.message.includes("wallet_insufficient")) throw e;
      balance = await walletBalance(sb, userId);
    }
  }
  return 0;
}

/** Give an order's wallet portion back (failed/refunded purchase). Idempotent. */
export async function refundSpend(sb: SupabaseClient, orderNo: string, note: string): Promise<void> {
  const { data: spend } = await sb.from("wallet_ledger")
    .select("user_id, amount").eq("ref", `spend:${orderNo}`).maybeSingle();
  if (!spend) return;
  await post(sb, spend.user_id, -Number(spend.amount), "release", `release:${orderNo}`, note, orderNo);
}

/** The record, newest first, for the wallet screen. */
export async function ledgerFor(sb: SupabaseClient, userId: string, limit = 30): Promise<LedgerEntry[]> {
  const { data } = await sb.from("wallet_ledger")
    .select("id, amount, kind, note, order_no, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as LedgerEntry[];
}

/** WTP-260812-4821 — a top-up's own order number. */
export function newTopupNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `WTP-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;
}
