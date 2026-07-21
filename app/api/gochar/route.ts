import { computeGochar } from "@/lib/gochar/index";
import { RASHIS_SA } from "@/lib/astro/constants";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const moonSign = Number(new URL(req.url).searchParams.get("moon") ?? 0);
  const g = await computeGochar(moonSign);
  return Response.json({ moonSign: RASHIS_SA[moonSign], saturnHouse: g.saturnHouse, jupiterHouse: g.jupiterHouse, sadeSati: g.sadeSati, kantakaShani: g.kantakaShani, ashtamaShani: g.ashtamaShani, transits: Object.fromEntries(Object.entries(g.transits).map(([k, v]) => [k, { sign: RASHIS_SA[v.sign], house: v.house, retro: v.retrograde }])) });
}
