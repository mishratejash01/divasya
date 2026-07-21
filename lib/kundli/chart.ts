// ============================================================================
//  DIVASYA · Kundli — chart assembly (ENGINES.md §2.3)
//  Turns the ephemeris result into a full Parashari chart: planets in houses,
//  dignities, 16 vargas, vargottama, Chara Karakas, Arudha Lagna.
// ============================================================================

import { EphemerisResult, GrahaId } from "../astro/types";
import { GRAHAS, NAK, PADA, norm360 } from "../astro/constants";
import { allVargas, VargaId } from "./varga";
import { dignityOf, Dignity, signLord } from "./dignity";

const mod12 = (x: number) => ((x % 12) + 12) % 12;

export interface GrahaState {
  id: GrahaId;
  lon: number;
  sign: number;             // 0..11
  degInSign: number;
  nakshatra: number;        // 0..26
  pada: number;             // 1..4
  house: number;            // 1..12 (whole-sign from lagna)
  retrograde: boolean;
  combust: boolean;
  dignity: Dignity;
  vargottama: boolean;      // same sign in D1 & D9
  vargas: Record<VargaId, number>;
}

export interface Bhava {
  house: number;            // 1..12
  sign: number;
  lord: GrahaId;
  planets: GrahaId[];
}

export type KarakaRole = "AK" | "AmK" | "BK" | "MK" | "PK" | "GK" | "DK" | "PiK";

export interface AssembledChart {
  lagnaSign: number;
  ascendant: number;
  bhavas: Bhava[];
  grahas: Record<GrahaId, GrahaState>;
  charaKarakas: Partial<Record<KarakaRole, GrahaId>>;
  arudhaLagna: number;
  bhavaArudhas: number[];   // 12
}

export function assembleChart(eph: EphemerisResult): AssembledChart {
  const lagnaSign = eph.houses!.lagnaSign;

  const grahas = {} as Record<GrahaId, GrahaState>;
  for (const g of GRAHAS) {
    const p = eph.positions[g];
    const vargas = allVargas(p.lon);
    grahas[g] = {
      id: g,
      lon: p.lon,
      sign: p.signIndex,
      degInSign: p.degInSign,
      nakshatra: p.nakshatraIndex,
      pada: p.pada,
      house: mod12(p.signIndex - lagnaSign) + 1,
      retrograde: p.retrograde,
      combust: p.combust,
      dignity: dignityOf(g, p.signIndex, p.degInSign),
      vargottama: vargas.D1 === vargas.D9,
      vargas,
    };
  }

  const bhavas: Bhava[] = Array.from({ length: 12 }, (_, i) => {
    const sign = mod12(lagnaSign + i);
    return {
      house: i + 1, sign, lord: signLord(sign),
      planets: GRAHAS.filter((g) => grahas[g].sign === sign),
    };
  });

  return {
    lagnaSign,
    ascendant: eph.houses!.ascendant,
    bhavas,
    grahas,
    charaKarakas: charaKarakas(grahas),
    arudhaLagna: arudhaOfBhava(1, lagnaSign, grahas),
    bhavaArudhas: Array.from({ length: 12 }, (_, i) => arudhaOfBhava(i + 1, lagnaSign, grahas)),
  };
}

/** Jaimini 8-karaka scheme: rank by descending degrees-in-sign (Rahu uses 30−d). */
function charaKarakas(grahas: Record<GrahaId, GrahaState>): Partial<Record<KarakaRole, GrahaId>> {
  const roles: KarakaRole[] = ["AK", "AmK", "BK", "MK", "PK", "GK", "DK", "PiK"];
  const list = (["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu"] as GrahaId[])
    .map((g) => ({ g, deg: g === "rahu" ? 30 - grahas[g].degInSign : grahas[g].degInSign }))
    .sort((a, b) => b.deg - a.deg);
  const out: Partial<Record<KarakaRole, GrahaId>> = {};
  list.forEach((x, i) => { if (roles[i]) out[roles[i]] = x.g; });
  return out;
}

/** Arudha of a bhava: count bhava→its lord, then the same count onward.
 *  Classic exception: if the arudha lands in the bhava itself or the 7th, use the 10th. */
function arudhaOfBhava(house: number, lagnaSign: number, grahas: Record<GrahaId, GrahaState>): number {
  const bhavaSign = mod12(lagnaSign + house - 1);
  const lord = signLord(bhavaSign);
  const lordSign = grahas[lord].sign;
  const count = mod12(lordSign - bhavaSign); // 0..11 signs from bhava to lord
  let arudha = mod12(lordSign + count);
  if (arudha === bhavaSign || mod12(arudha - bhavaSign) === 6) arudha = mod12(arudha + 9); // 10th
  return arudha;
}

export { NAK, PADA, norm360 };
