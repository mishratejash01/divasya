// Books a puja or chadhawa. The sequence is ordered so nothing can be lost:
// the DevPunya order and our booking row both exist BEFORE any money moves,
// and every amount comes from DevPunya's own response — whatever the client
// claims about prices is ignored, same rule as the store.
//
// An abandoned checkout leaves a 'created' booking and an unpaid DevPunya
// order — their model treats that as an abandoned cart; nothing to clean up.
import { supabaseAdmin } from "@/lib/supabase";
import { rzpConfigured, rzpKeyId, createRazorpayOrder, newOrderNo } from "@/lib/razorpay";
import {
  dpConfigured, loginUser, createPujaOrder, createChadawaOrder,
  poojaById, poojaAddons, listChadawa, DevpunyaError, type Sankalp,
} from "@/lib/devpunya";
import { spendForOrder, refundSpend } from "@/lib/wallet";
import { markBookingPaid } from "../verify/route";

export const runtime = "nodejs";
export const maxDuration = 60;

type Body = {
  kind?: "puja" | "chadhawa";
  productId?: number;
  packageId?: number;
  addonIds?: number[];
  sankalp?: Sankalp[];
  phone?: string;
  wish?: string;
  devoteeName?: string;
  city?: string;
  useWallet?: boolean;
};

async function userFromToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const { data } = await supabaseAdmin().auth.getUser(token);
  return data.user ?? null;
}

