// ============================================================================
//  DIVASYA — live Panchang engine
//  Every element (tithi, nakshatra, yoga, karana, masa, vaar, choghadiya,
//  Rahu Kaal, sunrise/sunset, vrat) is COMPUTED from real astronomy for the
//  actual moment & location. Zero hardcoded values.
// ============================================================================

import {
  julianDay, sunLongitude, moonLongitude, sidereal, norm360, sunriseSunset,
} from "./astro-core";

// Default observer: Hyderabad (client HQ). Overridable per call.
export const DEFAULT_COORDS = { lat: 17.385, lon: 78.4867, label: "Hyderabad" };

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
  "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
  "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata",
  "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];

const KARANA_MOVABLE = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];

export const MASA_NAMES = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwin", "Kartik", "Margashirsha", "Pausha", "Magha", "Phalguna",
];

export const VAAR = [
  { en: "Sunday", hi: "Ravivaar" }, { en: "Monday", hi: "Somvaar" }, { en: "Tuesday", hi: "Mangalvaar" },
  { en: "Wednesday", hi: "Budhvaar" }, { en: "Thursday", hi: "Guruvaar" }, { en: "Friday", hi: "Shukravaar" },
  { en: "Saturday", hi: "Shanivaar" },
];

// Choghadiya planetary hour cycle: Sun, Venus, Mercury, Moon, Saturn, Jupiter, Mars
const CHOG = [
  { name: "Udveg", good: false }, { name: "Char", good: true }, { name: "Labh", good: true },
  { name: "Amrit", good: true }, { name: "Kaal", good: false }, { name: "Shubh", good: true },
  { name: "Rog", good: false },
];
const CHOG_DAY_START = [0, 3, 6, 2, 5, 1, 4]; // by weekday (Sun..Sat)
const CHOG_NIGHT_START = [5, 1, 4, 0, 3, 6, 2];
const RAHU_SEG = [7, 1, 6, 4, 5, 3, 2]; // 0-based eighth of the day, by weekday
const YAMA_SEG = [4, 3, 2, 1, 0, 6, 5];

export type ChoghadiyaSlot = { name: string; good: boolean; from: Date; to: Date; night: boolean };

export type Panchang = {
  date: Date;
  weekday: string;        // "Monday"
  weekdayHi: string;      // "Somvaar"
  dateLabel: string;      // "13 July 2026"
  sunrise: Date | null;
  sunset: Date | null;
  tithi: { index: number; name: string; paksha: "Shukla" | "Krishna"; display: string };
  nakshatra: { index: number; name: string; pada: number };
  yoga: { index: number; name: string };
  karana: { name: string };
  masa: string;
  moonRashi: string;
  choghadiya: ChoghadiyaSlot[];
  rahuKaal: { from: Date; to: Date } | null;
  yamaganda: { from: Date; to: Date } | null;
  vrat: string | null;
  location: string;
};

const RASHI = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
];

function elongation(jd: number): number {
  return norm360(moonLongitude(jd) - sunLongitude(jd));
}

/** JD of the most recent new moon at/before `jd`. */
function lastNewMoon(jd: number): number {
  let hi = jd;
  let e = elongation(hi);
  // walk back until the elongation wraps (crosses 0 going backward)
  for (let i = 0; i < 130; i++) {
    const lo = hi - 0.25;
    const eLo = elongation(lo);
    if (eLo > e) {
      // wrap between lo..hi — bisect on signed elongation
      let a = lo, b = hi;
      for (let k = 0; k < 40; k++) {
        const m = (a + b) / 2;
        const em = elongation(m);
        if (em < 180) b = m; else a = m;
      }
      return (a + b) / 2;
    }
    hi = lo; e = eLo;
  }
  return jd - 29.53 / 2;
}

function vratForTithi(t: number, weekday: number): string | null {
  if (t === 10 || t === 25) return "Ekadashi Vrat";
  if (t === 14) return "Purnima";
  if (t === 29) return "Amavasya";
  if (t === 18) return "Sankashti Chaturthi";
  if (t === 3) return "Vinayaka Chaturthi";
  if (t === 12 || t === 27) return "Pradosh Vrat";
  if (t === 28) return "Masik Shivaratri";
  if (weekday === 1) return "Somvaar — Shiva Upasana";
  if (weekday === 2) return "Mangalvaar — Hanuman Upasana";
  if (weekday === 4) return "Guruvaar — Vishnu/Guru Upasana";
  if (weekday === 6) return "Shanivaar — Shani Upasana";
  return null;
}

