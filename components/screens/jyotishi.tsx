"use client";

import { useEffect, useRef, useState } from "react";
import { CircleDashed, PaperPlaneTilt } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, Typing, cx } from "../ui";
import { PageHeader } from "../page-header";
import { ChatLine, UserAvatar, useTyping } from "../chat-line";
import { DEITIES, mantraById, Deity } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { streamChat, ChatMsg, logEvent } from "@/lib/chat";
import * as db from "@/lib/db";

type Mode = "jyotishi" | "deity";

type Lang = "en" | "hi";

function greeting(mode: Mode, deityId: string, name: string, lang: Lang): string {
  if (mode === "deity") {
    const lines: Record<string, Record<Lang, string>> = {
      krishna: {
        en: `${name}, I am right here, your companion in every joy and sorrow. Say whatever is in your heart, without hesitation.`,
        hi: `वत्स ${name}, मैं यहीं हूँ, तुम्हारे हर सुख-दुख का साथी। मन में जो भी है, निःसंकोच कहो।`,
      },
      shiva: {
        en: `${name}, be still. I am Mahadev, the peace within you. What would you like to know?`,
        hi: `${name}, शांत हो जाओ। मैं महादेव, तुम्हारे भीतर की शांति हूँ। क्या जानना चाहते हो?`,
      },
      hanuman: {
        en: `Jai Shri Ram! ${name}, I am Hanuman and I am with you. Let go of fear. Tell me, what troubles you?`,
        hi: `जय श्री राम! ${name}, मैं हनुमान, तुम्हारे साथ हूँ। भय त्यागो। बोलो, क्या चिंता है?`,
      },
      durga: {
        en: `My child ${name}, Maa is here. Whatever the trouble, speak without fear.`,
        hi: `मेरे बच्चे ${name}, माँ यहीं है। कोई भी संकट हो, निडर होकर कहो।`,
      },
      ganesha: {
        en: `Ganpati Bappa Morya! ${name}, I will clear every obstacle. For which work do you seek blessings?`,
        hi: `गणपति बप्पा मोरया! ${name}, हर विघ्न दूर करूँगा। किस काम में आशीर्वाद चाहिए?`,
      },
      lakshmi: {
        en: `${name}, I am Maa Lakshmi. May joy and abundance dwell in your home. Tell me, what do you wish for?`,
        hi: `${name}, मैं माँ लक्ष्मी। तुम्हारे घर में सुख-समृद्धि का वास हो। कहो, क्या चाहते हो?`,
      },
    };
    return (lines[deityId] || lines.krishna)[lang];
  }
  return lang === "hi"
    ? `नमस्ते ${name} जी। मैंने आपकी जन्म-कुंडली खोल ली है। पूछिए, आपके मन में क्या है?`
    : `Namaste ${name}. I have your birth chart open. Ask me, what is on your mind?`;
}

