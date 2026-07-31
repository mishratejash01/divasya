"use client";

import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader } from "../ui";

// Demo ledger — the app has a live balance but no transaction store yet, so the
// history is seeded here to show the shape of the screen.
const TXNS: { id: string; title: string; sub: string; date: string; amount: number }[] = [
  { id: "t1", title: "Chadhava offering", sub: "Kashi Vishwanath", date: "28 Jul 2026", amount: -151 },
  { id: "t2", title: "Wallet top-up", sub: "UPI · GPay", date: "24 Jul 2026", amount: 500 },
  { id: "t3", title: "Online Puja", sub: "Ganesh Chaturthi", date: "20 Jul 2026", amount: -351 },
  { id: "t4", title: "Pushp Mala", sub: "Siddhivinayak", date: "15 Jul 2026", amount: -251 },
  { id: "t5", title: "Wallet top-up", sub: "UPI · GPay", date: "10 Jul 2026", amount: 1000 },
  { id: "t6", title: "Ghee Diya", sub: "Somnath", date: "5 Jul 2026", amount: -101 },
];

export function WalletScreen() {
  const { back, haptic, wallet, addWallet } = useApp();
  const totalSpent = TXNS.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  const totalAdded = TXNS.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const inr = (n: number) => n.toLocaleString("en-IN");

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Wallet" onBack={back} />

      <div className="gutter pt-3 lg:mx-auto lg:max-w-xl">
        {/* balance */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white"
          style={{ background: "linear-gradient(155deg, #E0902E 0%, #B23A1E 100%)" }}>
          <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "rgba(255,255,255,0.85)" }}>
              <Wallet size={15} weight="fill" /> Divasya Wallet
            </div>
            <div className="mt-1 font-display text-[34px] leading-none tnum">₹{inr(wallet)}</div>
            <div className="mt-0.5 text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>Current balance</div>
            <button
              onClick={() => { haptic(8); addWallet(500); }}
              className="mt-4 flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium"
              style={{ background: "#fff", color: "#8A2B22" }}
            >
              <Plus size={14} weight="bold" /> Add money
            </button>
          </div>
        </div>

        {/* totals */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl surface p-3.5">
            <div className="text-[10.5px] text-muted">Total spent</div>
            <div className="mt-1 font-display text-[20px] tnum" style={{ color: "var(--avoid)" }}>₹{inr(totalSpent)}</div>
          </div>
          <div className="rounded-2xl surface p-3.5">
            <div className="text-[10.5px] text-muted">Total added</div>
            <div className="mt-1 font-display text-[20px] tnum text-ink">₹{inr(totalAdded)}</div>
          </div>
        </div>

        {/* history — an open list, not a boxed table */}
        <h3 className="section-title mb-1 mt-5">Spend history</h3>
        <div>
          {TXNS.map((t) => {
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
                  <div className="truncate text-[13px] font-medium text-ink">{t.title}</div>
                  <div className="truncate text-[11px] text-muted">{t.sub} · {t.date}</div>
                </div>
                <div className="shrink-0 text-[13.5px] font-medium tnum" style={{ color: credit ? "var(--good)" : "var(--avoid)" }}>
                  {credit ? "+" : "−"}₹{inr(Math.abs(t.amount))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
