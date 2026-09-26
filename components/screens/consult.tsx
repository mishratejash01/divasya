"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, Check, Clock, Gift, PaperPlaneTilt, ShieldCheck, Star, Wallet } from "@phosphor-icons/react";
import { IconChat } from "../icons";
import { useApp } from "../app-context";
import { Avatar, cx, FilterChips, Typing } from "../ui";
import { PageHeader } from "../page-header";
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
  const [tag, setTag] = useState("All");

  // Filters are built from the practitioners actually listed, so the row never
  // offers a skill nobody here has. Six busiest tags — beyond that the strip
  // is longer than the list it filters.
  const counts = new Map<string, number>();
  astrologers.forEach((a) => a.tags?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const tags = ["All", ...[...counts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 6).map(([t]) => t)];
  const shown = tag === "All" ? astrologers : astrologers.filter((a) => a.tags?.includes(tag));

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Consult Astrologers"
        subtitle="Verified jyotishis, on call"
        onBack={back}
        gradient="linear-gradient(135deg, #153C6B 0%, #0A1F3B 100%)"
        shadow="rgba(10,31,59,0.30)"
        right={
          <span className="flex items-center gap-1.5">
            <Wallet size={17} weight="bold" />
            <span className="text-[13px] tnum font-medium">₹{wallet}</span>
          </span>
        }
      />

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

        {/* Skill filter — the shared chip block, under the offer. */}
        <FilterChips
          chips={tags.map((t) => ({ id: t, label: t }))}
          active={tag}
          onSelect={setTag}
        />

        <div className="gutter pt-1">
          {shown.map((a) => (
            // One tap target for the whole row; the Chat block is the visible
            // affordance, not a nested button. No card and no divider — the rows
            // sit on the white ground, separated by their own breathing room.
            <button
              key={a.id}
              onClick={() => go("consultChat", { astrologerId: a.id })}
              className="w-full py-3.5 text-left"
            >
              <div className="flex gap-2.5">
                <span className="relative shrink-0">
                  {/* status prop draws the online/busy dot */}
                  <Avatar name={a.name} size={46} tint={a.grad[0]} photo={a.photo} status={a.status} />
                  <span
                    className="absolute -bottom-0.5 -left-0.5 grid h-[15px] w-[15px] place-items-center rounded-full"
                    style={{ background: VERIFIED_BLUE, border: "2px solid var(--surface)" }}
                  >
                    <Check size={8} weight="bold" className="text-white" />
                  </span>
                </span>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-medium text-ink">{a.name}</div>
                  <div className="truncate text-[10.5px] text-muted">{a.specialty}</div>
                  {/* Languages matter more than anything else here when you are
                      choosing who to talk to, and were sitting unused in the
                      data. */}
                  <div className="mt-0.5 truncate text-[10px] tnum text-muted">
                    {a.langs} · {a.exp}y exp
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="flex items-center gap-1 text-[10.5px] tnum">
                    <Star size={11} weight="fill" style={{ color: STAR_GOLD }} />
                    <span className="font-medium text-ink">{a.rating}</span>
                  </span>
                  <span className="text-[9.5px] tnum text-muted">{a.orders} orders</span>
                </div>
              </div>

              {/* Price and availability against the action — no divider line
                  inside the row, so each astrologer reads as one block. */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-[11px] tnum lg:text-[12px]">
                  {a.status === "online" ? (
                    <span className="font-medium text-[var(--good)]">Free first chat</span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted">
                      <Clock size={11} weight="bold" className="lg:hidden" />
                      <Clock size={14} weight="bold" className="hidden lg:inline" /> {a.wait}
                    </span>
                  )}
                  <span className="truncate text-muted">· ₹{a.rate}/min</span>
                </span>
                <span
                  className="flex shrink-0 items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 text-[11.5px] text-white lg:gap-2 lg:px-5 lg:py-2.5 lg:text-[13px]"
                  style={{ background: CHAT_BLUE }}
                >
                  <IconChat size={14} strokeWidth={1.7} className="lg:hidden" />
                  <IconChat size={17} strokeWidth={1.7} className="hidden lg:block" /> Chat
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
    <div className="flex h-full flex-col">
      {/* Yellow header, bare caret — a circle around a back arrow is a frame
          doing no work. The subtitle carries the live state: while a reply is
          streaming it reads typing, the way a chat should. */}
      <div
        className="flex items-center gap-2.5 gutter"
        style={{
          background: "var(--bar-yellow)",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 10px)",
          paddingBottom: 10,
        }}
      >
        <button onClick={back} aria-label="Back" className="shrink-0">
          <CaretLeft size={20} weight="regular" className="text-ink" />
        </button>
        <Avatar name={astro.name} size={34} tint={astro.grad[0]} photo={astro.photo} status="online" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-ink">{astro.name}</div>
          <div className="text-[10px] text-ink/65">
            {streaming ? "typing…" : "Online now"}
          </div>
        </div>
        {/* Timer as a labelled readout, not a chip: the number is what matters,
            so it leads, with what it counts named beneath in small caps-free
            text. A pill made it look like a button that toggles something. */}
        <button
          onClick={() => phase === "free" && setFreeLeft(8)}
          className="shrink-0 text-right leading-none"
        >
          <span className="block text-[15px] tnum font-medium leading-none text-ink">
            {phase === "free" && fmt(freeLeft)}
            {phase === "paid" && `₹${Math.max(balanceLeft, 0)}`}
            {phase === "ended" && "0:00"}
          </span>
          <span className="mt-1 block text-[9px] leading-none text-ink/65">
            {phase === "free" && "free left"}
            {phase === "paid" && "balance"}
            {phase === "ended" && "session ended"}
          </span>
        </button>
      </div>

      {phase === "paid" && (
        <div className="gutter py-1 text-center text-[10px] tnum text-muted" style={{ background: "var(--surface)" }}>
          {fmt(paidElapsed)} · ₹{paidSpent} spent · ₹{astro.rate}/min
        </div>
      )}

      {/* Transcript on its own ground so the white bubbles read as bubbles. On
          desktop it is a centred, readable column rather than messages stranded
          against the left edge of a very wide window. */}
      <div
        ref={scroller}
        className="relative flex-1 overflow-y-auto py-3 no-scrollbar"
        style={{ background: "var(--surface)" }}
      >
        <div className="mx-auto flex w-full flex-col gap-2 gutter lg:max-w-3xl">
          <Row role="assistant" astroName={astro.name} tint={astro.grad[0]} photo={astro.photo}>{greet}</Row>
          {messages.map((m, i) =>
            m.role === "user"
              ? <Row key={i} role="user">{m.content}</Row>
              : <Row key={i} role="assistant" astroName={astro.name} tint={astro.grad[0]} photo={astro.photo}>
                  {m.content || <Typing />}
                </Row>
          )}
        </div>
      </div>

      {/* recharge overlay */}
      <AnimatePresence>
        {phase === "ended" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.34)", backdropFilter: "blur(3px)" }}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }}
              className="w-full rounded-t-3xl p-4" style={{ background: "var(--surface)", borderTop: "1px solid var(--line-gold)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 22px)" }}>
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

      {/* Composer, pinned. Its own ground and a top rule so it reads as a fixed
          bar rather than the last thing on the page. */}
      <div
        className="sticky bottom-0 z-20 gutter pt-2 above-tabbar"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
      >
        <div className="mx-auto flex w-full items-center gap-2 lg:max-w-3xl">
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={phase === "ended" ? "Recharge to continue…" : "Type your question…"}
            disabled={phase === "ended"}
            className="flex-1 rounded-[8px] px-3 py-2.5 text-[12.5px] text-ink outline-none placeholder:text-muted disabled:opacity-50 lg:py-3 lg:text-[13.5px]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--line-strong)" }} />
          <button onClick={() => send(input)} disabled={streaming || phase === "ended"}
            aria-label="Send"
            className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] btn-saffron disabled:opacity-50 lg:h-11 lg:w-11">
            <PaperPlaneTilt size={15} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A line of the transcript.
 *
 * Two parties, two grounds: theirs is the app's yellow, ours the deep rust the
 * Sandesh block already uses. Orange against yellow would have been two warm
 * colours fighting, and blue is spoken for as the Chat action colour, so rust
 * keeps the pair inside the app's own world while staying clearly separate.
 * The tail corner is squared on the sender's side so the direction reads
 * without needing alignment alone.
 */
function Row({ role, children, astroName, tint, photo }: {
  role: "user" | "assistant";
  children: React.ReactNode;
  astroName?: string;
  tint?: string;
  photo?: string;
}) {
  if (role === "user")
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] whitespace-pre-wrap rounded-xl rounded-br-[3px] px-3 py-2 text-[12px] leading-relaxed text-white"
          style={{ background: "var(--bhagwa-dark)" }}
        >
          {children}
        </div>
      </div>
    );
  return (
    <div className="flex items-end gap-1.5">
      <Avatar name={astroName || "A"} size={24} tint={tint} photo={photo} />
      <div
        className="max-w-[80%] whitespace-pre-wrap rounded-xl rounded-bl-[3px] px-3 py-2 text-[12px] leading-relaxed text-ink"
        style={{ background: "var(--bubble-in)" }}
      >
        {children}
      </div>
    </div>
  );
}
