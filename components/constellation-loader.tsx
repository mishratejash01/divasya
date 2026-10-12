"use client";

import { motion } from "framer-motion";

/**
 * The cut between screens — a constellation appearing, in black, white and grey.
 *
 * The night sky over the mountains (the same picture as the opening, in grey)
 * fades over the old screen, and the stars of a constellation — a different
 * one each time — light one by one, no lines, just the stars finding their
 * places. When the last is lit they brighten together once and the sky lifts
 * off the new screen. Transform and opacity only.
 */
export const PAGE_SWAP_MS = 320;
// long enough for the figure to fully form and glow before the sky lifts
export const PAGE_HOLD_MS = 1250;

type Star = [number, number, number]; // x, y, radius in a 200 × 120 field

// A different figure each time — stars listed in the order they light.
const FIGURES: Star[][] = [
  // Saptarishi (Big Dipper)
  [[22, 70, 1.5], [54, 50, 1.7], [80, 44, 1.5], [106, 52, 1.2], [110, 82, 1.5], [158, 88, 1.7], [154, 42, 1.9]],
  // Orion (Mriga)
  [[96, 6, 1.1], [62, 22, 2], [132, 28, 1.6], [86, 62, 1.4], [100, 60, 1.5], [114, 58, 1.4], [128, 102, 1.5], [66, 106, 2]],
  // Cassiopeia
  [[22, 42, 1.6], [62, 82, 1.8], [100, 52, 1.9], [140, 88, 1.6], [180, 46, 1.6]],
  // Krittika (Pleiades)
  [[84, 46, 1.6], [98, 38, 1.4], [112, 46, 1.7], [94, 58, 1.3], [108, 62, 1.4], [122, 54, 1.2], [102, 50, 1.1]],
  // Scorpius (Vrishchika)
  [[44, 12, 1.3], [50, 26, 1.4], [56, 38, 1.3], [74, 44, 2.1], [86, 60, 1.3], [96, 80, 1.3], [112, 96, 1.4], [136, 104, 1.4], [156, 96, 1.5], [164, 80, 1.6]],
  // Leo (Simha)
  [[54, 18, 1.3], [40, 30, 1.2], [66, 44, 1.3], [70, 62, 2], [76, 28, 1.4], [122, 46, 1.5], [154, 70, 1.4], [186, 62, 1.7]],
  // Cygnus
  [[100, 8, 2], [100, 48, 1.6], [74, 42, 1.3], [48, 36, 1.4], [126, 56, 1.3], [152, 62, 1.4], [100, 108, 1.5]],
  // Gemini (Mithuna)
  [[62, 10, 1.7], [84, 14, 1.9], [58, 40, 1.2], [90, 44, 1.3], [52, 72, 1.3], [94, 74, 1.4], [46, 104, 1.5], [100, 106, 1.4]],
];

export const FIGURE_COUNT = FIGURES.length;

/** A figure index different from the one before. */
export function nextFigure(prev: number): number {
  return (prev + 1 + Math.floor(Math.random() * (FIGURE_COUNT - 1))) % FIGURE_COUNT;
}

// every figure lights in the same span, however many stars it has
const LIGHT_SPAN = 0.62;

export function ConstellationLoader({ figure }: { figure: number }) {
  const stars = FIGURES[figure % FIGURE_COUNT];
  const STAR_STEP = LIGHT_SPAN / stars.length;
  const FORMED = 0.15 + LIGHT_SPAN;
  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: "#08080A" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      role="status"
      aria-label="Loading"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <motion.img
        src="/cosmic/sky-mono.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-bottom"
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      />

      <div className="absolute inset-x-0 top-[26%] flex justify-center">
        <svg viewBox="0 0 200 120" className="w-[70%] max-w-[330px] overflow-visible">
          {stars.map(([x, y, r], i) => (
            <g key={i}>
              {/* a soft halo that brightens once every star is lit */}
              <motion.circle
                cx={x} cy={y} r={r * 3.2}
                fill="#FFFFFF"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.07, 0.07, 0.18, 0.09] }}
                transition={{ duration: FORMED + 0.35, times: [0, (0.15 + i * STAR_STEP) / (FORMED + 0.35), 0.72, 0.86, 1] }}
              />
              <motion.circle
                cx={x} cy={y} r={r}
                fill="#FFFFFF"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + i * STAR_STEP, ease: "easeOut" }}
                style={{ transformOrigin: `${x}px ${y}px` }}
              />
            </g>
          ))}
        </svg>
      </div>
    </motion.div>
  );
}
