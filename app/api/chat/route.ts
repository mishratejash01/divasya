import { jyotishiSystem, deitySystem, consultSystem } from "@/lib/prompts";
import { deityById, astrologerById } from "@/lib/demo";
import { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Free-tier models, in order of preference. The lite models 503 under load,
// so we retry and then fall through to the next model before ever going canned.
const MODELS = ["gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-2.5-flash"];

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

function pick(mode: string, profile: Profile, deityId?: string, astrologerId?: string) {
  if (mode === "deity") return deitySystem(deityById(deityId || profile.deity_id), profile);
  if (mode === "consult") return consultSystem(astrologerById(astrologerId || "a1"), profile);
  return jyotishiSystem(profile);
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

function cannedFor(mode: string, p: Profile): string {
  const fn = (p.name || "devotee").split(" ")[0];
  if (mode === "deity") {
    return `${fn}, abhi divya sambandh mein thodi der ho rahi hai. Kuch pal mein phir se prashn poochhiye — main yahin hoon.`;
  }
  return `${fn} ji, abhi jyotish sewa par bahut bhaar hai. Kripya kuch second baad apna prashn dobara poochhiye — main turant margdarshan dunga.`;
}

// Find the first model that streams successfully (retrying transient 429/5xx).
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
        // transient → retry same model, else move to next model
        if (r.status === 429 || r.status >= 500) { await sleep(350 * (attempt + 1)); continue; }
        break;
      } catch { await sleep(300); }
    }
  }
  return null;
}

export async function POST(req: Request) {
  let body: { mode?: string; deityId?: string; astrologerId?: string; messages?: Msg[]; profile?: Partial<Profile> } = {};
  try { body = await req.json(); } catch {}
  const mode = body.mode || "jyotishi";
  // keep the last 16 turns — enough context, avoids drift/echo on long threads
  const messages = (body.messages || []).filter((m) => m.content?.trim()).slice(-16);
  const profile = asProfile(body.profile);
  const system = pick(mode, profile, body.deityId, body.astrologerId);

  const key = process.env.GEMINI_API_KEY;
  const fallbackHeaders = { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "fallback" };

  if (!key) {
    return new Response(cannedStream(cannedFor(mode, profile)), { headers: fallbackHeaders });
  }

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: 600, temperature: 0.7, topP: 0.95 },
  };

  const upstream = await openUpstream(payload, key);
  if (!upstream || !upstream.body) {
    // every model was unreachable — graceful, NON-persisted message
    return new Response(cannedStream(cannedFor(mode, profile)), { headers: fallbackHeaders });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let emitted = false;
      try {
        for (;;) {
          const { done, value } = await reader.read();
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
              if (Array.isArray(parts)) for (const pt of parts) if (pt?.text) { controller.enqueue(enc.encode(pt.text)); emitted = true; }
            } catch {}
          }
        }
      } catch {
        // mid-stream drop — if nothing came through, give a graceful nudge
        if (!emitted) controller.enqueue(enc.encode(cannedFor(mode, profile)));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" } });
}
