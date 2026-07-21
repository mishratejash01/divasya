// ============================================================================
//  DIVASYA · Geocoding (ENGINES.md §3 — geocode_cache)
//  Birthplace text → { lat, lon, tz }. Cached in Supabase so a place is looked
//  up once. Powers arcsecond-accurate Lagna/houses for any birthplace on Earth.
//  Server-only (uses the service-role client + Nominatim).
// ============================================================================

import { supabaseAdmin } from "./supabase";
import { find as geoFind } from "geo-tz";

export interface GeoResult { lat: number; lon: number; tz: string; display: string }

// A few high-traffic Indian metros as an instant, offline fallback if the
// external geocoder is unreachable (keeps the chart working, never blocks).
const SEED: Record<string, GeoResult> = {
  delhi: { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", display: "Delhi, India" },
  "new delhi": { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata", display: "New Delhi, India" },
  mumbai: { lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata", display: "Mumbai, India" },
  bangalore: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata", display: "Bengaluru, India" },
  bengaluru: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata", display: "Bengaluru, India" },
  hyderabad: { lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata", display: "Hyderabad, India" },
  chennai: { lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata", display: "Chennai, India" },
  kolkata: { lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata", display: "Kolkata, India" },
  pune: { lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata", display: "Pune, India" },
  jaipur: { lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata", display: "Jaipur, India" },
  lucknow: { lat: 26.8467, lon: 80.9462, tz: "Asia/Kolkata", display: "Lucknow, India" },
  ahmedabad: { lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata", display: "Ahmedabad, India" },
};

const tzFor = (lat: number, lon: number): string => {
  try { return geoFind(lat, lon)[0] || "Asia/Kolkata"; } catch { return "Asia/Kolkata"; }
};

export async function geocodePlace(place: string): Promise<GeoResult | null> {
  const q = place.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return null;

  // 1. Supabase cache
  try {
    const { data } = await supabaseAdmin()
      .from("geocode_cache").select("lat,lon,tz,display_name").eq("query_norm", q).maybeSingle();
    if (data) return { lat: Number(data.lat), lon: Number(data.lon), tz: data.tz, display: data.display_name };
  } catch { /* fall through */ }

  // 2. Offline seed (first token match, e.g. "chennai, tamil nadu" → chennai)
  const firstTok = q.split(",")[0].trim();
  if (SEED[firstTok]) { await cache(q, SEED[firstTok]).catch(() => {}); return SEED[firstTok]; }

  // 3. Nominatim (OpenStreetMap) — worldwide, free
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`,
      { headers: { "User-Agent": "Divasya/1.0 (jyotish app; contact ops@hebrewtechnologies.com)" } }
    );
    const arr = (await r.json()) as { lat: string; lon: string; display_name: string }[];
    if (arr?.length) {
      const lat = Number(arr[0].lat), lon = Number(arr[0].lon);
      const res: GeoResult = { lat, lon, tz: tzFor(lat, lon), display: arr[0].display_name };
      await cache(q, res).catch(() => {});
      return res;
    }
  } catch { /* geocoder unreachable */ }

  return null;
}

async function cache(q: string, r: GeoResult): Promise<void> {
  await supabaseAdmin().from("geocode_cache").upsert({
    query_norm: q, lat: r.lat, lon: r.lon, tz: r.tz, display_name: r.display,
    source: "nominatim", resolved_at: new Date().toISOString(),
  });
}
