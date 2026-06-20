import { jyotishiSystem, deitySystem, consultSystem } from "@/lib/prompts";
import { deityById, astrologerById } from "@/lib/demo";
import { Profile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Efficient, free-tier-friendly model — thinking off by default = minimal token burn.
const MODEL = "gemini-2.5-flash-lite";

type Msg = { role: "user" | "assistant"; content: string };

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
        await new Promise((r) => setTimeout(r, 26));
      }
      c.close();
    },
  });
}

function cannedFor(mode: string, p: Profile, deityId?: string): string {
  const fn = (p.name || "devotee").split(" ")[0];
  if (mode === "deity") {
    const d = deityById(deityId || p.deity_id);
    return `Vatsa ${fn} ${d.symbol}, main tumhare saath hoon. Jo bhi mann mein bhaar hai, use mujhe arpan kar do — phal ki chinta chhodo, karm karte raho.\n\nAaj ${d.name} ka smaran karo aur shaanti se jaap karo — Mala Counter mein. Tathastu. 🙏`;
  }
  if (mode === "consult") {
    return `Namaste ${fn} ji 🙏 Maine aapki kundli khol li hai. Aap nishchint hokar apna prashn poochhiye.`;
  }
  return `Namaste ${fn} ji 🙏 Aapki janm-kundli ke anusaar margdarshan deta hoon.\n\nUpaay 🪔: har Guruvaar ko peela daan karein aur apne isht mantra ki 108 mala karein. Kya aap career ke baare mein poochh rahe the, ya vivah ke?`;
}

export async function POST(req: Request) {
  let body: { mode?: string; deityId?: string; astrologerId?: string; messages?: Msg[]; profile?: Partial<Profile> } = {};
  try { body = await req.json(); } catch {}
  const mode = body.mode || "jyotishi";
  const messages = (body.messages || []).filter((m) => m.content?.trim());
  const profile = asProfile(body.profile);
  const system = pick(mode, profile, body.deityId, body.astrologerId);

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return new Response(cannedStream(cannedFor(mode, profile, body.deityId)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "demo-fallback" },
    });
  }

  const payload = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
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
          controller.enqueue(enc.encode(cannedFor(mode, profile, body.deityId)));
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
              if (Array.isArray(parts)) for (const pt of parts) if (pt?.text) controller.enqueue(enc.encode(pt.text));
            } catch {}
          }
        }
      } catch {
        controller.enqueue(enc.encode("\n\n🙏 Kshama karein, abhi connection mein vighna aaya. Kripya phir se poochhein."));
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" } });
}
