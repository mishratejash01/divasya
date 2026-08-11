// Confirms a payment the moment checkout returns, so the buyer sees a result
// straight away. The webhook remains the settling authority (see webhooks/razorpay).
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCheckoutSignature, fetchPayment } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (await req.json().catch(() => ({}))) as Record<string, string>;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });

  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
    return Response.json({ ok: false, error: "bad_signature" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: order } = await sb
    .from("orders").select("id, total, payment_status, user_id, wallet_applied")
    .eq("rzp_order_id", razorpay_order_id).maybeSingle();
  if (!order) return Response.json({ ok: false, error: "unknown_order" }, { status: 404 });

  // The signature proves the message; ask Razorpay what was actually paid.
  // The gateway owes the total MINUS whatever the wallet already covered.
  const gatewayDue = order.total - (order.wallet_applied ?? 0);
  const pay = await fetchPayment(razorpay_payment_id);
  const paidPaise = Number(pay?.amount ?? 0);
  if (pay && paidPaise !== gatewayDue * 100)
    return Response.json({ ok: false, error: "amount_mismatch" }, { status: 400 });

  if (order.payment_status !== "paid") await markPaid(order.id, razorpay_payment_id, gatewayDue, pay);

  return Response.json({ ok: true, orderId: order.id });
}

/** Shared by this route, the webhook and full-wallet checkout; safe to call
 *  twice. `amount` is what THIS instrument captured (gateway remainder, or
 *  the wallet portion), so the payments record stays truthful per payment. */
export async function markPaid(
  orderId: string, paymentId: string | null, amount: number,
  raw: Record<string, unknown> | null, provider: "razorpay" | "wallet" = "razorpay"
) {
  const sb = supabaseAdmin();
  const { data: current } = await sb.from("orders").select("payment_status, user_id").eq("id", orderId).maybeSingle();
  if (current?.payment_status === "paid") return;

  await sb.from("orders").update({
    payment_status: "paid", status: "paid",
    rzp_payment_id: paymentId, paid_at: new Date().toISOString(),
  }).eq("id", orderId);

  await sb.from("payments").insert({
    order_id: orderId, provider, provider_payment_id: paymentId,
    amount, status: "captured",
    method: provider === "wallet" ? "wallet" : ((raw?.method as string) ?? null),
    raw: raw ?? null,
  });

  // Take the stock down and empty the cart the order came from.
  const { data: items } = await sb.from("order_items").select("product_id, qty").eq("order_id", orderId);
  for (const it of items ?? []) {
    if (!it.product_id) continue;
    const { data: p } = await sb.from("products").select("stock").eq("id", it.product_id).maybeSingle();
    if (p) await sb.from("products").update({ stock: Math.max(0, p.stock - it.qty) }).eq("id", it.product_id);
  }
  if (current?.user_id) {
    const { data: cart } = await sb.from("carts").select("id").eq("user_id", current.user_id).maybeSingle();
    if (cart) await sb.from("cart_items").delete().eq("cart_id", cart.id);
  }
}
