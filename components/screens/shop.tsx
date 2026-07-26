"use client";

import { useMemo, useState } from "react";
import { CaretRight, Minus, Plus, Trash, ShieldCheck, Truck } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import {
  IconMala, IconStar, IconWheel, IconLotus, IconFlower, IconJournal, IconComponent,
} from "../icons";
import {
  useShop, useCart, getCategories, getProducts, getShopConfig,
  money, discountPct, shippingFor,
  Product, ShopCategory, ShopConfig,
} from "@/lib/shop";

/* Each category carries a mark. Products have no photograph yet, so the mark is
   what the tile shows: a tinted block with the category's own icon, rather than
   a grey box or a broken image. */
const CAT_ICON: Record<string, IconComponent> = {
  rudraksha: IconMala, rashi: IconStar, mulank: IconWheel,
  bracelets: IconLotus, malas: IconMala, anklets: IconFlower, studio: IconJournal,
};
const markFor = (p: Product): IconComponent => CAT_ICON[p.category_id] ?? IconLotus;

function ProductMark({ product, size = 30 }: { product: Product; size?: number }) {
  const Icon = markFor(product);
  const img = product.images?.[0];
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt={product.name} className="h-full w-full object-cover" />;
  }
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: "var(--surface-2)" }}>
      <Icon size={size} strokeWidth={1.4} className="text-[var(--bhagwa)]" />
    </div>
  );
}

