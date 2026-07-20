// ============================================================================
//  DIVASYA · Astro engine — shared types (ENGINES.md §2.1)
//  The whole platform speaks sidereal (Lahiri) ecliptic longitude in degrees.
// ============================================================================

/** The nine grahas of Vedic astrology, in the classical vaara/display order. */
export type GrahaId =
  | "sun" | "moon" | "mars" | "mercury" | "jupiter"
  | "venus" | "saturn" | "rahu" | "ketu";

/** Optional outer planets (never used in panchang/dasha). */
export type OuterId = "uranus" | "neptune" | "pluto";
export type Body = GrahaId | OuterId;

/** Which ephemeris tier produced a result — surfaced for honesty/UI. */
export type Precision =
  | "swisseph"        // Tier 1: sweph + .se1 files  (< 0.001")
  | "moshier"         // Tier 2: sweph Moshier built-in (< few arcsec)
  | "wasm-moshier"    // Tier 3: swisseph-wasm
  | "astronomy-engine"// Tier 4: pure JS (chart-only, ~arcmin)
  | "meeus";          // Tier 4 legacy fallback

export type NodeType = "mean" | "true";
export type HouseSystem = "W" | "S" | "P"; // Whole-sign / Sripati / Placidus
export type Ayanamsa = "lahiri";

export interface AstroConfig {
  ayanamsa: Ayanamsa;
  nodeType: NodeType;
  houseSystem: HouseSystem;
  /** rise/set/moonrise use topocentric; angas/lagna stay geocentric. */
  topocentric?: boolean;
}

export const DEFAULT_CONFIG: AstroConfig = {
  ayanamsa: "lahiri",
  nodeType: "mean",       // Drik + AstroSage default (critique A)
  houseSystem: "W",
};

/** A single body's full computed state at an instant. */
export interface BodyPosition {
  body: Body;
  /** sidereal (Lahiri) ecliptic longitude, 0–360 */
  lon: number;
  /** tropical ecliptic longitude, 0–360 (pre-ayanamsa) */
  tropicalLon: number;
  /** ecliptic latitude, degrees */
  lat: number;
  /** distance in AU (0 for computed nodes) */
  distanceAU: number;
  /** longitude speed °/day; negative ⇒ retrograde */
  lonSpeed: number;
  retrograde: boolean;
  stationary: boolean;
  /** 0 = Mesha … 11 = Meena */
  signIndex: number;
  /** degrees within the sign, 0–30 */
  degInSign: number;
  /** 0 = Ashwini … 26 = Revati */
  nakshatraIndex: number;
  /** 1–4 */
  pada: number;
  /** within the classical combustion orb of the Sun (nodes never combust) */
  combust: boolean;
  /** Moon-only: near-Sun for tithi-bala, NOT predictive combustion (critique F) */
  balaProximityToSun: boolean;
  /** in a graha-yuddha (planetary war) this instant */
  inWar: boolean;
}

export interface Houses {
  system: HouseSystem;
  /** ascendant sidereal longitude */
  ascendant: number;
  /** midheaven sidereal longitude */
  mc: number;
  /** 12 cusps (index 0 = 1st house cusp), sidereal longitudes */
  cusps: number[];
  /** ascendant sign 0–11 */
  lagnaSign: number;
}

export interface EphemerisResult {
  jdUT: number;
  jdTT: number;
  ayanamsaValue: number;
  positions: Record<Body, BodyPosition>;
  houses: Houses | null;
  precision: Precision;
  /** false ⇒ Tier-4 chart-only: suppress anga/muhurta/dasha-balance timing */
  timingGrade: boolean;
}

/** Low-level provider contract — the only code that talks to an ephemeris. */
export interface EphemerisProvider {
  readonly precision: Precision;
  readonly timingGrade: boolean;
  init(): Promise<void>;
  positions(jdUT: number, bodies: Body[], cfg: AstroConfig): Promise<Record<Body, BodyPosition>>;
  houses(jdUT: number, lat: number, lon: number, cfg: AstroConfig): Promise<Houses>;
  ayanamsa(jdUT: number): number;
  riseSet(
    jdUT: number, body: Body, lat: number, lon: number,
    opts: { event: "rise" | "set" | "upper_transit"; hindu?: boolean }
  ): number | null;
}
