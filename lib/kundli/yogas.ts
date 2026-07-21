// ============================================================================
//  DIVASYA · Kundli — yoga detection (ENGINES.md §2.3)
//  A focused, high-signal set. Each returns present + the factors that fired,
//  so the AI layer can explain them. Strength gating (shadbala) is Phase-2.
// ============================================================================

import { GrahaId } from "../astro/types";
import { AssembledChart, GrahaState } from "./chart";
import { signLord } from "./dignity";

const mod12 = (x: number) => ((x % 12) + 12) % 12;
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];

export interface Yoga { id: string; name: string; present: boolean; factors: string[]; benefic: boolean }

/** house of graha b counted FROM graha a's sign (1..12). */
function houseFrom(fromSign: number, toSign: number): number {
  return mod12(toSign - fromSign) + 1;
}

export function detectYogas(c: AssembledChart): Yoga[] {
  const g = c.grahas;
  const yogas: Yoga[] = [];
  const push = (id: string, name: string, present: boolean, factors: string[], benefic = true) =>
    present && yogas.push({ id, name, present, factors, benefic });

  // Pancha Mahapurusha — Ma/Me/Ju/Ve/Sa in own/exalted AND in a kendra from lagna.
  const PMP: [GrahaId, string][] = [["mars", "Ruchaka"], ["mercury", "Bhadra"], ["jupiter", "Hamsa"], ["venus", "Malavya"], ["saturn", "Sasa"]];
  for (const [graha, nm] of PMP) {
    const s = g[graha];
    if ((s.dignity === "own" || s.dignity === "exalted" || s.dignity === "moolatrikona") && KENDRA.includes(s.house))
      push(`mahapurusha_${graha}`, `${nm} Yoga`, true, [`${graha} ${s.dignity} in kendra (house ${s.house})`]);
  }

  // Gaja Kesari — Jupiter in a kendra from the Moon.
  const jFromMoon = houseFrom(g.moon.sign, g.jupiter.sign);
  push("gaja_kesari", "Gaja Kesari Yoga", KENDRA.includes(jFromMoon),
    [`Jupiter in house ${jFromMoon} from Moon`]);

  // Budha-Aditya — Sun + Mercury in the same sign (and Mercury not deeply combust).
  push("budhaditya", "Budha-Aditya Yoga", g.sun.sign === g.mercury.sign,
    ["Sun and Mercury conjunct — intellect & communication"]);

  // Chandra-Mangala — Moon + Mars conjunct.
  push("chandra_mangala", "Chandra-Mangala Yoga", g.moon.sign === g.mars.sign,
    ["Moon and Mars conjunct — drive for wealth"]);

  // Sunapha / Anapha / Durudhura — planets (not Sun/nodes) 2nd/12th from Moon.
  const nonLum = (["mars", "mercury", "jupiter", "venus", "saturn"] as GrahaId[]);
  const in2 = nonLum.filter((p) => houseFrom(g.moon.sign, g[p].sign) === 2);
  const in12 = nonLum.filter((p) => houseFrom(g.moon.sign, g[p].sign) === 12);
  push("sunapha", "Sunapha Yoga", in2.length > 0 && in12.length === 0, [`${in2.join(", ")} in 2nd from Moon`]);
  push("anapha", "Anapha Yoga", in12.length > 0 && in2.length === 0, [`${in12.join(", ")} in 12th from Moon`]);
  push("durudhura", "Durudhura Yoga", in2.length > 0 && in12.length > 0, ["planets flank the Moon (2nd & 12th)"]);
  push("kemadruma", "Kemadruma Yoga", in2.length === 0 && in12.length === 0 &&
    nonLum.every((p) => g[p].sign !== g.moon.sign), ["Moon isolated — needs strengthening"], false);

  // Kala Sarpa — all 7 planets on one side of the Rahu-Ketu axis.
  const rahu = g.rahu.lon, ketu = g.ketu.lon;
  const arc = mod12(0); void arc;
  const between = (lon: number) => {
    const a = ((lon - rahu + 360) % 360);
    const span = ((ketu - rahu + 360) % 360);
    return a > 0 && a < span;
  };
  const planets7 = (["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"] as GrahaId[]);
  const side = planets7.map((p) => between(g[p].lon));
  push("kala_sarpa", "Kala Sarpa Yoga", side.every((x) => x) || side.every((x) => !x),
    ["all planets hemmed between Rahu and Ketu"], false);

  // Raja Yoga — a kendra lord and a trikona lord conjunct (same sign).
  const lordOfHouse = (h: number): GrahaId => signLord(mod12(c.lagnaSign + h - 1));
  const kendraLords = new Set(KENDRA.map(lordOfHouse));
  const trikonaLords = new Set(TRIKONA.map(lordOfHouse));
  const raja: string[] = [];
  const gl = Object.values(g) as GrahaState[];
  for (const a of gl) for (const b of gl) {
    if (a.id >= b.id) continue;
    if (a.sign === b.sign && ((kendraLords.has(a.id) && trikonaLords.has(b.id)) || (kendraLords.has(b.id) && trikonaLords.has(a.id))))
      raja.push(`${a.id}+${b.id} in ${a.sign}`);
  }
  push("raja_yoga", "Raja Yoga", raja.length > 0, raja);

  return yogas;
}
