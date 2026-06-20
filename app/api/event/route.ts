import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { type, data } = await req.json();
    if (!type) return Response.json({ ok: false }, { status: 400 });
    await supabaseAdmin().from("divasya_events").insert({ type, data: data || {} });
    return Response.json({ ok: true });
  } catch {
    // best-effort analytics — never break the app
    return Response.json({ ok: false });
  }
}