function Price({ p, big }: { p: Product; big?: boolean }) {
  const off = discountPct(p.price, p.mrp);
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className={cx("tnum text-ink", big ? "text-[17px]" : "text-[12px]")}>{money(p.price)}</span>
      {p.mrp && p.mrp > p.price && (
        <span className={cx("tnum text-[var(--muted-2)] line-through", big ? "text-[12px]" : "text-[10px]")}>
          {money(p.mrp)}
        </span>
      )}
      {off && <span className={cx("text-gold", big ? "text-[12px]" : "text-[10px]")}>{off}% off</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ shop */
export function ShopScreen() {
  const { screen, back, go, haptic } = useApp();
  const cats = useShop<ShopCategory[]>(getCategories, []);
  const products = useShop<Product[]>(getProducts, []);
  const cfg = useShop<ShopConfig | null>(getShopConfig, null);
  const cart = useCart();
  const [filter, setFilter] = useState<string>((screen.params?.cat as string) || "all");

  const shown = useMemo(() => {
    if (filter === "all") return products;
    if (filter === "best") return products.filter((p) => p.is_bestseller);
    return products.filter((p) => p.category_id === filter);
  }, [products, filter]);

  const chips: { id: string; label: string }[] = [
    { id: "all", label: "All" },
    { id: "best", label: "Best sellers" },
    ...cats.map((c) => ({ id: c.id, label: c.name })),
  ];

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader
        title="Store"
        onBack={back}
        right={
          <button
            onClick={() => { haptic(6); go("cart"); }}
            className="relative shrink-0 rounded-full px-2.5 py-1 text-[11px] btn-white"
          >
            Cart
            {cart.count > 0 && (
              <span className="ml-1 tnum text-[var(--bhagwa-deep)]">{cart.count}</span>
            )}
          </button>
        }
      />

      {cfg?.copy?.tagline && (
        <p className="gutter pt-3 text-[11.5px] leading-relaxed text-ink">{cfg.copy.tagline}</p>
      )}

      {/* category filter */}
      <div className="gutter flex gap-1.5 overflow-x-auto no-scrollbar pt-2.5">
        {chips.map((c) => (
          <button
            key={c.id}
            onClick={() => { haptic(4); setFilter(c.id); }}
            className={cx(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] transition-colors",
              filter === c.id ? "btn-saffron" : "surface text-muted"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="gutter pt-2.5">
        {shown.length === 0 ? (
          <div className="rounded-2xl surface p-6 text-center text-[11.5px] text-muted">
            {products.length ? "Nothing in this shelf yet." : "Opening the store…"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map((p) => (
              <button
                key={p.id}
                onClick={() => { haptic(6); go("product", { slug: p.slug }); }}
                className="overflow-hidden rounded-2xl surface text-left transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <ProductMark product={p} size={34} />
                  {p.is_bestseller && (
                    <span
                      className="absolute left-1.5 top-1.5 rounded-[3px] px-1.5 py-0.5 text-[9px] text-white"
                      style={{ background: "var(--bhagwa)" }}
                    >
                      Best seller
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <div className="line-clamp-2 text-[11.5px] leading-tight text-ink">{p.name}</div>
                  <div className="mt-1"><Price p={p} /></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {cfg?.copy?.shipping_note && (
        <div className="gutter flex items-center justify-center gap-1.5 pt-3 text-[10px] text-muted">
          <Truck size={12} className="text-[var(--bhagwa)]" /> {cfg.copy.shipping_note}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- product */
export function ProductScreen() {
  const { screen, back, go, haptic } = useApp();
  const slug = (screen.params?.slug as string) || "";
  const products = useShop<Product[]>(getProducts, []);
  const cfg = useShop<ShopConfig | null>(getShopConfig, null);
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const p = products.find((x) => x.slug === slug);

  if (!p) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <ScreenHeader title="Product" onBack={back} />
        <div className="gutter pt-6 text-center text-[11.5px] text-muted">
          {products.length ? "This item is no longer listed." : "Loading…"}
        </div>
      </div>
    );
  }

  const addToCart = async () => {
    haptic(10);
    await cart.add(p.id, 1);
    setAdded(true);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={p.name} onBack={back} />

      <div className="gutter pt-2">
        <section className="overflow-hidden rounded-2xl surface">
          <div className="aspect-[4/3] w-full overflow-hidden">
            <ProductMark product={p} size={62} />
          </div>
          <div className="p-3">
            <div className="text-[14px] leading-tight text-ink">{p.name}</div>
            {p.subtitle && <div className="mt-0.5 text-[11px] text-muted">{p.subtitle}</div>}
            <div className="mt-2"><Price p={p} big /></div>

            {p.badges?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {p.badges.map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 rounded-[4px] px-2 py-1 text-[10px] text-ink"
                    style={{ background: "var(--surface-2)" }}
                  >
                    <ShieldCheck size={11} className="text-[var(--good)]" /> {b}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {p.description && (
        <div className="gutter pt-1.5">
          <section className="rounded-2xl surface p-2.5">
            <h3 className="section-title mb-1.5">About this</h3>
            <p className="measure text-[11.5px] leading-relaxed text-ink">{p.description}</p>
          </section>
        </div>
      )}

      <div className="gutter pt-1.5">
        <section className="rounded-2xl surface p-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Truck size={13} className="shrink-0 text-[var(--bhagwa)]" />
            {p.is_digital
              ? "Delivered to your account as soon as the payment clears."
              : cfg?.copy?.shipping_note || "Ships across India."}
          </div>
          {!p.is_digital && cfg && (
            <div className="mt-1.5 text-[10.5px] text-[var(--muted-2)]">
              Free delivery on orders above {money(cfg.shipping.free_above)}, else {money(cfg.shipping.flat_fee)}.
            </div>
          )}
        </section>
      </div>

      {/* action row */}
      <div className="gutter pt-2.5">
        {added ? (
          <div className="flex gap-2">
            <button onClick={() => { haptic(6); go("cart"); }} className="flex-1 rounded-2xl py-3 text-[12.5px] btn-saffron">
              Go to cart · {cart.count}
            </button>
            <button onClick={() => setAdded(false)} className="rounded-2xl px-4 py-3 text-[12.5px] btn-white">
              Keep looking
            </button>
          </div>
        ) : (
          <button onClick={addToCart} className="w-full rounded-2xl py-3 text-[12.5px] btn-saffron">
            Add to cart · {money(p.price)}
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ cart */
export function CartScreen() {
  const { back, go, haptic } = useApp();
  const cart = useCart();
  const cfg = useShop<ShopConfig | null>(getShopConfig, null);

  const shipping = cfg ? shippingFor(cart.subtotal, cfg) : 0;
  const total = cart.subtotal + shipping;

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Your cart" onBack={back} />

      {cart.lines.length === 0 ? (
        <div className="gutter pt-6">
          <div className="rounded-2xl surface p-6 text-center">
            <div className="text-[12.5px] text-ink">{cart.loading ? "Loading…" : "Your cart is empty."}</div>
            {!cart.loading && (
              <button onClick={() => go("shop")} className="mt-3 rounded-full px-4 py-2 text-[11.5px] btn-saffron">
                Browse the store
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="gutter pt-2">
            <section className="overflow-hidden rounded-2xl surface">
              {cart.lines.map((l, i) => (
                <div
                  key={l.id}
                  className="flex items-center gap-2.5 p-2.5"
                  style={{ borderTop: i ? "1px solid var(--line)" : undefined }}
                >
                  <button
                    onClick={() => go("product", { slug: l.product.slug })}
                    className="h-14 w-14 shrink-0 overflow-hidden rounded-[6px]"
                  >
                    <ProductMark product={l.product} size={22} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-[11.5px] leading-tight text-ink">{l.product.name}</div>
                    <div className="mt-0.5 tnum text-[11px] text-muted">{money(l.product.price)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => { haptic(4); cart.setQty(l.id, l.qty - 1); }}
                      className="grid h-7 w-7 place-items-center rounded-[4px]"
                      style={{ background: "var(--surface-2)" }}
                      aria-label="One fewer"
                    >
                      {l.qty === 1 ? <Trash size={12} className="text-ink" /> : <Minus size={12} className="text-ink" />}
                    </button>
                    <span className="tnum w-5 text-center text-[12px] text-ink">{l.qty}</span>
                    <button
                      onClick={() => { haptic(4); cart.setQty(l.id, l.qty + 1); }}
                      className="grid h-7 w-7 place-items-center rounded-[4px]"
                      style={{ background: "var(--surface-2)" }}
                      aria-label="One more"
                    >
                      <Plus size={12} className="text-ink" />
                    </button>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* bill */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-1.5">Bill</h3>
              <div className="rounded-[6px] p-2.5" style={{ background: "var(--surface-2)" }}>
                {[
                  ["Items", money(cart.subtotal)],
                  ["Delivery", shipping === 0 ? "Free" : money(shipping)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-0.5 text-[11.5px]">
                    <span className="text-muted">{k}</span>
                    <span className="tnum text-ink">{v}</span>
                  </div>
                ))}
                <div className="mt-1.5 flex items-center justify-between border-t pt-1.5" style={{ borderColor: "var(--line)" }}>
                  <span className="text-[12px] text-ink">To pay</span>
                  <span className="tnum text-[15px] text-ink">{money(total)}</span>
                </div>
              </div>
              {cfg && shipping > 0 && (
                <div className="mt-1.5 text-[10.5px] text-[var(--muted-2)]">
                  Add {money(cfg.shipping.free_above - cart.subtotal)} more for free delivery.
                </div>
              )}
            </section>
          </div>

          <div className="gutter pt-2.5">
            <button
              onClick={() => { haptic(10); go("checkout"); }}
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[12.5px] btn-saffron"
            >
              Checkout · {money(total)} <CaretRight size={13} weight="bold" />
            </button>
            <div className="mt-2 text-center text-[10px] text-muted">UPI · Cards · Netbanking · secured by Razorpay</div>
          </div>
        </>
      )}
    </div>
  );
}