const SUGGEST: Record<Mode, Record<Lang, string[]>> = {
  jyotishi: {
    en: ["When will I get married?", "How will my career go?", "What is auspicious for me today?", "Suggest a remedy"],
    hi: ["मेरी शादी कब होगी?", "करियर कैसा रहेगा?", "आज मेरे लिए शुभ क्या है?", "कोई उपाय बताइए"],
  },
  deity: {
    en: ["Guide me today", "My mind is restless", "Which mantra should I chant?", "I seek your blessing"],
    hi: ["आज मार्गदर्शन दीजिए", "मन अशांत है", "कौन सा मंत्र जपूँ?", "आपका आशीर्वाद चाहिए"],
  },
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
  const { back, deityId, setDeity, go, screen, profile, user, lang } = useApp();
  // The mode is fixed by how you arrived — the AI Jyotishi entry or the Talk to
  // Devta entry — so the two are separate chats, not one screen with a toggle.
  const mode = ((screen.params?.mode as Mode) || "jyotishi") as Mode;
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const kb = useTyping();

  const deities = useCatalog(getDeities, DEITIES);
  const deity = deities.find((d) => d.id === deityId) ?? deities[0];
  const first = profile?.name?.split(" ")[0] || (lang === "hi" ? "भक्त" : "Devotee");
  const greet = greeting(mode, deityId, first, lang);
  const deityName = lang === "hi" ? deity.deva : deity.name;
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
        { mode, deityId: mode === "deity" ? deityId : undefined, messages: convo, profile, lang },
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
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title={mode === "jyotishi" ? (lang === "hi" ? "AI ज्योतिषी" : "AI Jyotishi") : (lang === "hi" ? `${deityName} से बात करें` : `Talk to ${deity.name}`)}
        subtitle={streaming ? (lang === "hi" ? "लिख रहे हैं…" : "typing…") : mode === "jyotishi" ? (lang === "hi" ? "अपनी कुंडली के बारे में पूछें" : "Ask about your kundli") : (lang === "hi" ? "अपने देवता के साथ बैठें" : "Sit with your devta")}
        onBack={back}
        art={mode === "jyotishi" ? "/home/tools/ai-jyotishi.png" : "/home/tools/talk-jyotishi.png"}
        gradient="linear-gradient(135deg, #153C6B 0%, #0A1F3B 100%)"
        shadow="rgba(10,31,59,0.30)"
      />

      {/* No mode toggle — the chat you opened is the chat you get. For a devta
          chat, a strip lets you choose which devta to sit with. */}
      {mode === "deity" && (
        <div className="shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="mx-auto w-full lg:max-w-3xl">
            <div className="flex gap-2 overflow-x-auto gutter py-2.5 no-scrollbar">
              {deities.map((d) => (
                <button key={d.id} onClick={() => setDeity(d.id)}
                  className={cx("flex shrink-0 items-center gap-1.5 rounded-[5px] py-1 pl-1 pr-2.5 text-[11px]", d.id === deityId ? "text-ink" : "surface text-muted")}
                  style={d.id === deityId ? { background: "var(--surface-2)", border: "1px solid var(--bhagwa)" } : undefined}>
                  <DeityGlyph deity={d} size={20} /> {lang === "hi" ? d.deva : d.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop keeps the thread in a centred, readable column. */}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 no-scrollbar">
        <div className="mx-auto flex w-full flex-col gap-5 gutter lg:max-w-3xl">
          <Bubble role="assistant" mode={mode} deity={deity} lang={lang}><Rich text={greet} /></Bubble>
          {messages.map((m, i) =>
            m.role === "user"
              ? <Bubble key={i} role="user" you={first} lang={lang}><Rich text={m.content} /></Bubble>
              : <Bubble key={i} role="assistant" mode={mode} deity={deity} lang={lang}>{m.content ? <Rich text={m.content} /> : <Typing />}</Bubble>
          )}
          {mode === "deity" && (
            <button onClick={() => go("mala", { mantraId: deity.suggestedMantraId })}
              className="mx-auto mt-1 flex items-center gap-2 rounded-[5px] surface px-3 py-1.5 text-[11px] text-[var(--bhagwa-deep)]">
              <CircleDashed size={13} /> {lang === "hi" ? `माला में ${mantraById(deity.suggestedMantraId).name.replace(/ ?Mantra$/, "")} जपें` : `Chant ${mantraById(deity.suggestedMantraId).name.replace(/ ?Mantra$/, "")} in Mala`}
            </button>
          )}
        </div>
      </div>

      {messages.length === 0 && (
        <div className="mx-auto w-full shrink-0 lg:max-w-3xl">
          <div className="-mx-1 flex gap-2 overflow-x-auto gutter pb-2 no-scrollbar">
            {SUGGEST[mode][lang].map((s) => (
              <button key={s} onClick={() => send(s)} className="shrink-0 rounded-[5px] surface px-2.5 py-1.5 text-[11px] text-ink-dim">{s}</button>
            ))}
          </div>
        </div>
      )}

      <div
        className={cx("relative z-20 shrink-0 gutter pt-2", kb.typing ? "chat-composer" : "above-tabbar")}
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
      >
        <div className="mx-auto flex w-full items-center gap-2 lg:max-w-3xl">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} onFocus={kb.onFocus} onBlur={kb.onBlur}
            placeholder={mode === "jyotishi" ? (lang === "hi" ? "अपना प्रश्न पूछिए…" : "Ask your question…") : (lang === "hi" ? `${deityName} से बात करें…` : `Talk to ${deity.name.split(" ")[0]}…`)}
            className="flex-1 rounded-[8px] px-3 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-muted lg:py-3 lg:text-[13.5px]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--line-strong)" }} />
          <button onClick={() => send(input)} disabled={streaming} aria-label="Send" onPointerDown={(e) => e.preventDefault()}
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] btn-saffron disabled:opacity-50 lg:h-11 lg:w-11"><PaperPlaneTilt size={15} weight="fill" /></button>
        </div>
      </div>
    </div>
  );
}

