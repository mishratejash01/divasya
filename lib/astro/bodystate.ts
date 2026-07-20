// ============================================================================
//  DIVASYA · Astro engine — body-state enrichment (ENGINES.md §2.1)
//  Turns raw (lon, speed, lat) into a full BodyPosition, then applies the
//  cross-body phenomena (combustion, graha-yuddha) over the whole set.
// ============================================================================

import { Body, BodyPosition, GrahaId } from "./types";
import {
  NAK, PADA, norm360, wrap180, MEAN_DAILY_MOTION, COMBUSTION_ORB,
  COMBUSTION_ORB_RETRO, GRAHAS,
} from "./constants";

export interface RawBody {
  body: Body;
  lon: number;          // sidereal
  tropicalLon: number;
  lat: number;
  distanceAU: number;
  lonSpeed: number;
}

/** Per-body enrichment that needs no other body. */
export function enrichOne(r: RawBody): BodyPosition {
  const lon = norm360(r.lon);
  const signIndex = Math.floor(lon / 30);
  const degInSign = lon - signIndex * 30;
  const nakshatraIndex = Math.floor(lon / NAK) % 27;
  const pada = (Math.floor(lon / PADA) % 4) + 1;
  const mean = MEAN_DAILY_MOTION[r.body as GrahaId] ?? 1;
  const retrograde = r.lonSpeed < 0;
  const stationary = Math.abs(r.lonSpeed) < 0.1 * mean && r.body !== "sun" && r.body !== "moon";
  return {
    body: r.body,
    lon,
    tropicalLon: norm360(r.tropicalLon),
    lat: r.lat,
    distanceAU: r.distanceAU,
    lonSpeed: r.lonSpeed,
    retrograde,
    stationary,
    signIndex,
    degInSign,
    nakshatraIndex,
    pada,
    combust: false,
    balaProximityToSun: false,
    inWar: false,
  };
}

/**
 * Fill combustion + graha-yuddha across the whole set. The Sun is required.
 * Moon's "combustion" is bala-only (amavasya proximity), never predictive.
 */
export function applyCrossBody(map: Record<Body, BodyPosition>): void {
  const sun = map.sun;
  if (!sun) return;

  for (const g of GRAHAS) {
    const p = map[g];
    if (!p || g === "sun" || g === "rahu" || g === "ketu") continue;
    const sep = Math.abs(wrap180(p.lon - sun.lon));
    if (g === "moon") {
      p.balaProximityToSun = sep <= COMBUSTION_ORB.moon; // bala factor only
      continue;
    }
    const orb = (p.retrograde && COMBUSTION_ORB_RETRO[g]) || COMBUSTION_ORB[g];
    p.combust = sep <= orb;
  }

  // Graha-yuddha: two tara grahas within 1°; both flagged inWar.
  const tara: GrahaId[] = ["mars", "mercury", "jupiter", "venus", "saturn"];
  for (let i = 0; i < tara.length; i++) {
    for (let j = i + 1; j < tara.length; j++) {
      const a = map[tara[i]], b = map[tara[j]];
      if (a && b && Math.abs(wrap180(a.lon - b.lon)) <= 1) {
        a.inWar = true;
        b.inWar = true;
      }
    }
  }
}
