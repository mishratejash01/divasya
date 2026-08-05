// The Vastu Guru — an acharya persona over the SAME computed facts the app
// shows. The zone digest is generated from the engine's own tables at module
// load, the user's personal disha is computed here from their rashi lord, and
// the home analysis arrives already computed on the device. The model is
// instructed to reason ONLY from these facts and to ask for a missing
// measurement the way a pandit on site would — never to invent one.
import { ZONES16, ZONE_CYCLE, personalDirections } from "@/lib/vastu";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
type Msg = { role: "user" | "assistant"; content: string };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const enc = new TextEncoder();

// Computed once from the engine's tables — the acharya's memorised shastra.
const ZONE_DIGEST = ZONES16.map((z, i) =>
  `${z.code}${z.sanskrit ? ` (${z.sanskrit})` : ""}: ${z.lifeArea}; element ${ZONE_CYCLE[i]}; ideal ${z.idealFor.join("/")}; avoid ${z.avoidFor.join("/") || "-"}; colours ${z.colors.join("/")}`
).join("\n");

function system(p: { name?: string; rashi?: string | null }, lang: string, context?: string): string {
  const disha = personalDirections(p.rashi);
  return [
    `You are Vastu Acharya of the Divasya app — a seasoned vastu consultant in the classical MahaVastu tradition. Warm, precise, practical, never fear-mongering. You recommend no-demolition remedies only (colours, elements, placement, habits).`,
    `Speak ${lang === "hi" ? "in simple Hindi (Devanagari)" : "in simple English, with Sanskrit terms where natural"}. Address the user${p.name ? ` as ${p.name.split(" ")[0]} ji` : ""}. Keep answers under 180 words unless a full room-by-room review is asked.`,
    `THE 16 ZONES (your computed shastra — the only zone facts you may use):\n${ZONE_DIGEST}`,
    disha
      ? `THIS USER'S COMPUTED PERSONAL DISHA (from their rashi ${disha.rashi}, lord ${disha.lord}): favourable direction ${disha.dir}. Sleep: ${disha.sleep} Desk: ${disha.desk}`
      : `The user's rashi is not on file, so offer general guidance and suggest completing their birth profile for personalised disha.`,
    context ? `THE USER'S HOME, ALREADY COMPUTED BY THE ENGINE (authoritative — never contradict or recompute):\n${context}` : ``,
    `RULES: Reason only from the facts above. If a question needs a direction or placement you were not given, ask for it the way a pandit on site would ("stand at your centre and tell me which direction the kitchen falls"). Never invent a score, zone, or measurement. If asked about medical, legal or financial decisions, advise the relevant professional alongside the vastu view.`,
  ].filter(Boolean).join("\n\n");
}

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

const canned = (name?: string) =>
  `${(name || "Devotee").split(" ")[0]} ji, is samay seva par bhaar hai. Kripya kuch kshan mein phir se poochhiye — aapke ghar ki disha par hum shanti se vichaar karenge.`;

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

export async function POST(req: Request) {
  let body: {
    messages?: Msg[]; lang?: string; context?: string;
    profile?: { name?: string; rashi?: string | null };
  } = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const messages = (body.messages || []).filter((m) => m.content?.trim()).slice(-16);
  const profile = body.profile ?? {};
  const sys = system(profile, body.lang === "hi" ? "hi" : "en", (body.context || "").slice(0, 4000));

  const key = process.env.GEMINI_API_KEY;
  const fallbackHeaders = { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "fallback" };
  if (!key) return new Response(cannedStream(canned(profile.name)), { headers: fallbackHeaders });

  const payload = {
    systemInstruction: { parts: [{ text: sys }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: 1400, temperature: 0.55, topP: 0.9, thinkingConfig: { thinkingBudget: 0 } },
  };

  const upstream = await openUpstream(payload, key);
  if (!upstream || !upstream.body) {
    return new Response(cannedStream(canned(profile.name)), { headers: fallbackHeaders });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let emitted = false;
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
        if (!emitted) controller.enqueue(enc.encode(canned(profile.name)));
      }
      try { reader.cancel(); } catch { /* already closed */ }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" },
  });
}
