"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowCounterClockwise, Check, Fire } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { MANTRAS, TARGETS } from "@/lib/demo";
import { useCatalog, getMantras } from "@/lib/catalog";
import { bell, ting } from "@/lib/sound";

const SIZE = 288;
const CENTER = SIZE / 2;
const R = 112; // radius of the bead cord

// The mala's material — sets the colour of the un-chanted beads and the guru
// bead. Chanted beads always warm to gold regardless of material.
const MALAS = {
  rudraksha: { label: "Rudraksha", bead: "radial-gradient(circle at 34% 28%, #8A5A2C, #452A12 82%)", guru: "radial-gradient(circle at 34% 28%, #B98A4A, #6E4620 60%, #3E260F)" },
  tulsi: { label: "Tulsi", bead: "radial-gradient(circle at 34% 28%, #C79B5E, #7A4A2C 82%)", guru: "radial-gradient(circle at 34% 28%, #F5E3B4, #C88131 60%, #8A5A22)" },
  sphatik: { label: "Sphatik", bead: "radial-gradient(circle at 32% 26%, #FFFFFF, #C7D4DE 60%, #93A6B4 92%)", guru: "radial-gradient(circle at 32% 26%, #FFFFFF, #DDE7EE 55%, #A9B8C4)" },
} as const;

