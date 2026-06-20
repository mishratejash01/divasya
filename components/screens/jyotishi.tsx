"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Send, Sparkles, CircleDot } from "lucide-react";
import { useApp } from "../app-context";
import { cx, Typing } from "../ui";
import { DEITIES, deityById, DEMO_USER, mantraById } from "@/lib/demo";
import { streamChat, ChatMsg, logEvent } from "@/lib/chat";

type Mode = "jyotishi" | "deity";

function greeting(mode: Mode, deityId: string): string {
  if (mode === "deity") {
    const d = deityById(deityId);
    const lines: Record<string, string> = {
      krishna: `Vatsa ${DEMO_USER.name} 🪈, main yahin hoon — tumhare har sukh-dukh ka saathi. Mann mein jo bhi hai, nishank hokar kaho.`,
      shiva: `${DEMO_USER.name}, shaant ho jao. Main Mahadev, tumhare bhitar ki shaanti hoon. Kya jaanna chahte ho? 🔱`,
      hanuman: `Jai Shri Ram! ${DEMO_USER.name}, main Hanuman, tumhare saath hoon — bhay tyago. Bolo, kya chinta hai? 🪯`,
      durga: `Mere bachche ${DEMO_USER.name}, Maa yahin hai. Koi bhi sankat ho, nidar hokar kaho. 🔆`,
      ganesha: `Ganpati Bappa Morya! ${DEMO_USER.name}, har vighna door karunga. Kis kaam mein aashirwad chahiye? 🐘`,
      lakshmi: `${DEMO_USER.name}, main Maa Lakshmi. Tumhare ghar mein sukh-samriddhi ka vaas ho. Kaho, kya chahte ho? 🪷`,
    };
    return lines[deityId] || lines.krishna;
  }
  return `Namaste ${DEMO_USER.name} ji 🙏 Maine aapki janm-kundli khol li hai — Simha lagna, Chandrama Rohini nakshatra mein uchcha. Abhi Guru ki mahadasha chal rahi hai. Poochhiye, aapke mann mein kya hai?`;
}

const SUGGEST: Record<Mode, string[]> = {
  jyotishi: ["Meri shaadi kab hogi?", "Career kaisa rahega?", "Aaj mere liye shubh kya hai?", "Koi upay bataiye"],
  deity: ["Aaj margdarshan dijiye", "Mann ashaant hai", "Kaunsa mantra japu?", "Aapka aashirwad chahiye"],
};

function Rich({ text }: { text: string }) {
  // minimal **bold** + newline rendering
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="text-ink">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

export function JyotishiScreen() {
  const { back, deityId, setDeity, go, screen } = useApp();
  const initialMode = ((screen.params?.mode as Mode) || "jyotishi") as Mode;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const deity = deityById(deityId);
  const greet = greeting(mode, deityId);

  useEffect(() => { setMessages([]); }, [mode, deityId]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setInput("");
    const convo: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages([...convo, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      await streamChat(
        { mode, deityId: mode === "deity" ? deityId : undefined, messages: convo },
        (_c, full) =>
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          })
      );
    } finally {
      setStreaming(false);
      logEvent("ai_chat", { mode, deity: mode === "deity" ? deityId : undefined });
    }
  }

  return (
    <div className="flex h-full flex-col pt-12">
      {/* header */}
      <div className="flex items-center gap-3 px-5 py-2.5">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <div className="flex-1">
          <div className="font-display text-[17px] leading-tight text-ink">
            {mode === "jyotishi" ? "AI Jyotishi" : `Talk to ${deity.name}`}
          </div>
          <div className="text-[11px] text-[var(--good)]">● Online · grounded in your kundli</div>
        </div>
      </div>

      {/* mode toggle */}
      <div className="mx-5 mt-1 grid grid-cols-2 gap-1 rounded-full p-1 surface">
        {(["jyotishi", "deity"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={cx("rounded-full py-2 text-[12.5px] transition-colors", mode === m ? "btn-saffron" : "text-muted")}>
            {m === "jyotishi" ? "AI Jyotishi" : "Ishta Devta"}
          </button>
        ))}
      </div>

      {/* deity selector */}
      {mode === "deity" && (
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-5 no-scrollbar">
          {DEITIES.map((d) => (
            <button key={d.id} onClick={() => setDeity(d.id)}
              className={cx("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px]",
                d.id === deityId ? "btn-saffron" : "surface text-muted")}>
              <span>{d.symbol}</span> {d.name.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      {/* messages */}
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 no-scrollbar">
        {/* greeting bubble */}
        <Bubble role="assistant" mode={mode} deitySymbol={deity.symbol} deityColor={deity.color}>
          <Rich text={greet} />
        </Bubble>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <Bubble key={i} role="user"><Rich text={m.content} /></Bubble>
          ) : (
            <Bubble key={i} role="assistant" mode={mode} deitySymbol={deity.symbol} deityColor={deity.color}>
              {m.content ? <Rich text={m.content} /> : <Typing />}
            </Bubble>
          )
        )}

        {/* mantra deep-link in deity mode */}
        {mode === "deity" && (
          <button
            onClick={() => go("mala", { mantraId: deity.suggestedMantraId })}
            className="mx-auto mt-1 flex items-center gap-2 rounded-full surface px-4 py-2 text-[12px] text-[var(--saffron-soft)]"
          >
            <CircleDot size={14} /> Chant {mantraById(deity.suggestedMantraId).name.replace(/ ?Mantra$/, "")} in Mala
          </button>
        )}
      </div>

      {/* suggestions */}
      {messages.length === 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-5 pb-2 no-scrollbar">
          {SUGGEST[mode].map((s) => (
            <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full surface px-3 py-1.5 text-[12px] text-muted">{s}</button>
          ))}
        </div>
      )}

      {/* input */}
      <div className="flex items-center gap-2 px-4 pb-5 pt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={mode === "jyotishi" ? "Apna prashn poochhiye…" : `${deity.name.split(" ")[0]} se baat karein…`}
          className="flex-1 rounded-full bg-transparent px-4 py-3 text-[14px] text-ink outline-none placeholder:text-muted"
          style={{ border: "1px solid var(--line-strong)" }}
        />
        <button onClick={() => send(input)} disabled={streaming}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-saffron disabled:opacity-50">
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}

function Bubble({
  role, children, mode, deitySymbol, deityColor,
}: {
  role: "user" | "assistant"; children: React.ReactNode; mode?: Mode; deitySymbol?: string; deityColor?: string;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed btn-saffron">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[14px]"
        style={{ background: mode === "deity" ? `${deityColor}22` : "rgba(200,119,46,0.16)", border: "1px solid var(--line)" }}>
        {mode === "deity" ? deitySymbol : <Sparkles size={13} className="text-[var(--saffron-soft)]" />}
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink surface">{children}</div>
    </div>
  );
}
