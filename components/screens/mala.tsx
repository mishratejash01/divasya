"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowCounterClockwise, CaretLeft, Check, Fire, Pause, Play } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { useApp } from "../app-context";
import { cx } from "../ui";
import { MANTRAS, TARGETS } from "@/lib/demo";
import { useCatalog, getMantras } from "@/lib/catalog";
import { bell, ting } from "@/lib/sound";

const SIZE = 280;
const R = 116;
const CENTER = SIZE / 2;
const BEADS = 27;

export function MalaScreen() {
  const { back, addJapa, japaLifetime, streak, addPunya, haptic } = useApp();
  const params = useApp().screen.params as { mantraId?: string } | undefined;
  const mantras = useCatalog(getMantras, MANTRAS);

  const [mantraId, setMantraId] = useState(params?.mantraId || mantras[0].id);
  const mantra = mantras.find((m) => m.id === mantraId) ?? mantras[0];
  const [target, setTarget] = useState(108);
  const [count, setCount] = useState(0);
  const [malas, setMalas] = useState(0);
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = count / target;
  const circ = 2 * Math.PI * R;

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

  return (
    <div className="flex h-full flex-col screen-top">
      <div className="flex items-center gap-3 gutter py-2.5">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={16} /></button>
        <span className="font-display text-lg text-ink">Mala Jaap</span>
        <div className="ml-auto flex items-center gap-1.5 rounded-full surface px-3 py-1.5">
          <Fire size={12} className="text-[var(--bhagwa)]" />
          <span className="text-[11px] text-ink">{streak}</span>
        </div>
      </div>

      {/* mantra selector */}
      <div className="-mx-1 flex gap-2 overflow-x-auto gutter no-scrollbar">
        {mantras.slice(0, 6).map((m) => (
          <button
            key={m.id}
            onClick={() => { setMantraId(m.id); reset(); }}
            className={cx(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] transition-colors",
              m.id === mantraId ? "btn-saffron" : "surface text-muted"
            )}
          >
            {m.name.replace(/ ?(Mantra|Maha Mantra)$/i, "")}
          </button>
        ))}
      </div>

      {/* the mala */}
      <div className="relative mt-4 flex flex-1 flex-col items-center justify-center">
        <p className="px-8 text-center font-deva text-[13.5px] leading-relaxed text-muted">{mantra.deva}</p>

        <button onClick={chant} className="relative mt-4 active:scale-[0.99]" style={{ width: SIZE, height: SIZE }}>
          {/* decorative rotating bead ring */}
          <div className="animate-spinSlow absolute inset-0">
            {Array.from({ length: BEADS }).map((_, i) => {
              const a = (i / BEADS) * Math.PI * 2 - Math.PI / 2;
              const x = CENTER + (R + 14) * Math.cos(a);
              const y = CENTER + (R + 14) * Math.sin(a);
              return (
                <span
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{ left: x - 4, top: y - 4, background: i === 0 ? "var(--bhagwa-deep)" : "rgba(0,0,0,0.14)" }}
                />
              );
            })}
          </div>

          {/* progress ring */}
          <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90">
            <circle cx={CENTER} cy={CENTER} r={R} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={6} />
            <motion.circle
              cx={CENTER} cy={CENTER} r={R} fill="none"
              stroke="var(--bhagwa)" strokeWidth={6} strokeLinecap="round"
              strokeDasharray={circ}
              animate={{ strokeDashoffset: circ * (1 - progress) }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </svg>

          {/* Meru bead (top) — glows as progress nears completion */}
          <motion.span
            className="absolute rounded-full"
            style={{
              left: CENTER - 11, top: CENTER - R - 11, width: 22, height: 22,
              background: "radial-gradient(circle at 35% 30%, #F0DFB2, var(--ochre))",
            }}
            animate={{ boxShadow: `0 0 ${10 + progress * 26}px ${2 + progress * 6}px rgba(200,129,49,${0.25 + progress * 0.5})` }}
          />

          {/* center */}
          <div className="absolute inset-0 grid place-items-center">
            {done ? (
              <div className="flex flex-col items-center">
                <Check size={36} className="text-[var(--good)]" />
                <span className="mt-1 font-deva text-[13.5px] text-ink">माला पूर्ण</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-display text-6xl text-ink tabular-nums">{count}</span>
                <span className="text-[11.5px] text-muted">/ {target}</span>
                <span className="mt-1 eyebrow text-muted">tap to chant</span>
              </div>
            )}
          </div>
        </button>

        {/* target chips */}
        <div className="mt-5 flex gap-2">
          {TARGETS.map((t) => (
            <button
              key={t}
              onClick={() => { setTarget(t); reset(); }}
              className={cx("rounded-full px-3 py-1.5 text-[11px]", t === target ? "btn-saffron" : "surface text-muted")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* controls + stats */}
      <div className="gutter pb-6">
        <div className="mb-3 flex items-center justify-around rounded-2xl surface py-3 text-center">
          <div><div className="font-display text-lg text-ink">{count}</div><div className="text-[10px] text-muted">This mala</div></div>
          <div className="h-8 w-px" style={{ background: "var(--line)" }} />
          <div><div className="font-display text-lg text-ink">{malas}</div><div className="text-[10px] text-muted">Malas today</div></div>
          <div className="h-8 w-px" style={{ background: "var(--line)" }} />
          <div><div className="font-display text-lg text-ink">{japaLifetime.toLocaleString("en-IN")}</div><div className="text-[10px] text-muted">Lifetime</div></div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setAuto((a) => !a)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[12.5px] btn-saffron">
            {auto ? <><Pause size={15} /> Pause auto-jaap</> : <><Play size={15} /> Hands-free auto-jaap</>}
          </button>
          <button onClick={reset} className="grid h-[52px] w-[52px] place-items-center rounded-2xl btn-ghost"><ArrowCounterClockwise size={16} /></button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted">Audio continues with screen off · haptic at every 27</p>
      </div>
    </div>
  );
}