export function MalaScreen() {
  const { back, addJapa, japaLifetime, streak, addPunya, haptic } = useApp();
  const params = useApp().screen.params as { mantraId?: string } | undefined;
  const mantras = useCatalog(getMantras, MANTRAS);

  const [mantraId, setMantraId] = useState(params?.mantraId || mantras[0].id);
  const mantra = mantras.find((m) => m.id === mantraId) ?? mantras[0];
  const [target, setTarget] = useState(108);
  const [malaType, setMalaType] = useState<keyof typeof MALAS>("tulsi");
  const mala = MALAS[malaType];
  const [count, setCount] = useState(0);
  const [malas, setMalas] = useState(0);
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = count / target;
  const circ = 2 * Math.PI * R;

  // bead geometry — one bead per repetition, beads nearly touching like a real mala
  const spacing = circ / target;
  const beadR = Math.max(2.6, Math.min(spacing * 0.56, 7));

  function chant() {
    setDone(false);
    setCount((c) => {
      const n = c + 1;
      addJapa(1);
      if (n % 27 === 0 && n < target) { haptic([12, 30, 12]); ting(); }
      else haptic(10);
      if (n >= target) {
        setMalas((m) => m + 1);
        addPunya(11, "mala-complete");
        setDone(true);
        bell(540, 2.2, 0.26);
        haptic([20, 40, 20, 40, 60]);
        confetti({
          particleCount: 70,
          spread: 64,
          startVelocity: 32,
          gravity: 0.9,
          ticks: 160,
          origin: { y: 0.42 },
          colors: ["#C88131", "#D9954C", "#CEB976", "#9C8544", "#FFD9CC"],
          scalar: 0.9,
        });
        return 0;
      }
      return n;
    });
  }

  useEffect(() => {
    if (auto) {
      timer.current = setInterval(chant, 1900);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
    if (timer.current) clearInterval(timer.current);
  }, [auto, target, mantraId]); // eslint-disable-line

  function reset() {
    setCount(0); setDone(false); setAuto(false); haptic(8);
  }

  const stats: [string, string][] = [
    ["This mala", String(count)],
    ["Malas today", String(malas)],
    ["Lifetime", japaLifetime.toLocaleString("en-IN")],
  ];

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Mala Jaap"
        onBack={back}
        right={
          <span className="flex shrink-0 items-center gap-1 text-[12.5px] tnum font-medium text-ink">
            <Fire size={14} weight="fill" /> {streak}
          </span>
        }
      />

      {/* Everything lives inside one section block — mala on the left, all the
          text on the right — so the screen reads as a single card, not sprawl. */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="gutter py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}>
          <section className="rounded-2xl surface ring-gold p-3.5 lg:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8">

          {/* the mala — the tap surface, sitting to the left on desktop */}
          <div className="relative flex flex-col items-center lg:shrink-0">
            <button onClick={chant} className="relative active:scale-[0.99]" style={{ width: SIZE, height: SIZE }}>
              {/* the cord — a soft wooden thread the beads are strung on */}
              <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90">
                <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(122,74,44,0.22)" strokeWidth={beadR * 2 + 3} />
                <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(255,244,225,0.35)" strokeWidth={1} />
                {/* a whisper-thin gold progress arc riding the cord */}
                <motion.circle
                  cx={CENTER} cy={CENTER} r={R} fill="none"
                  stroke="var(--bhagwa)" strokeWidth={2} strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - progress) }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  opacity={0.5}
                />
              </svg>

              {/* the 108 beads (or `target` beads) — chanted ones warm to gold */}
              {Array.from({ length: target }).map((_, i) => {
                const a = (i / target) * Math.PI * 2 - Math.PI / 2;
                const x = CENTER + R * Math.cos(a);
                const y = CENTER + R * Math.sin(a);
                const lit = i < count;
                return (
                  <span
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: x - beadR, top: y - beadR, width: beadR * 2, height: beadR * 2,
                      background: lit
                        ? "radial-gradient(circle at 34% 28%, #FCEBC6, var(--bhagwa-soft) 52%, var(--bhagwa-deep))"
                        : mala.bead,
                      boxShadow: lit ? "0 0 6px rgba(214,84,3,0.45)" : "inset 0 -1px 1px rgba(0,0,0,0.25)",
                    }}
                  />
                );
              })}

              {/* the moving edge — the next bead to tell, gently pulsing */}
              {!done && count < target && (() => {
                const a = (count / target) * Math.PI * 2 - Math.PI / 2;
                const x = CENTER + R * Math.cos(a);
                const y = CENTER + R * Math.sin(a);
                return (
                  <motion.span
                    className="absolute rounded-full"
                    style={{ left: x - beadR - 3, top: y - beadR - 3, width: beadR * 2 + 6, height: beadR * 2 + 6, border: "1.5px solid var(--bhagwa)" }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0.3, 0.9] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                );
              })()}

              {/* sumeru / guru bead — the crown of the mala, with a tassel */}
              <div className="absolute" style={{ left: CENTER, top: CENTER - R, transform: "translate(-50%,-50%)" }}>
                {/* tassel above the guru bead */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "100%" }}>
                  <div className="mx-auto h-3 w-[2px]" style={{ background: "var(--bhagwa-deep)" }} />
                  <div className="mx-auto h-2.5 w-3 rounded-b-full" style={{ background: "linear-gradient(180deg, var(--bhagwa), var(--bhagwa-deep))" }} />
                </div>
                <motion.span
                  className="block rounded-full"
                  style={{
                    width: 24, height: 24,
                    background: mala.guru,
                    border: "1px solid rgba(121,82,31,0.55)",
                  }}
                  animate={{ boxShadow: `0 0 ${8 + progress * 24}px ${2 + progress * 5}px rgba(200,129,49,${0.28 + progress * 0.5})` }}
                />
              </div>

              {/* the count — floating inside the ring, no plate */}
              <div className="absolute inset-0 grid place-items-center">
                {done ? (
                  <div className="flex flex-col items-center">
                    <Check size={36} className="text-[var(--good)]" />
                    <span className="mt-1 font-deva text-[13.5px] text-ink">माला पूर्ण</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="font-display text-6xl leading-none text-ink tabular-nums">{count}</span>
                    <span className="mt-0.5 text-[11.5px] tnum text-muted">of {target}</span>
                    <span className="mt-1.5 eyebrow text-[var(--bhagwa-deep)]">tap to chant</span>
                  </div>
                )}
              </div>
            </button>

            {/* target chips */}
            <div className="mt-5 flex justify-center gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTarget(t); reset(); }}
                  className={cx("rounded-[5px] px-3 py-1.5 text-[11px] tnum", t === target ? "text-white" : "ring-gold text-muted")}
                  style={t === target ? { background: "var(--icon-ink)" } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* mala material */}
            <div className="mt-2 flex justify-center gap-1.5">
              {(Object.keys(MALAS) as (keyof typeof MALAS)[]).map((k) => (
                <button
                  key={k}
                  onClick={() => { setMalaType(k); haptic(6); }}
                  className={cx("rounded-[5px] px-3 py-1.5 text-[11px]", k === malaType ? "text-white" : "ring-gold text-muted")}
                  style={k === malaType ? { background: "var(--icon-ink)" } : undefined}
                >
                  {MALAS[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* all the text, gathered in one open column */}
          <div className="mx-auto mt-5 w-full max-w-[320px] lg:mx-0 lg:mt-0 lg:max-w-none lg:flex-1">

            {/* the chant */}
            <div className="text-center lg:text-left">
              <p className="eyebrow text-muted">{mantra.name.replace(/ ?(Mantra|Maha Mantra)$/i, "")} · {mantra.deity}</p>
              <p className="mt-1.5 font-deva text-[20px] leading-snug text-ink lg:text-[24px]">{mantra.deva}</p>
              <p className="mt-1 text-[11.5px] italic leading-snug text-muted lg:text-[13.5px]">{mantra.translit}</p>
            </div>

            {/* mantra selector — a single scroll strip on mobile so the pills
                never wrap into a ragged block; wraps freely on desktop */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar lg:flex-wrap lg:justify-start lg:overflow-visible">
              {mantras.slice(0, 6).map((m) => {
                const on = m.id === mantraId;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMantraId(m.id); reset(); }}
                    className={cx(
                      "shrink-0 rounded-[5px] px-2.5 py-1 text-[11px] transition-colors lg:px-3 lg:py-1.5 lg:text-[12.5px]",
                      on ? "text-white" : "ring-gold text-muted"
                    )}
                    style={on ? { background: "var(--icon-ink)" } : undefined}
                  >
                    {m.name.replace(/ ?(Mantra|Maha Mantra)$/i, "")}
                  </button>
                );
              })}
            </div>

            {/* japa tally — hairline row, no boxes */}
            <div className="mt-4 grid grid-cols-3 border-y py-2.5 text-center" style={{ borderColor: "var(--line)" }}>
              {stats.map(([l, v], i) => (
                <div key={l} className={cx("px-1", i > 0 && "border-l")} style={i > 0 ? { borderColor: "var(--line)" } : undefined}>
                  <div className="font-display text-[18px] tnum text-ink lg:text-[22px]">{v}</div>
                  <div className="mt-0.5 text-[10px] text-muted lg:text-[11.5px]">{l}</div>
                </div>
              ))}
            </div>

            {/* controls */}
            <div className="mt-3 flex gap-2.5 lg:ml-auto lg:max-w-xs">
              <button onClick={() => setAuto((a) => !a)} className="flex flex-1 items-center justify-center rounded-2xl py-3 text-[12.5px] font-medium text-white lg:text-[13.5px]" style={{ background: "var(--icon-ink)" }}>
                {auto ? "Pause auto-jaap" : "Hands-free auto-jaap"}
              </button>
              <button onClick={reset} className="grid h-[48px] w-[48px] place-items-center rounded-2xl btn-ghost lg:h-[52px] lg:w-[52px]"><ArrowCounterClockwise size={16} /></button>
            </div>
            <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-muted lg:text-left">Chant at your own pace — Divasya keeps the count for you, even with the screen off.</p>
          </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
