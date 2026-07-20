// ============================================================================
//  DIVASYA · Astro engine — L0 resolver + high-level API (ENGINES.md §1.1)
//  Walks the ephemeris fallback chain ONCE per process and caches the winner:
//     Tier 1/2  sweph (SWIEPH if .se1 present, else Moshier — no data files)
//     Tier 4    astronomy-engine (pure JS)  ← the app can never fail to compute
//  Every result carries `precision` + `timingGrade` for honest UI/AI disclosure.
// ============================================================================

import type {
  AstroConfig, Body, EphemerisProvider, EphemerisResult,
} from "./types";
import { DEFAULT_CONFIG } from "./types";
import { GRAHAS } from "./constants";
import { SwephProvider } from "./providers/sweph-provider";
import { FallbackProvider } from "./providers/fallback-provider";
import { dateToJd } from "./riseset";

let resolved: Promise<EphemerisProvider> | null = null;

/** Resolve (and cache) the best available provider for this process. */
export function getEphemeris(): Promise<EphemerisProvider> {
  if (resolved) return resolved;
  resolved = (async () => {
    try {
      const p = new SwephProvider();
      await p.init();
      return p as EphemerisProvider;
    } catch (e) {
      console.warn("[divasya/astro] sweph unavailable, falling back to astronomy-engine:", (e as Error)?.message);
      const f = new FallbackProvider();
      await f.init();
      return f as EphemerisProvider;
    }
  })();
  return resolved;
}

/** For tests: force re-resolution (e.g. to exercise Tier 4). */
export function _resetEphemeris(): void { resolved = null; }

const ALL_BODIES: Body[] = [...GRAHAS];

/** TT Julian Day from a UT Julian Day (ΔT ≈ 69 s in 2020s; refine later). */
function jdTT(jdUT: number): number {
  return jdUT + 69 / 86400;
}

/** Positions of all nine grahas at an instant (no houses). */
export async function computePositions(
  dateUTC: Date, cfg: Partial<AstroConfig> = {}
): Promise<EphemerisResult> {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  const provider = await getEphemeris();
  const jdUT = dateToJd(dateUTC);
  const positions = await provider.positions(jdUT, ALL_BODIES, c);
  return {
    jdUT, jdTT: jdTT(jdUT),
    ayanamsaValue: provider.ayanamsa(jdUT),
    positions, houses: null,
    precision: provider.precision, timingGrade: provider.timingGrade,
  };
}

/** Full chart: positions + houses (lagna) for a birth instant + place. */
export async function computeChart(
  birthUTC: Date, lat: number, lon: number, cfg: Partial<AstroConfig> = {}
): Promise<EphemerisResult> {
  const c = { ...DEFAULT_CONFIG, ...cfg };
  const provider = await getEphemeris();
  const jdUT = dateToJd(birthUTC);
  const [positions, houses] = await Promise.all([
    provider.positions(jdUT, ALL_BODIES, c),
    provider.houses(jdUT, lat, lon, c),
  ]);
  return {
    jdUT, jdTT: jdTT(jdUT),
    ayanamsaValue: provider.ayanamsa(jdUT),
    positions, houses,
    precision: provider.precision, timingGrade: provider.timingGrade,
  };
}

export { DEFAULT_CONFIG } from "./types";
export type { EphemerisResult, BodyPosition, AstroConfig, GrahaId } from "./types";
