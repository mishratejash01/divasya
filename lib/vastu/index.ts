// ============================================================================
//  DIVASYA · Vastu engine (ENGINES.md §2.5)
//  Pure computation, ephemeris-independent. Compass heading → 16 MahaVastu
//  zones and 32-entrance padas by geometry; room placements judged by the
//  pancha-tattva element cycle plus classical zone prescriptions; remedies
//  DERIVED from the bridge-element rule, never looked up per cell; a home
//  score computed as a criticality-weighted aggregate. The AI layer above
//  narrates these results — it never produces a verdict of its own.
//
//  North reference is magnetic, which is deliberate: an on-site vastu pandit
//  reads a magnetic compass. India's declination stays under ~2°, well inside
//  a 22.5° zone, and the UI says so instead of pretending false precision.
// ============================================================================

import {
  CYCLE, ELEMENT_EXPRESSION, PADAS32, PLANET_DIK, RASHI_LORD, ROOM_INFO,
  type Pada, type RoomType, type Tattva,
} from "./data";

const norm = (d: number) => ((d % 360) + 360) % 360;

export interface VastuZone {
  idx: number; code: string; sanskrit: string; direction: string;
  element: string; planet: string; lifeArea: string;
  idealFor: string[]; avoidFor: string[]; colors: string[];
}

// 16 zones at 22.5° each, starting N centered at 0°.
export const ZONES16: VastuZone[] = [
  { idx: 0, code: "N", sanskrit: "Uttara", direction: "North", element: "Water", planet: "Mercury", lifeArea: "Career & opportunities", idealFor: ["office", "cash locker", "study"], avoidFor: ["toilet"], colors: ["green", "blue"] },
  { idx: 1, code: "NNE", sanskrit: "", direction: "North-Northeast", element: "Water", planet: "Jupiter", lifeArea: "Health & immunity", idealFor: ["pooja", "water"], avoidFor: ["kitchen", "toilet"], colors: ["light blue"] },
  { idx: 2, code: "NE", sanskrit: "Ishanya", direction: "Northeast", element: "Water", planet: "Jupiter/Ketu", lifeArea: "Clarity, wisdom, divinity", idealFor: ["pooja room", "water source", "meditation"], avoidFor: ["kitchen", "toilet", "bedroom", "storage"], colors: ["white", "light yellow"] },
  { idx: 3, code: "ENE", sanskrit: "", direction: "East-Northeast", element: "Air/Water", planet: "Sun", lifeArea: "Recreation & fun", idealFor: ["living room", "entrance"], avoidFor: ["heavy storage"], colors: ["white"] },
  { idx: 4, code: "E", sanskrit: "Purva", direction: "East", element: "Air", planet: "Sun", lifeArea: "Social connections", idealFor: ["entrance", "living room", "windows"], avoidFor: ["toilet"], colors: ["white", "wooden"] },
  { idx: 5, code: "ESE", sanskrit: "", direction: "East-Southeast", element: "Fire/Air", planet: "Venus", lifeArea: "Analysis & anxiety", idealFor: ["bathroom"], avoidFor: ["pooja", "bedroom"], colors: ["silver"] },
  { idx: 6, code: "SE", sanskrit: "Agneya", direction: "Southeast", element: "Fire", planet: "Venus", lifeArea: "Cash flow & energy", idealFor: ["kitchen", "electrical"], avoidFor: ["pooja", "water tank", "master bedroom"], colors: ["orange", "red"] },
  { idx: 7, code: "SSE", sanskrit: "", direction: "South-Southeast", element: "Fire", planet: "Mars", lifeArea: "Confidence & power", idealFor: ["kitchen (alt)"], avoidFor: ["entrance"], colors: ["red"] },
  { idx: 8, code: "S", sanskrit: "Dakshina", direction: "South", element: "Fire/Earth", planet: "Mars", lifeArea: "Fame & relaxation", idealFor: ["bedroom", "heavy storage"], avoidFor: ["entrance", "water"], colors: ["red", "coral"] },
  { idx: 9, code: "SSW", sanskrit: "", direction: "South-Southwest", element: "Earth", planet: "Rahu", lifeArea: "Expenditure & waste", idealFor: ["toilet", "store"], avoidFor: ["entrance", "kitchen"], colors: ["yellow", "beige"] },
  { idx: 10, code: "SW", sanskrit: "Nairutya", direction: "Southwest", element: "Earth", planet: "Rahu", lifeArea: "Relationships & stability", idealFor: ["master bedroom", "heavy storage"], avoidFor: ["toilet", "kitchen", "underground water"], colors: ["yellow", "brown"] },
  { idx: 11, code: "WSW", sanskrit: "", direction: "West-Southwest", element: "Earth", planet: "Saturn", lifeArea: "Education & savings", idealFor: ["study", "children bedroom"], avoidFor: ["toilet"], colors: ["cream"] },
  { idx: 12, code: "W", sanskrit: "Paschima", direction: "West", element: "Water/Earth", planet: "Saturn", lifeArea: "Gains & profits", idealFor: ["dining", "children bedroom"], avoidFor: [], colors: ["blue", "white"] },
  { idx: 13, code: "WNW", sanskrit: "", direction: "West-Northwest", element: "Air", planet: "Moon", lifeArea: "Depression & detox", idealFor: ["toilet", "bathroom"], avoidFor: ["pooja"], colors: ["grey"] },
  { idx: 14, code: "NW", sanskrit: "Vayavya", direction: "Northwest", element: "Air", planet: "Moon", lifeArea: "Support & relationships", idealFor: ["guest room", "store (grains)", "toilet"], avoidFor: ["master bedroom"], colors: ["white", "grey"] },
  { idx: 15, code: "NNW", sanskrit: "", direction: "North-Northwest", element: "Air/Water", planet: "Mercury", lifeArea: "Attraction & sensuality", idealFor: ["bedroom"], avoidFor: [], colors: ["green"] },
];

