// Confirms a wallet top-up the moment checkout returns. The webhook stands
// behind it; both settle through the same idempotent creditTopup, so a credit
// can never apply twice no matter how many confirmations arrive.
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCheckoutSignature, fetchPayment } from "@/lib/razorpay";
import { creditTopup } from "@/lib/wallet";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (await req.json().catch(() => ({}))) as Record<string, string>;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });
  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
    return Response.json({ ok: false, error: "bad_signature" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: topup } = await sb.from("wallet_topups")
    .select("id, user_id, order_no, amount, status")
    .eq("rzp_order_id", razorpay_order_id).maybeSingle();
  if (!topup) return Response.json({ ok: false, error: "unknown_topup" }, { status: 404 });

  const pay = await fetchPayment(razorpay_payment_id);
  const paidPaise = Number(pay?.amount ?? 0);
  if (pay && paidPaise !== topup.amount * 100)
    return Response.json({ ok: false, error: "amount_mismatch" }, { status: 400 });

  await creditTopup(sb, topup, razorpay_payment_id);
  return Response.json({ ok: true, orderNo: topup.order_no, amount: topup.amount });
}
