// The devotion catalog, served from DevPunya through our server so the partner
// id stays out of the browser. Listings are cached in-module for ten minutes:
// fast for users, gentle on their API, and a DevPunya outage inside the TTL
// window is bridged by the last good copy instead of an empty screen.
//
//   GET /api/devotion/catalog                     → { pujas, chadawa, savedPhone? }
//   GET /api/devotion/catalog?kind=puja&id=146    → { product, addons }
import { supabaseAdmin } from "@/lib/supabase";
import {
  dpConfigured, listPujas, listChadawa, poojaById, poojaAddons,
  type DpProduct, type DpAddon, DevpunyaError,
} from "@/lib/devpunya";

export const runtime = "nodejs";
export const maxDuration = 30;

const TTL_MS = 10 * 60 * 1000;
type CacheSlot<T> = { at: number; data: T } | null;
let pujaCache: CacheSlot<DpProduct[]> = null;
let chadawaCache: CacheSlot<DpProduct[]> = null;
const detailCache = new Map<string, { at: number; data: unknown }>();

/** The slice of a product the UI needs — nothing else crosses the wire. */
function trim(p: DpProduct) {
  return {
    id: Number(p.id),
    name: (p.name ?? "").trim(),
    description: p.description ?? null,
    startingAt: p.startingAt ?? null,
    tithi: p.tithi ?? null,
    location: p.location ?? null,
    mandir: p.mandir_name ?? null,
    rating: p.rating ?? null,
    image: p.default_image ?? p.png_default_image ?? (p.images?.[0] ?? null),
    images: (p.images ?? []).slice(0, 4),
    packages: (p.packages ?? []).map((x) => ({
      id: Number(x.id), name: x.name, price: Number(x.price), image: x.image ?? null,
      description: x.description ?? null,
    })),
    offerings: (p.offerings ?? []).map((x) => ({
      id: Number(x.id), name: x.name, price: Number(x.price), image: x.image ?? null,
      description: x.description ?? null,
    })),
  };
}

async function cachedList(
  kind: "puja" | "chadhawa", fresh: boolean
): Promise<ReturnType<typeof trim>[]> {
  const slot = kind === "puja" ? pujaCache : chadawaCache;
  if (!fresh && slot && Date.now() - slot.at < TTL_MS) return slot.data.map(trim);
  try {
    const data = kind === "puja" ? await listPujas() : await listChadawa();
    const next = { at: Date.now(), data };
    if (kind === "puja") pujaCache = next; else chadawaCache = next;
    return data.map(trim);
  } catch (e) {
    // Their API hiccuped: serve the last good copy if we have one.
    if (slot) return slot.data.map(trim);
    throw e;
  }
}

async function savedPhoneFor(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.auth.getUser(token);
    if (!data.user) return null;
    const { data: row } = await sb
      .from("devpunya_users").select("phone").eq("user_id", data.user.id).maybeSingle();
    return row?.phone ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  if (!dpConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const id = url.searchParams.get("id");
  const fresh = url.searchParams.get("fresh") === "1";

  try {
    // ---- detail mode
    if (kind && id) {
      if (kind !== "puja" && kind !== "chadhawa")
        return Response.json({ error: "bad_kind" }, { status: 400 });

      const key = `${kind}:${id}`;
      const hit = detailCache.get(key);
      if (!fresh && hit && Date.now() - hit.at < TTL_MS) return Response.json(hit.data);

      if (kind === "puja") {
        const product = await poojaById(id);
        if (!product?.id) return Response.json({ error: "not_found" }, { status: 404 });
        const firstPkg = product.packages?.[0]?.id ?? 1;
        let addons: DpAddon[] = [];
        try {
          addons = await poojaAddons(id, firstPkg);
        } catch { /* add-ons are optional extras; booking works without them */ }
        const payload = {
          product: trim(product),
          addons: addons.map((a) => ({
            id: Number(a.id), name: (a.name ?? "").trim(), price: Number(a.price),
            description: a.description ?? null, image: a.image_url ?? null,
            optional: a.optional !== false,
          })),
        };
        detailCache.set(key, { at: Date.now(), data: payload });
        return Response.json(payload);
      }

      // chadawa has no by-id endpoint in their API: the listing row IS the detail.
      const all = await cachedList("chadhawa", fresh);
      const product = all.find((x) => String(x.id) === String(id));
      if (!product) return Response.json({ error: "not_found" }, { status: 404 });
      const payload = { product, addons: [] };
      detailCache.set(key, { at: Date.now(), data: payload });
      return Response.json(payload);
    }

    // ---- list mode: each side fails independently, so one outage never
    // blanks the other tab.
    const [pujas, chadawa, savedPhone] = await Promise.all([
      cachedList("puja", fresh).catch(() => null),
      cachedList("chadhawa", fresh).catch(() => null),
      savedPhoneFor(req),
    ]);
    if (pujas === null && chadawa === null)
      return Response.json({ error: "upstream_down" }, { status: 502 });
    return Response.json({ pujas: pujas ?? [], chadawa: chadawa ?? [], savedPhone });
  } catch (e) {
    const status = e instanceof DevpunyaError ? e.status : 502;
    return Response.json({ error: "catalog_failed", detail: (e as Error).message }, { status });
  }
}
