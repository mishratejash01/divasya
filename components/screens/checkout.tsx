"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ShieldCheck } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { supabaseBrowser } from "@/lib/supabase";
import { useCart, useShop, getShopConfig, money, shippingFor, ShopConfig } from "@/lib/shop";

type Addr = {
  id?: string; name: string; phone: string; line1: string; line2: string;
  city: string; state: string; pincode: string;
};
const EMPTY: Addr = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-[6px] px-2.5 py-2" style={{ background: "var(--surface-2)" }}>
      <span className="eyebrow block text-muted">{label}</span>
      {children}
    </label>
  );
}

const input =
  "mt-0.5 w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-[var(--muted-2)]";

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

export function CheckoutScreen() {
  const { back, go, profile, haptic } = useApp();
  const cart = useCart();
  const cfg = useShop<ShopConfig | null>(getShopConfig, null);

  const [addr, setAddr] = useState<Addr>(EMPTY);
  const [stage, setStage] = useState<"form" | "paying" | "done">("form");
  const [orderNo, setOrderNo] = useState("");
  const [err, setErr] = useState<string | null>(null);
  // the real wallet balance, from the ledger — offered when it can help
  const [walletBal, setWalletBal] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabaseBrowser().auth.getSession();
        const token = s.session?.access_token;
        if (!token) return;
        const r = await fetch("/api/wallet/summary", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) setWalletBal(((await r.json()) as { balance: number }).balance);
      } catch { /* wallet row simply doesn't show */ }
    })();
  }, []);

  // Prefill from the last address used, then from the profile name.
  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const { data } = await sb.from("addresses").select("*").eq("user_id", auth.user.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setAddr({ ...data });
      else if (profile?.name) setAddr((a) => ({ ...a, name: profile.name || "" }));
    })();
  }, [profile?.name]);

  const shipping = cfg ? shippingFor(cart.subtotal, cfg) : 0;
  const total = cart.subtotal + shipping;
  const ready =
    addr.name.trim() && /^\d{10}$/.test(addr.phone.replace(/\D/g, "").slice(-10)) &&
    addr.line1.trim() && addr.city.trim() && addr.state.trim() && /^\d{6}$/.test(addr.pincode.trim());

  async function pay() {
    setErr(null);
    if (!ready) { setErr("Please complete the delivery details."); return; }
    haptic(10);
    setStage("paying");
    try {
      const sb = supabaseBrowser();
      const { data: s } = await sb.auth.getSession();
      const token = s.session?.access_token;
      const uid = s.session?.user?.id;
      if (!token || !uid) throw new Error("Please sign in to place an order.");

      // Save (or update) the delivery address, then let the server price the order.
      const row = { user_id: uid, ...addr, id: undefined };
      delete (row as Record<string, unknown>).id;
      const { data: saved } = addr.id
        ? await sb.from("addresses").update(addr).eq("id", addr.id).select("id").maybeSingle()
        : await sb.from("addresses").insert(row).select("id").maybeSingle();

      const r = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addressId: saved?.id ?? addr.id, useWallet }),
      });
      const d = await r.json();

      if (d.error === "payment_not_configured") {
        setOrderNo(d.orderNo || "");
        setErr("Your order is saved. Card and UPI payment is being switched on, we will confirm shortly.");
        setStage("form");
        return;
      }
      if (!r.ok) throw new Error(d.item ? `${d.item} is out of stock.` : "Could not start the payment.");

      // the wallet covered everything — settled server-side, no gateway
      if (d.paid) {
        setOrderNo(d.orderNo);
        setStage("done");
        cart.refresh();
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
        description: `Order ${d.orderNo}`,
        order_id: d.rzpOrderId,
        prefill: { name: addr.name, contact: addr.phone, email: s.session?.user?.email ?? "" },
        theme: { color: "#F26B0F" },
        modal: { ondismiss: () => setStage("form") },
        handler: async (res: Record<string, string>) => {
          const v = await fetch("/api/shop/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(res),
          }).then((x) => x.json()).catch(() => ({ ok: false }));
          if (v.ok) { setOrderNo(d.orderNo); setStage("done"); cart.refresh(); }
          else { setErr("Payment taken but not confirmed yet. We will email you shortly."); setStage("form"); }
        },
      });
      rzp.open();
    } catch (e) {
      setErr((e as Error).message);
      setStage("form");
    }
  }

  if (stage === "done") {
    return (
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <ScreenHeader title="Order placed" onBack={() => go("shop")} />
        <div className="gutter pt-6">
          <section className="rounded-2xl surface p-5 text-center">
            <CheckCircle size={40} weight="fill" className="mx-auto text-[var(--good)]" />
            <div className="mt-2 text-[14px] text-ink">Thank you, your order is placed.</div>
            <div className="mt-1 tnum text-[12px] text-muted">{orderNo}</div>
            <p className="measure mx-auto mt-2 text-[11.5px] leading-relaxed text-muted">
              {cfg?.copy?.shipping_note || "We will pack it with care and send you the tracking details."}
            </p>
            <button onClick={() => go("shop")} className="mt-4 rounded-full px-4 py-2 text-[11.5px] btn-saffron">
              Back to the store
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Checkout" onBack={back} />

      {/* delivery */}
      <div className="gutter pt-2">
        <section className="rounded-2xl surface p-2.5">
          <h3 className="section-title mb-1.5">Deliver to</h3>
          <div className="grid gap-1.5">
            <Field label="Full name">
              <input value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })}
                className={input} placeholder="Your name" />
            </Field>
            <Field label="Phone">
              <input value={addr.phone} inputMode="numeric" onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                className={input} placeholder="10 digit mobile" />
            </Field>
            <Field label="Address">
              <input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                className={input} placeholder="House, street" />
            </Field>
            <Field label="Area, landmark (optional)">
              <input value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                className={input} placeholder="Locality" />
            </Field>
            <div className="grid grid-cols-2 gap-1.5">
              <Field label="City">
                <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={input} />
              </Field>
              <Field label="Pincode">
                <input value={addr.pincode} inputMode="numeric" onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} className={input} />
              </Field>
            </div>
            <Field label="State">
              <input value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} className={input} />
            </Field>
          </div>
        </section>
      </div>

      {/* bill */}
      <div className="gutter pt-1.5">
        <section className="rounded-2xl surface p-2.5">
          <h3 className="section-title mb-1.5">{cart.lines.length} item{cart.lines.length === 1 ? "" : "s"}</h3>
          <div className="rounded-[6px] p-2.5" style={{ background: "var(--surface-2)" }}>
            {cart.lines.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 py-0.5 text-[11.5px]">
                <span className="min-w-0 flex-1 truncate text-muted">{l.product.name} × {l.qty}</span>
                <span className="tnum text-ink">{money(l.product.price * l.qty)}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between py-0.5 text-[11.5px]">
              <span className="text-muted">Delivery</span>
              <span className="tnum text-ink">{shipping === 0 ? "Free" : money(shipping)}</span>
            </div>
            {useWallet && walletBal > 0 && (
              <div className="mt-1 flex items-center justify-between py-0.5 text-[11.5px]">
                <span className="text-muted">Divasya Wallet</span>
                <span className="tnum" style={{ color: "var(--good)" }}>− {money(Math.min(walletBal, total))}</span>
              </div>
            )}
            <div className="mt-1.5 flex items-center justify-between border-t pt-1.5" style={{ borderColor: "var(--line)" }}>
              <span className="text-[12px] text-ink">To pay</span>
              <span className="tnum text-[15px] text-ink">{money(useWallet ? Math.max(0, total - walletBal) : total)}</span>
            </div>
          </div>

          {/* wallet — a real ledger debit, offered only when there is balance */}
          {walletBal > 0 && (
            <button onClick={() => setUseWallet((v) => !v)}
              className="mt-2 flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2.5 text-left"
              style={{ background: "var(--surface-2)" }}>
              <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-md border", useWallet ? "btn-saffron border-transparent" : "")}
                style={{ borderColor: useWallet ? "transparent" : "var(--line-strong)" }}>
                {useWallet && <CheckCircle size={12} weight="fill" />}
              </span>
              <span className="min-w-0 flex-1 text-[11.5px] text-ink">Use Divasya Wallet</span>
              <span className="tnum shrink-0 text-[11.5px] text-muted">{money(walletBal)} available</span>
            </button>
          )}
        </section>
      </div>

      {err && (
        <div className="gutter pt-1.5">
          <div className="rounded-2xl surface p-2.5 text-[11.5px] leading-relaxed text-ink">{err}</div>
        </div>
      )}

      <div className="gutter pt-2.5">
        <button
          onClick={pay}
          disabled={stage === "paying" || cart.lines.length === 0}
          className={cx("w-full rounded-2xl py-3 text-[12.5px]", ready ? "btn-saffron" : "btn-white")}
        >
          {stage === "paying" ? "Opening payment…" : `Pay ${money(useWallet ? Math.max(0, total - walletBal) : total)}`}
        </button>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted">
          <ShieldCheck size={12} className="text-[var(--good)]" /> UPI · Cards · Netbanking · secured by Razorpay
        </div>
      </div>
    </div>
  );
}
