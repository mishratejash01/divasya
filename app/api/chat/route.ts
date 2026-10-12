import { jyotishiSystem, deitySystem, consultSystem, languageRule } from "@/lib/prompts";
import { deityById, astrologerById } from "@/lib/demo";
import { supabaseAdmin } from "@/lib/supabase";
import { Profile } from "@/lib/types";
import { buildChartContext, buildTodayContext } from "@/lib/kundli/grounding";

export const runtime = "nodejs";
export const maxDuration = 60;

// Quality-first model chain. gemini-2.5-flash leads (markedly better reasoning
// and language than lite); lite variants are the resilience net for 503 spikes.
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

type Msg = { role: "user" | "assistant"; content: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function asProfile(p?: Partial<Profile> | null): Profile {
  return {
    id: p?.id || "anon",
    name: p?.name || "devotee",
    dob: p?.dob ?? null,
    tob: p?.tob ?? null,
    birthplace: p?.birthplace ?? null,
    current_location: p?.current_location ?? null,
    gender: p?.gender ?? null,
    deity_id: p?.deity_id || "krishna",
    rashi: p?.rashi ?? null,
    nakshatra: p?.nakshatra ?? null,
    onboarded: true,
  };
}

/** Deity persona from the DB (source of truth), demo seed as fallback. */
async function loadDeity(id: string) {
  try {
    const { data } = await supabaseAdmin().from("deities").select("*").eq("id", id).maybeSingle();
    if (data) {
      return {
        ...deityById(id),
        name: data.name, deva: data.deva, tagline: data.tagline,
        persona: data.persona, aarti: data.aarti, color: data.color,
        suggestedMantraId: data.suggested_mantra_id,
      };
    }
  } catch { /* fall through */ }
  return deityById(id);
}

async function loadAstrologer(id: string) {
  try {
    const { data } = await supabaseAdmin().from("astrologers").select("*").eq("id", id).maybeSingle();
    if (data) {
      return {
        ...astrologerById(id),
        name: data.name, specialty: data.specialty, exp: data.exp,
        rating: Number(data.rating), langs: data.langs, rate: data.rate,
      };
    }
  } catch { /* fall through */ }
  return astrologerById(id);
}

const enc = new TextEncoder();

function cannedStream(text: string) {
  const words = text.split(" ");
  return new ReadableStream({
    async start(c) {
      for (let i = 0; i < words.length; i++) {
        c.enqueue(enc.encode(words[i] + (i < words.length - 1 ? " " : "")));
        await sleep(22);
      }
      c.close();
    },
  });
}

function cannedFor(mode: string, name: string, lang: "en" | "hi"): string {
  const fn = (name || (lang === "hi" ? "भक्त" : "devotee")).split(" ")[0];
  if (mode === "deity")
    return lang === "hi"
      ? `${fn}, अभी दिव्य संवाद में क्षण भर का विराम है। एक गहरी साँस लीजिए और कुछ पल में फिर से पूछिए, मैं यहीं हूँ।`
      : `${fn}, there is a brief pause in our connection. Take a deep breath and ask again in a moment. I am right here.`;
  return lang === "hi"
    ? `${fn} जी, इस समय ज्योतिष सेवा पर असाधारण भार है। कृपया 20-30 सेकंड बाद अपना प्रश्न दोबारा भेजिए, मैं आपकी कुंडली के साथ तैयार हूँ।`
    : `${fn} ji, the Jyotish service is unusually busy right now. Please send your question again in 20 to 30 seconds. I have your kundli ready.`;
}

/** Open a streaming completion, walking the model chain with retries. */
async function openUpstream(payload: object, key: string): Promise<Response | null> {
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify(payload),
        });
        if (r.ok && r.body) return r;
        if (r.status === 429 || r.status >= 500) { await sleep(400 * (attempt + 1)); continue; }
        break;
      } catch { await sleep(300); }
    }
  }
  return null;
}

export async function POST(req: Request) {
  let body: { mode?: string; deityId?: string; astrologerId?: string; messages?: Msg[]; profile?: Partial<Profile>; lang?: string } = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const mode = body.mode || "jyotishi";
  const messages = (body.messages || []).filter((m) => m.content?.trim()).slice(-16);
  const profile = asProfile(body.profile);

  // Real grounding: compute the user's actual kundli + dasha + today's live
  // panchang (jyotish-grade engine) and inject the facts — never invented.
  const [chart, today] = await Promise.all([buildChartContext(profile), buildTodayContext()]);
  let system: string;
  if (mode === "deity") system = deitySystem(await loadDeity(body.deityId || profile.deity_id), profile, chart, today);
  else if (mode === "consult") system = consultSystem(await loadAstrologer(body.astrologerId || "a1"), profile, chart, today);
  else system = jyotishiSystem(profile, chart, today);
  const lang: "en" | "hi" = body.lang === "hi" ? "hi" : "en";
  system += `

${languageRule(lang)}`;

  const key = process.env.GEMINI_API_KEY;
  const fallbackHeaders = { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "fallback" };
  if (!key) return new Response(cannedStream(cannedFor(mode, profile.name || "", lang)), { headers: fallbackHeaders });

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    // 1600 tokens: long Hinglish answers never hit MAX_TOKENS mid-sentence
    // (the exact bug behind replies that stopped mid-thought).
    generationConfig: { maxOutputTokens: 2000, temperature: 0.65, topP: 0.9, thinkingConfig: { thinkingBudget: 0 } },
  };

  const upstream = await openUpstream(payload, key);
  if (!upstream || !upstream.body) {
    return new Response(cannedStream(cannedFor(mode, profile.name || "", lang)), { headers: fallbackHeaders });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let emitted = false;
      // Watchdog: if Gemini stalls >20s between chunks, close cleanly so the
      // client is never stuck on a spinner.
      const readWithTimeout = () =>
        Promise.race([
          reader.read(),
          sleep(20000).then(() => ({ done: true, value: undefined as Uint8Array | undefined })),
        ]);
      try {
        for (;;) {
          const { done, value } = await readWithTimeout();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() || "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const json = t.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const obj = JSON.parse(json);
              const parts = obj?.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                for (const pt of parts) if (pt?.text) { controller.enqueue(enc.encode(pt.text)); emitted = true; }
              }
            } catch { /* partial SSE chunk */ }
          }
        }
      } catch {
        if (!emitted) controller.enqueue(enc.encode(cannedFor(mode, profile.name || "", lang)));
      }
      try { reader.cancel(); } catch { /* already closed */ }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" },
  });
}
