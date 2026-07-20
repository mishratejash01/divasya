// ============================================================================
//  DIVASYA · Panchang — kaals & muhurtas (ENGINES.md §2.2)
//  Everything scales with the REAL day (D = sunset−sunrise) / night (N) length.
//  Weekday part tables are the CI-verified constants (also seeded in `vaaras`).
//  All times are JD (UT); the presentation layer renders them in the local tz.
// ============================================================================

export interface Window { code: string; startJd: number; endJd: number; auspicious: boolean }

const DAY = 1; // 1 day in JD units

// 1-indexed octant (D/8) part per weekday [Sun..Sat] (spec §2.2, verified vs Drik).
const RAHU_PART = [8, 2, 7, 5, 6, 4, 3];
const YAMA_PART = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_PART = [7, 6, 5, 4, 3, 2, 1];

// Choghadiya cyclic types + weekday start offsets (kept from the verified engine).
export const CHOG = [
  { name: "Udveg", good: false }, { name: "Char", good: true }, { name: "Labh", good: true },
  { name: "Amrit", good: true }, { name: "Kaal", good: false }, { name: "Shubh", good: true },
  { name: "Rog", good: false },
];
const CHOG_DAY_START = [0, 3, 6, 2, 5, 1, 4];
const CHOG_NIGHT_START = [5, 1, 4, 0, 3, 6, 2];

// Hora planetary-hour lords, cyclic (Chaldean): Saturn..Moon order used per weekday.
const HORA_LORDS = ["sun", "venus", "mercury", "moon", "saturn", "jupiter", "mars"];
// Day's first hora lord = the weekday lord; [Sun..Sat] indices into HORA_LORDS.
const HORA_DAY_START = [0, 3, 6, 2, 5, 1, 4];

/** The day-part kaals (Rahu, Yamaganda, Gulika) as JD windows. */
export function dayPartKaals(sunrise: number, sunset: number, weekday: number): Window[] {
  const D = sunset - sunrise;
  const oct = (part: number) => ({
    startJd: sunrise + (part - 1) * D / 8,
    endJd: sunrise + part * D / 8,
  });
  return [
    { code: "rahu_kaal", auspicious: false, ...oct(RAHU_PART[weekday]) },
    { code: "yamaganda", auspicious: false, ...oct(YAMA_PART[weekday]) },
    { code: "gulika", auspicious: false, ...oct(GULIKA_PART[weekday]) },
  ];
}

/** Muhurta windows keyed off the 15 day-muhurtas / 15 night-muhurtas. */
export function muhurtaWindows(sunrise: number, sunset: number, nextSunrise: number, weekday: number): Window[] {
  const D = sunset - sunrise;
  const N = nextSunrise - sunset;
  const dM = D / 15, nM = N / 15;
  const w: Window[] = [];
  // Abhijit = 8th day-muhurta, omitted on Wednesday (weekday 3).
  if (weekday !== 3) w.push({ code: "abhijit", auspicious: true, startJd: sunrise + 7 * dM, endJd: sunrise + 8 * dM });
  // Brahma muhurta = 14th night-muhurta before sunrise.
  w.push({ code: "brahma", auspicious: true, startJd: sunrise - 2 * nM, endJd: sunrise - 1 * nM });
  // Pratah Sandhya (dawn) and Godhuli (dusk).
  w.push({ code: "pratah_sandhya", auspicious: true, startJd: sunrise - 1.5 * nM, endJd: sunrise });
  w.push({ code: "godhuli", auspicious: true, startJd: sunset, endJd: sunset + nM / 2 });
  return w;
}

export interface Choghadiya { name: string; good: boolean; startJd: number; endJd: number; night: boolean }

export function choghadiya(sunrise: number, sunset: number, nextSunrise: number, weekday: number): Choghadiya[] {
  const out: Choghadiya[] = [];
  const D = (sunset - sunrise) / 8;
  const N = (nextSunrise - sunset) / 8;
  for (let i = 0; i < 8; i++) {
    const c = CHOG[(CHOG_DAY_START[weekday] + i) % 7];
    out.push({ name: c.name, good: c.good, startJd: sunrise + i * D, endJd: sunrise + (i + 1) * D, night: false });
  }
  for (let i = 0; i < 8; i++) {
    const c = CHOG[(CHOG_NIGHT_START[weekday] + i) % 7];
    out.push({ name: c.name, good: c.good, startJd: sunset + i * N, endJd: sunset + (i + 1) * N, night: true });
  }
  return out;
}

export interface Hora { lord: string; startJd: number; endJd: number; night: boolean }

export function horas(sunrise: number, sunset: number, nextSunrise: number, weekday: number): Hora[] {
  const out: Hora[] = [];
  const D = (sunset - sunrise) / 12;
  const N = (nextSunrise - sunset) / 12;
  let idx = HORA_DAY_START[weekday];
  for (let i = 0; i < 12; i++) {
    out.push({ lord: HORA_LORDS[idx % 7], startJd: sunrise + i * D, endJd: sunrise + (i + 1) * D, night: false });
    idx++;
  }
  for (let i = 0; i < 12; i++) {
    out.push({ lord: HORA_LORDS[idx % 7], startJd: sunset + i * N, endJd: sunset + (i + 1) * N, night: true });
    idx++;
  }
  return out;
}

export { DAY };
