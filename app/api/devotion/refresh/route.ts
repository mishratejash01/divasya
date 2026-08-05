// Keeps a devotee's bookings honest with DevPunya's side of the story.
// Called when the Orders screen opens: any paid booking whose paid-signal
// never reached DevPunya is retried, and the ritual's live status (pending →
// timing_shared → started → conducted → delivered) is copied down. Each
// booking is handled independently — one bad apple never hides the rest.
import { supabaseAdmin } from "@/lib/supabase";
import { loginUser, getOrderById } from "@/lib/devpunya";
import { markBookingPaid } from "../verify/route";

export const runtime = "nodejs";
export const maxDuration = 60;

const DONE = new Set(["delivered", "refunded", "failed"]);

function ritualStatusFrom(order: Record<string, unknown>): string | null {
  const direct =
    order["puja_status"] ?? order["chadawa_status"] ?? order["chadhawa_status"];
  if (typeof direct === "string" && direct) return direct;
  // some of their reads nest the order one level down
  for (const v of Object.values(order)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = (v as Record<string, unknown>);
      const s = inner["puja_status"] ?? inner["chadawa_status"] ?? inner["chadhawa_status"];
      if (typeof s === "string" && s) return s;
    }
  }
  return null;
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return Response.json({ error: "sign_in_required" }, { status: 401 });
  const sb = supabaseAdmin();
  const { data: me } = await sb.auth.getUser(token);
  if (!me.user) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const { data: rows } = await sb
    .from("devpunya_bookings")
    .select("id, kind, order_no, product_name, package_name, amount, payment_status, ritual_status, dp_paid_notified, dp_order_id, phone, devotee_name, starting_at, mandir_name, image, paid_at, created_at")
    .eq("user_id", me.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const bookings = rows ?? [];
  const tokens = new Map<string, string>(); // one DevPunya login per phone
  const dpToken = async (phone: string, name: string | null) => {
    const hit = tokens.get(phone);
    if (hit) return hit;
    const u = await loginUser({ phone, fullname: name ?? "Devotee" });
    tokens.set(phone, u.token);
    return u.token;
  };

  let refreshed = 0;
  for (const b of bookings.slice(0, 10)) {
    if (b.payment_status !== "paid" || !b.dp_order_id) continue;
    try {
      // 1) a paid-signal DevPunya never heard is delivered now
      if (!b.dp_paid_notified) {
        await markBookingPaid(
          { ...b, kind: b.kind as "puja" | "chadhawa" },
          null
        );
      }
      // 2) the ritual's live status, unless it has already reached the end
      if (!DONE.has(b.ritual_status ?? "")) {
        const t = await dpToken(b.phone, b.devotee_name);
        const order = await getOrderById(b.kind as "puja" | "chadhawa", t, b.dp_order_id);
        const status = ritualStatusFrom(order);
        if (status && status !== b.ritual_status) {
          await sb.from("devpunya_bookings")
            .update({ ritual_status: status, updated_at: new Date().toISOString() })
            .eq("id", b.id);
          b.ritual_status = status;
          refreshed++;
        }
      }
    } catch (e) {
      console.error(`refresh failed for ${b.order_no}: ${(e as Error).message}`);
    }
  }

  return Response.json({
    refreshed,
    bookings: bookings.map((b) => ({
      id: b.id, kind: b.kind, orderNo: b.order_no,
      product: b.product_name, packageName: b.package_name,
      amount: Number(b.amount), paymentStatus: b.payment_status,
      ritualStatus: b.ritual_status, startingAt: b.starting_at,
      mandir: b.mandir_name, image: b.image,
      paidAt: b.paid_at, createdAt: b.created_at,
    })),
  });
}
