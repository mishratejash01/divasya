import { computeKundli } from "../lib/kundli/index";
import { currentDasha, dashaChainSummary } from "../lib/dasha";
import { RASHIS_SA, NAKSHATRAS } from "../lib/astro/constants";
import { VARGA_LIST } from "../lib/kundli/varga";

async function run() {
  // Known chart: 14 Aug 1996, 07:42, Delhi (28.61, 77.21)
  const k = await computeKundli({ dob: "1996-08-14", tob: "07:42", lat: 28.61, lon: 77.21, tz: "Asia/Kolkata" });
  const g = k.chart.grahas;
  console.log(`=== KUNDLI · 14 Aug 1996 07:42 Delhi · ${k.meta.precision} tg=${k.meta.timingGrade} ayan=${k.meta.ayanamsa.toFixed(3)} ===`);
  console.log(`Lagna: ${RASHIS_SA[k.chart.lagnaSign]} (${k.chart.ascendant.toFixed(2)}°)`);
  console.log("Grahas (sign/house/nakshatra/dignity):");
  for (const id of ["sun","moon","mars","mercury","jupiter","venus","saturn","rahu","ketu"] as const) {
    const s = g[id];
    console.log(`  ${id.padEnd(8)} ${RASHIS_SA[s.sign].padEnd(11)} H${s.house} ${NAKSHATRAS[s.nakshatra]}-${s.pada} ${s.dignity}${s.retrograde?" R":""}${s.combust?" [c]":""} | D9=${RASHIS_SA[s.vargas.D9]}${s.vargottama?" VARGOTTAMA":""}`);
  }
  console.log(`\nChara Karakas: ${Object.entries(k.chart.charaKarakas).map(([r,p])=>`${r}=${p}`).join(" ")}`);
  console.log(`Arudha Lagna: ${RASHIS_SA[k.chart.arudhaLagna]}`);
  console.log(`\nYogas: ${k.yogas.map(y=>y.name).join(", ") || "(none)"}`);
  console.log(`\nAshtakavarga BAV totals: ${Object.entries(k.ashtakavarga.bavTotals).map(([p,t])=>`${p.slice(0,2)}=${t}`).join(" ")}`);
  console.log(`SAV total: ${k.ashtakavarga.savTotal} (must be 337)`);
  console.log(`SAV per sign: ${k.ashtakavarga.sav.join(",")}`);
  console.log(`\nMoon: ${RASHIS_SA[k.moonSign]} ${NAKSHATRAS[k.moonNakshatra]} pada ${k.moonPada}`);
  const cur = k.dashas.currentVimshottari;
  console.log(`\nVimshottari now: ${dashaChainSummary(cur)}`);
  console.log("Mahadasha sequence (first 4):");
  for (const md of k.dashas.vimshottari.slice(0,4)) {
    console.log(`  ${md.lord.padEnd(8)} ${md.start.toISOString().slice(0,10)} → ${md.end.toISOString().slice(0,10)} (${md.years}y)`);
  }
  // sanity checks
  const ok = k.ashtakavarga.savTotal === 337;
  const totalsOk = JSON.stringify(k.ashtakavarga.bavTotals.sun ? [k.ashtakavarga.bavTotals.sun,k.ashtakavarga.bavTotals.moon,k.ashtakavarga.bavTotals.mars,k.ashtakavarga.bavTotals.mercury,k.ashtakavarga.bavTotals.jupiter,k.ashtakavarga.bavTotals.venus,k.ashtakavarga.bavTotals.saturn] : []);
  console.log(`\nCHECKS: SAV=337? ${ok?"✓":"✗ ("+k.ashtakavarga.savTotal+")"} | BAV totals ${totalsOk} (expect [48,49,39,54,56,52,39])`);
}
run().catch(e=>{console.error(e);process.exit(1);});
