"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, Check, Clock, Gift, PaperPlaneTilt, ShieldCheck, Star, Wallet } from "@phosphor-icons/react";
import { IconChat } from "../icons";
import { useApp } from "../app-context";
import { Avatar, cx, Typing } from "../ui";
import { ASTROLOGERS } from "@/lib/demo";
import { useCatalog, getAstrologers } from "@/lib/catalog";
import { streamChat, ChatMsg, logEvent } from "@/lib/chat";
import * as db from "@/lib/db";

/* ---------------- Directory ---------------- */

// Chat action ground. Classic sky blue (#87CEEB) carries white type at 1.7:1
// and is simply unreadable; this holds the blue while clearing 4.8:1.
const CHAT_BLUE = "#1478B0";
// The verified tick, in the blue people already read as "verified".
const VERIFIED_BLUE = "#1D9BF0";
// Rating star — golden, not the app's orange. A rating is its own convention
// and reads wrong in the brand accent.
const STAR_GOLD = "#E9A800";

export function ConsultScreen() {
  const { back, go, wallet } = useApp();
  const astrologers = useCatalog(getAstrologers, ASTROLOGERS);
  return (
    <div className="flex h-full flex-col">
      {/* Yellow header, matching the bar on home. Wallet reads as plain text
          beside its mark — a pill around a balance implies a button. */}
      <div
        className="flex items-center gap-3 gutter"
        style={{
          background: "var(--bar-yellow)",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 11px)",
          paddingBottom: 11,
        }}
      >
        <button onClick={back} aria-label="Back" className="shrink-0">
          <CaretLeft size={20} weight="regular" className="text-ink" />
        </button>
        <span className="font-display text-[17px] text-ink">Consult Astrologers</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          <Wallet size={17} weight="bold" className="text-ink" />
          <span className="text-[13px] tnum font-medium text-ink">₹{wallet}</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto screen-bottom no-scrollbar">
        {/* Promotional band — deep ground, not another pale card, so the offer
            actually reads as an offer. */}
        <div className="gutter pt-2">
          <div
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
            style={{ background: "linear-gradient(140deg, #7E1D2E, #46101C)" }}
          >
            <Gift size={20} weight="regular" className="shrink-0 text-white" />
            <div className="min-w-0">
              <div className="text-[12px] font-medium text-white">Your first chat is free</div>
              <div className="truncate text-[10.5px] text-white/75">
                Talk to any verified astrologer · no queue
              </div>
            </div>
          </div>
        </div>

        <div className="gutter space-y-2 pt-2">
          {astrologers.map((a) => (
            // One tap target for the whole card; the Chat block is the visible
            // affordance, not a nested button.
            <button
              key={a.id}
              onClick={() => go("consultChat", { astrologerId: a.id })}
              className="w-full rounded-2xl surface p-2.5 text-left"
            >
              <div className="flex gap-2.5">
                {/* Photo, then its own credentials directly beneath it — the
                    rating belongs to the person, so it sits under their face
                    rather than in the run of text beside it. */}
                <div className="flex w-[54px] shrink-0 flex-col items-center gap-1">
                  <span className="relative">
                    <Avatar name={a.name} size={44} tint={a.grad[0]} />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 grid h-[15px] w-[15px] place-items-center rounded-full"
                      style={{ background: VERIFIED_BLUE, border: "2px solid var(--surface)" }}
                    >
                      <Check size={8} weight="bold" className="text-white" />
                    </span>
                  </span>
                  <span className="flex items-center gap-0.5 text-[10.5px] tnum text-ink">
                    <Star size={11} weight="fill" style={{ color: STAR_GOLD }} />
                    {a.rating}
                  </span>
                  <span className="text-[9px] tnum leading-none text-muted">{a.orders} orders</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-ink">{a.name}</div>
                  <div className="truncate text-[10.5px] text-muted">{a.specialty}</div>
                  {/* second row, right side — experience and what it costs */}
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <span className="shrink-0 text-[10.5px] tnum text-ink">
                      {a.exp}y ·{" "}
                      {a.status === "online" ? (
                        <span className="font-medium text-[var(--good)]">Free</span>
                      ) : (
                        <span>₹{a.rate}/min</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <span
                  className="flex items-center gap-1.5 rounded-[5px] px-3.5 py-1.5 text-[11.5px] text-white"
                  style={{ background: CHAT_BLUE }}
                >
                  <IconChat size={14} strokeWidth={1.7} /> Chat
                </span>
              </div>
            </button>
          ))}
        </div>
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
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={16} /></button>
        <Avatar name={astro.name} size={34} tint={astro.grad[0]} status="online" />
        <div className="flex-1">
          <div className="text-[12px] font-medium text-ink">{astro.name}</div>
          <div className="text-[10px] text-[var(--good)]">● online</div>
        </div>
        <button
          onClick={() => phase === "free" && setFreeLeft(8)}
          className={cx("flex items-center gap-1.5 rounded-full surface px-3 py-1.5 text-[11px]",
            phase === "paid" ? "text-ink" : phase === "free" ? "text-[var(--good)]" : "text-[var(--avoid)]")}
        >
          <Clock size={12} />
          {phase === "free" && <span>Free {fmt(freeLeft)}</span>}
          {phase === "paid" && <span>₹{astro.rate}/min · ₹{Math.max(balanceLeft, 0)}</span>}
          {phase === "ended" && <span>Ended</span>}
        </button>
      </div>

      {phase === "free" && (
        <div className="px-4 py-1.5 text-center text-[10px] text-muted">First consultation free · tap the timer to skip ahead</div>
      )}
      {phase === "paid" && (
        <div className="px-4 py-1.5 text-center text-[10px] text-muted">Session {fmt(paidElapsed)} · ₹{paidSpent} spent · Balance ₹{Math.max(balanceLeft, 0)}</div>
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
            className="absolute inset-0 z-40 flex items-end" style={{ background: "rgba(0,0,0,0.34)", backdropFilter: "blur(3px)" }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
              className="w-full rounded-t-3xl p-4 pb-6" style={{ background: "var(--surface)", borderTop: "1px solid var(--line-gold)" }}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />
              <div className="font-display text-lg text-ink">Continue with {astro.name.split(" ").slice(-1)[0]}</div>
              <div className="mt-1 text-[11px] text-muted">Your free session ended. Recharge your wallet to keep chatting at ₹{astro.rate}/min.</div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {RECHARGE.map((amt) => (
                  <button key={amt} onClick={() => recharge(amt)}
                    className={cx("rounded-2xl py-3 text-[12.5px]", amt === 100 ? "btn-saffron" : "surface text-ink")}>
                    ₹{amt}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center text-[10px] text-muted">100% safe payments · UPI / Cards / Wallet</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input */}
      <div className="flex items-center gap-2 px-4 pt-1 above-tabbar">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder={phase === "ended" ? "Recharge to continue…" : "Type your question…"}
          disabled={phase === "ended"}
          className="flex-1 rounded-full px-4 py-3 text-[12.5px] text-ink outline-none placeholder:text-muted disabled:opacity-50"
          style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }} />
        <button onClick={() => send(input)} disabled={streaming || phase === "ended"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full btn-saffron disabled:opacity-50">
          <PaperPlaneTilt size={15} />
        </button>
      </div>
    </div>
  );
}

function Row({ role, children, astroName, tint }: { role: "user" | "assistant"; children: React.ReactNode; astroName?: string; tint?: string }) {
  if (role === "user")
    return <div className="flex justify-end"><div className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-br-md px-3.5 py-2.5 text-[12px] leading-relaxed btn-saffron">{children}</div></div>;
  return (
    <div className="flex items-end gap-2">
      <Avatar name={astroName || "A"} size={25} tint={tint} />
      <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[12px] leading-relaxed text-ink surface">{children}</div>
    </div>
  );
}
