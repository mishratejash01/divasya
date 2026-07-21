// ============================================================================
//  DIVASYA · Gochar / transits (ENGINES.md §2.9)
//  Current planetary transits vs the natal Moon: Sade Sati (Saturn over
//  12/1/2 from Moon), Kantaka & Ashtama Shani, Jupiter transit, plus each
//  graha's house-from-Moon. The computed backbone under the daily rashifal.
// ============================================================================

import { computePositions } from "../astro/engine";
import { GRAHAS } from "../astro/constants";
import { GrahaId } from "../astro/types";

const mod12 = (x: number) => ((x % 12) + 12) % 12;
const houseFrom = (fromSign: number, toSign: number) => mod12(toSign - fromSign) + 1;

export interface GocharReport {
  moonSign: number;
  date: string;
  transits: Record<GrahaId, { sign: number; house: number; retrograde: boolean }>;
  sadeSati: { active: boolean; phase: "rising" | "peak" | "setting" | null };
  kantakaShani: boolean;   // Saturn 4th/8th from Moon (Ashtama = 8th)
  ashtamaShani: boolean;
  saturnHouse: number;
  jupiterHouse: number;
}

export async function computeGochar(moonSign: number, at: Date = new Date()): Promise<GocharReport> {
  const eph = await computePositions(at);
  const transits = {} as GocharReport["transits"];
  for (const g of GRAHAS) {
    const p = eph.positions[g];
    transits[g] = { sign: p.signIndex, house: houseFrom(moonSign, p.signIndex), retrograde: p.retrograde };
  }
  const satHouse = transits.saturn.house;
  const jupHouse = transits.jupiter.house;

  // Sade Sati: Saturn transiting 12th, 1st, or 2nd from natal Moon.
  const sadeSatiActive = [12, 1, 2].includes(satHouse);
  const phase = satHouse === 12 ? "rising" : satHouse === 1 ? "peak" : satHouse === 2 ? "setting" : null;

  return {
    moonSign, date: at.toISOString(),
    transits,
    sadeSati: { active: sadeSatiActive, phase },
    kantakaShani: satHouse === 4 || satHouse === 8,
    ashtamaShani: satHouse === 8,
    saturnHouse: satHouse,
    jupiterHouse: jupHouse,
  };
}
