// The settling authority for payments. Razorpay calls this whether or not the
// buyer's browser survived the redirect, so an order can never be paid-for and
// unrecorded. Every event is logged once and replayed safely.
import { supabaseAdmin } from "@/lib/supabase";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markPaid } from "../../shop/verify/route";

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

  const rzpOrderId = (payment?.order_id as string) || "";
  const order = rzpOrderId
    ? (await sb.from("orders").select("id, total").eq("rzp_order_id", rzpOrderId).maybeSingle()).data
    : null;

  switch (evt.event) {
    case "payment.captured":
    case "order.paid": {
      if (order && payment) await markPaid(order.id, payment.id as string, order.total, payment);
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
      }
      break;
    }
    case "refund.processed":
    case "refund.created": {
      const refund = evt.payload?.refund?.entity ?? null;
      const refOrderId = (refund?.payment_id as string) || "";
      if (refOrderId) {
        const { data: pay } = await sb.from("payments").select("order_id").eq("provider_payment_id", refOrderId).maybeSingle();
        if (pay?.order_id) {
          await sb.from("orders").update({ payment_status: "refunded", status: "refunded" }).eq("id", pay.order_id);
        }
      }
      break;
    }
  }

  return Response.json({ ok: true });
}
