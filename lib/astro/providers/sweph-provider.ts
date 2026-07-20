// ============================================================================
//  DIVASYA · Astro engine — Tier 1/2 provider: Swiss Ephemeris (`sweph`).
//  Uses Moshier built-in (SEFLG_MOSEPH) by default → NO data files needed, so
//  it deploys to Vercel serverless. If `.se1` files are present at EPHE_PATH it
//  auto-upgrades to full SWIEPH precision. Arcsecond-accurate either way.
// ============================================================================

import type {
  AstroConfig, Body, BodyPosition, EphemerisProvider, Houses, Luminaries, Precision,
} from "../types";
import { SWE_ID, norm360, GRAHAS } from "../constants";
import { RawBody, enrichOne, applyCrossBody } from "../bodystate";
import { riseSet as sharedRiseSet } from "../riseset";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Swe = any;

export class SwephProvider implements EphemerisProvider {
  private swe: Swe;
  private C: any;
  private baseFlags = 0;
  private usingFiles = false;
  readonly timingGrade = true;
  private _precision: Precision = "moshier";
  get precision(): Precision { return this._precision; }

  async init(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = await import("sweph");
    this.swe = (mod as any).default ?? mod;
    this.C = this.swe.constants;
    // Try to point at bundled .se1 files (Tier 1); harmless if absent (Tier 2).
    try {
      this.swe.set_ephe_path(process.env.SWEPH_PATH || "./ephe");
    } catch { /* no-op */ }
    // Pin Lahiri once at init (Fluid-Compute-safe: we never flip the mode).
    this.swe.set_sid_mode(this.C.SE_SIDM_LAHIRI, 0, 0);
    // Probe: does a real Sun calc succeed with SWIEPH (files present)?
    const probe = this.swe.calc_ut(2451545.0, this.C.SE_SUN, this.C.SEFLG_SWIEPH);
    if (!probe.error && String(probe.flag).length) {
      // flag reflects which ephemeris actually served the request
      this.usingFiles = (probe.flag & this.C.SEFLG_SWIEPH) === this.C.SEFLG_SWIEPH;
    }
    this._precision = this.usingFiles ? "swisseph" : "moshier";
    this.baseFlags =
      (this.usingFiles ? this.C.SEFLG_SWIEPH : this.C.SEFLG_MOSEPH) |
      this.C.SEFLG_SPEED | this.C.SEFLG_SIDEREAL;
  }

  ayanamsa(jdUT: number): number {
    return this.swe.get_ayanamsa_ut(jdUT);
  }

  luminaries(jdUT: number): Luminaries {
    const s = this.swe.calc_ut(jdUT, this.C.SE_SUN, this.baseFlags);
    const m = this.swe.calc_ut(jdUT, this.C.SE_MOON, this.baseFlags);
    return {
      sun: { lon: norm360(s.data[0]), speed: s.data[3] },
      moon: { lon: norm360(m.data[0]), speed: m.data[3] },
    };
  }

  async positions(jdUT: number, bodies: Body[], cfg: AstroConfig): Promise<Record<Body, BodyPosition>> {
    const nodeId = cfg.nodeType === "true" ? 11 : 10; // SE_TRUE_NODE / SE_MEAN_NODE
    const ayan = this.ayanamsa(jdUT);
    const raw: RawBody[] = [];

    const want = new Set<Body>(bodies);
    // Ketu is derived; ensure Rahu is computed if Ketu is requested.
    if (want.has("ketu")) want.add("rahu");

    for (const body of want) {
      if (body === "ketu") continue;
      const ipl = body === "rahu" ? nodeId : SWE_ID[body];
      const r = this.swe.calc_ut(jdUT, ipl, this.baseFlags);
      const [lon, lat, dist, lonSpeed] = r.data;
      raw.push({
        body,
        lon: norm360(lon),
        tropicalLon: norm360(lon + ayan),
        lat, distanceAU: dist, lonSpeed,
      });
    }

    // Derive Ketu opposite Rahu.
    if (want.has("ketu")) {
      const rahu = raw.find((x) => x.body === "rahu")!;
      raw.push({
        body: "ketu",
        lon: norm360(rahu.lon + 180),
        tropicalLon: norm360(rahu.tropicalLon + 180),
        lat: -rahu.lat, distanceAU: 0, lonSpeed: rahu.lonSpeed,
      });
    }

    const map = {} as Record<Body, BodyPosition>;
    for (const r of raw) map[r.body] = enrichOne(r);
    applyCrossBody(map);
    return map;
  }

  async houses(jdUT: number, lat: number, lon: number, cfg: AstroConfig): Promise<Houses> {
    const hsys = cfg.houseSystem || "W";
    const res = this.swe.houses_ex2(jdUT, this.C.SEFLG_SIDEREAL, lat, lon, hsys);
    const cusps: number[] = (res.data.houses as number[]).map(norm360);
    const asc = norm360(res.data.points[0]);
    const mc = norm360(res.data.points[1]);
    return { system: hsys, ascendant: asc, mc, cusps, lagnaSign: Math.floor(asc / 30) };
  }

  riseSet(
    jdUT: number, body: Body, lat: number, lon: number,
    opts: { event: "rise" | "set" | "upper_transit"; hindu?: boolean }
  ): number | null {
    return sharedRiseSet(jdUT, body, lat, lon, opts);
  }
}

export { GRAHAS };
