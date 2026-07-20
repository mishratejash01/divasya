// ============================================================================
//  DIVASYA · Astro engine — Tier 4 provider: astronomy-engine (pure JS, MIT).
//  Guarantees the engine NEVER fails: no native addon, no data files. Returns
//  tropical positions, so we subtract the shared Lahiri polynomial and compute
//  the mean node ourselves (critique A). Chart-only: timingGrade = false, so
//  the panchang/dasha layers suppress precise timing when this tier is active.
// ============================================================================

import * as A from "astronomy-engine";
import type {
  AstroConfig, Body, BodyPosition, EphemerisProvider, Houses, Precision,
} from "../types";
import { SWE_ID, norm360, lahiriAyanamsa } from "../constants";
import { RawBody, enrichOne, applyCrossBody } from "../bodystate";
import { riseSet as sharedRiseSet, jdToDate } from "../riseset";

const AE: Partial<Record<Body, A.Body>> = {
  sun: A.Body.Sun, moon: A.Body.Moon, mercury: A.Body.Mercury, venus: A.Body.Venus,
  mars: A.Body.Mars, jupiter: A.Body.Jupiter, saturn: A.Body.Saturn,
  uranus: A.Body.Uranus, neptune: A.Body.Neptune, pluto: A.Body.Pluto,
};

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/** Tropical ecliptic-of-date longitude + latitude of a body (degrees). */
function tropicalOfDate(body: Body, time: A.AstroTime): { lon: number; lat: number } {
  if (body === "sun") { const p = A.SunPosition(time); return { lon: norm360(p.elon), lat: p.elat }; }
  if (body === "moon") { const p = A.EclipticGeoMoon(time); return { lon: norm360(p.lon), lat: p.lat }; }
  const v = A.GeoVector(AE[body]!, time, true);
  const e = A.RotateVector(A.Rotation_EQJ_ECT(time), v);
  const lon = norm360(Math.atan2(e.y, e.x) * R2D);
  const lat = Math.atan2(e.z, Math.hypot(e.x, e.y)) * R2D;
  return { lon, lat };
}

/** Mean lunar ascending node (Rahu), tropical, of date (Meeus 47.7). */
function meanNodeTropical(time: A.AstroTime): number {
  const T = time.tt / 36525;
  return norm360(
    125.0445479 - 1934.1362891 * T + 0.0020754 * T * T +
    (T * T * T) / 467441 - (T * T * T * T) / 60616000
  );
}

export class FallbackProvider implements EphemerisProvider {
  readonly precision: Precision = "astronomy-engine";
  readonly timingGrade = false; // chart-only
  async init(): Promise<void> { /* nothing to load */ }

  ayanamsa(jdUT: number): number { return lahiriAyanamsa(jdUT); }

  async positions(jdUT: number, bodies: Body[], cfg: AstroConfig): Promise<Record<Body, BodyPosition>> {
    const time = A.MakeTime(jdToDate(jdUT));
    const dt = 0.05; // days, for a central-difference speed
    const tPrev = A.MakeTime(jdToDate(jdUT - dt));
    const tNext = A.MakeTime(jdToDate(jdUT + dt));
    const ayan = this.ayanamsa(jdUT);

    const want = new Set<Body>(bodies);
    if (want.has("ketu")) want.add("rahu");
    const raw: RawBody[] = [];

    for (const body of want) {
      if (body === "ketu") continue;
      let tropLon: number, lat: number, speed: number;
      if (body === "rahu") {
        tropLon = meanNodeTropical(time);
        lat = 0;
        speed = norm360(meanNodeTropical(tNext) - meanNodeTropical(tPrev) + 540) - 180; // ≈ −0.053°/day
        speed /= 2 * dt;
      } else {
        const cur = tropicalOfDate(body, time);
        tropLon = cur.lon; lat = cur.lat;
        const a = tropicalOfDate(body, tPrev).lon;
        const b = tropicalOfDate(body, tNext).lon;
        speed = (norm360(b - a + 540) - 180) / (2 * dt);
      }
      raw.push({
        body,
        lon: norm360(tropLon - ayan),
        tropicalLon: tropLon,
        lat, distanceAU: 0, lonSpeed: speed,
      });
    }

    if (want.has("ketu")) {
      const rahu = raw.find((x) => x.body === "rahu")!;
      raw.push({
        body: "ketu",
        lon: norm360(rahu.lon + 180),
        tropicalLon: norm360(rahu.tropicalLon + 180),
        lat: 0, distanceAU: 0, lonSpeed: rahu.lonSpeed,
      });
    }

    const map = {} as Record<Body, BodyPosition>;
    for (const r of raw) map[r.body] = enrichOne(r);
    applyCrossBody(map);
    return map;
  }

  async houses(jdUT: number, lat: number, lon: number, cfg: AstroConfig): Promise<Houses> {
    const time = A.MakeTime(jdToDate(jdUT));
    const T = time.tt / 36525;
    const gast = A.SiderealTime(time);                       // apparent sidereal, hours
    const ramc = norm360(gast * 15 + lon) * D2R;
    const eps = (23.439291 - 0.0130042 * T) * D2R;           // mean obliquity
    const latR = lat * D2R;
    let ascTrop = Math.atan2(
      Math.cos(ramc),
      -(Math.sin(ramc) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
    ) * R2D;
    ascTrop = norm360(ascTrop);
    const asc = norm360(ascTrop - this.ayanamsa(jdUT));
    const lagnaSign = Math.floor(asc / 30);
    // Whole-sign cusps in the fallback (Placidus needs the full house solver).
    const cusps = Array.from({ length: 12 }, (_, i) => norm360((lagnaSign + i) * 30));
    const mcTrop = norm360(A.SiderealTime(time) * 15 + lon); // rough MC ≈ RAMC's ecliptic point
    return { system: "W", ascendant: asc, mc: norm360(mcTrop - this.ayanamsa(jdUT)), cusps, lagnaSign };
  }

  riseSet(
    jdUT: number, body: Body, lat: number, lon: number,
    opts: { event: "rise" | "set" | "upper_transit"; hindu?: boolean }
  ): number | null {
    return sharedRiseSet(jdUT, body, lat, lon, opts);
  }
}
