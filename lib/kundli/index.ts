// ============================================================================
//  DIVASYA · Kundli — orchestrator (ENGINES.md §2.3)
//  computeKundli(dob, tob, place) → full chart + vargas + ashtakavarga + yogas
//  + Vimshottari/Yogini dashas. Pure over (engine, inputs).
// ============================================================================

import { computeChart } from "../astro/engine";
import { birthToUTC, zoneForCoords } from "../astro/time";
import { GRAHAS } from "../astro/constants";
import { assembleChart, AssembledChart } from "./chart";
import { computeAshtakavarga, Ashtakavarga, Contrib } from "./ashtakavarga";
import { detectYogas, Yoga } from "./yogas";
import { dashaTimeline, currentDasha, DashaPeriod, dashaChainSummary } from "../dasha";

export interface Kundli {
  meta: { dob: string; tob: string | null; lat: number; lon: number; tz: string; approximate: boolean; precision: string; timingGrade: boolean; ayanamsa: number };
  chart: AssembledChart;
  ashtakavarga: Ashtakavarga;
  yogas: Yoga[];
  dashas: {
    vimshottari: DashaPeriod[];
    yogini: DashaPeriod[];
    currentVimshottari: DashaPeriod[];
  };
  moonSign: number;
  moonNakshatra: number;
  moonPada: number;
}

export interface KundliInput {
  dob: string;               // "YYYY-MM-DD"
  tob: string | null;        // "HH:MM" | null → noon fallback
  lat: number; lon: number;
  tz?: string;
}

export async function computeKundli(input: KundliInput): Promise<Kundli> {
  const tz = input.tz || zoneForCoords(input.lat, input.lon);
  const birthUTC = birthToUTC(input.dob, input.tob, tz);
  const eph = await computeChart(birthUTC, input.lat, input.lon);
  const chart = assembleChart(eph);

  // Ashtakavarga contributor signs (7 planets + lagna).
  const signOf: Record<Contrib, number> = {
    sun: chart.grahas.sun.sign, moon: chart.grahas.moon.sign, mars: chart.grahas.mars.sign,
    mercury: chart.grahas.mercury.sign, jupiter: chart.grahas.jupiter.sign,
    venus: chart.grahas.venus.sign, saturn: chart.grahas.saturn.sign, lagna: chart.lagnaSign,
  };
  const ashtakavarga = computeAshtakavarga(signOf);
  const yogas = detectYogas(chart);

  const moonLon = eph.positions.moon.lon;
  const vim = dashaTimeline("vimshottari", moonLon, birthUTC, 3);
  const yog = dashaTimeline("yogini", moonLon, birthUTC, 2);

  return {
    meta: {
      dob: input.dob, tob: input.tob, lat: input.lat, lon: input.lon, tz,
      approximate: !input.tob, precision: eph.precision, timingGrade: eph.timingGrade,
      ayanamsa: eph.ayanamsaValue,
    },
    chart, ashtakavarga, yogas,
    dashas: { vimshottari: vim, yogini: yog, currentVimshottari: currentDasha(vim) },
    moonSign: eph.positions.moon.signIndex,
    moonNakshatra: eph.positions.moon.nakshatraIndex,
    moonPada: eph.positions.moon.pada,
  };
}

export { GRAHAS, dashaChainSummary };
