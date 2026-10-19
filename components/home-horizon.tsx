"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useApp } from "./app-context";

/**
 * The close of the home screen — "तमसो मा ज्योतिर्गमय", from darkness lead me
 * to light (Brihadaranyaka Upanishad 1.3.28). A single picture: the ghat on
 * the Ganga at dawn, a diya burning on its steps.
 *
 * The mantra sits in the open dawn sky above the scene: the Sanskrit line,
 * its meaning, and its source under a small diya rule. The scene sits flush on
 * the bottom of the screen — the picture runs on under the tab bar (extended
 * with its own darkened reflection) so no white strip is left below it. As it
 * scrolls into view the dawn opens, the ghat rises into place and the line
 * appears; the sun breathes, the diya flickers and birds cross the sky. Each
 * time it comes back into view it plays again.
 */
const OUT = [0.16, 1, 0.3, 1] as const;
const INK = "#5A1F2E";
const SOFT = "#8A4A42";

export function HomeHorizon() {
  const { lang } = useApp();
  const hi = lang === "hi";
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { amount: 0.3 });
  const on = reduce || seen;
  const rise = (delay: number) => ({
    initial: reduce ? false : { y: 14, opacity: 0 },
    animate: on ? { y: 0, opacity: 1 } : { y: 14, opacity: 0 },
    transition: { duration: 1, delay, ease: OUT },
  });

  return (
    <div ref={ref} className="home-horizon relative w-full overflow-hidden">
      {/* dawn sky — opens out of the white page, warming towards the river */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(255,250,245,0) 0%, #FFF3E8 16%, #FDE6D3 34%, #F9D0B0 54%, #F3B48A 72%)" }}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.6 }}
      />

      {/* the line it carries */}
      <div className="relative px-8 pb-3 pt-12 text-center">
        {/* a thin gold rule with a diya flame at its heart */}
        <motion.div
          className="mx-auto mb-4 flex w-[150px] items-center gap-2.5"
          initial={reduce ? false : { opacity: 0, scaleX: 0.4 }}
          animate={on ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.4 }}
          transition={{ duration: 1.1, delay: 0.4, ease: OUT }}
        >
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(184,120,60,0), #B8783C)" }} />
          <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden className={reduce ? undefined : "hz-flame"}>
            <path d="M6 0.5C8.4 4 10.5 6.4 10.5 9.6A4.5 4.5 0 0 1 1.5 9.6C1.5 6.4 3.6 4 6 0.5Z" fill="#E08A2E" />
            <path d="M6 6C7.2 7.7 8 8.8 8 10.2A2 2 0 0 1 4 10.2C4 8.8 4.8 7.7 6 6Z" fill="#FFD27A" />
          </svg>
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, #B8783C, rgba(184,120,60,0))" }} />
        </motion.div>

        <motion.p className="font-deva text-[25px] leading-tight" style={{ color: INK }} {...rise(0.6)}>
          तमसो मा ज्योतिर्गमय
        </motion.p>
        <motion.p
          className={hi ? "mt-1.5 font-deva text-[14px]" : "mt-1.5 text-[13.5px] font-light"}
          style={{ color: SOFT, fontFamily: hi ? undefined : "var(--font-lexend)" }}
          {...rise(0.8)}
        >
          {hi ? "अंधकार से मुझे प्रकाश की ओर ले चलो" : "From darkness, lead me to light"}
        </motion.p>
        <motion.p
          className={hi ? "mt-2.5 font-deva text-[11px]" : "mt-2.5 text-[9.5px] uppercase tracking-[0.2em]"}
          style={{ color: SOFT, opacity: 0.75, fontFamily: hi ? undefined : "var(--font-lexend)" }}
          {...rise(1)}
        >
          {hi ? "बृहदारण्यक उपनिषद् · 1.3.28" : "Brihadaranyaka Upanishad · 1.3.28"}
        </motion.p>
      </div>

      {/* the ghat — runs on under the tab bar */}
      <motion.div
        className="relative mt-1"
        initial={reduce ? false : { y: 50, opacity: 0 }}
        animate={on ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.2, ease: OUT }}
      >
        {/* the sun, just risen behind the peaks */}
        <span
          className={reduce ? "absolute" : "hz-sun absolute"}
          style={{ left: "58%", top: "22%", width: 240, height: 240, marginLeft: -120, marginTop: -120, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,214,0.95) 0%, rgba(255,214,160,0.55) 30%, rgba(255,200,140,0) 68%)" }}
        />
        {/* birds crossing the dawn, in the open sky between the line and the peaks */}
        {!reduce && (
          <svg viewBox="0 0 402 60" className="pointer-events-none absolute inset-x-0 top-[4%] w-full" aria-hidden>
            <g className="hz-birds" fill="none" stroke="#6A2E34" strokeWidth="1.3" strokeLinecap="round" opacity="0.75">
              <path d="M0 0 q4 -4 8 0 q4 -4 8 0" transform="translate(0 30)" />
              <path d="M0 0 q3 -3 6 0 q3 -3 6 0" transform="translate(22 20)" />
              <path d="M0 0 q3 -3 6 0 q3 -3 6 0" transform="translate(-18 40)" />
            </g>
          </svg>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async" src="/horizon/ghat-ext.webp" alt="" className="relative block w-full" />
        {/* the diya's glow (the diya sits at 92.6% / 57.7% of the extended picture) */}
        <span
          className={reduce ? "absolute" : "hz-diya absolute"}
          style={{ left: "92.6%", top: "57.7%", width: 64, height: 64, marginLeft: -32, marginTop: -40, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,90,0.75) 0%, rgba(255,170,60,0.25) 40%, rgba(255,170,60,0) 70%)" }}
        />
      </motion.div>
      {/* the device's home-indicator area */}
      <div style={{ height: "env(safe-area-inset-bottom, 0px)", background: "#2A0F14" }} />
    </div>
  );
}