const bad = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(req: Request) {
  if (!dpConfigured()) return bad("not_configured", 503);
  if (!rzpConfigured()) return bad("payment_not_configured", 503);

  const user = await userFromToken(req);
  if (!user) return bad("sign_in_required", 401);

  const b = (await req.json().catch(() => ({}))) as Body;

  // ---- validate the request shape strictly; reject anything odd
  if (b.kind !== "puja" && b.kind !== "chadhawa") return bad("bad_kind");
  const productId = Number(b.productId);
  const packageId = Number(b.packageId);
  if (!Number.isInteger(productId) || productId <= 0) return bad("bad_product");
  if (!Number.isInteger(packageId) || packageId <= 0) return bad("bad_package");
  const addonIds = Array.isArray(b.addonIds) ? b.addonIds.map(Number) : [];
  if (addonIds.some((n) => !Number.isInteger(n) || n <= 0)) return bad("bad_addons");
  const phone = String(b.phone ?? "").replace(/\D/g, "").slice(-10);
  if (!/^\d{10}$/.test(phone)) return bad("bad_phone");
  const sankalp = (Array.isArray(b.sankalp) ? b.sankalp : [])
    .map((s) => ({ name: String(s?.name ?? "").trim(), gotra: String(s?.gotra ?? "").trim() }))
    .filter((s) => s.name);
  if (sankalp.length < 1 || sankalp.length > 6) return bad("bad_sankalp");
  const wish = String(b.wish ?? "").trim().slice(0, 300) || undefined;
  const devoteeName = String(b.devoteeName ?? sankalp[0].name).trim().slice(0, 120);
  const city = String(b.city ?? "").trim().slice(0, 200) || undefined;

  try {
    // ---- verify the product against DevPunya's live catalog, never the client
    let productName: string, packageName: string | null = null, expected = 0;
    let startingAt: string | null = null, mandir: string | null = null, image: string | null = null;

    if (b.kind === "puja") {
      const p = await poojaById(productId);
      if (!p?.id) return bad("product_not_found", 404);
      productName = (p.name ?? "").trim();
      startingAt = p.startingAt ?? null;
      mandir = p.mandir_name ?? null;
      image = p.default_image ?? p.png_default_image ?? (p.images?.[0] ?? null);
      const pkg = (p.packages ?? []).find((x) => x.id === packageId);
      if (!pkg) return bad("package_not_found", 404);
      packageName = pkg.name;
      expected = Number(pkg.price) || 0;
      if (addonIds.length) {
        const addons = await poojaAddons(productId, packageId);
        for (const id of addonIds) {
          const a = addons.find((x) => x.id === id);
          if (!a) return bad("addon_not_found", 404);
          expected += Number(a.price) || 0;
        }
      }
    } else {
      const all = await listChadawa();
      const p = all.find((x) => Number(x.id) === productId);
      if (!p) return bad("product_not_found", 404);
      productName = (p.name ?? "").trim();
      startingAt = p.startingAt ?? null;
      mandir = p.mandir_name ?? null;
      image = p.default_image ?? p.png_default_image ?? (p.images?.[0] ?? null);
      const pkgs = p.packages ?? [];
      if (pkgs.length) {
        const pkg = pkgs.find((x) => x.id === packageId);
        if (!pkg) return bad("package_not_found", 404);
        packageName = pkg.name;
        expected = Number(pkg.price) || 0;
      }
      const offers = p.offerings ?? [];
      for (const id of addonIds) {
        const o = offers.find((x) => x.id === id);
        if (!o) return bad("offering_not_found", 404);
        expected += Number(o.price) || 0;
      }
    }

    // ---- their user for our user (phone-keyed; also refreshes the JWT)
    const dpUser = await loginUser({ phone, fullname: devoteeName, gotra: sankalp[0].gotra || undefined });
    const sb = supabaseAdmin();
    await sb.from("devpunya_users").upsert({
      user_id: user.id, dp_user_id: dpUser.dpUserId, phone,
      fullname: devoteeName, token: dpUser.token,
      token_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });

    // ---- their order, carrying our order number for reconciliation
    const orderNo = newOrderNo();
    const common = { sankalp, devoteeName, wish, city, referenceId: orderNo };
    const dpOrder = b.kind === "puja"
      ? await createPujaOrder(dpUser.token, { pujaId: productId, packageId, addonIds, ...common })
      : await createChadawaOrder(dpUser.token, { productId, packageId, offeringIds: addonIds, ...common });

    const amount = Number(dpOrder.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json({ error: "bad_amount", detail: String(dpOrder.amount) }, { status: 502 });
    }
    if (expected && amount !== expected) {
      // Theirs is what gets fulfilled, so theirs is what we charge — but the
      // difference is worth a trace in the logs.
      console.warn(`devpunya amount differs: expected ${expected}, got ${amount} (order ${orderNo})`);
    }

    // ---- our booking row, before any money moves
    const insertBooking = () => sb.from("devpunya_bookings").insert({
      user_id: user.id, order_no: orderNo, kind: b.kind,
      dp_order_id: String(dpOrder.order_id),
      dp_reference_id: dpOrder.reference_id ?? null,
      product_id: productId, product_name: productName,
      package_id: packageId, package_name: packageName,
      addon_ids: addonIds, amount, currency: "INR",
      sankalp, devotee_name: devoteeName, wish: wish ?? null, phone,
      payment_status: "created", starting_at: startingAt,
      mandir_name: mandir, image,
    }).select("id").single();

    let booking = (await insertBooking()).data;
    if (!booking) booking = (await insertBooking()).data; // one retry, then fail loudly
    if (!booking) {
      console.error(`booking insert failed after devpunya order ${dpOrder.order_id} (${orderNo})`);
      return bad("booking_failed", 500);
    }

    // ---- the wallet first, if asked — a ledger debit tied to this order no.
    let walletApplied = 0;
    if (b.useWallet) {
      walletApplied = await spendForOrder(sb, user.id, orderNo, amount, `Paid toward booking ${orderNo}`);
      if (walletApplied > 0) await sb.from("devpunya_bookings").update({ wallet_applied: walletApplied }).eq("id", booking.id);
    }
    const remainder = amount - walletApplied;

    // fully covered: settled here — DevPunya gets its paid signal at once
    if (remainder === 0) {
      await markBookingPaid({
        id: booking.id, kind: b.kind!, order_no: orderNo, amount,
        payment_status: "created", dp_paid_notified: false,
        dp_order_id: String(dpOrder.order_id), phone, devotee_name: devoteeName,
      }, null);
      return Response.json({ paid: true, bookingId: booking.id, orderNo, amount, walletApplied, currency: "INR" });
    }

    // ---- Razorpay order for the remainder of their amount
    try {
      const rzp = await createRazorpayOrder(remainder, orderNo, {
        devotion: "1", kind: b.kind!, order_no: orderNo, booking_id: booking.id,
      });
      await sb.from("devpunya_bookings").update({ rzp_order_id: rzp.id }).eq("id", booking.id);
      return Response.json({
        bookingId: booking.id, orderNo, amount: remainder, total: amount, walletApplied,
        currency: "INR", rzpOrderId: rzp.id, keyId: rzpKeyId(),
      });
    } catch (e) {
      if (walletApplied > 0) await refundSpend(sb, orderNo, "Returned — payment could not start");
      return Response.json({ error: "gateway_error", detail: (e as Error).message }, { status: 502 });
    }
  } catch (e) {
    const status = e instanceof DevpunyaError ? e.status : 502;
    return Response.json({ error: "devpunya_error", detail: (e as Error).message }, { status });
  }
}