/**
 * Each zone's working element on the five-element remedial wheel — the
 * MahaVastu bar mapping (N-side water, E-side wood, S-side fire toward the
 * SSW, SW-side earth, W-side metal) that makes bridge remedies computable.
 */
export const ZONE_CYCLE: Tattva[] = [
  "water", "water", "water", "wood", "wood", "wood", "fire", "fire",
  "fire", "earth", "earth", "earth", "metal", "metal", "metal", "water",
];

/** Map a compass heading (0–360, magnetic) to a 16-zone index. */
export function zone16(heading: number): number {
  return Math.floor(norm(heading + 11.25) / 22.5) % 16;
}

/** 32-entrance pada from a heading; index 0 = N1 … 31 = W8. */
export function entrancePada(heading: number): { side: string; num: number; index: number } {
  const i = Math.floor(norm(heading + 45) / 11.25);
  return { side: "NESW"[Math.floor(i / 8)], num: (i % 8) + 1, index: i };
}

/** The full classical record for a pada picked by side + number. */
export function padaInfo(side: "N" | "E" | "S" | "W", num: number): Pada {
  return PADAS32.find((p) => p.side === side && p.num === num) ?? PADAS32[2];
}

// ---------------------------------------------------------------- elements

const produces = (a: Tattva, b: Tattva) =>
  CYCLE[(CYCLE.indexOf(a) + 1) % 5] === b;
const controls = (a: Tattva, b: Tattva) =>
  CYCLE[(CYCLE.indexOf(a) + 2) % 5] === b;

/** The element that digests a clash: the one the controller produces on the
 *  way to the controlled (water→[wood]→fire). Derived, never tabulated. */
export function bridgeElement(a: Tattva, b: Tattva): Tattva | null {
  const x = controls(a, b) ? a : controls(b, a) ? b : null;
  if (!x) return null;
  return CYCLE[(CYCLE.indexOf(x) + 1) % 5];
}

export type Grade = "ideal" | "good" | "neutral" | "caution" | "dosha" | "severe";
const GRADE_SCORE: Record<Grade, number> = { ideal: 100, good: 80, neutral: 60, caution: 45, dosha: 22, severe: 0 };
export const GRADE_LABEL: Record<Grade, string> = {
  ideal: "Ideal placement", good: "Well placed", neutral: "Acceptable",
  caution: "Slightly off", dosha: "Vastu dosha", severe: "Severe dosha",
};

// Keywords that connect a room type to the classical prescription lists.
const ROOM_KEYS: Record<RoomType, string[]> = {
  entrance: ["entrance"], pooja: ["pooja", "meditation"], kitchen: ["kitchen"],
  master_bedroom: ["master bedroom"], bedroom: ["bedroom"], kids_bedroom: ["children"],
  living: ["living"], dining: ["dining"], study: ["study", "office"],
  toilet: ["toilet"], bathroom: ["bathroom"], store: ["storage", "store"],
  staircase: ["heavy storage"], water_tank: ["water tank", "water"],
  borewell: ["underground water", "water source", "water"], septic_tank: ["toilet"],
  safe: ["cash locker", "office"], balcony: ["windows", "living"],
  garage: [], washing: ["bathroom"],
};