export function computePanchang(
  date: Date = new Date(),
  coords: { lat: number; lon: number; label?: string } = DEFAULT_COORDS
): Panchang {
  const jd = julianDay(date);
  const sunT = sunLongitude(jd);
  const moonT = moonLongitude(jd);
  const sunS = sidereal(sunT, jd);
  const moonS = sidereal(moonT, jd);

  const elong = norm360(moonT - sunT);
  const tithiIdx = Math.floor(elong / 12);
  const paksha: "Shukla" | "Krishna" = tithiIdx < 15 ? "Shukla" : "Krishna";
  const tithiName = TITHI_NAMES[tithiIdx];

  const nakFloat = moonS / (360 / 27);
  const nakIdx = Math.floor(nakFloat) % 27;
  const pada = Math.floor((nakFloat % 1) * 4) + 1;

  const yogaIdx = Math.floor(norm360(sunS + moonS) / (360 / 27)) % 27;

  const kIdx = Math.floor(elong / 6);
  const karana =
    kIdx === 0 ? "Kimstughna"
    : kIdx >= 57 ? ["Shakuni", "Chatushpada", "Naga"][kIdx - 57]
    : KARANA_MOVABLE[(kIdx - 1) % 7];

  // Amanta masa: sun's sidereal sign at the last new moon
  const nmJd = lastNewMoon(jd);
  const sunSignAtNM = Math.floor(sidereal(sunLongitude(nmJd), nmJd) / 30);
  const masa = MASA_NAMES[(sunSignAtNM + 1) % 12];

  const weekday = date.getDay();
  const { sunrise, sunset } = sunriseSunset(date, coords.lat, coords.lon);

  // Choghadiya: 8 day slots (sunrise→sunset) + 8 night slots (sunset→next sunrise)
  const choghadiya: ChoghadiyaSlot[] = [];
  let rahuKaal: { from: Date; to: Date } | null = null;
  let yamaganda: { from: Date; to: Date } | null = null;
  if (sunrise && sunset) {
    const dayLen = (sunset.getTime() - sunrise.getTime()) / 8;
    for (let i = 0; i < 8; i++) {
      const c = CHOG[(CHOG_DAY_START[weekday] + i) % 7];
      choghadiya.push({
        ...c, night: false,
        from: new Date(sunrise.getTime() + i * dayLen),
        to: new Date(sunrise.getTime() + (i + 1) * dayLen),
      });
    }
    const next = new Date(date); next.setDate(next.getDate() + 1);
    const { sunrise: nextRise } = sunriseSunset(next, coords.lat, coords.lon);
    const nightEnd = nextRise ?? new Date(sunset.getTime() + (86400000 - (sunset.getTime() - sunrise.getTime())));
    const nightLen = (nightEnd.getTime() - sunset.getTime()) / 8;
    for (let i = 0; i < 8; i++) {
      const c = CHOG[(CHOG_NIGHT_START[weekday] + i) % 7];
      choghadiya.push({
        ...c, night: true,
        from: new Date(sunset.getTime() + i * nightLen),
        to: new Date(sunset.getTime() + (i + 1) * nightLen),
      });
    }
    const seg = (idx: number) => ({
      from: new Date(sunrise.getTime() + idx * dayLen),
      to: new Date(sunrise.getTime() + (idx + 1) * dayLen),
    });
    rahuKaal = seg(RAHU_SEG[weekday]);
    yamaganda = seg(YAMA_SEG[weekday]);
  }

  return {
    date,
    weekday: VAAR[weekday].en,
    weekdayHi: VAAR[weekday].hi,
    dateLabel: date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    sunrise, sunset,
    tithi: { index: tithiIdx, name: tithiName, paksha, display: `${paksha} ${tithiName}` },
    nakshatra: { index: nakIdx, name: NAKSHATRA_NAMES[nakIdx], pada },
    yoga: { index: yogaIdx, name: YOGA_NAMES[yogaIdx] },
    karana: { name: karana },
    masa,
    moonRashi: RASHI[Math.floor(moonS / 30)],
    choghadiya,
    rahuKaal, yamaganda,
    vrat: vratForTithi(tithiIdx, weekday),
    location: coords.label ?? DEFAULT_COORDS.label,
  };
}

/** The choghadiya slot active at `now` (day or night). */
export function activeChoghadiya(p: Panchang, now: Date = new Date()): ChoghadiyaSlot | null {
  return p.choghadiya.find((c) => now >= c.from && now < c.to) ?? null;
}

export const fmtTime = (d: Date | null) =>
  d ? d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "—";
