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
        <div className="gutter pt-6">
          <div className="rounded-2xl surface p-6 text-center">
            <div className="text-[12.5px] text-ink">You have not ordered anything yet.</div>
            <button onClick={() => go("shop")} className="mt-3 rounded-full px-4 py-2 text-[11.5px] btn-saffron">
              Visit the store
            </button>
          </div>
        </div>
      )}

      {orders?.map((o) => {
        const st = STATUS[o.status] ?? STATUS.pending;
        return (
          <div key={o.id} className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
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

              <div className="mt-2 rounded-[6px] p-2.5" style={{ background: "var(--surface-2)" }}>
                {o.order_items?.map((it, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 py-0.5 text-[11.5px]">
                    <span className="min-w-0 flex-1 truncate text-muted">{it.name} × {it.qty}</span>
                    <span className="tnum text-ink">{money(it.total)}</span>
                  </div>
                ))}
                <div className="mt-1.5 flex items-center justify-between border-t pt-1.5" style={{ borderColor: "var(--line)" }}>
                  <span className="text-[12px] text-ink">Total</span>
                  <span className="tnum text-[13px] text-ink">{money(o.total)}</span>
                </div>
              </div>
            </section>
          </div>
        );
      })}
    </div>
  );
}
