export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamChat(
  body: {
    mode: "jyotishi" | "deity" | "consult";
    deityId?: string;
    astrologerId?: string;
    messages: ChatMsg[];
  },
  onDelta: (chunk: string, full: string) => void
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.body) return "";
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
  return full;
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
