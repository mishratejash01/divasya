// The wallet as the user sees it: the live balance (which first heals any
// spend stuck on a purchase that never completed) and the recent record.
// Everything shown is read straight from the ledger — nothing else exists.
import { supabaseAdmin } from "@/lib/supabase";
import { walletBalance, ledgerFor } from "@/lib/wallet";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const sb = supabaseAdmin();
  const { data: me } = token ? await sb.auth.getUser(token) : { data: { user: null } };
  if (!me.user) return Response.json({ error: "sign_in_required" }, { status: 401 });

  const [balance, entries] = await Promise.all([
    walletBalance(sb, me.user.id),
    ledgerFor(sb, me.user.id, 30),
  ]);
  return Response.json({ balance, entries });
}
