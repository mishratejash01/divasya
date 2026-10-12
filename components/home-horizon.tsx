"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useApp } from "./app-context";

/**
 * The close of the home screen — "तमसो मा ज्योतिर्गमय", from darkness lead me
 * to light (Brihadaranyaka Upanishad 1.3.28). A single picture: the ghat on
 * the Ganga at dawn, a diya burning on its steps.
 *
 * The scene sits flush on the bottom of the screen — the picture runs on
 * under the tab bar (extended with its own darkened reflection) so no white
 * strip is left below it. As it scrolls into view the dawn opens, the ghat
 * rises into place and the line appears; the diya keeps breathing and birds
 * cross. Each time it comes back into view it plays again.
 */
const OUT = [0.16, 1, 0.3, 1] as const;

export function HomeHorizon() {
  const { lang } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { amount: 0.3 });
  const on = reduce || seen;

  return (
    <div ref={ref} className="home-horizon relative w-full overflow-hidden">
      {/* dawn glow behind the picture's open sky, rising out of the page */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, rgba(253,233,216,0) 0%, #FCE3CF 26%, #F7C39C 48%, #F2A97E 60%)" }}
        initial={reduce ? false : { opacity: 0 }}
        animate={on ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1.6 }}
      />

      {/* the line it carries */}
      <div className="relative px-8 pb-2 pt-10 text-center">
        <motion.p
          className={lang === "hi" ? "font-deva text-[20px] leading-snug" : "text-[19px] font-light leading-snug"}
          style={{ color: "#5A1F2E", fontFamily: lang === "hi" ? undefined : "var(--font-lexend)" }}
          initial={reduce ? false : { y: 16, opacity: 0 }}
          animate={on ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: OUT }}
        >
          {lang === "hi" ? "तमसो मा ज्योतिर्गमय" : "From darkness, lead me to light"}
        </motion.p>
        <motion.p
          className="mt-1 text-[10.5px] tracking-[0.08em]"
          style={{ color: "#7A3A3E", fontFamily: lang === "hi" ? undefined : "var(--font-lexend)" }}
          initial={reduce ? false : { opacity: 0 }}
          animate={on ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          {lang === "hi" ? "बृहदारण्यक उपनिषद् 1.3.28" : "Brihadaranyaka Upanishad 1.3.28"}
        </motion.p>
      </div>

      {/* birds crossing the dawn */}
      {!reduce && (
        <svg viewBox="0 0 402 120" className="pointer-events-none absolute inset-x-0 top-[22%] w-full">
          <g className="hz-birds" fill="none" stroke="#5A2430" strokeWidth="1.4" strokeLinecap="round">
            <path d="M0 0 q4 -4 8 0 q4 -4 8 0" transform="translate(0 40)" />
            <path d="M0 0 q3 -3 6 0 q3 -3 6 0" transform="translate(22 28)" />
            <path d="M0 0 q3 -3 6 0 q3 -3 6 0" transform="translate(-18 52)" />
          </g>
        </svg>
      )}

      {/* the ghat — runs on under the tab bar */}
      <motion.div
        className="relative -mt-6"
        initial={reduce ? false : { y: 50, opacity: 0 }}
        animate={on ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
        transition={{ duration: 1.6, delay: 0.2, ease: OUT }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/horizon/ghat-ext.webp" alt="" className="block w-full" />
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
