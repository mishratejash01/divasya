// ============================================================================
//  DIVASYA · Astro engine — time pipeline (ENGINES.md Stage 0)
//  birthplace lat/lon → IANA zone (geo-tz) → local civil time → UTC (Luxon,
//  historical offsets) → UT Julian Day. Fixes the server-timezone bugs in the
//  old TS engines (which used new Date()/getDay() in the server zone).
// ============================================================================

import { find as geoFind } from "geo-tz";
import { DateTime } from "luxon";

export { jdToDate, dateToJd } from "./riseset";

/** IANA timezone for a coordinate (polygon-exact); "UTC" if unknown. */
export function zoneForCoords(lat: number, lon: number): string {
  try {
    const zones = geoFind(lat, lon);
    return zones[0] || "UTC";
  } catch {
    return "UTC";
  }
}

/** Local civil wall-clock (in `tz`) → the correct UTC instant. */
export function localToUTC(
  year: number, month: number, day: number,
  hour: number, minute: number, tz: string
): Date {
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: tz }
  );
  return dt.toUTC().toJSDate();
}

/** Parse "YYYY-MM-DD" + "HH:MM" (local to `tz`) → UTC Date. Noon if no time. */
export function birthToUTC(dob: string, tob: string | null, tz: string): Date {
  const [y, mo, d] = dob.split("-").map(Number);
  let h = 12, mi = 0;
  if (tob) {
    const [hh, mm] = tob.split(":").map(Number);
    h = hh; mi = mm;
  }
  return localToUTC(y, mo, d, h, mi, tz);
}

/** A UTC instant rendered as a Luxon DateTime in `tz` (for display). */
export function inZone(date: Date, tz: string): DateTime {
  return DateTime.fromJSDate(date, { zone: "utc" }).setZone(tz);
}

/** Format a UTC instant as "h:mm a" in `tz` (e.g. "5:49 AM"). */
export function fmtTimeInZone(date: Date | null, tz: string): string {
  if (!date) return "—";
  return inZone(date, tz).toFormat("h:mm a");
}
