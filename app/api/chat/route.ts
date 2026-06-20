import { jyotishiSystem, deitySystem, consultSystem } from "@/lib/prompts";
import { deityById, astrologerById, DEMO_USER } from "@/lib/demo";

export const runtime = "nodejs";
export const maxDuration = 60;

// Efficient, free-tier-friendly model. Flash-Lite = fast, cheap, thinking off by
// default (minimal token burn) — chosen so the POC survives heavy demo testing.
const MODEL = "gemini-2.5-flash-lite";

type Msg = { role: "user" | "assistant"; content: string };

function pick(mode: string, deityId?: string, astrologerId?: string) {
  if (mode === "deity") return deitySystem(deityById(deityId || DEMO_USER.deityId));
  if (mode === "consult") return consultSystem(astrologerById(astrologerId || "a1"));
  return jyotishiSystem();
}

const enc = new TextEncoder();

function cannedStream(text: string) {
  const words = text.split(" ");
  return new ReadableStream({
    async start(c) {
      for (let i = 0; i < words.length; i++) {
        c.enqueue(enc.encode(words[i] + (i < words.length - 1 ? " " : "")));
        await new Promise((r) => setTimeout(r, 26));
      }
      c.close();
    },
  });
}

function cannedFor(mode: string, deityId?: string): string {
  if (mode === "deity") {
    const d = deityById(deityId || DEMO_USER.deityId);
    return `Vatsa ${DEMO_USER.name} ${d.symbol}, main tumhare saath hoon. Jo bhi mann mein bhaar hai, use mujhe arpan kar do — phal ki chinta chhodo, karm karte raho.\n\nAaj ${d.name} ka smaran karo aur shaanti se jaap karo — Mala Counter mein. Tathastu. 🙏`;
  }
  if (mode === "consult") {
    return `Namaste ${DEMO_USER.name} ji 🙏 Maine aapki kundli khol li hai — Simha lagna, Rohini nakshatra. Aap nishchint hokar apna prashn poochhiye.`;
  }
  return `Namaste ${DEMO_USER.name} ji 🙏 Aapki kundli dekhi — Simha lagna, Chandrama Rohini nakshatra mein uchcha. Abhi Guru ki mahadasha aur Shani ki antardasha (Sep 2026 tak) chal rahi hai.\n\nKaam-kaaj ke liye samay shubh hai. Upaay 🪔: har Guruvaar ko peela daan karein aur "Om Gurave Namah" ki 108 mala karein. Kya aap career ke baare mein poochh rahe the, ya vivah ke?`;
}

export async function POST(req: Request) {
  let body: { mode?: string; deityId?: string; astrologerId?: string; messages?: Msg[] } = {};
  try { body = await req.json(); } catch {}
  const mode = body.mode || "jyotishi";
  const messages = (body.messages || []).filter((m) => m.content?.trim());
  const system = pick(mode, body.deityId, body.astrologerId);

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(cannedStream(cannedFor(mode, body.deityId)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "demo-fallback" },
    });
  }

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: 520, temperature: 0.85, topP: 0.95 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const upstream = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify(payload),
        });
        if (!upstream.ok || !upstream.body) {
          controller.enqueue(enc.encode(cannedFor(mode, body.deityId)));
          controller.close();
          return;
        }
        const reader = upstream.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
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
              if (Array.isArray(parts)) {
                for (const p of parts) if (p?.text) controller.enqueue(enc.encode(p.text));
              }
            } catch {}
          }
        }
      } catch {
        controller.enqueue(enc.encode("\n\n🙏 Kshama karein, abhi connection mein vighna aaya. Kripya phir se poochhein."));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" },
  });
}
