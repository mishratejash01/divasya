// ============================================================================
//  DIVASYA — shop data layer
//  Catalog, cart and orders all read from Supabase (migration 005). Nothing
//  about the store lives in app code: products, categories, shipping rules and
//  copy are rows, so the client can change them without a deploy.
// ============================================================================
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase";

export type ShopCategory = {
  id: string; name: string; slug: string; blurb: string | null; sort: number;
};

export type Product = {
  id: string; slug: string; name: string; subtitle: string | null;
  description: string | null; category_id: string;
  price: number; mrp: number | null; currency: string;
  images: string[]; badges: string[];
  is_digital: boolean; requires_shipping: boolean;
  stock: number; is_bestseller: boolean; sort: number;
};

export type CartLine = { id: string; qty: number; product: Product };

export type ShopConfig = {
  shipping: { flat_fee: number; free_above: number; cod_enabled: boolean };
  store: { name: string; currency: string; ships_to: string; support_email: string; support_phone: string };
  copy: { tagline: string; shipping_note: string };
};

const DEFAULT_CONFIG: ShopConfig = {
  shipping: { flat_fee: 79, free_above: 999, cod_enabled: false },
  store: { name: "Divasya Store", currency: "INR", ships_to: "India", support_email: "", support_phone: "" },
  copy: { tagline: "Sacred objects, handmade and posted with care.", shipping_note: "Ships across India." },
};

/** ₹1,49,900 — Indian digit grouping, no decimals. */
export const money = (n: number): string => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Percent off, for the MRP strike. Null when there is no discount to show. */
export function discountPct(price: number, mrp: number | null): number | null {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

// ---------------------------------------------------------------- catalog
const cache = new Map<string, Promise<unknown>>();
function cached<T>(key: string, load: () => Promise<T>, fallback: T): Promise<T> {
  if (!cache.has(key)) {
    cache.set(key, load().catch(() => fallback));
  }
  return cache.get(key) as Promise<T>;
}

export function getCategories(): Promise<ShopCategory[]> {
  return cached("shop:categories", async () => {
    const { data } = await supabaseBrowser()
      .from("product_categories").select("id,name,slug,blurb,sort")
      .eq("is_active", true).order("sort");
    return (data ?? []) as ShopCategory[];
  }, []);
}

export function getProducts(): Promise<Product[]> {
  return cached("shop:products", async () => {
    const { data } = await supabaseBrowser()
      .from("products")
      .select("id,slug,name,subtitle,description,category_id,price,mrp,currency,images,badges,is_digital,requires_shipping,stock,is_bestseller,sort")
      .eq("is_active", true).order("sort");
    return (data ?? []) as Product[];
  }, []);
}

export function getShopConfig(): Promise<ShopConfig> {
  return cached("shop:config", async () => {
    const { data } = await supabaseBrowser().from("shop_config").select("key,value");
    const cfg = { ...DEFAULT_CONFIG };
    for (const row of data ?? []) {
      (cfg as unknown as Record<string, unknown>)[row.key] = row.value;
    }
    return cfg;
  }, DEFAULT_CONFIG);
}

/** Generic loader hook, same shape as the rest of the app's catalog layer. */
export function useShop<T>(loader: () => Promise<T>, initial: T): T {
  const [v, setV] = useState<T>(initial);
  useEffect(() => {
    let on = true;
    loader().then((d) => on && d && setV(d));
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

// ---------------------------------------------------------------- cart
/** The user's cart id, created on first use. Null when signed out. */
async function cartId(): Promise<string | null> {
  const sb = supabaseBrowser();
  const { data: auth } = await sb.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data: existing } = await sb.from("carts").select("id").eq("user_id", uid).maybeSingle();
  if (existing?.id) return existing.id;
  const { data: made } = await sb.from("carts").insert({ user_id: uid }).select("id").maybeSingle();
  return made?.id ?? null;
}

export interface CartApi {
  lines: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  add: (productId: string, qty?: number) => Promise<void>;
  setQty: (lineId: string, qty: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCart(): CartApi {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const id = await cartId();
      if (!id) { setLines([]); return; }
      const { data } = await supabaseBrowser()
        .from("cart_items")
        .select("id,qty,product:products(id,slug,name,subtitle,description,category_id,price,mrp,currency,images,badges,is_digital,requires_shipping,stock,is_bestseller,sort)")
        .eq("cart_id", id)
        .order("added_at");
      setLines(
        (data ?? [])
          .map((r) => ({ id: r.id as string, qty: r.qty as number, product: r.product as unknown as Product }))
          .filter((l) => l.product)
      );
    } catch {
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (productId: string, qty = 1) => {
    const id = await cartId();
    if (!id) return;
    const sb = supabaseBrowser();
    const { data: existing } = await sb.from("cart_items")
      .select("id,qty").eq("cart_id", id).eq("product_id", productId).maybeSingle();
    if (existing) await sb.from("cart_items").update({ qty: existing.qty + qty }).eq("id", existing.id);
    else await sb.from("cart_items").insert({ cart_id: id, product_id: productId, qty });
    await refresh();
  }, [refresh]);

  const setQty = useCallback(async (lineId: string, qty: number) => {
    const sb = supabaseBrowser();
    if (qty <= 0) await sb.from("cart_items").delete().eq("id", lineId);
    else await sb.from("cart_items").update({ qty }).eq("id", lineId);
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (lineId: string) => {
    await supabaseBrowser().from("cart_items").delete().eq("id", lineId);
    await refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    const id = await cartId();
    if (!id) return;
    await supabaseBrowser().from("cart_items").delete().eq("cart_id", id);
    await refresh();
  }, [refresh]);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.product.price * l.qty, 0);

  return { lines, count, subtotal, loading, add, setQty, remove, clear, refresh };
}

/** Shipping for a subtotal, read from shop_config (never hardcoded in a screen). */
export function shippingFor(subtotal: number, cfg: ShopConfig): number {
  if (subtotal <= 0) return 0;
  return subtotal >= cfg.shipping.free_above ? 0 : cfg.shipping.flat_fee;
}
