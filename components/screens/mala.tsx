"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowCounterClockwise, CaretLeft, CaretRight, CaretDown, Plus, Minus,
  Pause, Play, SpeakerHigh, SpeakerSlash, Check,
} from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { useApp } from "../app-context";
import { cx } from "../ui";
import { PageHeader } from "../page-header";
import { MANTRAS } from "@/lib/demo";
import { useCatalog, getMantras } from "@/lib/catalog";
import { bell, startAmbient, stopAmbient, setAmbientMuted, ting } from "@/lib/sound";

// Each mala: its loop artwork (/mala/<type>.png), a short line for the chooser,
// and the bead gradient used only as a fallback until the artwork is present.
const MALAS = {
  rudraksha: {
    label: "Rudraksha",
    desc: "Calms the mind and steadies the breath — an all-purpose mala sacred to Shiva.",
    tint: "radial-gradient(circle at 50% 38%, #F4E4C6 0%, #E6C99C 100%)",
    bead: "radial-gradient(circle at 34% 28%, #8A5A2C, #452A12 82%)",
    guru: "radial-gradient(circle at 34% 28%, #B98A4A, #6E4620 60%, #3E260F)",
  },
  tulsi: {
    label: "Tulsi",
    desc: "For devotion and purity — the mala of choice for Ram and Krishna naam jaap.",
    tint: "radial-gradient(circle at 50% 38%, #F7E9CB 0%, #EBD2A2 100%)",
    bead: "radial-gradient(circle at 34% 28%, #C79B5E, #7A4A2C 82%)",
    guru: "radial-gradient(circle at 34% 28%, #F5E3B4, #C88131 60%, #8A5A22)",
  },
  sphatik: {
    label: "Sphatik",
    desc: "Cooling and calming — brings peace and abundance, ideal for summer or stress.",
    tint: "radial-gradient(circle at 50% 38%, #EDF2F6 0%, #D5E0E8 100%)",
    bead: "radial-gradient(circle at 32% 26%, #FFFFFF, #C7D4DE 60%, #93A6B4 92%)",
    guru: "radial-gradient(circle at 32% 26%, #FFFFFF, #DDE7EE 55%, #A9B8C4)",
  },
} as const;

type MalaKey = keyof typeof MALAS;
const MALA_TYPES = ["rudraksha", "tulsi", "sphatik"] as const;

