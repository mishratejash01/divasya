// ============================================================================
//  DIVASYA · Astro engine — shared constants & the validated Lahiri ayanamsa
//  (ENGINES.md §2.1). These orbs/tables will migrate to `astro_constants` in
//  Supabase (Stage 0); kept here as the typed, CI-asserted source of truth.
// ============================================================================

import { Body, GrahaId } from "./types";

export const J2000 = 2451545.0;
export const NAK = 360 / 27; // 13°20′
export const PADA = NAK / 4; // 3°20′

export const norm360 = (x: number): number => ((x % 360) + 360) % 360;
export const wrap180 = (x: number): number => {
  let a = norm360(x);
  if (a > 180) a -= 360;
  return a;
};

/**
 * Lahiri (Chitrapaksha) ayanamsa as a cubic in Julian centuries T from J2000,
 * fit to Swiss Ephemeris `SE_SIDM_LAHIRI`. Verified against sweph:
 * max error < 0.001″ across 1950–2100; exact at 2026-07-14 (24.227743°).
 * This is the tier-independent ayanamsa: subtracted uniformly across every
 * ephemeris tier so Tier 1 and Tier 4 sidereal longitudes agree (critique A).
 */
const LAHIRI = [23.8570923518, 1.3968879571, 0.0003070908, 0.0000000038];
export function lahiriAyanamsa(jdUT: number): number {
  const T = (jdUT - J2000) / 36525;
  return LAHIRI[0] + LAHIRI[1] * T + LAHIRI[2] * T * T + LAHIRI[3] * T * T * T;
}

/** Swiss Ephemeris body ids. */
export const SWE_ID: Record<Body, number> = {
  sun: 0, moon: 1, mercury: 2, venus: 3, mars: 4, jupiter: 5, saturn: 6,
  uranus: 7, neptune: 8, pluto: 9,
  rahu: 10, // SE_MEAN_NODE (default); SE_TRUE_NODE = 11
  ketu: -1, // derived = Rahu + 180
};

/** Display / vaara order of the nine grahas. */
export const GRAHAS: GrahaId[] = [
  "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu",
];

/** Mean daily motion (°/day) — for the stationary threshold (10% of mean). */
export const MEAN_DAILY_MOTION: Record<GrahaId, number> = {
  sun: 0.9856, moon: 13.176, mars: 0.524, mercury: 1.383, jupiter: 0.083,
  venus: 1.2, saturn: 0.033, rahu: 0.0529, ketu: 0.0529,
};

/**
 * Classical combustion (asta) orbs in degrees vs the Sun. Retro values in
 * parens where different. Nodes never combust; Moon is bala-only (critique F).
 */
export const COMBUSTION_ORB: Record<GrahaId, number> = {
  sun: 0, moon: 12, mars: 17, mercury: 14, jupiter: 11, venus: 10, saturn: 15,
  rahu: 0, ketu: 0,
};
export const COMBUSTION_ORB_RETRO: Partial<Record<GrahaId, number>> = {
  mercury: 12, venus: 8,
};

export const RASHIS_SA = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
