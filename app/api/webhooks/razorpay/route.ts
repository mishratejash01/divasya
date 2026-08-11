// The settling authority for payments. Razorpay calls this whether or not the
// buyer's browser survived the redirect, so an order can never be paid-for and
// unrecorded. Every event is logged once and replayed safely.
import { supabaseAdmin } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markPaid } from "../../shop/verify/route";
import { markBookingPaid } from "../../devotion/verify/route";
import { creditTopup, refundSpend } from "@/lib/wallet";

const BOOKING_COLS =
  "id, kind, order_no, amount, payment_status, dp_paid_notified, dp_order_id, phone, devotee_name";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // The signature is over the RAW body — read text, never json(), first.
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(raw, signature)) {
    return Response.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  let evt: {
    event?: string;
    payload?: { payment?: { entity?: Record<string, unknown> }; refund?: { entity?: Record<string, unknown> } };
  };
  try { evt = JSON.parse(raw); } catch { return Response.json({ ok: false }, { status: 400 }); }

  const sb = supabaseAdmin();
  const payment = evt.payload?.payment?.entity ?? null;
  const eventId =
    (req.headers.get("x-razorpay-event-id") as string) ||
    `${evt.event}:${(payment?.id as string) ?? ""}`;

  // Idempotency: an event we have already handled is acknowledged, not redone.
  const { data: seen } = await sb.from("webhook_events").select("id").eq("id", eventId).maybeSingle();
  if (seen) return Response.json({ ok: true, duplicate: true });
  await sb.from("webhook_events").insert({
    id: eventId, provider: "razorpay", event_type: evt.event ?? "unknown", payload: evt,
  });

  // One Razorpay order id belongs to exactly one of three ledgers: a store
  // order, a devotion (DevPunya) booking, or a wallet top-up. Settle whichever.
  const rzpOrderId = (payment?.order_id as string) || "";
  const order = rzpOrderId
    ? (await sb.from("orders").select("id, total, order_no, wallet_applied").eq("rzp_order_id", rzpOrderId).maybeSingle()).data
    : null;
  const booking = !order && rzpOrderId
    ? (await sb.from("devpunya_bookings").select(BOOKING_COLS).eq("rzp_order_id", rzpOrderId).maybeSingle()).data
    : null;
  const topup = !order && !booking && rzpOrderId
    ? (await sb.from("wallet_topups").select("id, user_id, order_no, amount, status").eq("rzp_order_id", rzpOrderId).maybeSingle()).data
    : null;

  switch (evt.event) {
    case "payment.captured":
    case "order.paid": {
      if (order && payment) await markPaid(order.id, payment.id as string, order.total - (order.wallet_applied ?? 0), payment);
      else if (booking && payment) await markBookingPaid(booking, payment.id as string);
      else if (topup && payment) await creditTopup(sb, topup, payment.id as string);
      break;
    }
    case "payment.failed": {
      if (order) {
        await sb.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
        await sb.from("payments").insert({
          order_id: order.id, provider: "razorpay",
          provider_order_id: rzpOrderId, provider_payment_id: (payment?.id as string) ?? null,
          amount: order.total, status: "failed", raw: payment,
        });
        // the wallet portion of a failed purchase goes straight back
        await refundSpend(sb, order.order_no, "Returned — payment failed");
      } else if (booking && booking.payment_status !== "paid") {
        // never regress a paid booking on a late/failed retry event
        await sb.from("devpunya_bookings")
          .update({ payment_status: "failed", updated_at: new Date().toISOString() })
          .eq("id", booking.id);
        await refundSpend(sb, booking.order_no, "Returned — payment failed");
      } else if (topup && topup.status !== "paid") {
        await sb.from("wallet_topups").update({ status: "failed" }).eq("id", topup.id);
      }
      break;
    }
    case "refund.processed":
    case "refund.created": {
      const refund = evt.payload?.refund?.entity ?? null;
      const refPaymentId = (refund?.payment_id as string) || "";
      if (refPaymentId) {
        const { data: pay } = await sb.from("payments").select("order_id").eq("provider_payment_id", refPaymentId).maybeSingle();
        if (pay?.order_id) {
          await sb.from("orders").update({ payment_status: "refunded", status: "refunded" }).eq("id", pay.order_id);
          const { data: ro } = await sb.from("orders").select("order_no").eq("id", pay.order_id).maybeSingle();
          if (ro) await refundSpend(sb, ro.order_no, "Returned — order refunded");
        } else {
          const { data: rb } = await sb.from("devpunya_bookings")
            .select("id, order_no").eq("rzp_payment_id", refPaymentId).maybeSingle();
          if (rb) {
            await sb.from("devpunya_bookings")
              .update({ payment_status: "refunded", updated_at: new Date().toISOString() })
              .eq("id", rb.id);
            await refundSpend(sb, rb.order_no, "Returned — booking refunded");
          }
        }
      }
      break;
    }
  }

  return Response.json({ ok: true });
}
