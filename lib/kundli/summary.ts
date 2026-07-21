// ============================================================================
//  DIVASYA · Kundli — AI grounding digest (ENGINES.md §4)
//  Turns the computed chart + dasha into prompt-grade FACTS so the AI Jyotishi
//  reasons over a real chart (dated dasha windows, graha placements, yogas)
//  instead of inventing. The differentiator over retrieval-based astro chat.
// ============================================================================

import { Kundli } from "./index";
import { RASHIS_SA, NAKSHATRAS, GRAHAS } from "../astro/constants";
import { currentDasha, DashaPeriod } from "../dasha";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtD = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Flatten the next N antardasha windows from now (level-2 periods). */
function upcomingAntardashas(timeline: DashaPeriod[], from: Date, n: number): DashaPeriod[] {
  const out: DashaPeriod[] = [];
  for (const md of timeline) {
    for (const ad of md.children || []) {
      if (ad.end > from) out.push(ad);
      if (out.length >= n + 2) break;
    }
    if (out.length >= n + 2) break;
  }
  return out.filter((a) => a.end > from).slice(0, n);
}

export function chartSummaryForAI(k: Kundli): string {
  const g = k.chart.grahas;
  const lines: string[] = [];
  lines.push(`REAL BIRTH CHART (computed with Swiss Ephemeris, Lahiri ayanamsa ${k.meta.ayanamsa.toFixed(2)}° — authoritative, do NOT invent different positions).`);
  lines.push(`Lagna: ${RASHIS_SA[k.chart.lagnaSign]} rising. Moon: ${RASHIS_SA[k.moonSign]} in ${NAKSHATRAS[k.moonNakshatra]} nakshatra pada ${k.moonPada}.`);
  lines.push("Grahas (sign · house · nakshatra · dignity):");
  for (const id of GRAHAS) {
    const s = g[id];
    const flags = [s.retrograde ? "retro" : "", s.combust ? "combust" : "", s.vargottama ? "vargottama" : ""].filter(Boolean).join(", ");
    lines.push(`  ${cap(id)}: ${RASHIS_SA[s.sign]} · house ${s.house} · ${NAKSHATRAS[s.nakshatra]} · ${s.dignity}${flags ? " (" + flags + ")" : ""}`);
  }
  const ck = k.chart.charaKarakas;
  if (ck.AK) lines.push(`Chara Karakas: Atmakaraka=${cap(ck.AK)}, Amatyakaraka=${cap(ck.AmK || "")}, Darakaraka=${cap(ck.DK || "")}. Arudha Lagna: ${RASHIS_SA[k.chart.arudhaLagna]}.`);
  if (k.yogas.length) lines.push(`Yogas present: ${k.yogas.map((y) => y.name).join(", ")}.`);
  // Ashtakavarga: strongest & weakest houses by SAV
  const sav = k.ashtakavarga.sav.map((v, i) => ({ house: (i - k.chart.lagnaSign + 12) % 12 + 1, v }));
  const strong = [...sav].sort((a, b) => b.v - a.v).slice(0, 3).map((x) => `H${x.house}(${x.v})`).join(", ");
  lines.push(`Ashtakavarga: strongest houses ${strong}. SAV total ${k.ashtakavarga.savTotal}.`);

  // Dasha context — the timing backbone
  const now = new Date();
  const chain = currentDasha(k.dashas.vimshottari, now);
  if (chain.length) {
    lines.push(`CURRENT Vimshottari dasha: ${chain.map((c) => cap(c.lord)).join("–")} (antardasha until ${fmtD(chain[Math.min(1, chain.length - 1)].end)}).`);
    const up = upcomingAntardashas(k.dashas.vimshottari, now, 4);
    if (up.length) lines.push("Upcoming antardasha windows: " + up.map((a) => `${cap(a.lord)} ${fmtD(a.start)}–${fmtD(a.end)}`).join("; ") + ".");
  }
  if (!k.meta.timingGrade) lines.push("(Note: ephemeris fell back to chart-only tier — hedge precise timing.)");
  if (k.meta.approximate) lines.push("(Note: birth time unknown — lagna & houses approximate; do not over-specify.)");
  return lines.join("\n");
}
