import { Profile } from "./types";

export type ChatMsg = { role: "user" | "assistant"; content: string };

export type ChatResult = { text: string; fallback: boolean };

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
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const fallback = res.headers.get("X-Divasya-Mode") === "fallback";
  if (!res.body) return { text: "", fallback: true };
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value, { stream: true });
    full += chunk;
    onDelta(chunk, full);
  }
  return { text: full, fallback };
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
  } catch {}
}
