// ============================================================================
//  DIVASYA · Panchang — sun-derived calendar (ENGINES.md §2.2)
//  Amanta/Purnimanta masa (from Sun's rashi at the opening new moon — the only
//  way to get Adhika masa right), adhika/kshaya detection, samvats, samvatsara,
//  ritu, ayana. Reference test: Adhika Jyeshtha 2026 = 2026-05-17 → 06-15.
// ============================================================================

import { Luminaries } from "../astro/types";
import { norm360, wrap180 } from "../astro/constants";
import { LumFn } from "./angas";

const SYNODIC_RATE = 360 / 29.53059; // ≈ 12.19°/day mean elongation rate

/**
 * Refine a new moon (Sun–Moon conjunction) near jdGuess. Uses the SIGNED
 * elongation (wrap ±180°) so the root-finder is stable across the E=0 wrap —
 * a plain norm360 crossing of 0 makes Newton jump a whole lunation.
 */
function refineNewMoon(lum: LumFn, jdGuess: number): number {
  let jd = jdGuess;
  for (let i = 0; i < 12; i++) {
    const l = lum(jd);
    const e = wrap180(l.moon.lon - l.sun.lon); // signed distance from conjunction
    const r = l.moon.speed - l.sun.speed;
    const step = e / r;
    jd -= step;
    if (Math.abs(step) < 1e-8) break;
  }
  return jd;
}

/** Last new moon at or before jd (guess back by the current elongation). */
export function lastNewMoon(lum: LumFn, jd: number): number {
  const E0 = norm360(lum(jd).moon.lon - lum(jd).sun.lon);
  return refineNewMoon(lum, jd - E0 / SYNODIC_RATE);
}
/** First new moon strictly after jd. */
export function nextNewMoon(lum: LumFn, jd: number): number {
  const E0 = norm360(lum(jd).moon.lon - lum(jd).sun.lon);
  return refineNewMoon(lum, jd + (360 - E0) / SYNODIC_RATE);
}

export interface MasaInfo {
  amantaId: number;       // 1 = Chaitra … 12 = Phalguna
  purnimantaId: number;
  isAdhika: boolean;
  isKshaya: boolean;
  paksha: "shukla" | "krishna";
  ritu: number;           // 0 = Vasanta … 5 = Shishira
  ayana: "uttarayana" | "dakshinayana";
  vikramSamvat: number;
  shakaSamvat: number;
  samvatsaraId: number;   // 1..60 (South / Drik convention)
}

/** amanta month id (1=Chaitra) from the Sun's rashi at a new moon. */
function masaIdFromNewMoon(sunLonAtNM: number): number {
  const R = Math.floor(norm360(sunLonAtNM) / 30);
  return ((R + 1) % 12) + 1; // R=11(Meena)→1 Chaitra
}

export function computeMasa(lum: LumFn, jd: number): MasaInfo {
  const monthStart = lastNewMoon(lum, jd);
  const monthEnd = nextNewMoon(lum, monthStart + 2);
  const sunStart = lum(monthStart).sun.lon;
  const sunEnd = lum(monthEnd).sun.lon;
  const R0 = Math.floor(norm360(sunStart) / 30);
  const R1 = Math.floor(norm360(sunEnd) / 30);

  const amantaId = masaIdFromNewMoon(sunStart);
  const isAdhika = R0 === R1;                    // no sankranti inside the lunation
  const isKshaya = ((R1 - R0 + 12) % 12) === 2;  // two sankrantis inside (rare)

  // paksha from current tithi
  const E = norm360(lum(jd).moon.lon - lum(jd).sun.lon);
  const paksha: "shukla" | "krishna" = E < 180 ? "shukla" : "krishna";
  // Purnimanta: krishna paksha carries the NEXT amanta month's name
  const purnimantaId = paksha === "krishna" ? (amantaId % 12) + 1 : amantaId;

  const ritu = Math.floor((amantaId - 1) / 2); // Chaitra/Vaishakha=Vasanta …

  const sunSign = Math.floor(norm360(lum(jd).sun.lon) / 30);
  const ayana: "uttarayana" | "dakshinayana" =
    sunSign >= 9 || sunSign <= 2 ? "uttarayana" : "dakshinayana";

  // Samvats increment at Chaitra Shukla Pratipada → find the most recent one.
  const chaitraStart = recentChaitraStart(lum, jd);
  const gregYear = new Date((chaitraStart - 2440587.5) * 86400000).getUTCFullYear();
  const shakaSamvat = gregYear - 78;
  const vikramSamvat = gregYear + 57;
  const samvatsaraId = (((shakaSamvat + 11) % 60) + 60) % 60 + 1; // South/Drik

  return {
    amantaId, purnimantaId, isAdhika, isKshaya, paksha, ritu, ayana,
    vikramSamvat, shakaSamvat, samvatsaraId,
  };
}

/** Most recent new moon (≤ jd) that opens Chaitra (Sun in Meena at the NM). */
function recentChaitraStart(lum: LumFn, jd: number): number {
  let t = lastNewMoon(lum, jd);
  for (let k = 0; k < 14; k++) {
    const R = Math.floor(norm360(lum(t).sun.lon) / 30);
    if (R === 11) return t;           // Sun in Meena → Chaitra new moon
    t = lastNewMoon(lum, t - 2);
  }
  return t;
}
