// ============================================================================
//  DIVASYA — Razorpay (server only)
//  Talks to Razorpay over REST so there is no SDK to keep in step, and does the
//  two signature checks that make a payment trustworthy:
//    · checkout   HMAC_SHA256("<order_id>|<payment_id>", KEY_SECRET)
//    · webhook    HMAC_SHA256(raw request body, WEBHOOK_SECRET)
//  Amounts are handed to Razorpay in paise; the app stores whole rupees.
// ============================================================================

import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/** True once the keys are in the environment. Until then checkout says so. */
export function rzpConfigured(): boolean {
  return Boolean(KEY_ID && KEY_SECRET);
}

/** The publishable key id — safe to hand to the browser, by Razorpay's design. */
export function rzpKeyId(): string {
  return KEY_ID;
}

export interface RzpOrder { id: string; amount: number; currency: string; status: string }

/** Create an order. `amountRupees` is whole rupees; Razorpay is sent paise. */
export async function createRazorpayOrder(
  amountRupees: number,
  receipt: string,
  notes: Record<string, string> = {}
): Promise<RzpOrder> {
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const r = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Math.round(amountRupees * 100),
      currency: "INR",
      receipt: receipt.slice(0, 40),
      notes,
    }),
  });
  if (!r.ok) throw new Error(`razorpay order failed: ${r.status} ${await r.text()}`);
  return (await r.json()) as RzpOrder;
}

/** Fetch a payment, to confirm amount and status from the horse's mouth. */
export async function fetchPayment(paymentId: string): Promise<Record<string, unknown> | null> {
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const r = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) return null;
  return (await r.json()) as Record<string, unknown>;
}

const safeEqual = (a: string, b: string): boolean => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Checkout handler signature: HMAC_SHA256("orderId|paymentId", KEY_SECRET). */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!KEY_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC_SHA256(RAW body, WEBHOOK_SECRET). Never parse first. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

/** DVS-260721-4821 — short, sortable, and readable on a courier slip. */
export function newOrderNo(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  const stamp = `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  return `DVS-${stamp}-${crypto.randomInt(1000, 9999)}`;
}
