// ============================================================================
//  DIVASYA · Matching — Ashtakoota / Guna Milan (36 points, ENGINES.md §2.6)
//  8 kootas + Mangal dosha. Tables mirror the Supabase koota_scores seed
//  (discrepancies vs AstroSage are data patches, not code changes).
// ============================================================================

const mod = (x: number, n: number) => ((x % n) + n) % n;

// nakshatra (0..26) → gana / yoni-animal / nadi — mirrors the `nakshatras` seed.
const GANA = ["deva", "manushya", "rakshasa", "manushya", "deva", "manushya", "deva", "deva", "rakshasa", "rakshasa", "manushya", "manushya", "deva", "rakshasa", "deva", "rakshasa", "deva", "rakshasa", "rakshasa", "manushya", "manushya", "deva", "rakshasa", "rakshasa", "manushya", "manushya", "deva"];
const YONI = ["Horse", "Elephant", "Sheep", "Serpent", "Serpent", "Dog", "Cat", "Sheep", "Cat", "Rat", "Rat", "Cow", "Buffalo", "Tiger", "Buffalo", "Tiger", "Deer", "Deer", "Dog", "Monkey", "Mongoose", "Monkey", "Lion", "Horse", "Lion", "Cow", "Elephant"];
const NADI = ["adi", "madhya", "antya", "antya", "madhya", "adi", "adi", "madhya", "antya", "antya", "madhya", "adi", "adi", "madhya", "antya", "antya", "madhya", "adi", "adi", "madhya", "antya", "antya", "madhya", "adi", "adi", "madhya", "antya"];

// rashi (0..11) varna rank: brahmin4 kshatriya3 vaishya2 shudra1 by element.
const VARNA = [3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4]; // Ar=ksh,Ta=vai,Ge=shu,Ca=bra...
const RASHI_LORD = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];

// Yoni sworn-enemy pairs (score 0). Same animal = 4; else 2 (neutral approx).
const YONI_ENEMY: Record<string, string> = {
  Cow: "Tiger", Tiger: "Cow", Elephant: "Lion", Lion: "Elephant", Horse: "Buffalo", Buffalo: "Horse",
  Dog: "Deer", Deer: "Dog", Serpent: "Mongoose", Mongoose: "Serpent", Cat: "Rat", Rat: "Cat",
  Monkey: "Sheep", Sheep: "Monkey",
};

// Naisargika friendship (for Graha Maitri).
const FRIEND: Record<string, Record<string, "F" | "N" | "E">> = {
  sun: { moon: "F", mars: "F", jupiter: "F", mercury: "N", venus: "E", saturn: "E", sun: "F" },
  moon: { sun: "F", mercury: "F", mars: "N", jupiter: "N", venus: "N", saturn: "N", moon: "F" },
  mars: { sun: "F", moon: "F", jupiter: "F", mercury: "E", venus: "N", saturn: "N", mars: "F" },
  mercury: { sun: "F", venus: "F", moon: "E", mars: "N", jupiter: "N", saturn: "N", mercury: "F" },
  jupiter: { sun: "F", moon: "F", mars: "F", mercury: "E", venus: "E", saturn: "N", jupiter: "F" },
  venus: { mercury: "F", saturn: "F", sun: "E", moon: "E", mars: "N", jupiter: "N", venus: "F" },
  saturn: { mercury: "F", venus: "F", sun: "E", moon: "E", mars: "E", jupiter: "N", saturn: "F" },
};

export interface MoonProfile { rashi: number; nakshatra: number; }
export interface KootaScore { koota: string; points: number; max: number; note: string; }
export interface MatchReport { kootas: KootaScore[]; total: number; max: 36; verdict: string; doshas: string[]; }

