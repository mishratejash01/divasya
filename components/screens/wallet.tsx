"use client";

// The real Divasya Wallet. Everything on this screen is read from the
// wallet ledger — balance is the sum of entries, history IS the entries, and
// money only enters through a verified Razorpay payment. Closed loop: the
// balance spends inside Divasya (store and puja checkout) and is not
// withdrawable.

import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, ShieldCheck, Wallet } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { useIsIosApp } from "@/lib/platform";
import { ScreenHeader, cx } from "../ui";
import { supabaseBrowser } from "@/lib/supabase";

type Entry = {
  id: string; amount: number; kind: string; note: string | null;
  order_no: string | null; created_at: string;
};

const KIND_LABEL: Record<string, string> = {
  topup: "Wallet top-up",
  spend: "Paid from wallet",
  release: "Returned to wallet",
  refund: "Refund",
  adjust: "Adjustment",
};

const TOPUP_CHIPS = [100, 250, 500, 1000];

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    const w = window as unknown as { Razorpay?: unknown };
    if (w.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function WalletScreen() {
  const iosApp = useIsIosApp();
  const { back, haptic, profile } = useApp();
  const [balance, setBalance] = useState<number | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [amountStr, setAmountStr] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inr = (n: number) => n.toLocaleString("en-IN");

  const refresh = useCallback(async () => {
    try {
      const { data: s } = await supabaseBrowser().auth.getSession();
      const token = s.session?.access_token;
      if (!token) { setBalance(0); setEntries([]); return; }
      const r = await fetch("/api/wallet/summary", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { balance: number; entries: Entry[] };
      setBalance(d.balance); setEntries(d.entries ?? []);
    } catch {
      setErr("The wallet could not load. Pull back and try again.");
      setBalance((b) => b ?? 0);
    }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const amount = Math.round(Number(amountStr));
  const amountOk = Number.isFinite(amount) && amount >= 50 && amount <= 50000;

  async function addMoney() {
    setErr(null);
    if (!amountOk) { setErr("Enter an amount between ₹50 and ₹50,000."); return; }
    haptic(10);
    setBusy(true);
    try {
      const { data: s } = await supabaseBrowser().auth.getSession();
      const token = s.session?.access_token;
      if (!token) throw new Error("Please sign in first.");
      const r = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error === "payment_not_configured"
        ? "Payment is being switched on. Try again shortly."
        : "The top-up could not start. Nothing was charged.");

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Payment window could not load. Check your connection.");
      const RZP = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      const rzp = new RZP({
        key: d.keyId,
        amount: d.amount * 100,
        currency: d.currency,
        name: "Divasya",
        description: `Wallet top-up · ${d.orderNo}`,
        order_id: d.rzpOrderId,
        prefill: { name: profile?.name ?? "" },
        theme: { color: "#F26B0F" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (res: Record<string, string>) => {
          const v = await fetch("/api/wallet/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(res),
          }).then((x) => x.json()).catch(() => ({ ok: false }));
          if (v.ok) { haptic([12, 30, 12]); setAmountStr(""); }
          else setErr("Payment received; the credit is on its way. Refresh in a minute.");
          setBusy(false);
          refresh();
        },
      });
      rzp.open();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Wallet" onBack={back} />

      <div className="gutter pt-3 lg:mx-auto lg:max-w-xl">
        {/* balance — always the ledger's sum, fetched from the server */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(155deg, #E0902E 0%, #B23A1E 100%)" }}>
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              <Wallet size={15} weight="fill" /> Divasya Wallet
            </div>
            <div className="mt-1 font-display text-[34px] leading-none tnum">
              {balance === null ? "…" : `₹${inr(balance)}`}
            </div>
            <div className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>
              Spends on the store and puja bookings
            </div>
          </div>
        </div>

        {/* add money — a real Razorpay payment, credited only when captured.
            Hidden in the iOS app (App Store payment rules); balance and
            spending remain, so money added elsewhere is never invisible. */}
        {!iosApp && (
        <div className="mt-3 rounded-2xl surface p-3">
          <div className="eyebrow text-muted">Add money</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {TOPUP_CHIPS.map((v) => (
              <button key={v} onClick={() => setAmountStr(String(v))}
                className={cx("rounded-full px-3.5 py-1.5 text-[11.5px] tnum", amountStr === String(v) ? "btn-saffron" : "surface text-muted")}>
                ₹{v}
              </button>
            ))}
            <input
              value={amountStr}
              inputMode="numeric"
              placeholder="Other amount"
              onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ""))}
              className="w-28 rounded-full px-3.5 py-1.5 text-[11.5px] text-ink outline-none placeholder:text-muted"
              style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }}
            />
          </div>
          {err && <div className="mt-2 text-[11px] leading-relaxed text-ink">{err}</div>}
          <button onClick={addMoney} disabled={busy}
            className={cx("mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[12.5px]", amountOk && !busy ? "btn-saffron" : "btn-white")}>
            <Plus size={13} weight="bold" /> {busy ? "Opening payment…" : amountOk ? `Add ₹${inr(amount)}` : "Add money"}
          </button>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted">
            <ShieldCheck size={12} className="text-[var(--good)]" /> UPI · Cards · Netbanking · secured by Razorpay
          </div>
        </div>
        )}

        {/* history — the ledger itself, newest first */}
        <h3 className="section-title mb-1 mt-5">History</h3>
        {entries.length === 0 && balance !== null && (
          <div className="rounded-2xl p-4 text-center text-[11.5px] text-muted" style={{ background: "var(--surface-2)" }}>
            Nothing yet. Every top-up, payment and return will be recorded here.
          </div>
        )}
        <div>
          {entries.map((t) => {
            const credit = t.amount > 0;
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{ background: credit ? "rgba(46,122,52,0.12)" : "rgba(197,60,50,0.12)" }}>
                  {credit
                    ? <ArrowDownLeft size={15} weight="bold" className="text-[var(--good)]" />
                    : <ArrowUpRight size={15} weight="bold" style={{ color: "var(--avoid)" }} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-ink">{KIND_LABEL[t.kind] ?? t.kind}</div>
                  <div className="truncate text-[11px] text-muted">
                    {[t.note ?? undefined, t.order_no ?? undefined,
                      new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                    ].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="shrink-0 text-[13.5px] font-medium tnum" style={{ color: credit ? "var(--good)" : "var(--avoid)" }}>
                  {credit ? "+" : "−"}₹{inr(Math.abs(t.amount))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[9.5px] leading-relaxed text-[var(--muted-2)]">
          Divasya Wallet balance is usable within the Divasya app only and is not withdrawable or
          transferable. Failed purchases return their wallet portion automatically.
        </p>
      </div>
    </div>
  );
}
