// Starts a wallet top-up: the topup row exists before any money moves, then
// Razorpay opens for exactly the chosen amount. Credit happens only in
// verify/webhook once the payment is real. ₹50 to ₹50,000, whole rupees.
import { supabaseAdmin } from "@/lib/supabase";
import { rzpConfigured, rzpKeyId, createRazorpayOrder } from "@/lib/razorpay";
import { newTopupNo } from "@/lib/wallet";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  if (!rzpConfigured()) return Response.json({ error: "payment_not_configured" }, { status: 503 });

  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const sb = supabaseAdmin();
  const { data: me } = token ? await sb.auth.getUser(token) : { data: { user: null } };
  if (!me.user) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { amount?: number };
  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 50 || amount > 50000)
    return Response.json({ error: "bad_amount", min: 50, max: 50000 }, { status: 400 });

  const orderNo = newTopupNo();
  const { data: topup, error } = await sb.from("wallet_topups")
    .insert({ user_id: me.user.id, order_no: orderNo, amount })
    .select("id").single();
  if (error || !topup) return Response.json({ error: "topup_failed" }, { status: 500 });

  try {
    const rzp = await createRazorpayOrder(amount, orderNo, {
      wallet: "1", order_no: orderNo, user_id: me.user.id,
    });
    await sb.from("wallet_topups").update({ rzp_order_id: rzp.id }).eq("id", topup.id);
    return Response.json({ orderNo, amount, currency: "INR", rzpOrderId: rzp.id, keyId: rzpKeyId() });
  } catch (e) {
    await sb.from("wallet_topups").update({ status: "failed" }).eq("id", topup.id);
    return Response.json({ error: "gateway_error", detail: (e as Error).message }, { status: 502 });
  }
}