export function gunaMilan(boy: MoonProfile, girl: MoonProfile): MatchReport {
  const K: KootaScore[] = [];

  // 1 Varna (1)
  const vb = VARNA[boy.rashi], vg = VARNA[girl.rashi];
  K.push({ koota: "Varna", max: 1, points: vb >= vg ? 1 : 0, note: `boy ${vb} vs girl ${vg}` });

  // 2 Vashya (2) — simplified: same class 2, friendly 1, else 0.5/0
  const cls = (r: number) => (["quad", "quad", "human", "water", "quad", "human", "human", "insect", "human", "quad", "human", "water"][r]);
  const cb = cls(boy.rashi), cg = cls(girl.rashi);
  K.push({ koota: "Vashya", max: 2, points: cb === cg ? 2 : (cb === "human" || cg === "human" ? 1 : 0.5), note: `${cb}/${cg}` });

  // 3 Tara (3) — average of both directions
  const taraScore = (a: number, b: number) => { const t = mod(b - a, 27) + 1; const r = t % 9; return [3, 5, 7].includes(r) ? 0 : 1.5; };
  const tara = taraScore(boy.nakshatra, girl.nakshatra) + taraScore(girl.nakshatra, boy.nakshatra);
  K.push({ koota: "Tara", max: 3, points: tara, note: `${tara}/3` });

  // 4 Yoni (4)
  const yb = YONI[boy.nakshatra], yg = YONI[girl.nakshatra];
  const yoni = yb === yg ? 4 : YONI_ENEMY[yb] === yg ? 0 : 2;
  K.push({ koota: "Yoni", max: 4, points: yoni, note: `${yb}/${yg}` });

  // 5 Graha Maitri (5)
  const lb = RASHI_LORD[boy.rashi], lg = RASHI_LORD[girl.rashi];
  const rel = (a: string, b: string) => (a === b ? "F" : FRIEND[a]?.[b] ?? "N");
  const r1 = rel(lb, lg), r2 = rel(lg, lb);
  const maitriPts = (() => {
    const both = [r1, r2];
    if (both.every((x) => x === "F")) return 5;
    if (both.includes("F") && both.includes("N")) return 4;
    if (both.every((x) => x === "N")) return 3;
    if (both.includes("F") && both.includes("E")) return 1;
    if (both.includes("N") && both.includes("E")) return 0.5;
    return 0;
  })();
  K.push({ koota: "Graha Maitri", max: 5, points: maitriPts, note: `${lb}/${lg}` });

  // 6 Gana (6)
  const gb = GANA[boy.nakshatra], gg = GANA[girl.nakshatra];
  const ganaPts = (() => {
    if (gb === gg) return 6;
    const set = new Set([gb, gg]);
    if (set.has("deva") && set.has("manushya")) return gb === "deva" ? 6 : 5;
    if (set.has("manushya") && set.has("rakshasa")) return gb === "manushya" ? 0 : 3;
    if (set.has("deva") && set.has("rakshasa")) return gb === "deva" ? 1 : 5;
    return 0;
  })();
  K.push({ koota: "Gana", max: 6, points: ganaPts, note: `${gb}/${gg}` });

  // 7 Bhakoot (7)
  const d = mod(girl.rashi - boy.rashi, 12) + 1;
  const bad = [6, 8, 5, 9, 2, 12];
  const bhakoot = bad.includes(d) ? 0 : 7;
  K.push({ koota: "Bhakoot", max: 7, points: bhakoot, note: `distance ${d}` });

  // 8 Nadi (8)
  const nb = NADI[boy.nakshatra], ng = NADI[girl.nakshatra];
  const nadi = nb === ng ? 0 : 8;
  K.push({ koota: "Nadi", max: 8, points: nadi, note: `${nb}/${ng}` });

  const total = K.reduce((a, b) => a + b.points, 0);
  const doshas: string[] = [];
  if (nadi === 0) doshas.push("Nadi dosha (same nadi) — check exceptions");
  if (bhakoot === 0) doshas.push("Bhakoot dosha");
  const verdict = total < 18 ? "Not recommended" : total < 25 ? "Acceptable" : total < 33 ? "Very good" : "Excellent";

  return { kootas: K, total: Math.round(total * 10) / 10, max: 36, verdict, doshas };
}
