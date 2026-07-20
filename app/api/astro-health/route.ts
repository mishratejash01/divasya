// Deploy smoke-test (ENGINES.md §1.1): confirms which ephemeris tier actually
// wins in production and that positions are correct. Hit /api/astro-health.
import { computeChart, getFallbackReason } from "@/lib/astro/engine";
import { RASHIS_SA } from "@/lib/astro/constants";

export const runtime = "nodejs";

export async function GET() {
  // Golden instant: 2026-07-14 12:00 UT, Hyderabad. Sun must be ~87.85° (Mithuna).
  const chart = await computeChart(new Date(Date.UTC(2026, 6, 14, 12, 0, 0)), 17.385, 78.4867);
  const sun = chart.positions.sun;
  const expectedSunLon = 87.8466;
  const sunErrArcsec = Math.abs(sun.lon - expectedSunLon) * 3600;

  return Response.json({
    ok: sunErrArcsec < 60, // generous: Tier 4 fallback still passes
    precision: chart.precision,
    timingGrade: chart.timingGrade,
    fallbackReason: getFallbackReason(),
    ayanamsa: Number(chart.ayanamsaValue.toFixed(6)),
    sun: { lon: Number(sun.lon.toFixed(4)), sign: RASHIS_SA[sun.signIndex], errorArcsec: Number(sunErrArcsec.toFixed(2)) },
    lagna: { lon: Number(chart.houses!.ascendant.toFixed(4)), sign: RASHIS_SA[chart.houses!.lagnaSign] },
  });
}
