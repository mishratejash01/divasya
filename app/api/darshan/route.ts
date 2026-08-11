// The Live Darshan directory with proof attached. Serves every temple plus,
// for each, the stream that just proved itself live (exact video id and
// embeddability) — never the flaky channel alias. Stale proofs re-verify
// lazily inside a strict time budget, so the screen is always fast and the
// Live badge is never older than ~10 minutes.
import { supabaseAdmin } from "@/lib/supabase";
import { refreshStaleStreams, type StreamRow } from "@/lib/darshan";

export const runtime = "nodejs";
export const maxDuration = 30;

type TempleRow = {
  id: string; name: string; deity: string | null; deity_group: string | null;
  location: string | null; timing: string | null; about: string | null;
  tint: string | null; sort: number | null;
};

// thin burst cache so a busy minute costs one refresh, not hundreds
let cache: { at: number; body: unknown } | null = null;
const BURST_MS = 60 * 1000;

export async function GET(req: Request) {
  const fresh = new URL(req.url).searchParams.get("fresh") === "1";
  if (!fresh && cache && Date.now() - cache.at < BURST_MS) return Response.json(cache.body);

  const sb = supabaseAdmin();
  const [{ data: temples }, { data: streams }] = await Promise.all([
    sb.from("temples").select("id,name,deity,deity_group,location,timing,about,tint,sort").order("sort"),
    sb.from("temple_streams").select("*").order("priority"),
  ]);

  const proven = await refreshStaleStreams(sb, (streams ?? []) as StreamRow[], fresh ? 15000 : 8000, 6, fresh);
  const byTemple = new Map<string, StreamRow[]>();
  for (const s of proven) {
    const list = byTemple.get(s.temple_id) ?? [];
    list.push(s);
    byTemple.set(s.temple_id, list);
  }

  const out = ((temples ?? []) as TempleRow[]).map((t) => {
    const sources = (byTemple.get(t.id) ?? []).sort((a, b) => a.priority - b.priority);
    // the first source proven live wins — that is the automatic switching
    const best = sources.find((s) => s.is_live && s.live_video_id);
    return {
      id: t.id, name: t.name, deity: t.deity, deityGroup: t.deity_group ?? "other",
      location: t.location, timing: t.timing, about: t.about, tint: t.tint ?? "#4A2472",
      live: best
        ? {
            videoId: best.live_video_id!,
            embeddable: best.embeddable !== false,
            watchUrl: `https://www.youtube.com/watch?v=${best.live_video_id}`,
            label: best.label ?? "Live",
          }
        : null,
    };
  });
  // live temples first, then directory order
  out.sort((a, b) => Number(Boolean(b.live)) - Number(Boolean(a.live)) || 0);

  const body = { checkedAt: new Date().toISOString(), temples: out };
  cache = { at: Date.now(), body };
  return Response.json(body);
}
