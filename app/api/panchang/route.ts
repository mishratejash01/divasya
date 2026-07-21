// Jyotish-grade panchang for a place + moment. Engine (Swiss Ephemeris) + the
// Supabase reference catalog (zero hardcoding). GET /api/panchang?lat&lon&tz&date
import { computePanchang } from "@/lib/panchang/index";
import { karanaIndexFromSlot } from "@/lib/panchang/angas";
import { getCatalog } from "@/lib/panchang/catalog";
import { fmtTimeInZone } from "@/lib/astro/time";

export const runtime = "nodejs";
export const maxDuration = 30;

const DEFAULTS = { lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" };

export async function GET(req: Request) {
  const u = new URL(req.url);
  const lat = Number(u.searchParams.get("lat") ?? DEFAULTS.lat);
  const lon = Number(u.searchParams.get("lon") ?? DEFAULTS.lon);
  const tz = u.searchParams.get("tz") || DEFAULTS.tz;
  const dateParam = u.searchParams.get("date");
  const moment = dateParam ? new Date(dateParam) : new Date();

  const [p, cat] = await Promise.all([computePanchang(moment, lat, lon, tz), getCatalog()]);
  const T = (d: Date | null) => fmtTimeInZone(d, tz);
  // End of the segment CONTAINING `moment` (not segment[0] — karana/tithi may
  // have already changed since sunrise).
  const endsNow = (s: { start: Date; end: Date }[]) => {
    const cur = s.find((seg) => moment >= seg.start && moment < seg.end) ?? s[s.length - 1];
    return cur ? T(cur.end) : null;
  };

  const tithiName = cat.tithi[p.tithi.current - 1];
  const karanaIdx = karanaIndexFromSlot(p.karana.current);

  // Display-ready block for the home screen (+ the currently-active choghadiya).
  const activeC = p.choghadiya.find((c) => moment >= c.start && moment < c.end) ?? null;
  const rkNow = p.kaals.find((k) => k.code === "rahu_kaal");
  const VRAT: Record<number, string> = { 4: "Sankashti Chaturthi", 11: "Ekadashi", 13: "Pradosh Vrat", 15: "Purnima Vrat", 19: "Sankashti Chaturthi", 26: "Ekadashi", 28: "Pradosh Vrat", 30: "Amavasya" };
  const home = {
    tithiDisplay: `${tithiName?.paksha === "shukla" ? "Shukla" : "Krishna"} ${tithiName?.name}`,
    weekday: cat.vaara[p.weekday]?.name_en,
    weekdayShort: cat.vaara[p.weekday]?.name_sa,
    dateLabel: new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "numeric", month: "long", year: "numeric" }).format(moment),
    sunrise: T(p.sunrise), sunset: T(p.sunset),
    rahuKaal: rkNow ? `${T(rkNow.start)} – ${T(rkNow.end)}` : null,
    masa: cat.masa[p.masa.amantaId]?.amanta, nakshatra: cat.nakshatra[p.nakshatra.current]?.name,
    vrat: VRAT[p.tithi.current] ?? null,
    active: activeC ? { name: activeC.name, good: activeC.good, to: T(activeC.end), toISO: activeC.end.toISOString() } : null,
  };

  return Response.json({
    home,
    precision: p.precision,
    timingGrade: p.timingGrade,
    location: { lat, lon, tz },
    date: moment.toISOString(),
    vaara: cat.vaara[p.weekday],
    sun: { rise: T(p.sunrise), set: T(p.sunset) },
    moon: { rise: T(p.moonrise), set: T(p.moonset) },
    tithi: { num: p.tithi.current, name: tithiName?.name, paksha: tithiName?.paksha, endsAt: endsNow(p.tithi.segments) },
    nakshatra: { index: p.nakshatra.current, name: cat.nakshatra[p.nakshatra.current]?.name, endsAt: endsNow(p.nakshatra.segments) },
    yoga: { index: p.yoga.current, name: cat.yoga[p.yoga.current]?.name, nature: cat.yoga[p.yoga.current]?.nature, endsAt: endsNow(p.yoga.segments) },
    karana: { name: cat.karana[karanaIdx]?.name, isVishti: cat.karana[karanaIdx]?.is_vishti, endsAt: endsNow(p.karana.segments) },
    masa: {
      amanta: cat.masa[p.masa.amantaId]?.amanta,
      purnimanta: cat.masa[p.masa.purnimantaId]?.amanta,
      isAdhika: p.masa.isAdhika, paksha: p.masa.paksha, ritu: p.masa.ritu, ayana: p.masa.ayana,
    },
    samvat: { vikram: p.masa.vikramSamvat, shaka: p.masa.shakaSamvat, samvatsara: cat.samvatsara[p.masa.samvatsaraId] },
    kaals: p.kaals.map((k) => ({ code: k.code, from: T(k.start), to: T(k.end) })),
    muhurtas: p.muhurtas.map((m) => ({ code: m.code, from: T(m.start), to: T(m.end) })),
    choghadiya: p.choghadiya.map((c) => ({ name: c.name, good: c.good, night: c.night, from: T(c.start), to: T(c.end) })),
  });
}
