import { computeChart, computePositions, getEphemeris, _resetEphemeris } from "../lib/astro/engine";
import { lahiriAyanamsa } from "../lib/astro/constants";
import { RASHIS_SA, NAKSHATRAS } from "../lib/astro/constants";
import { SwephProvider } from "../lib/astro/providers/sweph-provider";
import { FallbackProvider } from "../lib/astro/providers/fallback-provider";
import { DEFAULT_CONFIG } from "../lib/astro/types";

// Reference: 2026-07-14 12:00:00 UT, Hyderabad (17.385, 78.4867)
const birth = new Date(Date.UTC(2026, 6, 14, 12, 0, 0));
const LAT = 17.385, LON = 78.4867;

// sweph ground-truth (validated earlier, sidereal Lahiri):
const REF: Record<string, [number, string]> = {
  sun: [87.8466, "Mithuna"], moon: [89.1774, "Mithuna"], mars: [46.8317, "Vrishabha"],
  mercury: [85.5586, "Mithuna"], jupiter: [98.8639, "Karka"], venus: [131.0618, "Simha"],
  saturn: [350.3904, "Meena"], rahu: [307.6420, "Kumbha"], ketu: [127.6420, "Simha"],
};
const REF_ASC = 248.5855; // Dhanu

async function run() {
  const chart = await computeChart(birth, LAT, LON);
  console.log(`=== PRIMARY provider: precision=${chart.precision} timingGrade=${chart.timingGrade} ===`);
  console.log(`ayanamsa: engine ${chart.ayanamsaValue.toFixed(6)}  polynomial ${lahiriAyanamsa(chart.jdUT).toFixed(6)}`);
  let maxErr = 0;
  for (const g of Object.keys(REF)) {
    const p = chart.positions[g as keyof typeof chart.positions];
    const [refLon, refSign] = REF[g];
    let d = Math.abs(p.lon - refLon); if (d > 180) d = 360 - d;
    maxErr = Math.max(maxErr, d * 3600);
    const rflag = p.retrograde ? " R" : "";
    const ok = RASHIS_SA[p.signIndex] === refSign && d * 3600 < 5 ? "✓" : "✗";
    console.log(`  ${ok} ${g.padEnd(8)} ${p.lon.toFixed(4).padStart(9)} ${RASHIS_SA[p.signIndex]}/${NAKSHATRAS[p.nakshatraIndex]} p${p.pada}${rflag}  Δ${(d*3600).toFixed(2)}"`);
  }
  const ascOk = Math.abs(chart.houses!.ascendant - REF_ASC) * 3600 < 5;
  console.log(`  ${ascOk?"✓":"✗"} Lagna    ${chart.houses!.ascendant.toFixed(4)} ${RASHIS_SA[chart.houses!.lagnaSign]}  Δ${(Math.abs(chart.houses!.ascendant-REF_ASC)*3600).toFixed(2)}"`);
  console.log(`  MAX planetary error: ${maxErr.toFixed(2)}"  (target <5" for Tier 1/2)`);

  // Force Tier 4 fallback and check it's within arcminutes
  console.log(`\n=== FALLBACK (Tier 4, forced): pure JS ===`);
  const fb = new FallbackProvider();
  await fb.init();
  const fbPos = await fb.positions(chart.jdUT, ["sun","moon","mars","jupiter","saturn","rahu"], DEFAULT_CONFIG);
  const fbH = await fb.houses(chart.jdUT, LAT, LON, DEFAULT_CONFIG);
  let fbMax = 0;
  for (const g of ["sun","moon","mars","jupiter","saturn","rahu"]) {
    const p = fbPos[g as keyof typeof fbPos];
    let d = Math.abs(p.lon - REF[g][0]); if (d>180) d=360-d;
    fbMax = Math.max(fbMax, d*60);
    console.log(`  ${g.padEnd(8)} ${p.lon.toFixed(4).padStart(9)} ${RASHIS_SA[p.signIndex]}  Δ${(d*60).toFixed(2)}′`);
  }
  console.log(`  Lagna ${fbH.ascendant.toFixed(4)} ${RASHIS_SA[fbH.lagnaSign]}  Δ${(Math.abs(fbH.ascendant-REF_ASC)*60).toFixed(2)}′`);
  console.log(`  MAX fallback error: ${fbMax.toFixed(2)}′  (target <5′ chart-only)`);
}
run().catch(e => { console.error(e); process.exit(1); });
