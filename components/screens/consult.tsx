"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, Clock, Gift, PaperPlaneTilt, ShieldCheck, Star, Wallet } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Avatar, cx, Typing } from "../ui";
import { ASTROLOGERS } from "@/lib/demo";
import { useCatalog, getAstrologers } from "@/lib/catalog";
import { streamChat, ChatMsg, logEvent } from "@/lib/chat";
import * as db from "@/lib/db";

/* ---------------- Directory ---------------- */
export function ConsultScreen() {
  const { back, go, wallet } = useApp();
  const astrologers = useCatalog(getAstrologers, ASTROLOGERS);
  return (
    <div className="flex h-full flex-col screen-top">
      <div className="flex items-center gap-3 gutter py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={18} /></button>
        <span className="font-display text-lg text-ink">Consult Astrologers</span>
        <div className="ml-auto flex items-center gap-1.5 rounded-full surface px-3 py-1.5">
          <Wallet size={13} className="text-[var(--amber)]" />
          <span className="text-[12px] text-ink">₹{wallet}</span>
        </div>
      </div>

      <div className="gutter-m mb-3 flex items-center gap-3 rounded-2xl card-temple px-4 py-3">
        <Gift size={20} className="text-[var(--amber)]" />
        <div>
          <div className="text-[13px] font-medium text-ink">Your first chat is FREE</div>
          <div className="text-[11.5px] text-muted">Talk to any verified astrologer · no queue</div>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto px-4 pb-6 no-scrollbar">
        {astrologers.map((a) => (
          <button key={a.id} onClick={() => go("consultChat", { astrologerId: a.id })}
            className="flex w-full items-center gap-3 rounded-2xl surface p-3 text-left">
            <Avatar name={a.name} size={50} tint={a.grad[0]} status={a.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13.5px] font-medium text-ink">{a.name}</span>
                <ShieldCheck size={13} className="shrink-0 text-[var(--good)]" />
              </div>
              <div className="truncate text-[11.5px] text-muted">{a.specialty}</div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                <span className="flex items-center gap-0.5 text-gold"><Star size={11} fill="currentColor" /> {a.rating}</span>
                <span>· {a.orders} orders</span>
                <span>· {a.exp}y</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={cx("rounded-full px-3 py-1.5 text-[12px]", a.status === "online" ? "btn-saffron" : "surface text-muted")}>
                {a.status === "online" ? "Free" : a.wait}
              </span>
              <span className="text-[10.5px] text-muted">₹{a.rate}/min</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Live consult chat + wallet ---------------- */
const FREE_SECONDS = 300;
const RECHARGE = [50, 100, 200, 500];

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function ConsultChatScreen() {
  const { back, screen, wallet, addWallet, haptic, profile, user } = useApp();
  const astrologers = useCatalog(getAstrologers, ASTROLOGERS);
  const astroId = (screen.params?.astrologerId as string) || "a1";
  const astro = astrologers.find((a) => a.id === astroId) ?? astrologers[0];
  const first = profile?.name?.split(" ")[0] || "ji";
  const thread = `consult:${astro.id}`;

  const [phase, setPhase] = useState<"free" | "ended" | "paid">("free");
  const [freeLeft, setFreeLeft] = useState(FREE_SECONDS);
  const [paidElapsed, setPaidElapsed] = useState(0);
  const [recharged, setRecharged] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const greet = `Namaste ${first}. Main ${astro.name.replace(/^(Acharya|Pandit|Jyotishi|Dr\.?|Guru Maa) /, "")}. Maine aapki kundli khol li hai. Aap nishank hokar apna prashn poochhiye.`;

  // free countdown
  useEffect(() => {
    if (phase !== "free") return;
    if (freeLeft <= 0) { setPhase("ended"); haptic([10, 40, 10]); return; }
    const id = setTimeout(() => setFreeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, freeLeft, haptic]);

  // paid meter
  const paidSpent = Math.floor((paidElapsed * astro.rate) / 60);
  const balanceLeft = recharged - paidSpent;
  useEffect(() => {
    if (phase !== "paid") return;
    if (balanceLeft <= 0) { setPhase("ended"); return; }
    const id = setTimeout(() => setPaidElapsed((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [phase, paidElapsed, balanceLeft]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  // load persisted consult history with this astrologer
  useEffect(() => {
    if (!user) return;
    let on = true;
    db.getMessages(user.id, thread).then((m) => { if (on && m.length) setMessages(m); });
    return () => { on = false; };
  }, [thread, user]);

  function recharge(amt: number) {
    addWallet(amt);
    setRecharged((r) => r - paidSpent + amt); // reset meter baseline
    setPaidElapsed(0);
    setPhase("paid");
    haptic(14);
    logEvent("wallet_recharge", { amt, astrologer: astro.id });
  }

  async function send(text: string) {
    if (!text.trim() || streaming || phase === "ended") return;
    setInput("");
    const convo: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages([...convo, { role: "assistant", content: "" }]);
    setStreaming(true);
    let result = { text: "", fallback: false };
    try {
      result = await streamChat({ mode: "consult", astrologerId: astro.id, messages: convo, profile }, (_c, f) =>
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: f }; return c; })
      );
    } finally {
      setStreaming(false); logEvent("consult_chat", { astrologer: astro.id });
      if (user && result.text && !result.fallback) db.addMessages(user.id, thread, [{ role: "user", content: text }, { role: "assistant", content: result.text }]);
    }
  }

  return (
    <div className="flex h-full flex-col screen-top">
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={18} /></button>
        <Avatar name={astro.name} size={38} tint={astro.grad[0]} status="online" />
        <div className="flex-1">
          <div className="text-[13.5px] font-medium text-ink">{astro.name}</div>
          <div className="text-[11px] text-[var(--good)]">● online</div>
        </div>
        <button
          onClick={() => phase === "free" && setFreeLeft(8)}
          className={cx("flex items-center gap-1.5 rounded-full surface px-3 py-1.5 text-[12px]",
            phase === "paid" ? "text-ink" : phase === "free" ? "text-[var(--good)]" : "text-[var(--avoid)]")}
        >
          <Clock size={12} />
          {phase === "free" && <span>Free {fmt(freeLeft)}</span>}
          {phase === "paid" && <span>₹{astro.rate}/min · ₹{Math.max(balanceLeft, 0)}</span>}
          {phase === "ended" && <span>Ended</span>}
        </button>
      </div>

      {phase === "free" && (
        <div className="px-4 py-1.5 text-center text-[11px] text-muted">First consultation free · tap the timer to skip ahead</div>
      )}
      {phase === "paid" && (
        <div className="px-4 py-1.5 text-center text-[11px] text-muted">Session {fmt(paidElapsed)} · ₹{paidSpent} spent · Balance ₹{Math.max(balanceLeft, 0)}</div>
      )}

      {/* messages */}
      <div ref={scroller} className="relative flex-1 space-y-3 overflow-y-auto px-4 py-4 no-scrollbar">
        <Row role="assistant" astroName={astro.name} tint={astro.grad[0]}>{greet}</Row>
        {messages.map((m, i) =>
          m.role === "user"
            ? <Row key={i} role="user">{m.content}</Row>
            : <Row key={i} role="assistant" astroName={astro.name} tint={astro.grad[0]}>{m.content || <Typing />}</Row>
        )}
      </div>

      {/* recharge overlay */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-end" style={{ background: "rgba(51,41,26,0.28)", backdropFilter: "blur(3px)" }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
              className="w-full rounded-t-3xl p-4 pb-6" style={{ background: "var(--surface)", borderTop: "1px solid var(--line-gold)" }}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />
              <div className="font-display text-lg text-ink">Continue with {astro.name.split(" ").slice(-1)[0]}</div>
              <div className="mt-1 text-[12.5px] text-muted">Your free session ended. Recharge your wallet to keep chatting at ₹{astro.rate}/min.</div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {RECHARGE.map((amt) => (
                  <button key={amt} onClick={() => recharge(amt)}
                    className={cx("rounded-2xl py-3 text-[14px]", amt === 100 ? "btn-saffron" : "surface text-ink")}>
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-[11px] text-muted">100% safe payments · UPI / Cards / Wallet</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input */}
      <div className="flex items-center gap-2 px-4 pb-5 pt-1">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={phase === "ended" ? "Recharge to continue…" : "Type your question…"}
          disabled={phase === "ended"}
          className="flex-1 rounded-full px-4 py-3 text-[14px] text-ink outline-none placeholder:text-muted disabled:opacity-50"
          style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }} />
        <button onClick={() => send(input)} disabled={streaming || phase === "ended"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-saffron disabled:opacity-50">
          <PaperPlaneTilt size={17} />
        </button>
      </div>
    </div>
  );
}

function Row({ role, children, astroName, tint }: { role: "user" | "assistant"; children: React.ReactNode; astroName?: string; tint?: string }) {
  if (role === "user")
    return <div className="flex justify-end"><div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13.5px] leading-relaxed btn-saffron">{children}</div></div>;
  return (
    <div className="flex items-end gap-2">
      <Avatar name={astroName || "A"} size={28} tint={tint} />
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink surface">{children}</div>
    </div>
  );
}
