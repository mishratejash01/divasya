"use client";

import { useEffect, useState } from "react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { supabaseBrowser } from "@/lib/supabase";
import { money } from "@/lib/shop";

type OrderRow = {
  id: string; order_no: string; status: string; payment_status: string;
  total: number; created_at: string;
  order_items: { name: string; qty: number; total: number; image: string | null }[];
};

const STATUS: Record<string, { label: string; tone: "good" | "wait" | "bad" }> = {
  pending: { label: "Awaiting payment", tone: "wait" },
  paid: { label: "Confirmed", tone: "good" },
  packed: { label: "Packed", tone: "good" },
  shipped: { label: "On its way", tone: "good" },
  delivered: { label: "Delivered", tone: "good" },
  cancelled: { label: "Cancelled", tone: "bad" },
  refunded: { label: "Refunded", tone: "bad" },
};

const prettyDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** Empty-state mark: an open, empty parcel. Duotone line-art in the app's own
 *  hand rather than a stock "no data" clip-art. */
function EmptyParcel() {
  return (
    <svg width="92" height="92" viewBox="0 0 96 96" fill="none" aria-hidden>
      {/* box body */}
      <path d="M20 44 L48 56 L76 44 L76 74 L48 86 L20 74 Z"
        fill="var(--bhagwa)" fillOpacity="0.08" stroke="var(--bhagwa)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 44 L48 56 L76 44" stroke="var(--bhagwa)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M48 56 L48 86" stroke="var(--bhagwa)" strokeWidth="2" strokeLinejoin="round" />
      {/* open flaps */}
      <path d="M20 44 L34 34 L58 44" stroke="var(--bhagwa)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M76 44 L62 34 L38 44" stroke="var(--bhagwa)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* nothing inside — three settling dots */}
      <circle cx="42" cy="24" r="2" fill="var(--bhagwa)" fillOpacity="0.5" />
      <circle cx="52" cy="18" r="2.4" fill="var(--bhagwa)" fillOpacity="0.35" />
      <circle cx="50" cy="28" r="1.6" fill="var(--bhagwa)" fillOpacity="0.6" />
    </svg>
  );
}

export function OrdersScreen() {
  const { back, go } = useApp();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: auth } = await sb.auth.getUser();
        if (!auth.user) { setOrders([]); return; }
        const { data } = await sb
          .from("orders")
          .select("id,order_no,status,payment_status,total,created_at,order_items(name,qty,total,image)")
          .eq("user_id", auth.user.id)
          .order("created_at", { ascending: false })
          .limit(30);
        setOrders((data ?? []) as unknown as OrderRow[]);
      } catch {
        setOrders([]);
      }
    })();
  }, []);

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="My orders" onBack={back} />

      {orders === null && <div className="gutter pt-6 text-center text-[11.5px] text-muted">Loading…</div>}

      {orders?.length === 0 && (
        <div className="flex flex-col items-center gutter pt-16 text-center">
          <EmptyParcel />
          <div className="mt-4 font-display text-[15px] text-ink">No orders yet</div>
          <p className="mt-1.5 measure text-[11.5px] leading-relaxed text-muted">
            When you buy something from the store, it will show up here with its progress.
          </p>
          <button onClick={() => go("shop")} className="mt-4 rounded-full px-5 py-2.5 text-[12px] btn-saffron">
            Visit the store
          </button>
        </div>
      )}

      {/* No card, no border around each order — just the order, with a hairline
          between one and the next. */}
      {orders?.map((o, oi) => {
        const st = STATUS[o.status] ?? STATUS.pending;
        return (
          <div
            key={o.id}
            className="gutter py-3.5"
            style={oi ? { borderTop: "1px solid var(--line)" } : undefined}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="tnum text-[12.5px] text-ink">{o.order_no}</div>
                <div className="text-[10.5px] text-[var(--muted-2)]">{prettyDate(o.created_at)}</div>
              </div>
              <span
                className={cx(
                  "shrink-0 rounded-[4px] px-2 py-1 text-[10px]",
                  st.tone === "good" ? "text-[var(--good)]" : st.tone === "bad" ? "text-[var(--avoid)]" : "text-gold"
                )}
                style={{ background: "var(--surface-2)" }}
              >
                {st.label}
              </span>
            </div>

            <div className="mt-2">
              {o.order_items?.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-0.5 text-[11.5px]">
                  <span className="min-w-0 flex-1 truncate text-muted">{it.name} × {it.qty}</span>
                  <span className="tnum text-ink">{money(it.total)}</span>
                </div>
              ))}
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[12px] text-ink">Total</span>
                <span className="tnum text-[13px] text-ink">{money(o.total)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
