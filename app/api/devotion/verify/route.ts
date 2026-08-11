// Confirms a devotion payment the moment checkout returns, so the devotee sees
// their booking confirmed straight away. The Razorpay webhook is the settling
// authority behind it, and both paths run through the same idempotent
// markBookingPaid — calling it twice can never double-book or double-notify.
//
// Telling DevPunya transaction_status=paid is what fires their WhatsApp
// confirmation. If that call fails, the booking still records as paid here and
// dp_paid_notified stays false, so the webhook and the refresh route keep
// retrying until their side has definitely heard.
import { supabaseAdmin } from "@/lib/supabase";
import { verifyCheckoutSignature, fetchPayment } from "@/lib/razorpay";
import { loginUser, updateOrderStatus } from "@/lib/devpunya";

export const runtime = "nodejs";
export const maxDuration = 30;

type BookingRow = {
  id: string; kind: "puja" | "chadhawa"; order_no: string; amount: number;
  payment_status: string; dp_paid_notified: boolean; dp_order_id: string | null;
  phone: string; devotee_name: string | null;
};

export async function POST(req: Request) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    (await req.json().catch(() => ({}))) as Record<string, string>;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
    return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });

  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature))
    return Response.json({ ok: false, error: "bad_signature" }, { status: 400 });

  const sb = supabaseAdmin();
  const { data: booking } = await sb
    .from("devpunya_bookings")
    .select("id, kind, order_no, amount, payment_status, dp_paid_notified, dp_order_id, phone, devotee_name, wallet_applied")
    .eq("rzp_order_id", razorpay_order_id)
    .maybeSingle();
  if (!booking) return Response.json({ ok: false, error: "unknown_booking" }, { status: 404 });

  // The signature proves the message; Razorpay itself confirms the money.
  // The gateway owes the total MINUS whatever the wallet already covered.
  const gatewayDue = Math.round((Number(booking.amount) - Number(booking.wallet_applied ?? 0)) * 100);
  const pay = await fetchPayment(razorpay_payment_id);
  const paidPaise = Number(pay?.amount ?? 0);
  if (pay && paidPaise !== gatewayDue)
    return Response.json({ ok: false, error: "amount_mismatch" }, { status: 400 });

  await markBookingPaid(booking as BookingRow, razorpay_payment_id);
  return Response.json({ ok: true, orderNo: booking.order_no });
}

/** Idempotent settle: records the payment, then makes sure DevPunya has heard. */
export async function markBookingPaid(booking: BookingRow, paymentId: string | null) {
  const sb = supabaseAdmin();
  const { data: current } = await sb
    .from("devpunya_bookings")
    .select("payment_status, dp_paid_notified")
    .eq("id", booking.id)
    .maybeSingle();
  if (!current) return;

  if (current.payment_status !== "paid") {
    await sb.from("devpunya_bookings").update({
      payment_status: "paid",
      rzp_payment_id: paymentId,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", booking.id);
  }

  if (!current.dp_paid_notified && booking.dp_order_id) {
    try {
      const dpUser = await loginUser({
        phone: booking.phone,
        fullname: booking.devotee_name ?? "Devotee",
      });
      await updateOrderStatus(booking.kind, dpUser.token, booking.dp_order_id, "paid");
      await sb.from("devpunya_bookings").update({
        dp_paid_notified: true, updated_at: new Date().toISOString(),
      }).eq("id", booking.id);
    } catch (e) {
      // Paid stands recorded; notification will be retried by webhook/refresh.
      console.error(`devpunya paid-notify failed for ${booking.order_no}: ${(e as Error).message}`);
    }
  }
}
