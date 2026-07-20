// ============================================================================
//  DIVASYA · Panchang — the five angas (ENGINES.md §2.2)
//  Tithi · Nakshatra · Yoga · Karana · (Vaara is assigned in the orchestrator).
//  All use the apparent GEOCENTRIC Sun/Moon (never topocentric) — the single
//  biggest silent-error risk in panchang. Returns indices + exact JD times;
//  names are joined from the Supabase catalog at presentation.
// ============================================================================

import { Luminaries } from "../astro/types";
import { NAK, norm360 } from "../astro/constants";
import { nextCrossing, prevCrossing } from "./rootfind";

export type LumFn = (jd: number) => Luminaries;

/** A slice of a day during which one anga value prevails. */
export interface AngaSegment {
  index: number;    // tithi 1-30 / nakshatra 0-26 / yoga 0-26 / karana slot 0-59
  startJd: number;
  endJd: number;
}

type AngaKind = "tithi" | "nakshatra" | "yoga" | "karana";

interface AngaDef {
  step: number;                                   // degrees per unit
  angle: (l: Luminaries) => number;               // 0..(360 or 720)
  rate: (l: Luminaries) => number;                // °/day, positive
  wrap: number;                                   // 360 for M/E, 720 for S+M pre-mod
  units: number;                                  // 30 tithi, 27 nak/yoga, 60 karana
}

const DEFS: Record<AngaKind, AngaDef> = {
  tithi: {
    step: 12, units: 30, wrap: 360,
    angle: (l) => norm360(l.moon.lon - l.sun.lon),
    rate: (l) => l.moon.speed - l.sun.speed,
  },
  nakshatra: {
    step: NAK, units: 27, wrap: 360,
    angle: (l) => l.moon.lon,
    rate: (l) => l.moon.speed,
  },
  yoga: {
    step: NAK, units: 27, wrap: 360,
    angle: (l) => norm360(l.sun.lon + l.moon.lon),
    rate: (l) => l.moon.speed + l.sun.speed,
  },
  karana: {
    step: 6, units: 60, wrap: 360,
    angle: (l) => norm360(l.moon.lon - l.sun.lon),
    rate: (l) => l.moon.speed - l.sun.speed,
  },
};

/** Index (0-based unit) of an anga at a JD. */
export function angaIndex(kind: AngaKind, lum: LumFn, jd: number): number {
  const d = DEFS[kind];
  const a = d.angle(lum(jd));
  return Math.floor(a / d.step) % d.units;
}

/**
 * All segments of one anga type covering [jdStart, jdEnd] (sunrise→next-sunrise).
 * The first segment carries its true start (may precede jdStart). Handles 0/1/2
 * transitions per day (kshaya = 2 in the window; vriddhi = spans two sunrises).
 */
export function angaSegments(
  kind: AngaKind, lum: LumFn, jdStart: number, jdEnd: number
): AngaSegment[] {
  const d = DEFS[kind];
  const angle = (jd: number) => d.angle(lum(jd));
  const rate = (jd: number) => d.rate(lum(jd));

  const segs: AngaSegment[] = [];
  let jd = jdStart;
  let guard = 0;
  while (jd < jdEnd && guard++ < 40) {
    const idx = Math.floor(angle(jd) / d.step) % d.units;
    const boundaryEnd = ((idx + 1) * d.step) % d.wrap;
    const boundaryStart = (idx * d.step) % d.wrap;
    const endJd = nextCrossing(jd, boundaryEnd, angle, rate);
    const startJd = segs.length === 0 ? prevCrossing(jd, boundaryStart, angle, rate) : jd;
    segs.push({ index: idx, startJd, endJd });
    jd = endJd + 1e-6;
  }
  return segs;
}

/** Tithi is 1..30 (index+1); the others are 0-based. Karana name mapping below. */
export function tithiNumber(slot: number): number { return slot + 1; }

/** Karana slot (0..59) → the 11-karana index (0..10). */
export function karanaIndexFromSlot(p: number): number {
  // slot 0 = Kimstughna(10); 1..56 cycle the 7 movable; 57 Shakuni(7), 58 Chatushpada(8), 59 Naga(9)
  const MOVABLE = [0, 1, 2, 3, 4, 5, 6]; // Bava..Vishti
  if (p === 0) return 10;               // Kimstughna
  if (p >= 1 && p <= 56) return MOVABLE[(p - 1) % 7];
  if (p === 57) return 7;               // Shakuni
  if (p === 58) return 8;               // Chatushpada
  return 9;                              // Naga (59)
}