export interface RoomVerdict {
  grade: Grade;
  label: string;
  basis: string;          // the rule that fired, in plain words
  remedy: string | null;  // derived; null when nothing needs fixing
}

/** Judge one placement: prescriptions first, then the element cycle. */
export function roomVerdict(room: RoomType, zoneIdx: number): RoomVerdict {
  const zone = ZONES16[zoneIdx];
  const keys = ROOM_KEYS[room];
  const info = ROOM_INFO[room];
  const zEl = ZONE_CYCLE[zoneIdx];
  const inList = (list: string[]) =>
    keys.some((k) => list.some((s) => s.toLowerCase().includes(k)));

  const prescribed = inList(zone.idealFor);
  const proscribed = inList(zone.avoidFor);

  // element behaviour of the activity inside the zone (cycle elements only —
  // space/air activities are judged purely by the prescriptions)
  const aEl = info.element;
  const onCycle = CYCLE.includes(aEl);
  const clashAZ = onCycle && controls(aEl, zEl); // activity injures the zone
  const clashZA = onCycle && controls(zEl, aEl); // zone drains the activity
  const support = onCycle && (aEl === zEl || produces(aEl, zEl) || produces(zEl, aEl));

  // Sanctity is read off the zone's own prescriptions: a zone the texts give
  // to pooja or meditation is sattvic. Impurity there is the gravest defect —
  // a different principle from element conflict, and older than it.
  const sattvic = zone.idealFor.some((s) => /pooja|meditation/i.test(s));

  let grade: Grade, basis: string;
  if (proscribed && info.polluting && sattvic) {
    grade = "severe";
    basis = `A ${info.label.toLowerCase()} defiles ${zone.direction} (${zone.sanskrit || zone.code}), the most sattvic zone — the classical ashuddhi dosha.`;
  } else if (proscribed && (clashAZ || clashZA)) {
    grade = "severe";
    basis = `${info.label} is classically avoided in ${zone.direction}, and its ${aEl} energy clashes with the zone's ${zEl}.`;
  } else if (proscribed) {
    grade = "dosha";
    basis = `The texts avoid a ${info.label.toLowerCase()} in ${zone.direction} (${zone.lifeArea.toLowerCase()}).`;
  } else if (clashAZ) {
    grade = "dosha";
    basis = `Its ${aEl} energy injures this zone's ${zEl} element.`;
  } else if (clashZA) {
    grade = "caution";
    basis = `The zone's ${zEl} element drains this activity's ${aEl}.`;
  } else if (prescribed) {
    grade = "ideal";
    basis = `Exactly where the texts place a ${info.label.toLowerCase()} — ${zone.direction} governs ${zone.lifeArea.toLowerCase()}.`;
  } else if (support) {
    grade = "good";
    basis = `Its ${aEl} energy sits harmoniously with the zone's ${zEl}.`;
  } else {
    grade = "neutral";
    basis = `No classical objection to a ${info.label.toLowerCase()} in ${zone.direction}.`;
  }

  return { grade, label: GRADE_LABEL[grade], basis, remedy: deriveRemedy(room, zoneIdx, grade) };
}

/** A no-demolition remedy, composed from the bridge rule + zone colours. */
export function deriveRemedy(room: RoomType, zoneIdx: number, grade: Grade): string | null {
  if (grade === "ideal" || grade === "good" || grade === "neutral") return null;
  const zone = ZONES16[zoneIdx];
  const aEl = ROOM_INFO[room].element;
  const zEl = ZONE_CYCLE[zoneIdx];
  const parts: string[] = [];

  const bridge = CYCLE.includes(aEl) ? bridgeElement(aEl, zEl) : null;
  if (bridge) {
    const ex = ELEMENT_EXPRESSION[bridge];
    parts.push(`Introduce the ${bridge} element (${ex.hindi}) to digest the clash: ${ex.objects}; lean on ${ex.colors}.`);
  }
  // activity-specific mitigations — assembled, not tabulated per zone
  if (room === "toilet" || room === "septic_tank") {
    parts.push("Keep the door shut and the lid down; place a bowl of unprocessed sea salt inside and change it weekly.");
  } else if (room === "kitchen") {
    parts.push("Face east while cooking if the stove allows; keep water storage well apart from the flame.");
  } else if (room === "master_bedroom" || room === "bedroom" || room === "kids_bedroom") {
    parts.push("Sleep with the head toward south or east; avoid mirrors facing the bed.");
  } else if (room === "pooja") {
    parts.push("Face east or northeast while praying; keep the space clutter-free and lit with a ghee lamp.");
  } else if (room === "entrance") {
    parts.push("Keep the entrance brightly lit and spotless; a nameplate and a threshold (dehleez) strengthen any door.");
  }
  parts.push(`Favour this zone's colours here: ${zone.colors.join(", ")}.`);
  return parts.join(" ");
}

