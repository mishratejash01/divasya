// ============================================================================
//  Daily horoscope — generated once per rashi per day by Gemini, grounded in
//  the live computed panchang, cached in Supabase (daily_horoscopes).
// ============================================================================
import { supabaseAdmin } from "@/lib/supabase";
import { computePanchang } from "@/lib/panchang";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];
// Vedic rashi names map to their western labels for lookups
const SANSKRIT: Record<string, string> = {
  Mesha: "Aries", Vrishabha: "Taurus", Mithuna: "Gemini", Karka: "Cancer",
  Simha: "Leo", Kanya: "Virgo", Tula: "Libra", Vrishchika: "Scorpio",
  Dhanu: "Sagittarius", Makara: "Capricorn", Kumbha: "Aquarius", Meena: "Pisces",
};

async function generate(sign: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const p = computePanchang(new Date());
  const prompt = `Write today's daily horoscope for ${sign} for ${p.dateLabel} (${p.weekday}; ${p.tithi.display} tithi, ${p.nakshatra.name} nakshatra, ${p.masa} maas).
Voice: grounded, luminous, reassuring — orientation, not fear. 55–75 words of flowing English prose (no headers, no lists, no emoji). Include: the day's energy for ${sign}, one gentle focus (work, relationships or health), one small practical suggestion, and end with a lucky colour and number. Complete every sentence.`;
  for (const model of MODELS) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 700, temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } },
          }),
        }
      );
      if (!r.ok) continue;
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? "").join("").trim();
      if (text) return text;
    } catch { /* next model */ }
  }
  return null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = (url.searchParams.get("rashi") || "").trim();
  const first = raw.split(/[\s(]/)[0];
  const sign =
    SANSKRIT[first] ??
    SIGNS.find((s) => raw.toLowerCase().startsWith(s.toLowerCase())) ??
    SIGNS.find((s) => raw.toLowerCase().includes(s.toLowerCase())) ??
    null;
  if (!sign) return Response.json({ error: "unknown rashi" }, { status: 400 });

  const dateKey = new Date().toISOString().slice(0, 10);
  const sb = supabaseAdmin();

  const { data: hit } = await sb
    .from("daily_horoscopes")
    .select("content")
    .eq("date_key", dateKey)
    .eq("rashi", sign)
    .maybeSingle();
  if (hit?.content) return Response.json({ text: hit.content, cached: true });

  const text = await generate(sign);
  if (!text) return Response.json({ error: "generation unavailable" }, { status: 503 });

  await sb.from("daily_horoscopes").upsert({ date_key: dateKey, rashi: sign, content: text });
  return Response.json({ text, cached: false });
}
