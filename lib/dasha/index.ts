// ============================================================================
//  DIVASYA · Dasha engine (ENGINES.md §2.4)
//  Vimshottari (120y, primary) + Yogini (36y). Wheel-anchored, exact-fraction
//  boundaries computed in UT ms, rendered later in the birth zone. Fixes the
//  first-MD bug in the old dasha.py/kundli.ts and pins YEAR = 365.25 days.
// ============================================================================

import { GrahaId } from "../astro/types";
import { NAK, norm360 } from "../astro/constants";

const YEAR_MS = 365.25 * 86400000;

export type DashaSystem = "vimshottari" | "yogini" | "ashtottari";

export interface DashaPeriod {
  system: DashaSystem;
  level: number;              // 1 = maha, 2 = antar, 3 = pratyantar …
  lord: string;               // graha id or yogini name
  start: Date;
  end: Date;
  years: number;
  children?: DashaPeriod[];
}

// Vimshottari sequence + years (total 120).
const VIM: { lord: GrahaId; years: number }[] = [
  { lord: "ketu", years: 7 }, { lord: "venus", years: 20 }, { lord: "sun", years: 6 },
  { lord: "moon", years: 10 }, { lord: "mars", years: 7 }, { lord: "rahu", years: 18 },
  { lord: "jupiter", years: 16 }, { lord: "saturn", years: 19 }, { lord: "mercury", years: 17 },
];
const VIM_TOTAL = 120;

// Yogini sequence (36y). Start index derived from nakshatra.
const YOG: { lord: string; years: number }[] = [
  { lord: "Mangala", years: 1 }, { lord: "Pingala", years: 2 }, { lord: "Dhanya", years: 3 },
  { lord: "Bhramari", years: 4 }, { lord: "Bhadrika", years: 5 }, { lord: "Ulka", years: 6 },
  { lord: "Siddha", years: 7 }, { lord: "Sankata", years: 8 },
];
const YOG_TOTAL = 36;

// Ashtottari (108y, conditional/secondary). Counted from Ardra.
const ASH: { lord: GrahaId; years: number }[] = [
  { lord: "sun", years: 6 }, { lord: "moon", years: 15 }, { lord: "mars", years: 8 },
  { lord: "mercury", years: 17 }, { lord: "saturn", years: 10 }, { lord: "jupiter", years: 19 },
  { lord: "rahu", years: 12 }, { lord: "venus", years: 21 },
];
const ASH_TOTAL = 108;
// Ashtottari nakshatra→lord start index (grouped 4/3, counted from Ardra=5).
function ashottariStartIdx(nak: number): number {
  const fromArdra = ((nak - 5) % 27 + 27) % 27;
  // groups of sizes cycling; approximate the classical 4/4/3... grouping
  const bounds = [3, 7, 10, 14, 18, 21, 25, 27]; // cumulative nakshatra counts per lord
  for (let i = 0; i < bounds.length; i++) if (fromArdra < bounds[i]) return i;
  return 0;
}

function subdivide(
  system: DashaSystem, seq: { lord: string; years: number }[], total: number,
  parentLordIdx: number, parentStartMs: number, parentYears: number,
  level: number, maxLevel: number
): DashaPeriod[] | undefined {
  if (level > maxLevel) return undefined;
  const out: DashaPeriod[] = [];
  let cursor = parentStartMs;
  for (let k = 0; k < seq.length; k++) {
    const child = seq[(parentLordIdx + k) % seq.length];
    const childYears = (parentYears * child.years) / total;
    const ms = childYears * YEAR_MS;
    out.push({
      system, level, lord: child.lord,
      start: new Date(cursor), end: new Date(cursor + ms), years: childYears,
      children: subdivide(system, seq, total, (parentLordIdx + k) % seq.length, cursor, childYears, level + 1, maxLevel),
    });
    cursor += ms;
  }
  return out;
}

function buildTimeline(
  system: DashaSystem, seq: { lord: string; years: number }[], total: number,
  startLordIdx: number, frac: number, birthMs: number, maxLevel: number
): DashaPeriod[] {
  const elapsedYears = frac * seq[startLordIdx].years;
  let cursor = birthMs - elapsedYears * YEAR_MS; // wheelStart (before birth)
  const out: DashaPeriod[] = [];
  for (let i = 0; i < seq.length; i++) {
    const idx = (startLordIdx + i) % seq.length;
    const md = seq[idx];
    const ms = md.years * YEAR_MS;
    out.push({
      system, level: 1, lord: md.lord,
      start: new Date(cursor), end: new Date(cursor + ms), years: md.years,
      children: subdivide(system, seq, total, idx, cursor, md.years, 2, maxLevel),
    });
    cursor += ms;
  }
  return out;
}

/** Full dashamahadasha timeline for a system (one 120y/36y wheel from wheelStart). */
export function dashaTimeline(
  system: DashaSystem, moonSiderealLon: number, birth: Date, maxLevel = 3
): DashaPeriod[] {
  const L = norm360(moonSiderealLon);
  const nak = Math.floor(L / NAK);
  const frac = (L - nak * NAK) / NAK;
  const birthMs = birth.getTime();
  if (system === "vimshottari") {
    return buildTimeline("vimshottari", VIM, VIM_TOTAL, nak % 9, frac, birthMs, maxLevel);
  } else if (system === "ashtottari") {
    return buildTimeline("ashtottari", ASH, ASH_TOTAL, ashottariStartIdx(nak), frac, birthMs, maxLevel);
  } else {
    const startIdx = (nak + 3) % 8; // Yogini start (spec §2.4)
    return buildTimeline("yogini", YOG, YOG_TOTAL, startIdx, frac, birthMs, maxLevel);
  }
}

/** The running chain (maha → antar → …) at a given instant. */
export function currentDasha(timeline: DashaPeriod[], at: Date = new Date()): DashaPeriod[] {
  const chain: DashaPeriod[] = [];
  let level = timeline;
  while (level && level.length) {
    const p = level.find((x) => at >= x.start && at < x.end);
    if (!p) break;
    chain.push(p);
    level = p.children || [];
  }
  return chain;
}

/** Compact "MahaLord–AntarLord until DD Mon YYYY" for AI grounding. */
export function dashaChainSummary(chain: DashaPeriod[]): string {
  if (!chain.length) return "unknown";
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const lords = chain.map((c) => cap(c.lord)).join("–");
  const inner = chain[chain.length - 1];
  return `${lords} (until ${fmt(inner.end)})`;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