// ---------------------------------------------------------------- home score

export interface HomeRoom { room: RoomType; zone: number }
export interface HomeAnalysis {
  score: number;
  grade: "Excellent" | "Good" | "Mixed" | "Needs attention";
  rooms: (HomeRoom & { verdict: RoomVerdict; zoneName: string; weight: number })[];
  doshas: (HomeRoom & { verdict: RoomVerdict; zoneName: string })[];
  strengths: (HomeRoom & { verdict: RoomVerdict; zoneName: string })[];
}

/** The weighted aggregate a pandit would reach room by room. */
export function analyzeHome(rooms: HomeRoom[]): HomeAnalysis {
  const judged = rooms.map((r) => {
    const verdict = roomVerdict(r.room, r.zone);
    const zone = ZONES16[r.zone];
    return {
      ...r, verdict, weight: ROOM_INFO[r.room].weight,
      zoneName: `${zone.direction}${zone.sanskrit ? ` (${zone.sanskrit})` : ""}`,
    };
  });
  const totalW = judged.reduce((n, r) => n + r.weight, 0) || 1;
  const score = Math.round(
    judged.reduce((n, r) => n + GRADE_SCORE[r.verdict.grade] * r.weight, 0) / totalW
  );
  const grade = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Mixed" : "Needs attention";
  const order: Grade[] = ["severe", "dosha", "caution"];
  return {
    score, grade, rooms: judged,
    doshas: judged
      .filter((r) => order.includes(r.verdict.grade))
      .sort((a, b) => order.indexOf(a.verdict.grade) - order.indexOf(b.verdict.grade)),
    strengths: judged.filter((r) => r.verdict.grade === "ideal" || r.verdict.grade === "good"),
  };
}

// ---------------------------------------------------------------- personal

export interface PersonalDisha {
  rashi: string; lord: string; dir: string; code: string;
  sleep: string; desk: string;
}

/** rashi → rashi lord → dikpala direction. Pure jyotish chain, no lookup of
 *  opinions — the same rule a pandit applies. */
export function personalDirections(rashi: string | null | undefined): PersonalDisha | null {
  if (!rashi) return null;
  const key = rashi.trim().split(/[\s(]/)[0];
  const lord = RASHI_LORD[key];
  if (!lord) return null;
  const dik = PLANET_DIK[lord];
  return {
    rashi: key, lord, dir: dik.dir, code: dik.code,
    sleep: "Head toward south for deep rest; east for study years. Never north.",
    desk: `Face ${dik.dir.toLowerCase()} at your desk — the disha of ${lord}, your rashi lord.`,
  };
}

// ---------------------------------------------------------------- compass

/** Circular exponential smoothing — 359° and 1° are neighbours, not 358° apart. */
export function smoothHeading(prev: number, next: number, alpha = 0.18): number {
  let d = norm(next) - norm(prev);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return norm(prev + alpha * d);
}

export interface VastuAssessment {
  heading: number;
  facingZone: VastuZone;
  entrance: { side: string; num: number };
  guidance: string;
}

/** Assess a facing direction and give zone guidance. */
export function assessFacing(heading: number): VastuAssessment {
  const z = ZONES16[zone16(heading)];
  const e = entrancePada(heading);
  return {
    heading: norm(heading),
    facingZone: z,
    entrance: { side: e.side, num: e.num },
    guidance: `Facing ${z.direction} (${z.sanskrit || z.code}) — governs ${z.lifeArea}. Element ${z.element}. Ideal for ${z.idealFor.join(", ")}; avoid ${z.avoidFor.join(", ") || "nothing critical"}.`,
  };
}
