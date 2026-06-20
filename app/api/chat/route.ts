import Anthropic from "@anthropic-ai/sdk";
import { jyotishiSystem, deitySystem, consultSystem } from "@/lib/prompts";
import { deityById, astrologerById, DEMO_USER } from "@/lib/demo";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPUS = "claude-opus-4-8";
const SONNET = "claude-sonnet-4-6";

type Msg = { role: "user" | "assistant"; content: string };

function pick(mode: string, deityId?: string, astrologerId?: string) {
  if (mode === "deity") return { system: deitySystem(deityById(deityId || DEMO_USER.deityId)), model: SONNET };
  if (mode === "consult") return { system: consultSystem(astrologerById(astrologerId || "a1")), model: SONNET };
  return { system: jyotishiSystem(), model: OPUS };
}

const enc = new TextEncoder();

// Stream a canned string word-by-word (used when no API key is set).
function cannedStream(text: string) {
  const words = text.split(" ");
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < words.length; i++) {
        controller.enqueue(enc.encode(words[i] + (i < words.length - 1 ? " " : "")));
        await new Promise((r) => setTimeout(r, 28));
      }
      controller.close();
    },
  });
}

function cannedFor(mode: string, deityId?: string): string {
  if (mode === "deity") {
    const d = deityById(deityId || DEMO_USER.deityId);
    return `Vatsa ${DEMO_USER.name} ${d.symbol}, main tumhare saath hoon. Jo bhi mann mein bhaar hai, use mujhe arpan kar do — phal ki chinta chhodo, karm karte raho.\n\nAaj ${d.name} ka smaran karo. "${d.aarti}" gaao aur shaanti se ${d.suggestedMantraId === "harekrishna" ? "Hare Krishna" : "apne isht mantra"} ka jaap karo — Mala Counter mein. Tathastu. 🙏`;
  }
  if (mode === "consult") {
    return `Namaste ${DEMO_USER.name} ji 🙏 Maine aapki kundli khol li hai — Simha lagna, Rohini nakshatra. Aap nishchint hokar apna prashn poochhiye, main aapko vistaar se margdarshan dunga.`;
  }
  return `Namaste ${DEMO_USER.name} ji 🙏 Aapki kundli dekhi — Simha lagna, Chandrama Rohini nakshatra mein uchcha sthiti mein. Abhi Guru ki mahadasha aur Shani ki antardasha (Sep 2026 tak) chal rahi hai.\n\nKaam-kaaj ke liye samay shubh hai — dashvé bhaav mein uchcha Chandra aapki pratishtha badha raha hai. Shani ki antardasha mein dheeraj rakhein; Apr 2028 ke baad Guru mahadasha poori tarah phalit hogi.\n\nUpaay 🪔: har Guruvaar ko peela vastra/chana daan karein aur "Om Gurave Namah" ki 108 mala karein (Mala Counter mein). Kya aap career ke baare mein poochh rahe the, ya vivah ke?`;
}

export async function POST(req: Request) {
  let body: { mode?: string; deityId?: string; astrologerId?: string; messages?: Msg[] } = {};
  try {
    body = await req.json();
  } catch {}
  const mode = body.mode || "jyotishi";
  const messages = (body.messages || []).filter((m) => m.content?.trim());
  const { system, model } = pick(mode, body.deityId, body.astrologerId);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(cannedStream(cannedFor(mode, body.deityId)), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "demo-fallback" },
    });
  }

  const anthropic = new Anthropic({ apiKey });
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const s = await anthropic.messages.create({
          model,
          max_tokens: 900,
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
        });
        for await (const ev of s) {
          if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
            controller.enqueue(enc.encode(ev.delta.text));
          }
        }
      } catch (e) {
        controller.enqueue(enc.encode("\n\n🙏 Kshama karein, abhi connection mein vighna aaya. Kripya phir se poochhein."));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Divasya-Mode": "live" },
  });
}
