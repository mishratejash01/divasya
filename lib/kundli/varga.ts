// ============================================================================
//  DIVASYA · Kundli — the 16 divisional charts (Shodasavarga, ENGINES.md §2.3)
//  Exact BPHS/JHora sign formulas. All re-derived and CI-validated. The varga
//  LAGNA runs the ascendant through the same formula; varga houses are
//  whole-sign from it.
// ============================================================================

const mod12 = (x: number) => ((x % 12) + 12) % 12;

/** modality: 0 = movable(chara), 1 = fixed(sthira), 2 = dual(dvisvabhava). */
const modality = (s: number) => s % 3;
const isOdd = (s: number) => s % 2 === 0; // sign 0=Aries is "odd" (1st)

export type VargaId =
  | "D1" | "D2" | "D3" | "D4" | "D7" | "D9" | "D10" | "D12"
  | "D16" | "D20" | "D24" | "D27" | "D30" | "D40" | "D45" | "D60";

export const VARGA_LIST: VargaId[] = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60",
];

/** Sign (0..11) of a sidereal longitude in a given divisional chart. */
export function vargaSign(varga: VargaId, lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  const s = Math.floor(L / 30);
  const d = L - s * 30;
  const odd = isOdd(s);
  const m = modality(s);

  switch (varga) {
    case "D1":
      return s;
    case "D2": { // Hora (Parashari): odd → Leo/Cancer, even → Cancer/Leo
      const p = Math.floor(d / 15);
      return odd ? (p === 0 ? 4 : 3) : (p === 0 ? 3 : 4);
    }
    case "D3": { // Drekkana
      const p = Math.floor(d / 10);
      return mod12(s + 4 * p);
    }
    case "D4": { // Chaturthamsa
      const p = Math.floor(d / 7.5);
      return mod12(s + 3 * p);
    }
    case "D7": { // Saptamsa
      const p = Math.floor((7 * d) / 30);
      return mod12(odd ? s + p : s + 6 + p);
    }
    case "D9": // Navamsa
      return Math.floor(L / (30 / 9)) % 12;
    case "D10": { // Dasamsa
      const p = Math.floor(d / 3);
      return mod12(odd ? s + p : s + 8 + p);
    }
    case "D12": { // Dwadasamsa
      const p = Math.floor(d / 2.5);
      return mod12(s + p);
    }
    case "D16": { // Shodasamsa
      const p = Math.floor((16 * d) / 30);
      const start = m === 0 ? 0 : m === 1 ? 4 : 8;
      return mod12(start + p);
    }
    case "D20": { // Vimsamsa
      const p = Math.floor(d / 1.5);
      const start = m === 0 ? 0 : m === 1 ? 8 : 4;
      return mod12(start + p);
    }
    case "D24": { // Siddhamsa: odd from Leo, even from Cancer
      const p = Math.floor((4 * d) / 5);
      return mod12((odd ? 4 : 3) + p);
    }
    case "D27": // Bhamsa
      return Math.floor(L / (30 / 27)) % 12;
    case "D30": { // Trimsamsa — unequal 5/5/8/7/5
      if (odd) {
        if (d < 5) return 0;       // Mars → Aries
        if (d < 10) return 10;     // Saturn → Aquarius
        if (d < 18) return 8;      // Jupiter → Sagittarius
        if (d < 25) return 2;      // Mercury → Gemini
        return 6;                  // Venus → Libra
      } else {
        if (d < 5) return 1;       // Venus → Taurus
        if (d < 12) return 5;      // Mercury → Virgo
        if (d < 20) return 11;     // Jupiter → Pisces
        if (d < 25) return 9;      // Saturn → Capricorn
        return 7;                  // Mars → Scorpio
      }
    }
    case "D40": { // Khavedamsa: odd from Aries, even from Libra
      const p = Math.floor((4 * d) / 3);
      return mod12((odd ? 0 : 6) + p);
    }
    case "D45": { // Akshavedamsa: movable Aries / fixed Leo / dual Sag
      const p = Math.floor((3 * d) / 2);
      const start = m === 0 ? 0 : m === 1 ? 4 : 8;
      return mod12(start + p);
    }
    case "D60": { // Shashtiamsa
      const p = Math.floor(2 * d);
      return mod12(s + (p % 12));
    }
  }
}

/** All 16 varga signs for a longitude. */
export function allVargas(lon: number): Record<VargaId, number> {
  const out = {} as Record<VargaId, number>;
  for (const v of VARGA_LIST) out[v] = vargaSign(v, lon);
  return out;
}

/** D60 shashtiamsa index (0..59) with the odd/even name reversal (critique C). */
export function shashtiamsaNameIndex(lon: number): number {
  const L = ((lon % 360) + 360) % 360;
  const s = Math.floor(L / 30);
  const d = L - s * 30;
  const p = Math.floor(2 * d); // 0..59
  return isOdd(s) ? p : 59 - p;
}
