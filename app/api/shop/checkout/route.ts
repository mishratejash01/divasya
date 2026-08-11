// Creates an order. The price is recomputed here from the database: whatever
// the client sends about money is ignored, so a tampered cart cannot underpay.
import { supabaseAdmin } from "@/lib/supabase";
import { rzpConfigured, rzpKeyId, createRazorpayOrder, newOrderNo } from "@/lib/razorpay";
import { spendForOrder, refundSpend } from "@/lib/wallet";
import { markPaid } from "../verify/route";

export const runtime = "nodejs";
export const maxDuration = 30;

type Cfg = { shipping: { flat_fee: number; free_above: number } };

async function userFromToken(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const { data } = await supabaseAdmin().auth.getUser(token);
  return data.user?.id ?? null;
}

export async function POST(req: Request) {
  const uid = await userFromToken(req);
  if (!uid) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { addressId?: string; coupon?: string; useWallet?: boolean };
  const sb = supabaseAdmin();

  // 1. the cart, priced from the products table (never from the client)
  const { data: cart } = await sb.from("carts").select("id").eq("user_id", uid).maybeSingle();
  if (!cart) return Response.json({ error: "cart_empty" }, { status: 400 });
  const { data: rows } = await sb
    .from("cart_items")
    .select("qty, product:products(id,name,price,is_digital,requires_shipping,stock,is_active,images)")
    .eq("cart_id", cart.id);

  type Row = { qty: number; product: { id: string; name: string; price: number; is_digital: boolean; requires_shipping: boolean; stock: number; is_active: boolean; images: string[] } | null };
  const lines = ((rows ?? []) as unknown as Row[]).filter((l) => l.product?.is_active);
  if (!lines.length) return Response.json({ error: "cart_empty" }, { status: 400 });

  const outOfStock = lines.find((l) => l.product!.stock < l.qty);
  if (outOfStock) return Response.json({ error: "out_of_stock", item: outOfStock.product!.name }, { status: 409 });

  const subtotal = lines.reduce((n, l) => n + l.product!.price * l.qty, 0);
  const needsShipping = lines.some((l) => l.product!.requires_shipping);

  // 2. shipping + coupon, both from the database
  const { data: cfgRows } = await sb.from("shop_config").select("key,value");
  const cfg = Object.fromEntries((cfgRows ?? []).map((r) => [r.key, r.value])) as unknown as Cfg;
  const flat = cfg?.shipping?.flat_fee ?? 0;
  const freeAbove = cfg?.shipping?.free_above ?? 0;
  const shipping = !needsShipping || subtotal >= freeAbove ? 0 : flat;

  let discount = 0;
  let couponCode: string | null = null;
  if (body.coupon) {
    const { data: c } = await sb.from("coupons").select("*").eq("code", body.coupon.toUpperCase()).eq("is_active", true).maybeSingle();
    if (c && subtotal >= (c.min_order ?? 0) && (!c.max_uses || c.used < c.max_uses)) {
      discount = c.kind === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
      couponCode = c.code;
    }
  }

  const total = Math.max(1, subtotal - discount + shipping);

  // 3. the delivery address, if this order needs one
  let address: Record<string, unknown> | null = null;
  if (needsShipping) {
    if (!body.addressId) return Response.json({ error: "address_required" }, { status: 400 });
    const { data: a } = await sb.from("addresses").select("*").eq("id", body.addressId).eq("user_id", uid).maybeSingle();
    if (!a) return Response.json({ error: "address_required" }, { status: 400 });
    address = a;
  }

  // 4. our order, before any money moves
  const orderNo = newOrderNo();
  const { data: order, error: oErr } = await sb
    .from("orders")
    .insert({
      order_no: orderNo, user_id: uid, status: "pending", payment_status: "unpaid",
      subtotal, discount, shipping_fee: shipping, total, currency: "INR",
      coupon_code: couponCode, address,
      phone: (address?.phone as string) ?? null,
    })
    .select("id, order_no")
    .single();
  if (oErr || !order) return Response.json({ error: "order_failed" }, { status: 500 });

  await sb.from("order_items").insert(
    lines.map((l) => ({
      order_id: order.id, product_id: l.product!.id, name: l.product!.name,
      price: l.product!.price, qty: l.qty, total: l.product!.price * l.qty,
      is_digital: l.product!.is_digital, image: l.product!.images?.[0] ?? null,
    }))
  );

  // 5. the wallet first, if asked — a real ledger debit tied to this order
  //    number, capped at the live balance. If the gateway remainder later
  //    fails or is abandoned, the webhook / stale-release returns it.
  let walletApplied = 0;
  if (body.useWallet) {
    walletApplied = await spendForOrder(sb, uid, order.order_no, total, `Paid toward order ${order.order_no}`);
    if (walletApplied > 0) await sb.from("orders").update({ wallet_applied: walletApplied }).eq("id", order.id);
  }
  const remainder = total - walletApplied;

  // fully covered by the wallet: settled right here, no gateway at all
  if (remainder === 0) {
    await markPaid(order.id, null, walletApplied, null, "wallet");
    return Response.json({
      paid: true, orderId: order.id, orderNo: order.order_no,
      amount: total, walletApplied, currency: "INR",
    });
  }

  // 6. hand the remainder to Razorpay
  if (!rzpConfigured()) {
    return Response.json({
      error: "payment_not_configured",
      orderId: order.id, orderNo: order.order_no, amount: total,
    }, { status: 503 });
  }

  try {
    const rzp = await createRazorpayOrder(remainder, order.order_no, { order_no: order.order_no, user_id: uid });
    await sb.from("orders").update({ rzp_order_id: rzp.id }).eq("id", order.id);
    await sb.from("payments").insert({
      order_id: order.id, provider: "razorpay", provider_order_id: rzp.id,
      amount: remainder, status: "created",
    });
    return Response.json({
      orderId: order.id, orderNo: order.order_no,
      amount: remainder, total, walletApplied, currency: "INR",
      rzpOrderId: rzp.id, keyId: rzpKeyId(),
    });
  } catch (e) {
    await sb.from("orders").update({ status: "cancelled" }).eq("id", order.id);
    // the gateway never opened — give the wallet portion back immediately
    if (walletApplied > 0) await refundSpend(sb, order.order_no, "Returned — payment could not start");
    return Response.json({ error: "gateway_error", detail: (e as Error).message }, { status: 502 });
  }
}
