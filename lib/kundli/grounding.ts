// ============================================================================
//  DIVASYA · AI grounding bridge (ENGINES.md §4)
//  Async builders that feed the AI Jyotishi real computed facts: the devotee's
//  chart + dasha (chartSummaryForAI) and today's live panchang. Planetary
//  positions + dasha are location-independent; lagna/houses use a default
//  location when birth coords are unknown (flagged approximate).
// ============================================================================

import { Profile } from "../types";
import { computeKundli } from "./index";
import { chartSummaryForAI } from "./summary";
import { computePanchang } from "../panchang/index";
import { getCatalog } from "../panchang/catalog";
import { karanaIndexFromSlot } from "../panchang/angas";
import { fmtTimeInZone } from "../astro/time";
import { currentDasha } from "../dasha";
import { supabaseAdmin } from "../supabase";
import { geocodePlace } from "../geocode";

/** Grounded remedy + dasha-theme for the running mahadasha lord (from Supabase). */
async function remedyContext(mdLord: string): Promise<string> {
  try {
    const sb = supabaseAdmin();
    const [rem, prof] = await Promise.all([
      sb.from("remedies").select("mantra,gemstone,donation,weekday,deity,remedy_note").eq("graha_id", mdLord).maybeSingle(),
      sb.from("dasha_lord_profiles").select("themes,favorable_for,caution_for").eq("graha_id", mdLord).maybeSingle(),
    ]);
    const parts: string[] = [];
    if (prof.data) parts.push(`Running ${mdLord} mahadasha themes: ${prof.data.themes} Favourable for: ${(prof.data.favorable_for || []).join(", ")}. Caution: ${(prof.data.caution_for || []).join(", ")}.`);
    if (rem.data) parts.push(`Grounded remedy for ${mdLord}: chant "${rem.data.mantra}"; gemstone ${rem.data.gemstone}; donate ${rem.data.donation} on ${rem.data.weekday}; ${rem.data.remedy_note}`);
    return parts.length ? "\n\nAPP REMEDY DATA (prefer these when suggesting an upaya):\n" + parts.join("\n") : "";
  } catch { return ""; }
}

const DEF = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };

export async function buildChartContext(p: Profile): Promise<string> {
  const head = `DEVOTEE
Name: ${p.name || "devotee"} | DOB: ${p.dob || "unknown"} | TOB: ${p.tob || "unknown"} | Place: ${p.birthplace || "unknown"} | Lives in: ${p.current_location || "unknown"} | Gender: ${p.gender || "unknown"}`;
  if (!p.dob) {
    return `${head}
Chart: birth date unknown — ask gently for it once, then guide with general wisdom meanwhile.`;
  }
  try {
    // Geocode the birthplace for an accurate Lagna; fall back to the default.
    let loc = DEF;
    if (p.birthplace) {
      const geo = await geocodePlace(p.birthplace);
      if (geo) loc = { lat: geo.lat, lon: geo.lon, tz: geo.tz };
    }
    const k = await computeKundli({ dob: p.dob, tob: p.tob ?? null, lat: loc.lat, lon: loc.lon, tz: loc.tz });
    const chain = currentDasha(k.dashas.vimshottari);
    const mdLord = chain[0]?.lord;
    const remedies = mdLord ? await remedyContext(mdLord) : "";
    return `${head}\n\n${chartSummaryForAI(k)}${remedies}`;
  } catch {
    return `${head}\nChart temporarily unavailable — guide with general wisdom.`;
  }
}

export async function buildTodayContext(): Promise<string> {
  try {
    const [p, cat] = await Promise.all([computePanchang(new Date(), DEF.lat, DEF.lon, DEF.tz), getCatalog()]);
    const T = (d: Date | null) => fmtTimeInZone(d, DEF.tz);
    const tithi = cat.tithi[p.tithi.current - 1];
    const rk = p.kaals.find((k) => k.code === "rahu_kaal");
    return `TODAY (computed live): ${cat.vaara[p.weekday]?.name_en}. ${cat.masa[p.masa.amantaId]?.amanta} maas${p.masa.isAdhika ? " (Adhika)" : ""}, ${tithi?.paksha} ${tithi?.name} tithi, ${cat.nakshatra[p.nakshatra.current]?.name} nakshatra, ${cat.yoga[p.yoga.current]?.name} yoga. Sunrise ${T(p.sunrise)}, sunset ${T(p.sunset)}. Rahu Kaal ${rk ? `${T(rk.start)}–${T(rk.end)}` : "n/a"}.`;
  } catch {
    return `TODAY: panchang temporarily unavailable.`;
  }
}

export { karanaIndexFromSlot };
