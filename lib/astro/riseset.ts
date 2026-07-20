// ============================================================================
//  DIVASYA · Astro engine — rise/set (ENGINES.md §2.1)
//  Uses astronomy-engine's search: refraction-corrected, topocentric — the
//  right tool for rise/set on every tier (independent of the position tier).
//  Polar fallback (no rise/set) is handled by the panchang layer, not here.
// ============================================================================

import * as A from "astronomy-engine";
import { Body } from "./types";

const AE_BODY: Partial<Record<Body, A.Body>> = {
  sun: A.Body.Sun,
  moon: A.Body.Moon,
};

/** Julian Day (UT) → JS Date (UTC). */
export function jdToDate(jdUT: number): Date {
  return new Date((jdUT - 2440587.5) * 86400000);
}
/** JS Date (UTC) → Julian Day (UT). */
export function dateToJd(d: Date): number {
  return d.getTime() / 86400000 + 2440587.5;
}

/**
 * Find the next rise/set of body after jdUT at (lat, lon). Returns the JD (UT)
 * of the event, or null if none in the search window (polar day/night).
 */
export function riseSet(
  jdUT: number,
  body: Body,
  lat: number,
  lon: number,
  opts: { event: "rise" | "set" | "upper_transit"; hindu?: boolean }
): number | null {
  const aeBody = AE_BODY[body];
  if (!aeBody) return null;
  const observer = new A.Observer(lat, lon, 0);
  const start = A.MakeTime(jdToDate(jdUT));

  if (opts.event === "upper_transit") {
    const t = A.SearchHourAngle(aeBody, observer, 0, start, +1);
    return t ? dateToJd(t.time.date) : null;
  }

  const direction = opts.event === "rise" ? +1 : -1;
  // Hindu middle-limb convention drops refraction; Drik default keeps it.
  const metersAboveGround = 0;
  const t = A.SearchRiseSet(aeBody, observer, direction, start, 1, metersAboveGround);
  return t ? dateToJd(t.date) : null;
}
