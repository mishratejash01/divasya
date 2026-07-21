import { computeKundli } from "@/lib/kundli/index";
import { currentDasha, dashaChainSummary } from "@/lib/dasha";
import { vargaSign } from "@/lib/kundli/varga";
import { RASHIS_SA, NAKSHATRAS } from "@/lib/astro/constants";
export const runtime = "nodejs";
export const maxDuration = 30;

const ABBR: Record<string, string> = {
  sun: "Su", moon: "Mo", mars: "Ma", mercury: "Me", jupiter: "Ju",
  venus: "Ve", saturn: "Sa", rahu: "Ra", ketu: "Ke",
};

export async function GET(req: Request) {
  const u = new URL(req.url);
  const dob = u.searchParams.get("dob"); const tob = u.searchParams.get("tob");
  const lat = Number(u.searchParams.get("lat") ?? 28.6139), lon = Number(u.searchParams.get("lon") ?? 77.209);
  const tz = u.searchParams.get("tz") || "Asia/Kolkata";
  if (!dob) return Response.json({ error: "dob required (YYYY-MM-DD)" }, { status: 400 });
  const k = await computeKundli({ dob, tob, lat, lon, tz });
  const g = k.chart.grahas;
  const navamsaLagnaIndex = vargaSign("D9", k.chart.ascendant);

  return Response.json({
    precision: k.meta.precision, timingGrade: k.meta.timingGrade, approximate: k.meta.approximate,
    ayanamsa: Number(k.meta.ayanamsa.toFixed(3)),
    lagna: { sign: RASHIS_SA[k.chart.lagnaSign], signIndex: k.chart.lagnaSign, deg: Number(k.chart.ascendant.toFixed(2)) },
    moon: { sign: RASHIS_SA[k.moonSign], nakshatra: NAKSHATRAS[k.moonNakshatra], pada: k.moonPada },
    grahas: Object.fromEntries(Object.values(g).map((s) => [s.id, { sign: RASHIS_SA[s.sign], signIndex: s.sign, house: s.house, deg: Number(s.degInSign.toFixed(1)), nakshatra: NAKSHATRAS[s.nakshatra], pada: s.pada, dignity: s.dignity, retrograde: s.retrograde, combust: s.combust, navamsa: RASHIS_SA[s.vargas.D9], navamsaIndex: s.vargas.D9, vargottama: s.vargottama }])),
    // chart geometry: raw indices for drawing the D1 (Rasi) + D9 (Navamsa) diagrams
    chart: {
      lagnaIndex: k.chart.lagnaSign,
      navamsaLagnaIndex,
      placements: Object.values(g).map((s) => ({
        id: s.id, abbr: ABBR[s.id], deg: Math.round(s.degInSign),
        rasiSign: s.sign, navamsaSign: s.vargas.D9,
        retro: s.retrograde, combust: s.combust,
      })),
    },
    charaKarakas: k.chart.charaKarakas, arudhaLagna: RASHIS_SA[k.chart.arudhaLagna],
    yogas: k.yogas.map((y) => y.name),
    ashtakavarga: { bavTotals: k.ashtakavarga.bavTotals, savTotal: k.ashtakavarga.savTotal, sav: k.ashtakavarga.sav },
    currentDasha: dashaChainSummary(currentDasha(k.dashas.vimshottari)),
    mahadashas: k.dashas.vimshottari.map((m) => ({ lord: m.lord, from: m.start.toISOString().slice(0, 10), to: m.end.toISOString().slice(0, 10) })),
  });
}
