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

const DEF = { lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" };

export async function buildChartContext(p: Profile): Promise<string> {
  const head = `DEVOTEE
Name: ${p.name || "devotee"} | DOB: ${p.dob || "unknown"} | TOB: ${p.tob || "unknown"} | Place: ${p.birthplace || "unknown"} | Lives in: ${p.current_location || "unknown"} | Gender: ${p.gender || "unknown"}`;
  if (!p.dob) {
    return `${head}
Chart: birth date unknown — ask gently for it once, then guide with general wisdom meanwhile.`;
  }
  try {
    const k = await computeKundli({ dob: p.dob, tob: p.tob ?? null, lat: DEF.lat, lon: DEF.lon, tz: DEF.tz });
    return `${head}\n\n${chartSummaryForAI(k)}`;
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
