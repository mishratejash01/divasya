"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bank, Check, MagnifyingGlass, MapPin, Play, Plus, ShieldCheck, VideoCamera, X } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, FilterChips, cx } from "../ui";
import { logEvent } from "@/lib/chat";
import { supabaseBrowser } from "@/lib/supabase";
import { money } from "@/lib/shop";
import { bell, conch } from "@/lib/sound";

// ---------------------------------------------------------------- types
// The wire shapes served by /api/devotion/catalog — real DevPunya products.
type Pkg = { id: number; name: string; price: number; image: string | null; description: string | null };
type Product = {
  id: number; name: string; description: string | null; startingAt: string | null;
  tithi: string | null; location: string | null; mandir: string | null; rating: number | null;
  image: string | null; images: string[]; packages: Pkg[]; offerings: Pkg[];
};
type Addon = { id: number; name: string; price: number; description: string | null; image: string | null; optional: boolean };
type Catalog = { pujas: Product[]; chadawa: Product[]; savedPhone: string | null };
type Member = { name: string; gotra: string };

const fmtEventDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;

function OmTile({ size = 48 }: { size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-xl font-display"
      style={{ width: size, height: size, background: "var(--surface-2)", border: "1px solid var(--line-gold)", color: "var(--bhagwa-deep)", fontSize: Math.round(size * 0.44) }}>
      ॐ
    </div>
  );
}

/** Razorpay's checkout script, fetched once and only when it is needed. */
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

async function authToken(): Promise<string | null> {
  const { data } = await supabaseBrowser().auth.getSession();
  return data.session?.access_token ?? null;
}


