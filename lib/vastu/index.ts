// ============================================================================
//  DIVASYA · Vastu engine (ENGINES.md §2.5)
//  Compass heading → 16 MahaVastu zones + 32-entrance pada. Ephemeris-
//  independent, pure geometry. North reference is magnetic by default (matches
//  MahaVastu compass practice). Zone attributes mirror the vastu_zones16 seed.
// ============================================================================

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

/** Map a compass heading (0–360, magnetic) to a 16-zone index. */
export function zone16(heading: number): number {
  return Math.floor(norm(heading + 11.25) / 22.5) % 16;
}

/** 32-entrance pada: side (N/E/S/W) + number 1..8. */
export function entrancePada(heading: number): { side: string; num: number; index: number } {
  const i = Math.floor(norm(heading + 45) / 11.25); // 0=N1 … 31=W8
  return { side: "NESW"[Math.floor(i / 8)], num: (i % 8) + 1, index: i };
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
