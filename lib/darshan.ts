// ============================================================================
//  DIVASYA — Live Darshan stream health (server only)
//  Answers, from YouTube's own public endpoints and with zero API quota, the
//  two questions an embed cannot: is this channel live RIGHT NOW, and on
//  exactly which video — and may that video be embedded?
//
//  · liveness+id: the channel's /live page carries a canonical watch URL and
//    "isLiveNow":true only while a public broadcast is running; when the
//    channel is dark the canonical points back at the channel itself.
//  · embeddability: the oEmbed endpoint answers 200 only for embeddable,
//    existing videos; 401/403 mean the owner blocked embedding.
//
//  Every network call is capped and every failure degrades to "not proven
//  live" — the one state the UI already renders honestly (the schedule).
// ============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

async function fetchText(url: string, timeoutMs = 6000): Promise<{ status: number; text: string } | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": UA,
        "Accept-Language": "en-US,en;q=0.8",
        // skips the EU consent interstitial that hides the real page
        Cookie: "CONSENT=YES+cb; SOCS=CAI",
      },
      redirect: "follow",
      cache: "no-store",
      signal: ctrl.signal,
    });
    return { status: r.status, text: await r.text() };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export type StreamHealth = { isLive: boolean; videoId: string | null; embeddable: boolean | null };

/** Is this channel live right now, and on which exact video? */
export async function checkChannelLive(channelId: string): Promise<StreamHealth> {
  const page = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/live`);
  if (!page || page.status >= 400) return { isLive: false, videoId: null, embeddable: null };
  const html = page.text;

  // the live page canonicalises to the running broadcast and carries
  // "isLive":true; a dark channel canonicalises back to the channel page and
  // carries neither (verified against live and offline temple channels).
  const canonical = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{6,15})"/);
  const videoId = canonical?.[1] ?? null;
  const liveNow = html.includes('"isLive":true');
  const upcoming = html.includes('"isUpcoming":true');
  const isLive = Boolean(videoId) && liveNow && !upcoming;
  if (!isLive || !videoId) return { isLive: false, videoId: null, embeddable: null };

  return { isLive: true, videoId, embeddable: await checkEmbeddable(videoId) };
}

/** May this video play inside an app? oEmbed answers without any key. */
export async function checkEmbeddable(videoId: string): Promise<boolean | null> {
  const r = await fetchText(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
    5000
  );
  if (!r) return null;              // unknown — the UI treats unknown as embeddable and lets the player try
  if (r.status === 200) return true;
  if (r.status === 401 || r.status === 403) return false;
  return null;
}

export type StreamRow = {
  id: string; temple_id: string; yt_type: string; yt_id: string;
  label: string | null; priority: number;
  is_live: boolean; live_video_id: string | null; embeddable: boolean | null;
  checked_at: string | null;
};

const TTL_MS = 10 * 60 * 1000;

export const isStale = (s: StreamRow) =>
  !s.checked_at || Date.now() - new Date(s.checked_at).getTime() > TTL_MS;

/** Re-prove one stream and persist what was found. Never throws. */
export async function refreshStream(sb: SupabaseClient, s: StreamRow): Promise<StreamRow> {
  try {
    const h = s.yt_type === "video"
      ? await checkVideoLive(s.yt_id)
      : await checkChannelLive(s.yt_id);
    const next = {
      is_live: h.isLive, live_video_id: h.videoId, embeddable: h.embeddable,
      checked_at: new Date().toISOString(),
    };
    await sb.from("temple_streams").update(next).eq("id", s.id);
    return { ...s, ...next };
  } catch {
    // proof failed — mark the attempt so one bad stream can't be re-tried in
    // a hot loop, and leave it un-live (the honest default)
    const next = { is_live: false, checked_at: new Date().toISOString() };
    await sb.from("temple_streams").update(next).eq("id", s.id).then(() => {}, () => {});
    return { ...s, ...next, live_video_id: null };
  }
}

/** A fixed video source (24×7 rebroadcasts): live if it still embeds. */
async function checkVideoLive(videoId: string): Promise<StreamHealth> {
  const emb = await checkEmbeddable(videoId);
  if (emb === true) return { isLive: true, videoId, embeddable: true };
  return { isLive: false, videoId: null, embeddable: emb };
}

/** Refresh every stale stream, a few at a time, inside a strict time budget. */
export async function refreshStaleStreams(
  sb: SupabaseClient, streams: StreamRow[], budgetMs = 8000, width = 6
): Promise<StreamRow[]> {
  const stale = streams.filter(isStale);
  const out = new Map(streams.map((s) => [s.id, s]));
  const started = Date.now();
  for (let i = 0; i < stale.length; i += width) {
    if (Date.now() - started > budgetMs) break;  // serve what we have; next visit continues
    const batch = stale.slice(i, i + width);
    const results = await Promise.allSettled(batch.map((s) => refreshStream(sb, s)));
    results.forEach((r, j) => { if (r.status === "fulfilled") out.set(batch[j].id, r.value); });
  }
  return [...out.values()];
}
