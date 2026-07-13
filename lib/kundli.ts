// ============================================================================
//  DIVASYA — Vedic kundli engine
//  Computes the user's REAL sidereal chart (nine grahas + lagna) and the
//  full Vimshottari mahadasha/antardasha timeline from their birth details.
//  This grounds the AI Jyotishi in genuine astronomy — no invented charts.
// ============================================================================

import {
  julianDay, planetLongitudes, sidereal, ascendant, norm360, PlanetName,
} from "./astro-core";
import { NAKSHATRA_NAMES } from "./panchang";
import { DEFAULT_COORDS } from "./panchang";

export const RASHI_EN = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

const DASHA_SEQ: PlanetName[] = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};
const YEAR_MS = 365.2425 * 86400000;

export type GrahaPosition = { graha: PlanetName; longitude: number; sign: string; signIndex: number; degInSign: number };
export type DashaPeriod = { lord: PlanetName; from: Date; to: Date };

export type Kundli = {
  positions: GrahaPosition[];
  moonSign: string;
  sunSign: string;
  lagna: string | null;
  nakshatra: { name: string; pada: number };
  mahadasha: DashaPeriod;
  antardasha: DashaPeriod;
  dashaTimeline: DashaPeriod[];
  birthDate: Date;
};

function toPosition(graha: PlanetName, lonSid: number): GrahaPosition {
  const signIndex = Math.floor(lonSid / 30);
  return { graha, longitude: lonSid, sign: RASHI_EN[signIndex], signIndex, degInSign: lonSid % 30 };
}

/** Vimshottari timeline from the sidereal moon longitude at birth. */
function vimshottari(moonSid: number, birth: Date): DashaPeriod[] {
  const nakSpan = 360 / 27;
  const nakIdx = Math.floor(moonSid / nakSpan);
  const frac = (moonSid % nakSpan) / nakSpan;
  const startLordIdx = nakIdx % 9;
  const balanceYears = (1 - frac) * DASHA_YEARS[DASHA_SEQ[startLordIdx]];
  const timeline: DashaPeriod[] = [];
  let cursor = birth.getTime();
  for (let i = 0; i < 12; i++) {
    const lord = DASHA_SEQ[(startLordIdx + i) % 9];
    const years = i === 0 ? balanceYears : DASHA_YEARS[lord];
    const end = cursor + years * YEAR_MS;
    timeline.push({ lord, from: new Date(cursor), to: new Date(end) });
    cursor = end;
  }
  return timeline;
}

/** Antardasha (bhukti) inside a mahadasha, at `at`. */
function antardashaAt(maha: DashaPeriod, at: Date): DashaPeriod {
  const total = maha.to.getTime() - maha.from.getTime();
  const startIdx = DASHA_SEQ.indexOf(maha.lord);
  let cursor = maha.from.getTime();
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_SEQ[(startIdx + i) % 9];
    const len = (total * DASHA_YEARS[lord]) / 120;
    if (at.getTime() < cursor + len || i === 8) {
      return { lord, from: new Date(cursor), to: new Date(cursor + len) };
    }
    cursor += len;
  }
  return maha;
}

/**
 * Compute a full kundli. `dob` = "YYYY-MM-DD", `tob` = "HH:MM" (local, optional
 * — noon is assumed when unknown, which is standard fallback practice).
 */
export function computeKundli(
  dob: string | null | undefined,
  tob?: string | null,
  coords: { lat: number; lon: number } = DEFAULT_COORDS,
  at: Date = new Date()
): Kundli | null {
  if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const [y, m, d] = dob.split("-").map(Number);
  let hh = 12, mm = 0;
  const hasTob = !!tob && /^\d{1,2}:\d{2}/.test(tob);
  if (hasTob) { const t = tob!.split(":"); hh = +t[0]; mm = +t[1]; }
  const birth = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (isNaN(birth.getTime())) return null;

  const jd = julianDay(birth);
  const tropical = planetLongitudes(jd);
  const positions = (Object.keys(tropical) as PlanetName[]).map((g) =>
    toPosition(g, sidereal(tropical[g], jd))
  );
  const moon = positions.find((p) => p.graha === "Moon")!;
  const sun = positions.find((p) => p.graha === "Sun")!;

  const nakSpan = 360 / 27;
  const nakName = NAKSHATRA_NAMES[Math.floor(moon.longitude / nakSpan) % 27];
  const pada = Math.floor(((moon.longitude % nakSpan) / nakSpan) * 4) + 1;

  const timeline = vimshottari(moon.longitude, birth);
  const maha = timeline.find((p) => at >= p.from && at < p.to) ?? timeline[timeline.length - 1];
  const antar = antardashaAt(maha, at);

  return {
    positions,
    moonSign: moon.sign,
    sunSign: sun.sign,
    lagna: hasTob ? RASHI_EN[Math.floor(norm360(ascendant(jd, coords.lat, coords.lon)) / 30)] : null,
    nakshatra: { name: nakName, pada },
    mahadasha: maha,
    antardasha: antar,
    dashaTimeline: timeline,
    birthDate: birth,
  };
}

const fmtMY = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });

/** Compact, prompt-ready summary of the real chart. */
export function kundliSummary(k: Kundli): string {
  const pos = k.positions
    .map((p) => `${p.graha}: ${p.sign.split(" ")[0]} ${p.degInSign.toFixed(1)}°`)
    .join("; ");
  const upcoming = k.dashaTimeline
    .filter((p) => p.to > new Date())
    .slice(0, 4)
    .map((p) => `${p.lord} (${fmtMY(p.from)}–${fmtMY(p.to)})`)
    .join(", ");
  return [
    `Graha positions (sidereal/Lahiri, computed astronomically): ${pos}.`,
    k.lagna ? `Lagna: ${k.lagna}.` : `Lagna: unknown (birth time not given).`,
    `Moon rashi: ${k.moonSign}; Janma nakshatra: ${k.nakshatra.name} (pada ${k.nakshatra.pada}).`,
    `Current Vimshottari: ${k.mahadasha.lord} Mahadasha (${fmtMY(k.mahadasha.from)} – ${fmtMY(k.mahadasha.to)}), ${k.antardasha.lord} Antardasha (${fmtMY(k.antardasha.from)} – ${fmtMY(k.antardasha.to)}).`,
    `Upcoming dasha windows: ${upcoming}.`,
  ].join("\n");
}