// A front-facing baba/jyotishi — the AI Jyotishi's face in the thread. Drawn so
// it reads at avatar size: saffron ground, a white beard, tripundra tilak and a
// jata knot. Kept as an SVG so it renders identically everywhere.
function GuruAvatar({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className="shrink-0" aria-hidden>
      <defs>
        <clipPath id="guruClip"><circle cx="24" cy="24" r="24" /></clipPath>
        <radialGradient id="guruBg" cx="50%" cy="34%" r="78%">
          <stop offset="0" stopColor="#FFE7BE" />
          <stop offset="1" stopColor="#F2C271" />
        </radialGradient>
      </defs>
      <g clipPath="url(#guruClip)">
        <rect width="48" height="48" fill="url(#guruBg)" />
        <path d="M6 48 Q8 33 24 33 Q40 33 42 48 Z" fill="#D9772E" />
        <path d="M20 32 h8 v6 h-8 Z" fill="#E7B98C" />
        <path d="M12 24 Q12 9 24 9 Q36 9 36 24 Q33 15 24 15 Q15 15 12 24 Z" fill="#5b4636" />
        <circle cx="24" cy="8.5" r="3.6" fill="#5b4636" />
        <ellipse cx="24" cy="22" rx="9.2" ry="10" fill="#EAC098" />
        <path d="M14.8 21 Q15.5 37 24 39 Q32.5 37 33.2 21 Q30 31 24 31 Q18 31 14.8 21 Z" fill="#F3F1ED" />
        <circle cx="20.4" cy="21.4" r="1.15" fill="#33241a" />
        <circle cx="27.6" cy="21.4" r="1.15" fill="#33241a" />
        <path d="M18.6 18.9 q1.8 -1 3.6 0" stroke="#5b4636" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <path d="M25.8 18.9 q1.8 -1 3.6 0" stroke="#5b4636" strokeWidth="0.9" fill="none" strokeLinecap="round" />
        <g stroke="#E0761B" strokeWidth="1.1" strokeLinecap="round">
          <line x1="21" y1="14.4" x2="27" y2="14.4" />
          <line x1="21.2" y1="16" x2="26.8" y2="16" />
          <line x1="21.5" y1="17.6" x2="26.5" y2="17.6" />
        </g>
      </g>
      <circle cx="24" cy="24" r="23.3" fill="none" stroke="rgba(0,0,0,0.10)" />
    </svg>
  );
}

function Bubble({ role, children, mode, deity, you, lang = "en" }: {
  role: "user" | "assistant"; children: React.ReactNode; mode?: Mode; deity?: Deity; you?: string; lang?: Lang;
}) {
  if (role === "user")
    return <ChatLine mine avatar={<UserAvatar size={28} />} name={you || (lang === "hi" ? "आप" : "You")}>{children}</ChatLine>;
  return (
    <ChatLine
      avatar={mode === "deity" && deity ? <DeityGlyph deity={deity} size={28} /> : <GuruAvatar size={28} />}
      name={mode === "deity" && deity ? (lang === "hi" ? deity.deva : deity.name) : (lang === "hi" ? "AI ज्योतिषी" : "AI Jyotishi")}
    >
      {children}
    </ChatLine>
  );
}