export function MalaScreen() {
  const { back, addJapa, addPunya, haptic, lang } = useApp();
  const params = useApp().screen.params as { mantraId?: string } | undefined;
  const mantras = useCatalog(getMantras, MANTRAS);

  const [mantraId, setMantraId] = useState(params?.mantraId || mantras[0].id);
  const mantra = mantras.find((m) => m.id === mantraId) ?? mantras[0];
  const target = 108;
  const [chosen, setChosen] = useState<MalaKey | null>(null);
  const [count, setCount] = useState(0);
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [malaSize, setMalaSize] = useState(268);
  const [pickMantra, setPickMantra] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeStart = useRef<number | null>(null);
  const manualHold = useRef(false);

  const mala = MALAS[chosen ?? "rudraksha"];
  const progress = count / target;
  const SIZE = malaSize;
  const CENTER = SIZE / 2;
  const R = SIZE * 0.375;
  const circ = 2 * Math.PI * R;
  const visibleBeads = target >= 108 ? 54 : target;
  const beadR = Math.max(5, Math.min((circ / visibleBeads) * 0.52, 7));
  const litBeads = Math.ceil(progress * visibleBeads);
  const RING = SIZE * 0.47;
  const ringCirc = 2 * Math.PI * RING;

  useEffect(() => {
    startAmbient();
    const unlock = () => startAmbient();
    window.addEventListener("pointerdown", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      stopAmbient();
    };
  }, []);

  useEffect(() => {
    const fit = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      const w = window.visualViewport?.width ?? window.innerWidth;
      setMalaSize(Math.max(196, Math.min(300, h - 360, w - 88)));
    };
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
    };
  }, []);

  function toggleAmbient() {
    const next = !musicMuted;
    setMusicMuted(next);
    if (!next) startAmbient();
    setAmbientMuted(next);
  }

  function choose(t: MalaKey) {
    setChosen(t);
    setCount(0);
    setDone(false);
    setAuto(false);
    haptic(10);
  }

  function chant() {
    startAmbient();
    setDone(false);
    setCount((c) => {
      const n = c + 1;
      addJapa(1);
      if (n % 27 === 0 && n < target) { haptic([12, 30, 12]); ting(); }
      else haptic(10);
      if (n >= target) {
        addPunya(11, "mala-complete");
        setDone(true);
        bell(540, 2.2, 0.26);
        haptic([20, 40, 20, 40, 60]);
        confetti({
          particleCount: 70, spread: 64, startVelocity: 32, gravity: 0.9, ticks: 160,
          origin: { y: 0.42 },
          colors: ["#C88131", "#D9954C", "#CEB976", "#9C8544", "#FFD9CC"], scalar: 0.9,
        });
        return 0;
      }
      return n;
    });
  }

  function decrement() {
    setDone(false);
    setCount((c) => Math.max(0, c - 1));
    haptic(6);
  }

  useEffect(() => {
    if (auto) {
      timer.current = setInterval(() => { if (!manualHold.current) chant(); }, 1900);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
    if (timer.current) clearInterval(timer.current);
  }, [auto, target, mantraId]); // eslint-disable-line

  function reset() { setCount(0); setDone(false); setAuto(false); haptic(8); }

  function onMalaPointerDown() { manualHold.current = true; }
  function onMalaPointerUp() { manualHold.current = false; }

  const shortMantra = (m: { name: string }) => m.name.replace(/ ?(Mantra|Maha Mantra)$/i, "");
  // the mantra in the app's language: Devanagari for Hindi, roman name for English
  const mantraText = (m: { name: string; deva: string }) => (lang === "hi" ? m.deva : shortMantra(m));

  // ---------------------------------------------------------------- chooser
  if (!chosen) {
    return (
      <div className="mala-screen flex h-full flex-col">
        <PageHeader
          title="Choose Mala"
          subtitle="Pick a mala for your jaap"
          onBack={back}
          art="/home/tools/mala-jaap.png"
          gradient="linear-gradient(135deg, #7A1D2E 0%, #430D19 100%)"
          shadow="rgba(67,13,25,0.30)"
        />
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <div className="mx-auto flex max-w-[460px] flex-col gap-2.5">
            {MALA_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => choose(t)}
                className="flex w-full items-center gap-2.5 rounded-xl p-1.5 pr-2 text-left transition-transform active:scale-[0.99]"
                style={{ background: "var(--surface)", border: "1px solid var(--line-gold)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/mala/${t}.png`} alt="" className="h-[76px] w-[76px] shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[17px] font-semibold leading-tight text-ink">{MALAS[t].label} Mala</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{MALAS[t].desc}</p>
                </div>
                <CaretRight size={17} weight="bold" className="mr-1 shrink-0 text-ink" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- chanting
  return (
    <div className="mala-screen relative flex h-full flex-col overflow-hidden">
      {/* the yellow header — speaker (music) on the left, reset on the right,
          the mantra names the screen in the middle (tap to change it) */}
      <div className="shrink-0" style={{ background: "var(--bar-yellow)", paddingTop: "calc(env(safe-area-inset-top, 0px) + 11px)" }}>
        <div className="flex items-center gap-2 gutter pb-[11px]">
          <button onClick={() => { setChosen(null); setAuto(false); }} aria-label="Back" className="shrink-0">
            <CaretLeft size={20} className="text-ink" />
          </button>
          <button onClick={toggleAmbient} aria-label={musicMuted ? "Unmute music" : "Mute music"} className="shrink-0">
            {musicMuted ? <SpeakerSlash size={19} className="text-ink" /> : <SpeakerHigh size={19} className="text-ink" />}
          </button>
          <button onClick={() => setPickMantra(true)} className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
            <span className={cx("truncate text-ink", lang === "hi" ? "font-deva text-[18px]" : "font-display text-[17px]")}>{mantraText(mantra)}</span>
            <CaretDown size={13} className="shrink-0 text-ink/60" />
          </button>
          <button onClick={reset} aria-label="Reset" className="shrink-0">
            <ArrowCounterClockwise size={18} className="text-ink" />
          </button>
        </div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-between px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] pt-3">

        {/* the count — above the mala */}
        <div className="flex flex-col items-center">
          {done ? (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/spot/mala-done.png" alt="" className="h-9 w-9 object-contain" />
              <span className="font-deva text-[16px] text-ink">माला पूर्ण</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[42px] leading-none text-ink tabular-nums">{count}</span>
              <span className="text-[15px] tnum text-muted">/ {target}</span>
            </div>
          )}
        </div>

        {/* the mala — the hero and tap surface */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            className="relative touch-none select-none active:scale-[0.99]"
            style={{ width: SIZE, height: SIZE }}
            role="button"
            tabIndex={0}
            aria-label={`${mala.label} mala — tap to chant`}
            onClick={chant}
            onPointerDown={onMalaPointerDown}
            onPointerUp={onMalaPointerUp}
            onPointerCancel={onMalaPointerUp}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") chant(); }}
          >
            <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx={CENTER} cy={CENTER} r={RING} fill="none" stroke="var(--line-gold)" strokeWidth={3} opacity={0.4} />
              <circle
                cx={CENTER} cy={CENTER} r={RING} fill="none" stroke="var(--bhagwa)" strokeWidth={4} strokeLinecap="round"
                strokeDasharray={ringCirc} strokeDashoffset={ringCirc * (1 - Math.min(1, progress))}
                style={{ transition: "stroke-dashoffset 0.35s ease", filter: "drop-shadow(0 0 5px rgba(242,107,15,0.55))" }}
              />
            </svg>

            <MalaLoop
              material={chosen}
              size={SIZE}
              center={CENTER}
              radius={R}
              beadR={beadR}
              visibleBeads={visibleBeads}
              litBeads={litBeads}
              progress={progress}
              done={done}
              beadBg={mala.bead}
              guruBg={mala.guru}
            />

          </div>
        </div>

        {/* counter controls: −1 · play/pause · +1 */}
        <div className="mt-2 flex items-center justify-center gap-7">
          <button onClick={decrement} aria-label="Minus one" className="grid h-12 w-12 place-items-center rounded-full surface ring-gold">
            <Minus size={18} className="text-ink" />
          </button>
          <button
            onClick={() => { setAuto((a) => !a); haptic(8); }}
            aria-label={auto ? "Pause auto-jaap" : "Start auto-jaap"}
            className="grid h-16 w-16 place-items-center rounded-full btn-saffron shadow-[0_6px_16px_rgba(138,43,34,0.3)]"
          >
            {auto ? <Pause size={24} weight="fill" className="text-white" /> : <Play size={24} weight="fill" className="text-white" />}
          </button>
          <button onClick={chant} aria-label="Plus one" className="grid h-12 w-12 place-items-center rounded-full surface ring-gold">
            <Plus size={18} className="text-ink" />
          </button>
        </div>

        {/* hint */}
        <div className="mt-3 flex items-center gap-2 rounded-full px-4 py-2 surface">
          <ArrowCounterClockwise size={13} className="text-[var(--icon-ink)]" />
          <div className="leading-tight">
            <div className="text-[11.5px] font-medium text-ink">Tap to chant</div>
            <div className="text-[9.5px] text-muted">or use the counter buttons</div>
          </div>
        </div>

        {/* mantra bar — just the mantra, tap to change */}
        <button onClick={() => setPickMantra(true)} className="mt-3 flex w-full max-w-[460px] items-center justify-center gap-2 rounded-2xl surface px-4 py-3 text-center">
          <span className={cx("truncate text-ink", lang === "hi" ? "font-deva text-[15.5px]" : "font-serif text-[14.5px] font-medium")}>
            {mantraText(mantra)}
          </span>
          <CaretDown size={13} className="shrink-0 text-[var(--muted-2)]" />
        </button>
      </div>

      {/* mantra picker */}
      <Sheet open={pickMantra} onClose={() => setPickMantra(false)} title="Choose mantra">
        <div className="flex flex-col gap-1">
          {mantras.map((m) => {
            const on = m.id === mantraId;
            return (
              <button
                key={m.id}
                onClick={() => { setMantraId(m.id); reset(); setPickMantra(false); }}
                className={cx("flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left", on ? "" : "")}
                style={on ? { background: "rgba(242,107,15,0.10)" } : undefined}
              >
                <div className="min-w-0 flex-1">
                  <div className={cx("text-ink", lang === "hi" ? "font-deva text-[15px]" : "font-serif text-[14px] font-medium")}>
                    {mantraText(m)}
                  </div>
                  <div className="truncate text-[11px] text-muted">{lang === "hi" ? shortMantra(m) : m.deva} · {m.deity}</div>
                </div>
                {on && <Check size={16} weight="bold" className="shrink-0 text-[var(--bhagwa)]" />}
              </button>
            );
          })}
        </div>
      </Sheet>

    </div>
  );
}

/** A simple bottom sheet. */
function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(20,10,4,0.35)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rounded-t-3xl bg-[var(--surface)] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-4"
            initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />
            <h3 className="mb-2 font-serif text-[15px] font-semibold text-ink">{title}</h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * The mala loop. Prefers the material's artwork at /mala/<material>.png; until
 * that is present it falls back to a drawn ring of beads with a guru bead.
 */
function MalaLoop({
  material, size, center, radius, beadR, visibleBeads, litBeads, progress, done, beadBg, guruBg,
}: {
  material: string; size: number; center: number; radius: number; beadR: number;
  visibleBeads: number; litBeads: number; progress: number; done: boolean;
  beadBg: string; guruBg: string;
}) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/mala/${material}.png`}
        alt=""
        onError={() => setImgOk(false)}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ filter: `drop-shadow(0 4px 14px rgba(120,70,20,${0.2 + progress * 0.3}))` }}
        draggable={false}
      />
    );
  }

  return (
    <div className="absolute inset-0" style={{ width: size, height: size }}>
      {Array.from({ length: visibleBeads }).map((_, i) => {
        const a = (i / visibleBeads) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(a);
        const y = center + radius * Math.sin(a);
        const lit = i < litBeads;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: x - beadR, top: y - beadR, width: beadR * 2, height: beadR * 2,
              background: lit ? "radial-gradient(circle at 34% 28%, #FCEBC6, var(--bhagwa-soft) 52%, var(--bhagwa-deep))" : beadBg,
              boxShadow: lit ? "0 0 6px rgba(214,84,3,0.45)" : "inset 0 -1px 1px rgba(0,0,0,0.25)",
            }}
          />
        );
      })}
      <div className="absolute" style={{ left: center, top: center - radius, transform: "translate(-50%,-50%)" }}>
        <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "100%" }}>
          <div className="mx-auto h-3 w-[2px]" style={{ background: "var(--bhagwa-deep)" }} />
          <div className="mx-auto h-2.5 w-3 rounded-b-full" style={{ background: "linear-gradient(180deg, var(--bhagwa), var(--bhagwa-deep))" }} />
        </div>
        <motion.span
          className="block rounded-full"
          style={{ width: 24, height: 24, background: guruBg, border: "1px solid rgba(121,82,31,0.55)" }}
          animate={{ boxShadow: `0 0 ${8 + progress * 24}px ${2 + progress * 5}px rgba(200,129,49,${0.28 + progress * 0.5})` }}
        />
      </div>
      {!done && (() => {
        const a = (litBeads / visibleBeads) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(a);
        const y = center + radius * Math.sin(a);
        return (
          <motion.span
            className="absolute rounded-full"
            style={{ left: x - beadR - 3, top: y - beadR - 3, width: beadR * 2 + 6, height: beadR * 2 + 6, border: "1.5px solid var(--bhagwa)" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0.3, 0.9] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })()}
    </div>
  );
}
