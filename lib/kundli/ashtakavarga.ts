// ============================================================================
//  DIVASYA · Kundli — Ashtakavarga (ENGINES.md §2.3)
//  Bhinnashtakavarga (per-planet benefic bindus) + Sarvashtakavarga. The
//  benefic-place tables are canon; CI asserts the row totals (Sun 48 … Sa 39)
//  and SAV grand total = 337.
// ============================================================================

import { GrahaId } from "../astro/types";

const mod12 = (x: number) => ((x % 12) + 12) % 12;

// The 7 contributors for each planet's BAV (+ Lagna). Values = house-numbers
// (1..12) from the contributor where the studied planet gives a bindu (rekha).
// Standard Parashari benefic-places table.
type Contrib = "sun" | "moon" | "mars" | "mercury" | "jupiter" | "venus" | "saturn" | "lagna";
const CONTRIBS: Contrib[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "lagna"];

const BAV: Record<GrahaId, Partial<Record<Contrib, number[]>>> = {
  sun: {
    sun: [1, 2, 4, 7, 8, 9, 10, 11], moon: [3, 6, 10, 11], mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [3, 5, 6, 9, 10, 11, 12], jupiter: [5, 6, 9, 11], venus: [6, 7, 12],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11], lagna: [3, 4, 6, 10, 11, 12],
  },
  moon: {
    sun: [3, 6, 7, 8, 10, 11], moon: [1, 3, 6, 7, 10, 11], mars: [2, 3, 5, 6, 9, 10, 11],
    mercury: [1, 3, 4, 5, 7, 8, 10, 11], jupiter: [1, 4, 7, 8, 10, 11, 12], venus: [3, 4, 5, 7, 9, 10, 11],
    saturn: [3, 5, 6, 11], lagna: [3, 6, 10, 11],
  },
  mars: {
    sun: [3, 5, 6, 10, 11], moon: [3, 6, 11], mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [3, 5, 6, 11], jupiter: [6, 10, 11, 12], venus: [6, 8, 11, 12],
    saturn: [1, 4, 7, 8, 9, 10, 11], lagna: [1, 3, 6, 10, 11],
  },
  mercury: {
    sun: [5, 6, 9, 11, 12], moon: [2, 4, 6, 8, 10, 11], mars: [1, 2, 4, 7, 8, 9, 10, 11],
    mercury: [1, 3, 5, 6, 9, 10, 11, 12], jupiter: [6, 8, 11, 12], venus: [1, 2, 3, 4, 5, 8, 9, 11],
    saturn: [1, 2, 4, 7, 8, 9, 10, 11], lagna: [1, 2, 4, 6, 8, 10, 11],
  },
  jupiter: {
    sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], moon: [2, 5, 7, 9, 11], mars: [1, 2, 4, 7, 8, 10, 11],
    mercury: [1, 2, 4, 5, 6, 9, 10, 11], jupiter: [1, 2, 3, 4, 7, 8, 10, 11], venus: [2, 5, 6, 9, 10, 11],
    saturn: [3, 5, 6, 12], lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  venus: {
    sun: [8, 11, 12], moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], mars: [3, 4, 6, 9, 11, 12],
    mercury: [3, 5, 6, 9, 11], jupiter: [5, 8, 9, 10, 11], venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    saturn: [3, 4, 5, 8, 9, 10, 11], lagna: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  saturn: {
    sun: [1, 2, 4, 7, 8, 10, 11], moon: [3, 6, 11], mars: [3, 5, 6, 10, 11, 12],
    mercury: [6, 8, 9, 10, 11, 12], jupiter: [5, 6, 11, 12], venus: [6, 11, 12],
    saturn: [3, 5, 6, 11], lagna: [1, 3, 4, 6, 10, 11],
  },
  rahu: {}, ketu: {},
};

const AV_PLANETS: GrahaId[] = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

export interface Ashtakavarga {
  bav: Record<GrahaId, number[]>;  // per planet: bindus per sign (0..11)
  sav: number[];                   // 12 signs
  bavTotals: Record<GrahaId, number>;
  savTotal: number;
}

/** signPositions: sign (0..11) of each contributor incl. lagna. */
export function computeAshtakavarga(
  signOf: Record<Contrib, number>
): Ashtakavarga {
  const bav = {} as Record<GrahaId, number[]>;
  const bavTotals = {} as Record<GrahaId, number>;
  const sav = new Array(12).fill(0);

  for (const planet of AV_PLANETS) {
    const row = new Array(12).fill(0);
    for (const c of CONTRIBS) {
      const places = BAV[planet][c];
      if (!places) continue;
      const from = signOf[c];
      for (const houseNo of places) {
        const sign = mod12(from + houseNo - 1);
        row[sign] += 1;
      }
    }
    bav[planet] = row;
    bavTotals[planet] = row.reduce((a, b) => a + b, 0);
    for (let s = 0; s < 12; s++) sav[s] += row[s];
  }

  return { bav, sav, bavTotals, savTotal: sav.reduce((a, b) => a + b, 0) };
}

export { AV_PLANETS };
export type { Contrib };
