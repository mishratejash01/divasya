"use client";

import { useEffect, useRef, useState } from "react";
import { CaretLeft, CircleDashed, PaperPlaneTilt, Sparkle } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx, Typing, DeityGlyph } from "../ui";
import { DEITIES, mantraById, Deity } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { streamChat, ChatMsg, logEvent } from "@/lib/chat";
import * as db from "@/lib/db";

type Mode = "jyotishi" | "deity";

function greeting(mode: Mode, deityId: string, name: string): string {
  if (mode === "deity") {
    const lines: Record<string, string> = {
      krishna: `Vatsa ${name}, main yahin hoon, tumhare har sukh-dukh ka saathi. Mann mein jo bhi hai, nishank hokar kaho.`,
      shiva: `${name}, shaant ho jao. Main Mahadev, tumhare bhitar ki shaanti hoon. Kya jaanna chahte ho?`,
      hanuman: `Jai Shri Ram! ${name}, main Hanuman, tumhare saath hoon. Bhay tyago. Bolo, kya chinta hai?`,
      durga: `Mere bachche ${name}, Maa yahin hai. Koi bhi sankat ho, nidar hokar kaho.`,
      ganesha: `Ganpati Bappa Morya! ${name}, har vighna door karunga. Kis kaam mein aashirwad chahiye?`,
      lakshmi: `${name}, main Maa Lakshmi. Tumhare ghar mein sukh-samriddhi ka vaas ho. Kaho, kya chahte ho?`,
    };
    return lines[deityId] || lines.krishna;
  }
  return `Namaste ${name} ji. Maine aapki janm-kundli khol li hai. Poochhiye, aapke mann mein kya hai?`;
}

const SUGGEST: Record<Mode, string[]> = {
  jyotishi: ["Meri shaadi kab hogi?", "Career kaisa rahega?", "Aaj mere liye shubh kya hai?", "Koi upay bataiye"],
  deity: ["Aaj margdarshan dijiye", "Mann ashaant hai", "Kaunsa mantra japu?", "Aapka aashirwad chahiye"],
};

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span className="whitespace-pre-wrap">
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} className="text-ink">{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

export function JyotishiScreen() {
  const { back, deityId, setDeity, go, screen, profile, user } = useApp();
  const initialMode = ((screen.params?.mode as Mode) || "jyotishi") as Mode;
  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const deities = useCatalog(getDeities, DEITIES);
  const deity = deities.find((d) => d.id === deityId) ?? deities[0];
  const first = profile?.name?.split(" ")[0] || "Devotee";
  const greet = greeting(mode, deityId, first);
  const thread = mode === "deity" ? `deity:${deityId}` : "jyotishi";

  // load persisted history for this thread
  useEffect(() => {
    setMessages([]);
    if (!user) return;
    let on = true;
    db.getMessages(user.id, thread).then((m) => { if (on && m.length) setMessages(m); });
    return () => { on = false; };
  }, [thread, user]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    setInput("");
    const convo: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages([...convo, { role: "assistant", content: "" }]);
    setStreaming(true);
    let result = { text: "", fallback: false };
    try {
      result = await streamChat(
        { mode, deityId: mode === "deity" ? deityId : undefined, messages: convo, profile },
        (_c, f) => setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: f }; return c; })
      );
    } finally {
      setStreaming(false);
      logEvent("ai_chat", { mode });
      // never persist a graceful fallback — it would poison later turns
      if (user && result.text && !result.fallback) db.addMessages(user.id, thread, [{ role: "user", content: text }, { role: "assistant", content: result.text }]);
    }
  }

  return (
    <div className="flex h-full flex-col screen-top">
      <div className="flex items-center gap-3 gutter py-2.5">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={18} /></button>
        <div className="flex-1">
          <div className="font-display text-[17px] leading-tight text-ink">{mode === "jyotishi" ? "AI Jyotishi" : `Talk to ${deity.name}`}</div>
          <div className="text-[11px] text-[var(--good)]">● Online · grounded in your kundli</div>
        </div>
      </div>

      <div className="gutter-m mt-1 grid grid-cols-2 gap-1 rounded-full p-1 surface">
        {(["jyotishi", "deity"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={cx("rounded-full py-2 text-[12.5px] transition-colors", mode === m ? "btn-saffron" : "text-muted")}>
            {m === "jyotishi" ? "AI Jyotishi" : "Ishta Devta"}
          </button>
        ))}
      </div>

      {mode === "deity" && (
        <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto gutter no-scrollbar">
          {deities.map((d) => (
            <button key={d.id} onClick={() => setDeity(d.id)}
              className={cx("flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-3.5 text-[12px]", d.id === deityId ? "ring-gold text-ink" : "surface text-muted")}
              style={d.id === deityId ? { background: "rgba(206,185,118,0.16)" } : undefined}>
              <DeityGlyph deity={d} size={22} /> {d.name.split(" ")[0]}
            </button>
          ))}
        </div>
      )}

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 no-scrollbar">
        <Bubble role="assistant" mode={mode} deity={deity}><Rich text={greet} /></Bubble>
        {messages.map((m, i) =>
          m.role === "user"
            ? <Bubble key={i} role="user"><Rich text={m.content} /></Bubble>
            : <Bubble key={i} role="assistant" mode={mode} deity={deity}>{m.content ? <Rich text={m.content} /> : <Typing />}</Bubble>
        )}
        {mode === "deity" && (
          <button onClick={() => go("mala", { mantraId: deity.suggestedMantraId })}
            className="mx-auto mt-1 flex items-center gap-2 rounded-full surface px-4 py-2 text-[12px] text-[var(--amber-deep)]">
            <CircleDashed size={14} /> Chant {mantraById(deity.suggestedMantraId).name.replace(/ ?Mantra$/, "")} in Mala
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto gutter pb-2 no-scrollbar">
          {SUGGEST[mode].map((s) => (
            <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full surface px-3 py-1.5 text-[12px] text-ink-dim" style={{ border: "1px solid var(--line)" }}>{s}</button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 px-4 pb-5 pt-1">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={mode === "jyotishi" ? "Apna prashn poochhiye…" : `${deity.name.split(" ")[0]} se baat karein…`}
          className="flex-1 rounded-full px-4 py-3 text-[14px] text-ink outline-none placeholder:text-muted"
          style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }} />
        <button onClick={() => send(input)} disabled={streaming}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-saffron disabled:opacity-50"><PaperPlaneTilt size={17} /></button>
      </div>
    </div>
  );
}

function Bubble({ role, children, mode, deity }: {
  role: "user" | "assistant"; children: React.ReactNode; mode?: Mode; deity?: Deity;
}) {
  if (role === "user")
    return <div className="flex justify-end"><div className="max-w-[78%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed btn-saffron">{children}</div></div>;
  return (
    <div className="flex items-end gap-2">
      {mode === "deity" && deity ? (
        <DeityGlyph deity={deity} size={28} />
      ) : (
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
          style={{ background: "rgba(200,129,49,0.12)", border: "1px solid var(--line)" }}>
          <Sparkle size={13} className="text-[var(--amber)]" />
        </div>
      )}
      <div className="max-w-[80%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink surface">{children}</div>
    </div>
  );
}
