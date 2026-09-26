"use client";

import { useMemo, useState } from "react";
import { CaretRight, Minus, Plus, ShoppingCartSimple, Trash, ShieldCheck, Truck } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { FilterChips, cx } from "../ui";
import { PageHeader } from "../page-header";
import {
  IconMala, IconStar, IconWheel, IconLotus, IconFlower, IconJournal, IconComponent,
} from "../icons";
import {
  useShop, useCart, getCategories, getProducts, getShopConfig,
  money, discountPct, shippingFor,
  Product, ShopCategory, ShopConfig,
} from "@/lib/shop";

const STORE_GRAD = "linear-gradient(135deg, #8A3B08 0%, #4E1F03 100%)";
const STORE_SHADOW = "rgba(78,31,3,0.30)";

/* Each category carries a mark. Products have no photograph yet, so the mark is
   what the tile shows: a tinted block with the category's own icon, rather than
   a grey box or a broken image. */
const CAT_ICON: Record<string, IconComponent> = {
  rudraksha: IconMala, rashi: IconStar, mulank: IconWheel,
  bracelets: IconLotus, malas: IconMala, anklets: IconFlower, studio: IconJournal,
};
const markFor = (p: Product): IconComponent => CAT_ICON[p.category_id] ?? IconLotus;

