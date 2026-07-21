// ============================================================================
//  DIVASYA · Muhurta finder (ENGINES.md §2.7)
//  Scores each day in a range for an activity using the panchang engine:
//  favourable tithi/nakshatra/yoga/vaara, avoiding Rikta tithis, Bhadra
//  (Vishti karana), inauspicious yogas. Returns ranked shubh days.
// ============================================================================

import { computePanchang } from "../panchang/index";
import { karanaIndexFromSlot } from "../panchang/angas";

// Favourable nakshatras per activity (by index 0=Ashwini). Compact, extendable.
const ACTIVITY_NAK: Record<string, number[]> = {
  marriage: [0, 2, 6, 11, 12, 14, 16, 20, 21, 25, 26], // Ashwini, Krittika, Punarvasu, U.Phalguni, Hasta, Swati, Anuradha, U.Ashadha, Shravana, U.Bhadrapada, Revati
  griha_pravesh: [2, 6, 11, 12, 20, 21, 25, 26],
  vehicle: [2, 6, 7, 12, 13, 21, 22, 26],
  business: [2, 6, 7, 12, 13, 16, 21, 26],
  mundan: [4, 6, 7, 12, 15, 21, 22, 26],
  naamkaran: [2, 6, 7, 12, 21, 26],
};
const RIKTA = new Set([4, 9, 14, 19, 24, 29]); // Rikta tithis (both pakshas)
const BAD_YOGA = new Set([5, 8, 9, 12, 14, 16, 18, 26]);

export interface MuhurtaDay {
  date: string;
  score: number;                 // 0..100
  rating: "excellent" | "good" | "neutral" | "avoid";
  tithi: number; nakshatra: number; yoga: number;
  reasons: string[];
}

export async function findMuhurta(
  activity: string, from: Date, to: Date, lat: number, lon: number, tz: string
): Promise<MuhurtaDay[]> {
  const goodNak = ACTIVITY_NAK[activity] || [];
  const days: MuhurtaDay[] = [];
  const oneDay = 86400000;

  for (let t = from.getTime(); t <= to.getTime(); t += oneDay) {
    const noonLocal = new Date(t + 12 * 3600000);
    const p = await computePanchang(noonLocal, lat, lon, tz);
    const reasons: string[] = [];
    let score = 50;

    // nakshatra suitability
    if (goodNak.includes(p.nakshatra.current)) { score += 25; reasons.push("auspicious nakshatra"); }
    // tithi
    if (RIKTA.has(p.tithi.current)) { score -= 25; reasons.push("Rikta tithi (avoid)"); }
    else if (p.tithi.current === 30) { score -= 20; reasons.push("Amavasya"); }
    else score += 8;
    // yoga
    if (BAD_YOGA.has(p.yoga.current)) { score -= 15; reasons.push("inauspicious yoga"); }
    else score += 7;
    // karana — Bhadra (Vishti)
    const kIdx = karanaIndexFromSlot(p.karana.current);
    if (kIdx === 6) { score -= 12; reasons.push("Bhadra (Vishti karana)"); }
    // weekday nudge for a few activities
    if (activity === "vehicle" && [1, 3, 4, 5].includes(p.weekday)) { score += 5; }
    if (activity === "marriage" && p.weekday === 2) { score -= 8; reasons.push("Tuesday less ideal"); }

    score = Math.max(0, Math.min(100, score));
    const rating = score >= 75 ? "excellent" : score >= 60 ? "good" : score >= 45 ? "neutral" : "avoid";
    days.push({
      date: noonLocal.toISOString().slice(0, 10),
      score, rating,
      tithi: p.tithi.current, nakshatra: p.nakshatra.current, yoga: p.yoga.current,
      reasons,
    });
  }
  return days.sort((a, b) => b.score - a.score);
}
