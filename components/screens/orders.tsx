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

type BookingRow = {
  id: string; kind: string; orderNo: string; product: string; packageName: string | null;
  amount: number; paymentStatus: string; ritualStatus: string | null;
  startingAt: string | null; mandir: string | null; image: string | null; createdAt: string;
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

// The ritual's journey on DevPunya's side, in the devotee's words.
const RITUAL: Record<string, string> = {
  pending: "Sankalp received",
  timing_shared: "Timing shared",
  started: "Ritual started",
  conducted: "Ritual conducted",
  delivered: "Video delivered",
};

function bookingStatus(b: BookingRow): { label: string; tone: "good" | "wait" | "bad" } {
  if (b.paymentStatus === "created") return { label: "Awaiting payment", tone: "wait" };
  if (b.paymentStatus === "failed") return { label: "Payment failed", tone: "bad" };
  if (b.paymentStatus === "refunded") return { label: "Refunded", tone: "bad" };
  return { label: RITUAL[b.ritualStatus ?? ""] ?? "Confirmed", tone: "good" };
}

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
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);

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

  // Devotion bookings go through the refresh route, which also retries any
  // paid-signal DevPunya missed and pulls the ritual's live status down.
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabaseBrowser().auth.getSession();
        const token = s.session?.access_token;
        if (!token) { setBookings([]); return; }
        const r = await fetch("/api/devotion/refresh", {
          method: "POST", headers: { Authorization: `Bearer ${token}` },
        });
        if (!r.ok) throw new Error();
        const d = (await r.json()) as { bookings: BookingRow[] };
        setBookings(d.bookings ?? []);
      } catch {
        // fall back to reading our own table so the list still shows
        try {
          const sb = supabaseBrowser();
          const { data: auth } = await sb.auth.getUser();
          if (!auth.user) { setBookings([]); return; }
          const { data } = await sb
            .from("devpunya_bookings")
            .select("id,kind,order_no,product_name,package_name,amount,payment_status,ritual_status,starting_at,mandir_name,image,created_at")
            .eq("user_id", auth.user.id)
            .order("created_at", { ascending: false })
            .limit(30);
          setBookings(((data ?? []) as unknown as Record<string, unknown>[]).map((b) => ({
            id: b.id as string, kind: b.kind as string, orderNo: b.order_no as string,
            product: b.product_name as string, packageName: (b.package_name as string) ?? null,
            amount: Number(b.amount), paymentStatus: b.payment_status as string,
            ritualStatus: (b.ritual_status as string) ?? null,
            startingAt: (b.starting_at as string) ?? null,
            mandir: (b.mandir_name as string) ?? null, image: (b.image as string) ?? null,
            createdAt: b.created_at as string,
          })));
        } catch { setBookings([]); }
      }
    })();
  }, []);

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="My orders" onBack={back} />

      {orders === null && bookings === null && (
        <div className="gutter pt-6 text-center text-[11.5px] text-muted">Loading…</div>
      )}

      {orders?.length === 0 && bookings?.length === 0 && (
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

      {/* puja & chadhava bookings — a ritual's journey, not a parcel's, so the
          status speaks in sankalp/timing/video terms. Same hairline rows. */}
      {bookings && bookings.length > 0 && (
        <>
          <div className="gutter pt-2">
            <h3 className="section-title">Puja &amp; Chadhava</h3>
          </div>
          {bookings.map((b, bi) => {
            const st = bookingStatus(b);
            return (
              <div
                key={b.id}
                className="gutter py-3.5"
                style={bi ? { borderTop: "1px solid var(--line)" } : undefined}
              >
                <div className="flex items-start gap-2.5">
                  {b.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[12px] font-medium leading-snug text-ink">{b.product}</div>
                    <div className="mt-0.5 text-[10.5px] text-[var(--muted-2)]">
                      {[b.packageName ?? undefined, b.mandir ?? undefined,
                        b.startingAt ? prettyDate(b.startingAt) : undefined].filter(Boolean).join(" · ")}
                    </div>
                    <div className="mt-0.5 tnum text-[10.5px] text-[var(--muted-2)]">{b.orderNo}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={cx(
                        "inline-block rounded-[4px] px-2 py-1 text-[10px]",
                        st.tone === "good" ? "text-[var(--good)]" : st.tone === "bad" ? "text-[var(--avoid)]" : "text-gold"
                      )}
                      style={{ background: "var(--surface-2)" }}
                    >
                      {st.label}
                    </span>
                    <div className="mt-1 tnum text-[12px] text-ink">{money(b.amount)}</div>
                  </div>
                </div>
                {b.paymentStatus === "paid" && (b.ritualStatus ?? "") !== "delivered" && (
                  <div className="mt-1.5 text-[10px] text-muted">Updates and the ritual video arrive on WhatsApp.</div>
                )}
              </div>
            );
          })}
          {(orders?.length ?? 0) > 0 && (
            <div className="gutter pt-2">
              <h3 className="section-title">Store</h3>
            </div>
          )}
        </>
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
