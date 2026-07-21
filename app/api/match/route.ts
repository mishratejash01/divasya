import { gunaMilan } from "@/lib/matching/index";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const n = (k: string) => Number(u.searchParams.get(k));
  const boy = { rashi: n("br"), nakshatra: n("bn") }, girl = { rashi: n("gr"), nakshatra: n("gn") };
  if ([boy.rashi, boy.nakshatra, girl.rashi, girl.nakshatra].some(Number.isNaN))
    return Response.json({ error: "need br,bn,gr,gn (rashi 0-11, nakshatra 0-26)" }, { status: 400 });
  return Response.json(gunaMilan(boy, girl));
}
