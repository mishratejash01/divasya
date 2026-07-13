import { Profile } from "./types";

export type ChatMsg = { role: "user" | "assistant"; content: string };
export type ChatResult = { text: string; fallback: boolean };

/**
 * Stream a chat completion with hard anti-stall guarantees:
 *  - 30s cap on first byte, 25s cap between chunks, 90s total —
 *    the UI can never sit on a spinner forever.
 */
export async function streamChat(
  body: {
    mode: "jyotishi" | "deity" | "consult";
    deityId?: string;
    astrologerId?: string;
    messages: ChatMsg[];
    profile?: Partial<Profile> | null;
  },
  onDelta: (chunk: string, full: string) => void
): Promise<ChatResult> {
  const controller = new AbortController();
  const totalCap = setTimeout(() => controller.abort(), 90000);
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const fallback = res.headers.get("X-Divasya-Mode") === "fallback";
    if (!res.body) return { text: "", fallback: true };
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let full = "";
    for (;;) {
      const step = await Promise.race([
        reader.read(),
        new Promise<{ done: true; value: undefined }>((resolve) =>
          setTimeout(() => resolve({ done: true, value: undefined }), full ? 25000 : 30000)
        ),
      ]);
      if (step.done) break;
      const chunk = dec.decode(step.value, { stream: true });
      full += chunk;
      onDelta(chunk, full);
    }
    try { reader.cancel(); } catch { /* closed */ }
    return { text: full, fallback };
  } catch {
    return { text: "", fallback: true };
  } finally {
    clearTimeout(totalCap);
  }
}

// fire-and-forget analytics → Supabase
export function logEvent(type: string, data: Record<string, unknown> = {}) {
  try {
    fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* noop */ }
}
