// ============================================================================
//  DIVASYA · Kundli — planetary dignity & naisargika friendship (ENGINES.md §2.3)
//  Sign-based dignity (exalted/debilitated/moolatrikona/own/friend/neutral/enemy)
//  and the natural-friendship table. Constants mirror the `grahas` Supabase rows.
// ============================================================================

import { GrahaId } from "../astro/types";

export const SIGN_LORD: GrahaId[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

/** Exaltation sign (0..11) per graha. Debilitation = +6. */
const EXALT: Partial<Record<GrahaId, number>> = {
  sun: 0, moon: 1, mars: 9, mercury: 5, jupiter: 3, venus: 11, saturn: 6,
  rahu: 1, ketu: 7,
};
const OWN: Partial<Record<GrahaId, number[]>> = {
  sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11],
  venus: [1, 6], saturn: [9, 10],
};
// Moolatrikona: [sign, fromDeg, toDeg]
const MOOL: Partial<Record<GrahaId, [number, number, number]>> = {
  sun: [4, 0, 20], moon: [1, 3, 30], mars: [0, 0, 12], mercury: [5, 15, 20],
  jupiter: [8, 0, 10], venus: [6, 0, 15], saturn: [10, 0, 20],
};

/** Naisargika (natural) friendship: F = friend, N = neutral, E = enemy. */
const FRIEND: Record<GrahaId, Partial<Record<GrahaId, "F" | "N" | "E">>> = {
  sun: { moon: "F", mars: "F", jupiter: "F", mercury: "N", venus: "E", saturn: "E" },
  moon: { sun: "F", mercury: "F", mars: "N", jupiter: "N", venus: "N", saturn: "N" },
  mars: { sun: "F", moon: "F", jupiter: "F", mercury: "E", venus: "N", saturn: "N" },
  mercury: { sun: "F", venus: "F", moon: "E", mars: "N", jupiter: "N", saturn: "N" },
  jupiter: { sun: "F", moon: "F", mars: "F", mercury: "E", venus: "E", saturn: "N" },
  venus: { mercury: "F", saturn: "F", sun: "E", moon: "E", mars: "N", jupiter: "N" },
  saturn: { mercury: "F", venus: "F", sun: "E", moon: "E", mars: "E", jupiter: "N" },
  rahu: {}, ketu: {},
};

export type Dignity =
  | "exalted" | "debilitated" | "moolatrikona" | "own"
  | "great_friend" | "friend" | "neutral" | "enemy" | "great_enemy";

/** Classify a graha's dignity in a sign (degInSign only used for moolatrikona). */
export function dignityOf(graha: GrahaId, sign: number, degInSign: number): Dignity {
  const ex = EXALT[graha];
  if (ex !== undefined) {
    if (sign === ex) return "exalted";
    if (sign === (ex + 6) % 12) return "debilitated";
  }
  const mt = MOOL[graha];
  if (mt && sign === mt[0] && degInSign >= mt[1] && degInSign < mt[2]) return "moolatrikona";
  if ((OWN[graha] || []).includes(sign)) return "own";
  // relationship to the sign lord (naisargika only; tatkalika added later)
  if (graha === "rahu" || graha === "ketu") return "neutral";
  const lord = SIGN_LORD[sign];
  if (lord === graha) return "own";
  const rel = FRIEND[graha]?.[lord] ?? "N";
  return rel === "F" ? "friend" : rel === "E" ? "enemy" : "neutral";
}

export function signLord(sign: number): GrahaId {
  return SIGN_LORD[((sign % 12) + 12) % 12];
}

/** Special aspects (graha drishti) each graha casts, as house-offsets from itself. */
export const ASPECTS: Record<GrahaId, number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7],
  mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10],
  rahu: [7], ketu: [7], // nodes' aspects debated; 7th by default
};
