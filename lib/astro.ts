import { Profile } from "./types";

const SIGNS: { name: string; indian: string; symbol: string; from: [number, number] }[] = [
  { name: "Capricorn", indian: "Makara", symbol: "♑", from: [12, 22] },
  { name: "Aquarius", indian: "Kumbha", symbol: "♒", from: [1, 20] },
  { name: "Pisces", indian: "Meena", symbol: "♓", from: [2, 19] },
  { name: "Aries", indian: "Mesha", symbol: "♈", from: [3, 21] },
  { name: "Taurus", indian: "Vrishabha", symbol: "♉", from: [4, 20] },
  { name: "Gemini", indian: "Mithuna", symbol: "♊", from: [5, 21] },
  { name: "Cancer", indian: "Karka", symbol: "♋", from: [6, 21] },
  { name: "Leo", indian: "Simha", symbol: "♌", from: [7, 23] },
  { name: "Virgo", indian: "Kanya", symbol: "♍", from: [8, 23] },
  { name: "Libra", indian: "Tula", symbol: "♎", from: [9, 23] },
  { name: "Scorpio", indian: "Vrishchika", symbol: "♏", from: [10, 23] },
  { name: "Sagittarius", indian: "Dhanu", symbol: "♐", from: [11, 22] },
];

export function sunSign(dob: string | null): { name: string; indian: string; symbol: string } {
  if (!dob) return { name: "—", indian: "—", symbol: "✦" };
  const [, mStr, dStr] = dob.split("-");
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  // pick the last sign whose start (month/day) is <= the date
  let chosen = SIGNS[0]; // Capricorn wraps Dec->Jan
  for (const s of SIGNS) {
    const [sm, sd] = s.from;
    if (m > sm || (m === sm && d >= sd)) chosen = s;
  }
  // handle January (Capricorn until 19, Aquarius from 20)
  if (m === 1) chosen = d >= 20 ? SIGNS[1] : SIGNS[0];
  return { name: chosen.name, indian: chosen.indian, symbol: chosen.symbol };
}

export function rashiLabel(p: Pick<Profile, "rashi" | "dob">): string {
  if (p.rashi) return p.rashi;
  const s = sunSign(p.dob);
  return `${s.name} (${s.indian})`;
}

export function zodiacSymbol(p: Pick<Profile, "rashi" | "dob">): string {
  const s = sunSign(p.dob);
  return s.symbol;
}