function ProductMark({ product, size = 30, fit = "cover" }: { product: Product; size?: number; fit?: "cover" | "contain" }) {
  const Icon = markFor(product);
  const img = product.images?.[0];
  if (img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt={product.name} className={cx("h-full w-full", fit === "contain" ? "object-contain" : "object-cover")} />;
  }
  return (
    <div className="grid h-full w-full place-items-center" style={{ background: "rgba(0,0,0,0.035)" }}>
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
      <PageHeader
        title="Store"
        subtitle="Rudraksha, malas & puja samagri"
        onBack={back}
        art="/home/tools/store.png"
        gradient="linear-gradient(135deg, #8A3B08 0%, #4E1F03 100%)"
        shadow="rgba(78,31,3,0.30)"
        right={
          <button
            onClick={() => { haptic(6); go("cart"); }}
            aria-label={cart.count > 0 ? `Cart, ${cart.count} item${cart.count === 1 ? "" : "s"}` : "Cart"}
            className="relative shrink-0"
          >
            <ShoppingCartSimple size={22} weight="regular" className="text-[#FBE8C6]" />
            {/* Count rides the icon as a badge. The old text button spelt out
                "Cart 3", which is a label doing an icon's job in a bar that is
                otherwise all marks. */}
            {cart.count > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-medium leading-none tnum text-white"
                style={{ background: "var(--bhagwa-deep)" }}
              >
                {cart.count > 9 ? "9+" : cart.count}
              </span>
            )}
          </button>
        }
      />

      {/* Filter — the shared horizontal chip block, on the white ground. */}
      <FilterChips chips={chips} active={filter} onSelect={(id) => { haptic(4); setFilter(id); }} />

      {/* grid */}
      <div className="gutter pt-3">
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
  const { screen, back, go, haptic, user } = useApp();
  const slug = (screen.params?.slug as string) || "";
  const products = useShop<Product[]>(getProducts, []);
  const cfg = useShop<ShopConfig | null>(getShopConfig, null);
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const p = products.find((x) => x.slug === slug);

  if (!p) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <PageHeader title="Product" onBack={back} gradient={STORE_GRAD} shadow={STORE_SHADOW} />
        <div className="gutter pt-6 text-center text-[11.5px] text-muted">
          {products.length ? "This item is no longer listed." : "Loading…"}
        </div>
      </div>
    );
  }

  // The cart lives in the database against a user id, so cart.add is a silent
  // no-op when signed out — the button would flip to "Go to cart" over an empty
  // cart. Ask for sign-in at the tap instead of failing quietly.
  const addToCart = async () => {
    haptic(10);
    if (!user) { go("signin"); return; }
    await cart.add(p.id, 1);
    setAdded(true);
  };

  // Buy Now — the Flipkart shortcut: put it in the cart and go straight to
  // checkout, skipping the cart review.
  const buyNow = async () => {
    haptic(12);
    if (!user) { go("signin"); return; }
    await cart.add(p.id, 1);
    go("checkout");
  };

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={p.name} onBack={back} gradient={STORE_GRAD} shadow={STORE_SHADOW} />

      {/* Everything scrolls; the phone buy bar does not. */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 14 }}>
        {/* Desktop is a Flipkart split — the image and the About copy on the
            left, the title, price, delivery and buy actions on the right. A
            phone keeps one column with the buy bar pinned below. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,400px)_1fr] lg:gap-7 lg:px-5 lg:pt-4">

          {/* LEFT — image, and on desktop the About beneath it */}
          <div className="lg:self-start">
            <div className="aspect-[4/3] w-full p-6 lg:aspect-square lg:rounded-xl lg:border lg:border-[var(--tile-line)] lg:p-5">
              <ProductMark product={p} size={64} fit="contain" />
            </div>
            {p.description && (
              <div className="hidden lg:block lg:pt-4">
                <h2 className="section-title mb-1 lg:text-[15px]">About this product</h2>
                <p className="text-[12.5px] leading-relaxed text-ink">{p.description}</p>
              </div>
            )}
          </div>

          {/* RIGHT — the detail column, held to a readable width */}
          <div className="gutter pt-1 lg:max-w-xl lg:px-0 lg:pt-0">
            <h1 className="font-display text-[19px] leading-tight tracking-[-0.02em] text-ink lg:text-[22px]">{p.name}</h1>
            {p.subtitle && <div className="mt-1 text-[11.5px] text-muted lg:text-[12.5px]">{p.subtitle}</div>}
            <div className="mt-2.5 lg:mt-2.5"><Price p={p} big /></div>

            {p.badges?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {p.badges.map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-1 rounded-[4px] border border-[var(--tile-line)] px-2 py-1 text-[10px] text-ink lg:text-[11px]"
                  >
                    <ShieldCheck size={11} className="text-[var(--good)]" /> {b}
                  </span>
                ))}
              </div>
            )}

            {/* About — phone flow only; desktop shows it on the left */}
            {p.description && (
              <div className="pt-5 lg:hidden">
                <h2 className="section-title mb-1.5">About this product</h2>
                <p className="measure text-[11.5px] leading-relaxed text-ink">{p.description}</p>
              </div>
            )}

            <div className="pt-4">
              <div className="flex items-center gap-2 text-[11px] text-muted lg:text-[12.5px]">
                <Truck size={13} className="shrink-0 text-[var(--bhagwa)]" />
                {p.is_digital
                  ? "Delivered to your account as soon as the payment clears."
                  : cfg?.copy?.shipping_note || "Ships across India."}
              </div>
              {!p.is_digital && cfg && (
                <div className="mt-1.5 text-[10.5px] text-[var(--muted-2)] lg:text-[11.5px]">
                  Free delivery on orders above {money(cfg.shipping.free_above)}, else {money(cfg.shipping.flat_fee)}.
                </div>
              )}
            </div>

            {/* Buy actions — desktop inline; the phone uses the pinned bar */}
            <div className="hidden gap-3 pt-5 lg:flex">
              <button
                onClick={added ? () => { haptic(6); go("cart"); } : addToCart}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] font-medium text-ink"
                style={{ background: "var(--bhagwa-soft)" }}
              >
                <ShoppingCartSimple size={18} weight="bold" />
                {added ? `Go to cart · ${cart.count}` : "Add to Cart"}
              </button>
              <button
                onClick={buyNow}
                className="flex flex-1 items-center justify-center rounded-2xl py-3.5 text-[14px] font-medium text-white"
                style={{ background: "var(--bhagwa-deep)" }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Buy bar — phone only, pinned above the tab bar. */}
      <div
        className="shrink-0 flex gap-2.5 gutter above-tabbar pt-2.5 lg:hidden"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
      >
        <button
          onClick={added ? () => { haptic(6); go("cart"); } : addToCart}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-medium text-ink"
          style={{ background: "var(--bhagwa-soft)" }}
        >
          <ShoppingCartSimple size={17} weight="bold" />
          {added ? `Go to cart · ${cart.count}` : "Add to Cart"}
        </button>
        <button
          onClick={buyNow}
          className="flex flex-1 items-center justify-center rounded-2xl py-3.5 text-[13px] font-medium text-white"
          style={{ background: "var(--bhagwa-deep)" }}
        >
          Buy Now
        </button>
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
      <PageHeader title="Your cart" onBack={back} gradient={STORE_GRAD} shadow={STORE_SHADOW} />

      {cart.lines.length === 0 ? (
        <div className="gutter pt-6">
          <div className="flex flex-col items-center rounded-2xl surface p-6 text-center">
            {!cart.loading && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/spot/cart.png" alt="" className="mb-3 h-28 w-28 object-contain" />
            )}
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
