// Permanent account deletion, Play-policy grade: every row the user owns is
// removed child-first, then the auth account itself. The auth user is only
// deleted once every table wipe succeeded, so a partial failure leaves an
// account that can sign in and retry rather than an orphaned half-deletion.
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

async function userFromToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  const { data } = await supabaseAdmin().auth.getUser(token);
  return data.user ?? null;
}

export async function POST(req: Request) {
  const user = await userFromToken(req);
  if (!user) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const sb = supabaseAdmin();
  const uid = user.id;
  const errors: string[] = [];
  const wipe = async (table: string, col: string, ids: string[] | string) => {
    const q = sb.from(table).delete();
    const { error } = Array.isArray(ids) ? await q.in(col, ids) : await q.eq(col, ids);
    if (error) errors.push(`${table}: ${error.message}`);
  };

  // children need their parents' ids before the parents go
  const { data: carts } = await sb.from("carts").select("id").eq("user_id", uid);
  const cartIds = (carts ?? []).map((c) => c.id);
  const { data: orders } = await sb.from("orders").select("id").eq("user_id", uid);
  const orderIds = (orders ?? []).map((o) => o.id);

  if (cartIds.length) await wipe("cart_items", "cart_id", cartIds);
  await wipe("carts", "user_id", uid);
  if (orderIds.length) {
    await wipe("order_items", "order_id", orderIds);
    await wipe("payments", "order_id", orderIds);
    await wipe("shipments", "order_id", orderIds);
  }
  await wipe("orders", "user_id", uid);
  await wipe("wallet_ledger", "user_id", uid);
  await wipe("wallet_topups", "user_id", uid);
  await wipe("devpunya_bookings", "user_id", uid);
  await wipe("devpunya_users", "user_id", uid);
  await wipe("bookings", "user_id", uid);
  await wipe("chat_messages", "user_id", uid);
  await wipe("addresses", "user_id", uid);
  await wipe("vastu_snapshots", "user_id", uid);
  await wipe("vastu_rooms", "user_id", uid);
  await wipe("vastu_properties", "user_id", uid);
  await wipe("user_state", "id", uid);
  await wipe("profiles", "id", uid);

  if (errors.length) {
    console.error(`account delete incomplete for ${uid}:`, errors);
    return Response.json({ error: "delete_incomplete", detail: errors }, { status: 500 });
  }

  const { error: authErr } = await sb.auth.admin.deleteUser(uid);
  if (authErr) {
    console.error(`auth delete failed for ${uid}: ${authErr.message}`);
    return Response.json({ error: "auth_delete_failed" }, { status: 500 });
  }
  return Response.json({ deleted: true });
}
