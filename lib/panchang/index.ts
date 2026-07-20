// ============================================================================
//  DIVASYA · Panchang engine — orchestrator (ENGINES.md §2.2)
//  computePanchang(moment, lat, lon, tz) → sunrise-anchored day with every
//  anga's exact end-time, masa/samvatsara, all kaals/muhurtas/choghadiya/hora.
//  Pure over (provider, inputs); names are joined at presentation.
// ============================================================================

import { getEphemeris } from "../astro/engine";
import { Luminaries } from "../astro/types";
import { dateToJd, jdToDate } from "../astro/riseset";
import { inZone } from "../astro/time";
import { angaSegments, angaIndex, tithiNumber, karanaIndexFromSlot, LumFn } from "./angas";
import { computeMasa, MasaInfo } from "./calendar";
import {
  dayPartKaals, muhurtaWindows, choghadiya, horas, Window, Choghadiya, Hora,
} from "./muhurta";

export interface Seg { index: number; start: Date; end: Date }
export interface DatedWindow { code: string; start: Date; end: Date; auspicious: boolean }

export interface Panchang {
  ref: Date;
  tz: string; lat: number; lon: number;
  weekday: number;                 // 0 = Sunday
  sunrise: Date | null; sunset: Date | null;
  moonrise: Date | null; moonset: Date | null;
  dayLengthHours: number;
  polarFallback: boolean;
  tithi: { segments: Seg[]; current: number };       // current = tithi number 1-30
  nakshatra: { segments: Seg[]; current: number };   // 0-26
  yoga: { segments: Seg[]; current: number };        // 0-26
  karana: { segments: Seg[]; current: number };      // slot 0-59 → use karanaIndexFromSlot
  masa: MasaInfo;
  kaals: DatedWindow[];
  muhurtas: DatedWindow[];
  choghadiya: (Omit<Choghadiya, "startJd" | "endJd"> & { start: Date; end: Date })[];
  horas: (Omit<Hora, "startJd" | "endJd"> & { start: Date; end: Date })[];
  precision: string;
  timingGrade: boolean;
}

const toDate = (jd: number): Date => jdToDate(jd);
const win = (w: Window): DatedWindow => ({ code: w.code, start: toDate(w.startJd), end: toDate(w.endJd), auspicious: w.auspicious });

export async function computePanchang(
  moment: Date, lat: number, lon: number, tz: string
): Promise<Panchang> {
  const provider = await getEphemeris();
  const lum: LumFn = (jd: number): Luminaries => provider.luminaries(jd);

  // Anchor to the local civil date's sunrise (Udaya). Start the rise search at
  // local midnight so we land on THIS day's sunrise.
  const local = inZone(moment, tz);
  const midnightUTC = local.startOf("day").toUTC().toJSDate();
  const jdMidnight = dateToJd(midnightUTC);

  let sunriseJd = provider.riseSet(jdMidnight, "sun", lat, lon, { event: "rise" });
  let polarFallback = false;
  if (sunriseJd == null) {
    polarFallback = true;
    sunriseJd = jdMidnight + 6 / 24; // 06:00 local fallback
  }
  let sunsetJd = provider.riseSet(sunriseJd, "sun", lat, lon, { event: "set" });
  if (sunsetJd == null) { polarFallback = true; sunsetJd = sunriseJd + 12 / 24; }
  let nextSunriseJd = provider.riseSet(sunsetJd, "sun", lat, lon, { event: "rise" });
  if (nextSunriseJd == null) nextSunriseJd = sunriseJd + 1;

  const moonriseJd = provider.riseSet(jdMidnight, "moon", lat, lon, { event: "rise" });
  const moonsetJd = provider.riseSet(jdMidnight, "moon", lat, lon, { event: "set" });

  const weekday = (inZone(toDate(sunriseJd), tz).weekday % 7); // luxon 1=Mon..7=Sun → 0=Sun

  const seg = (kind: "tithi" | "nakshatra" | "yoga" | "karana"): Seg[] =>
    angaSegments(kind, lum, sunriseJd!, nextSunriseJd!).map((s) => ({
      index: s.index, start: toDate(s.startJd), end: toDate(s.endJd),
    }));

  const refJd = dateToJd(moment);
  const masa = computeMasa(lum, sunriseJd);

  return {
    ref: moment, tz, lat, lon, weekday,
    sunrise: toDate(sunriseJd), sunset: toDate(sunsetJd),
    moonrise: moonriseJd ? toDate(moonriseJd) : null,
    moonset: moonsetJd ? toDate(moonsetJd) : null,
    dayLengthHours: (sunsetJd - sunriseJd) * 24,
    polarFallback,
    tithi: { segments: seg("tithi"), current: tithiNumber(angaIndex("tithi", lum, refJd)) },
    nakshatra: { segments: seg("nakshatra"), current: angaIndex("nakshatra", lum, refJd) },
    yoga: { segments: seg("yoga"), current: angaIndex("yoga", lum, refJd) },
    karana: { segments: seg("karana"), current: angaIndex("karana", lum, refJd) },
    masa,
    kaals: dayPartKaals(sunriseJd, sunsetJd, weekday).map(win),
    muhurtas: muhurtaWindows(sunriseJd, sunsetJd, nextSunriseJd, weekday).map(win),
    choghadiya: choghadiya(sunriseJd, sunsetJd, nextSunriseJd, weekday).map((c) => ({
      name: c.name, good: c.good, night: c.night, start: toDate(c.startJd), end: toDate(c.endJd),
    })),
    horas: horas(sunriseJd, sunsetJd, nextSunriseJd, weekday).map((h) => ({
      lord: h.lord, night: h.night, start: toDate(h.startJd), end: toDate(h.endJd),
    })),
    precision: provider.precision,
    timingGrade: provider.timingGrade,
  };
}

export { karanaIndexFromSlot };