/* ---------------- Puja + Chadhava (real DevPunya bookings) ---------------- */
export function PujaScreen() {
  const { back, haptic, profile, screen, go } = useApp();
  const [tab, setTab] = useState<"puja" | "chadhava">(
    screen.params?.tab === "chadhava" ? "chadhava" : "puja"
  );
  const [cat, setCat] = useState<Catalog | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [sel, setSel] = useState<{ kind: "puja" | "chadhava"; product: Product } | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoadErr(false);
    try {
      const token = await authToken();
      const r = await fetch("/api/devotion/catalog", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error("catalog");
      setCat((await r.json()) as Catalog);
    } catch {
      setLoadErr(true);
    }
  }, []);
  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  const list = tab === "puja" ? cat?.pujas : cat?.chadawa;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Online Puja & Chadhava" onBack={back} />

      <FilterChips
        chips={[{ id: "puja", label: "Pujas" }, { id: "chadhava", label: "e-Chadhava" }]}
        active={tab}
        onSelect={(id) => setTab(id as "puja" | "chadhava")}
      />

      <div className="flex-1 overflow-y-auto gutter pt-1 screen-bottom no-scrollbar">
        {/* loading */}
        {!cat && !loadErr && (
          <div className="pt-2">
            {[0, 1].map((i) => (
              <div key={i} className="mb-3 h-24 w-full rounded-xl shimmer" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        )}

        {/* the catalog could not be reached at all */}
        {loadErr && (
          <div className="pt-6 text-center">
            <div className="text-[12.5px] text-ink">The temple catalog could not load.</div>
            <p className="mx-auto mt-1 measure text-[11px] leading-relaxed text-muted">
              Check your connection and try again. Nothing has been booked or charged.
            </p>
            <button onClick={loadCatalog} className="mt-3 rounded-full px-4 py-2 text-[11.5px] btn-saffron">Try again</button>
          </div>
        )}

        {/* honest empty state — real events only, never demo data */}
        {cat && list && list.length === 0 && (
          <div className="pt-6 text-center">
            <OmTile size={44} />
            <div className="mt-3 text-[12.5px] text-ink">
              {tab === "puja" ? "No upcoming pujas right now" : "No chadhava offerings right now"}
            </div>
            <p className="mx-auto mt-1 measure text-[11px] leading-relaxed text-muted">
              Temple events are added through the year. Check back soon, or explore the other tab.
            </p>
          </div>
        )}

        {/* event cards */}
        {cat && list && list.length > 0 && (
          <div className="pt-2 lg:grid lg:grid-cols-3 lg:gap-3 xl:grid-cols-4">
            {list.map((p) => {
              const from = p.packages.length ? Math.min(...p.packages.map((x) => x.price)) : null;
              const date = fmtEventDate(p.startingAt);
              return (
                <button
                  key={p.id}
                  onClick={() => { setSel({ kind: tab, product: p }); haptic(10); }}
                  className="flex w-full items-center gap-3 py-2.5 text-left transition-colors lg:flex-col lg:items-start lg:gap-3 lg:rounded-xl lg:border lg:border-[var(--tile-line)] lg:p-4 lg:hover:bg-[var(--surface-2)]"
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover lg:h-32 lg:w-full" />
                  ) : (
                    <OmTile />
                  )}
                  <div className="min-w-0 flex-1 lg:w-full lg:flex-none">
                    <div className="line-clamp-2 text-[12.5px] font-medium leading-snug text-ink lg:text-[14px]">{p.name}</div>
                    <div className="mt-0.5 truncate text-[10.5px] text-muted lg:text-[12px]">
                      {[p.mandir ?? undefined, p.location ?? undefined].filter(Boolean).join(" · ")}
                    </div>
                    {(date || p.tithi) && (
                      <div className="mt-0.5 truncate text-[10px] text-gold lg:text-[11.5px]">
                        {[date, p.tithi ?? undefined].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 rounded-[6px] px-3.5 py-2 text-[11px] btn-saffron lg:mt-1 lg:w-full lg:py-2.5 lg:text-center lg:text-[13px]">
                    {from != null ? `from ${money(from)}` : "Book"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {sel && (
          <BookingSheet
            kind={sel.kind}
            product={sel.product}
            savedPhone={cat?.savedPhone ?? null}
            defaultName={profile?.name || ""}
            onClose={() => setSel(null)}
            onDone={() => { setSel(null); go("orders"); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- booking sheet ---------------- */
function BookingSheet({ kind, product, savedPhone, defaultName, onClose, onDone }: {
  kind: "puja" | "chadhava";
  product: Product;
  savedPhone: string | null;
  defaultName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const { haptic } = useApp();
  // the API's kind spelling for the server routes
  const apiKind = kind === "chadhava" ? "chadhawa" : "puja";

  const [detail, setDetail] = useState<{ product: Product; addons: Addon[] } | null>(null);
  const [step, setStep] = useState<"form" | "paying" | "done">("form");
  const [pkgId, setPkgId] = useState<number | null>(null);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [members, setMembers] = useState<Member[]>([{ name: defaultName, gotra: "Kashyap" }]);
  const [phone, setPhone] = useState(savedPhone ?? "");
  const [wish, setWish] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [orderNo, setOrderNo] = useState("");
  // the real wallet balance — offered as payment when there is any
  const [walletBal, setWalletBal] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const token = await authToken();
        if (!token) return;
        const r = await fetch("/api/wallet/summary", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setWalletBal(((await r.json()) as { balance: number }).balance);
      } catch { /* wallet row simply doesn't show */ }
    })();
  }, []);

  // full detail (with add-ons) on open — the listing card travels light
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await fetch(`/api/devotion/catalog?kind=${apiKind}&id=${product.id}`);
        if (!r.ok) throw new Error();
        const d = (await r.json()) as { product: Product; addons: Addon[] };
        if (on) { setDetail(d); setPkgId(d.product.packages[0]?.id ?? 1); }
      } catch {
        // the listing row is enough to book with; add-ons just stay hidden
        if (on) { setDetail({ product, addons: [] }); setPkgId(product.packages[0]?.id ?? 1); }
      }
    })();
    return () => { on = false; };
  }, [apiKind, product]);

  const p = detail?.product ?? product;
  const extras: Pkg[] | Addon[] = kind === "chadhava" ? p.offerings : (detail?.addons ?? []);
  const pkg = p.packages.find((x) => x.id === pkgId) ?? p.packages[0] ?? null;
  // Number() on every price: an upstream API that returns "891" as text would
  // otherwise turn + into concatenation and the total into a monster.
  const extrasTotal = [...picked].reduce((n, id) => {
    const e = (extras as { id: number; price: number }[]).find((x) => x.id === id);
    return n + (Number(e?.price) || 0);
  }, 0);
  const total = (Number(pkg?.price) || 0) + extrasTotal;

  const phoneOk = /^\d{10}$/.test(phone.replace(/\D/g, "").slice(-10));
  const membersOk = members.length >= 1 && members.every((m) => m.name.trim());
  const ready = phoneOk && membersOk && (p.packages.length === 0 || pkg != null);

  const toggle = (id: number) =>
    setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  async function pay() {
    setErr(null);
    if (!ready) { setErr("Add the sankalp name and a 10 digit WhatsApp number."); return; }
    haptic(10);
    setStep("paying");
    try {
      const token = await authToken();
      if (!token) throw new Error("Please sign in to book.");

      const r = await fetch("/api/devotion/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind: apiKind,
          productId: p.id,
          packageId: pkg?.id ?? 1,
          addonIds: [...picked],
          sankalp: members.map((m) => ({ name: m.name.trim(), gotra: m.gotra.trim() || "—" })),
          phone,
          wish: wish.trim() || undefined,
          useWallet,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        const friendly: Record<string, string> = {
          sign_in_required: "Please sign in to book.",
          payment_not_configured: "Payment is being switched on. Please try again shortly.",
          product_not_found: "This event is no longer available.",
          package_not_found: "That package is no longer available. Reopen and pick again.",
          devpunya_error: "The temple partner could not take the booking just now. Nothing was charged.",
        };
        throw new Error(friendly[d.error as string] ?? "The booking could not start. Nothing was charged.");
      }

      // the wallet covered the whole sankalp — settled server-side, no gateway
      if (d.paid) {
        setOrderNo(d.orderNo);
        setStep("done");
        bell(540, 1.8, 0.2);
        haptic([15, 40, 15]);
        logEvent("puja_booking", { item: p.name, price: d.amount, kind: apiKind, wallet: true });
        return;
      }

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Payment window could not load. Check your connection.");

      const RZP = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      const rzp = new RZP({
        key: d.keyId,
        amount: d.amount * 100,
        currency: d.currency,
        name: "Divasya",
        description: `${p.name} · ${d.orderNo}`,
        order_id: d.rzpOrderId,
        prefill: { name: members[0].name, contact: phone },
        theme: { color: "#F26B0F" },
        modal: { ondismiss: () => setStep("form") },
        handler: async (res: Record<string, string>) => {
          const v = await fetch("/api/devotion/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(res),
          }).then((x) => x.json()).catch(() => ({ ok: false }));
          if (v.ok) {
            setOrderNo(d.orderNo);
            setStep("done");
            bell(540, 1.8, 0.2);
            haptic([15, 40, 15]);
            logEvent("puja_booking", { item: p.name, price: d.amount, kind: apiKind });
          } else {
            setErr("Payment received; confirmation is on its way. Check My Orders in a minute.");
            setStep("form");
          }
        },
      });
      rzp.open();
    } catch (e) {
      setErr((e as Error).message);
      setStep("form");
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.34)", backdropFilter: "blur(3px)" }}
      onClick={() => step !== "paying" && onClose()}>
      <motion.div initial={{ y: 80 }} animate={{ y: 0 }} onClick={(e) => e.stopPropagation()}
        className="max-h-[88%] w-full overflow-y-auto rounded-t-3xl p-4 no-scrollbar lg:mx-auto lg:max-w-[560px]"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line-gold)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 22px)" }}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />

        {step === "form" && (
          <>
            <div className="flex items-start gap-3">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
              ) : (
                <OmTile size={56} />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-medium leading-snug text-ink">{p.name}</div>
                <div className="mt-0.5 text-[10.5px] text-muted">
                  {[p.mandir ?? undefined, p.location ?? undefined].filter(Boolean).join(" · ")}
                </div>
                {(fmtEventDate(p.startingAt) || p.tithi) && (
                  <div className="mt-0.5 text-[10px] text-gold">
                    {[fmtEventDate(p.startingAt), p.tithi ?? undefined].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </div>

            {!detail && (
              <div className="mt-4 h-16 w-full rounded-xl shimmer" style={{ background: "var(--surface-2)" }} />
            )}

            {/* package tiers */}
            {detail && p.packages.length > 0 && (
              <div className="mt-4">
                <div className="eyebrow text-muted">Package</div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {p.packages.map((x) => (
                    <button key={x.id} onClick={() => setPkgId(x.id)}
                      className={cx("rounded-xl px-3 py-2.5 text-left", pkgId === x.id ? "btn-saffron" : "surface")}>
                      <div className="text-[11.5px] font-medium leading-tight">{x.name}</div>
                      <div className={cx("tnum mt-0.5 text-[12.5px]", pkgId === x.id ? "" : "text-gold")}>{money(x.price)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* add-ons / offerings */}
            {detail && (extras as { id: number }[]).length > 0 && (
              <div className="mt-4">
                <div className="eyebrow text-muted">{kind === "chadhava" ? "Offerings" : "Add-ons (optional)"}</div>
                <div className="mt-1.5 overflow-hidden rounded-xl" style={{ border: "1px solid var(--line)" }}>
                  {(extras as Addon[]).map((a, i) => (
                    <button key={a.id} onClick={() => toggle(a.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left"
                      style={{ borderTop: i ? "1px solid var(--line)" : undefined, background: picked.has(a.id) ? "var(--surface-2)" : undefined }}>
                      <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-md border", picked.has(a.id) ? "btn-saffron border-transparent" : "")}
                        style={{ borderColor: picked.has(a.id) ? "transparent" : "var(--line-strong)" }}>
                        {picked.has(a.id) && <Check size={12} />}
                      </span>
                      <span className="min-w-0 flex-1 text-[11.5px] leading-tight text-ink">{a.name}</span>
                      <span className="tnum shrink-0 text-[11.5px] text-gold">{money(a.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* sankalp members */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className="eyebrow text-muted">Sankalp (name and gotra)</div>
                {members.length < 6 && (
                  <button onClick={() => setMembers((m) => [...m, { name: "", gotra: m[0]?.gotra || "Kashyap" }])}
                    className="flex items-center gap-1 text-[10.5px] text-[var(--bhagwa)]">
                    <Plus size={11} /> Add member
                  </button>
                )}
              </div>
              <div className="mt-1.5 space-y-1.5">
                {members.map((m, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input value={m.name} placeholder={i === 0 ? "Full name" : `Member ${i + 1} name`}
                      onChange={(e) => setMembers((ms) => ms.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                      className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-muted"
                      style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }} />
                    <input value={m.gotra} placeholder="Gotra"
                      onChange={(e) => setMembers((ms) => ms.map((x, j) => (j === i ? { ...x, gotra: e.target.value } : x)))}
                      className="w-28 rounded-xl px-3 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-muted"
                      style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }} />
                    {i > 0 && (
                      <button onClick={() => setMembers((ms) => ms.filter((_, j) => j !== i))}
                        className="grid w-9 shrink-0 place-items-center rounded-xl text-muted" style={{ border: "1px solid var(--line)" }}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* whatsapp + wish */}
            <div className="mt-3 space-y-1.5">
              <div className="rounded-xl px-3.5 py-2.5" style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }}>
                <div className="eyebrow text-muted">WhatsApp number · confirmation and puja video arrive here</div>
                <input value={phone} inputMode="numeric" placeholder="10 digit mobile"
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted" />
              </div>
              <div className="rounded-xl px-3.5 py-2.5" style={{ border: "1px solid var(--line-strong)", background: "var(--surface)" }}>
                <div className="eyebrow text-muted">Manokamna (your wish, optional)</div>
                <input value={wish} placeholder="e.g. health and success of family"
                  onChange={(e) => setWish(e.target.value)}
                  className="mt-0.5 w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted" />
              </div>
            </div>

            {/* wallet — a real ledger debit, offered only when there is balance */}
            {walletBal > 0 && (
              <button onClick={() => setUseWallet((v) => !v)}
                className="mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
                style={{ background: "var(--surface-2)" }}>
                <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-md border", useWallet ? "btn-saffron border-transparent" : "")}
                  style={{ borderColor: useWallet ? "transparent" : "var(--line-strong)" }}>
                  {useWallet && <Check size={12} />}
                </span>
                <span className="min-w-0 flex-1 text-[11.5px] text-ink">Use Divasya Wallet</span>
                <span className="tnum shrink-0 text-[11.5px] text-muted">{money(walletBal)} available</span>
              </button>
            )}

            {err && <div className="mt-3 rounded-xl surface p-2.5 text-[11.5px] leading-relaxed text-ink">{err}</div>}

            <button onClick={pay} disabled={!detail}
              className={cx("mt-4 w-full rounded-2xl py-3.5 text-[12.5px]", ready ? "btn-saffron" : "btn-white")}>
              Proceed to Pay {money(useWallet ? Math.max(0, total - walletBal) : total)}
            </button>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted">
              <ShieldCheck size={12} className="text-[var(--good)]" /> UPI · Cards · Netbanking · secured by Razorpay
            </div>
          </>
        )}

        {step === "paying" && (
          <div className="flex flex-col items-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full" style={{ border: "3px solid var(--line)", borderTopColor: "var(--bhagwa)" }} />
            <div className="mt-4 text-[12.5px] text-ink">Placing your sankalp…</div>
            <div className="text-[11px] text-muted">Opening secure payment of {money(total)}</div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "rgba(95,134,87,0.16)" }}>
              <Check size={31} className="text-[var(--good)]" />
            </motion.div>
            <div className="mt-3 font-display text-xl text-ink">Booking Confirmed</div>
            <div className="mt-1 measure text-[11.5px] leading-relaxed text-muted">
              {p.name} will be performed in the name of <span className="text-ink">{members[0].name}</span>
              {members.length > 1 ? ` and ${members.length - 1} more` : ""}{p.mandir ? ` at ${p.mandir}` : ""}.
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full surface px-3 py-2 text-[11px] text-ink">
              <VideoCamera size={13} className="text-[var(--good)]" /> Confirmation and ritual video arrive on WhatsApp
            </div>
            <div className="mt-2 tnum text-[11px] text-muted">Booking · {orderNo}</div>
            <button onClick={onDone} className="mt-4 w-full rounded-2xl py-3 text-[12.5px] btn-saffron">Track in My Orders</button>
            <button onClick={onClose} className="mt-1.5 w-full rounded-2xl py-3 text-[12.5px] btn-ghost">Done</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- Temple directory + Live Darshan ---------------- */
// The directory is served by /api/darshan with proof attached: a temple shows
// Live only when the server verified its stream minutes ago, and the player
// embeds the exact live video id — never the flaky channel alias. Lists use
// thumbnails, not six live iframes; only the player runs one.

type DarshanTemple = {
  id: string; name: string; deity: string | null; deityGroup: string;
  location: string | null; timing: string | null; about: string | null; tint: string;
  live: { videoId: string; embeddable: boolean; watchUrl: string; label: string } | null;
};

const DARSHAN_CHIPS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live now" },
  { id: "shiva", label: "Shiva" },
  { id: "vishnu", label: "Krishna & Vishnu" },
  { id: "devi", label: "Devi" },
  { id: "ganga", label: "Ganga Aarti" },
];

const thumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

function LivePill({ small }: { small?: boolean }) {
  return (
    <span
      className={cx(
        "flex items-center gap-1 rounded-[3px] font-medium text-white",
        small ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]"
      )}
      style={{ background: "#E11900" }}
    >
      <span className={cx("rounded-full bg-white", small ? "h-1 w-1" : "h-1.5 w-1.5")} /> Live
    </span>
  );
}

export function TempleScreen() {
  const { back, go, haptic } = useApp();
  const [dir, setDir] = useState<DarshanTemple[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async (fresh = false) => {
    try {
      const r = await fetch(`/api/darshan${fresh ? "?fresh=1" : ""}`);
      if (!r.ok) throw new Error();
      const d = (await r.json()) as { temples: DarshanTemple[] };
      setDir(d.temples);
      setLoadErr(false);
    } catch {
      setLoadErr(true);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  // While a player is open, re-prove every minute. If the stream drops, the
  // banner below the player offers the next live temple — the auto-switch.
  useEffect(() => {
    if (!openId) return;
    const t = setInterval(() => load(), 60000);
    return () => clearInterval(t);
  }, [openId, load]);

  const open = openId ? (dir ?? []).find((x) => x.id === openId) ?? null : null;

  /* ---------------- player ---------------- */
  if (open) {
    const alsoLive = (dir ?? []).filter((x) => x.live && x.id !== open.id).slice(0, 4);
    const suggestion = !open.live ? alsoLive[0] : null;
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader
          title={open.name}
          sub={[open.deity ?? undefined, open.location ?? undefined].filter(Boolean).join(" · ")}
          onBack={() => setOpenId(null)}
        />
        <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom lg:flex lg:items-start lg:gap-6 lg:px-4 lg:pt-5">
          <div className="relative mt-3 gutter-m overflow-hidden rounded-2xl lg:mx-0 lg:mt-0 lg:min-w-0 lg:flex-1"
            style={{ aspectRatio: "16/9", background: "var(--surface-2)" }}>
            {open.live && open.live.embeddable && (
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${open.live.videoId}?autoplay=1&mute=1&playsinline=1&rel=0`}
                title={`${open.name} live darshan`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
            {open.live && !open.live.embeddable && (
              // the temple streams, but blocks in-app playback — hand off honestly
              <div className="grid h-full w-full place-items-center p-4 text-center"
                style={{ background: `linear-gradient(160deg, ${open.tint}55, ${open.tint}22)` }}>
                <div>
                  <div className="text-[12.5px] text-ink">This temple streams on YouTube only.</div>
                  <a href={open.live.watchUrl} target="_blank" rel="noreferrer"
                    className="mt-3 inline-block rounded-full px-4 py-2 text-[11.5px] btn-saffron">
                    Watch live on YouTube
                  </a>
                </div>
              </div>
            )}
            {!open.live && (
              <div className="grid h-full w-full place-items-center p-4 text-center">
                <div>
                  <div className="text-[12.5px] text-ink">Not streaming right now</div>
                  {open.timing && <div className="mt-1 text-[11px] text-gold">{open.timing}</div>}
                </div>
                <div className="absolute inset-0 shimmer opacity-20" />
              </div>
            )}
            {open.live && (
              <div className="absolute left-3 top-3"><LivePill /></div>
            )}
          </div>

          <div className="gutter pt-4 lg:mx-0 lg:w-[340px] lg:shrink-0 lg:px-0 lg:pt-0">
            {/* stream dropped or never on — offer the next live darshan */}
            {suggestion && (
              <button
                onClick={() => { haptic(8); setOpenId(suggestion.id); }}
                className="mb-3 flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left"
                style={{ background: "var(--surface-2)", border: "1px solid var(--line-gold)" }}
              >
                <LivePill small />
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink">
                  {suggestion.name} is live now — switch darshan
                </span>
                <Play size={13} className="shrink-0 text-[var(--bhagwa)]" />
              </button>
            )}

            <div className="text-[12.5px] font-medium text-ink">{open.deity}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
              <MapPin size={11} /> {open.location}
            </div>
            <div className="mt-3 rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              {open.timing && <div className="text-[11px] font-medium text-gold">{open.timing}</div>}
              {open.about && <p className="mt-1.5 text-[12px] leading-relaxed text-ink-dim">{open.about}</p>}
            </div>

            {/* other proven-live darshans, one tap away */}
            {alsoLive.length > (suggestion ? 1 : 0) && (
              <div className="mt-4">
                <h3 className="section-title mb-1.5">Also live now</h3>
                <div className="grid grid-cols-2 gap-2">
                  {alsoLive.map((t) => (
                    <button key={t.id} onClick={() => { haptic(6); setOpenId(t.id); }} className="text-left">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg"
                        style={{ background: `linear-gradient(150deg, ${t.tint}66, ${t.tint}22)` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumb(t.live!.videoId)} alt="" className="h-full w-full object-cover" loading="lazy" />
                        <span className="absolute left-1.5 top-1.5"><LivePill small /></span>
                      </div>
                      <div className="mt-1 truncate text-[11px] font-medium text-ink">{t.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => go("puja")} className="mt-4 w-full rounded-2xl py-3.5 text-center text-[12.5px] btn-saffron">
              Book Puja / Chadhava here
            </button>
            <button onClick={() => { conch(); haptic([14, 40, 14]); }} className="mt-2 w-full rounded-2xl py-3 text-center text-[11.5px] btn-ghost">
              Offer a virtual Shankhnaad
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- directory ---------------- */
  const list = (dir ?? []).filter((t) => {
    if (chip === "live" && !t.live) return false;
    if (chip !== "all" && chip !== "live" && t.deityGroup !== chip) return false;
    const needle = q.trim().toLowerCase();
    if (needle) {
      const hay = `${t.name} ${t.deity ?? ""} ${t.location ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
  const liveList = list.filter((t) => t.live);
  const restList = list.filter((t) => !t.live);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Live Temple Darshan" onBack={back} />

      {/* search — name, deity or city */}
      <div className="gutter-m flex items-center gap-2 rounded-2xl px-3 py-2 surface">
        <MagnifyingGlass size={14} className="shrink-0 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search temple, deity or city…"
          className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted"
        />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear search" className="shrink-0 text-muted"><X size={13} /></button>
        )}
      </div>

      <FilterChips chips={DARSHAN_CHIPS} active={chip} onSelect={setChip} />

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        {dir === null && !loadErr && (
          <div className="gutter pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="mb-2.5 h-20 w-full rounded-xl shimmer" style={{ background: "var(--surface-2)" }} />
            ))}
          </div>
        )}

        {loadErr && (
          <div className="gutter pt-8 text-center">
            <div className="text-[12.5px] text-ink">The darshan directory could not load.</div>
            <button onClick={() => load(true)} className="mt-3 rounded-full px-4 py-2 text-[11.5px] btn-saffron">Try again</button>
          </div>
        )}

        {dir && list.length === 0 && (
          <div className="gutter pt-8 text-center text-[11.5px] text-muted">
            {chip === "live" ? "No verified live streams at this moment. Aarti hours bring them back." : "Nothing matches. Try another name or filter."}
          </div>
        )}

        {/* proven live right now — thumbnails, not iframes */}
        {liveList.length > 0 && (
          <div className="gutter pt-2">
            <h3 className="section-title mb-1.5">Live now</h3>
            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {liveList.map((t) => (
                <button key={t.id} onClick={() => { haptic(8); setOpenId(t.id); }} className="text-left">
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl"
                    style={{ background: `linear-gradient(150deg, ${t.tint}66, ${t.tint}22)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumb(t.live!.videoId)} alt="" className="h-full w-full object-cover" loading="lazy" />
                    <span className="absolute left-1.5 top-1.5"><LivePill small /></span>
                    {!t.live!.embeddable && (
                      <span className="absolute bottom-1.5 right-1.5 rounded-[3px] bg-black/55 px-1.5 py-0.5 text-[8.5px] text-white">on YouTube</span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-[12px] font-medium text-ink">{t.name}</div>
                  <div className="truncate text-[10px] text-muted">{[t.deity ?? undefined, t.location ?? undefined].filter(Boolean).join(" · ")}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* the rest of the mandir directory, with honest timings */}
        {restList.length > 0 && (
          <div className="gutter pt-3">
            <h3 className="section-title mb-1">Darshan schedule</h3>
            <div>
              {restList.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { haptic(6); setOpenId(t.id); }}
                  className="flex w-full items-center gap-3 py-2.5 text-left"
                  style={i ? { borderTop: "1px solid var(--line)" } : undefined}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ background: `linear-gradient(150deg, ${t.tint}44, ${t.tint}14)`, color: "var(--bhagwa-deep)" }}>
                    <Bank size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-medium text-ink">{t.name}</div>
                    <div className="truncate text-[10.5px] text-muted">{[t.deity ?? undefined, t.location ?? undefined].filter(Boolean).join(" · ")}</div>
                  </div>
                  {t.timing && <div className="shrink-0 text-right text-[10px] text-gold">{t.timing}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {dir && (
          <p className="gutter pb-2 pt-4 text-[9.5px] leading-relaxed text-[var(--muted-2)]">
            Live appears only for streams verified in the last few minutes. Temples switch to their
            best available source automatically.
          </p>
        )}
      </div>
    </div>
  );
}
