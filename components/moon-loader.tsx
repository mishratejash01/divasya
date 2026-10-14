"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * The cosmic curtain — the app's opening, built from the Divasya art set in
 * /public/cosmic.
 *
 *  1. The night sky (the same picture the splash shows) is on screen from the
 *     first frame. Nothing else moves until every piece of art is decoded, so
 *     no piece pops in late.
 *  2. The golden zodiac wheel turns in, the moon in its centre waxes through
 *     its real phases (new → crescent → half → gibbous → full) and flares, the
 *     clouds drift in from both sides, a row of diyas rises at the foot and
 *     the wordmark wipes in — one even timeline.
 *  3. The panel lifts away with a curved trailing edge, revealing the app.
 *
 * Only transform and opacity animate — smooth on phones.
 */
export const COSMIC_HOLD_MS = 900;
export const COSMIC_INTRO_MS = 2300;

export const COSMIC_ASSETS = [
  "/cosmic/sky-min.webp",
  "/cosmic/wheel-min.webp",
  "/cosmic/sky-mono.webp",
  "/cosmic/clouds.webp",
  "/cosmic/diyas.webp",
  "/brand/divasya-wordmark-ink.png",
  ...Array.from({ length: 8 }, (_, i) => `/cosmic/phase-${i}.webp`),
];

const EASE = [0.76, 0, 0.24, 1] as const;
const OUT = [0.16, 1, 0.3, 1] as const;
// waxing order on the sheet: 4 new, 5 crescent, 6 first quarter, 7 gibbous, 0 full
const WAX = [4, 5, 6, 7, 0];

let decoded: Promise<void> | null = null;
/** Fetches and decodes every piece of the opening art, once. */
export function preloadCosmic(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!decoded) {
    decoded = Promise.all(
      COSMIC_ASSETS.map((src) => {
        const img = new Image();
        img.src = src;
        return img.decode().catch(() => undefined);
      })
    ).then(() => undefined);
  }
  return decoded;
}

/** Resolves once the opening art is ready, or after `capMs` on a slow network. */
export function cosmicReady(capMs = 3000): Promise<void> {
  return Promise.race([preloadCosmic(), new Promise<void>((r) => window.setTimeout(r, capMs))]);
}

/*
 * One timeline, in seconds from the moment the art is ready:
 *   0.00  wheel turns in       → settles by 1.6
 *   0.10  moon waxes           → full at 1.1
 *   0.25  clouds drift in      → in by 1.65
 *   0.45  diyas rise           → up by 1.35
 *   0.80  wordmark wipes in    → done by 1.6
 * then it rests until the curtain lifts.
 */
export function MoonLoader({ intro = false }: { intro?: boolean }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    cosmicReady().then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!ready) return;
    const ids = WAX.map((_, i) => window.setTimeout(() => setPhase(i), 100 + i * 250));
    return () => ids.forEach(clearTimeout);
  }, [ready]);
  const full = phase === WAX.length - 1;
  const at = (delay: number, duration: number) => ({ duration, delay, ease: OUT });

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: "#070A1C" }}
      initial={intro ? false : { y: "100%", borderTopLeftRadius: 700, borderTopRightRadius: 700 }}
      animate={{ y: "0%", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      exit={{ y: "-100%", borderBottomLeftRadius: 700, borderBottomRightRadius: 700 }}
      transition={{ duration: 0.6, ease: EASE }}
      aria-label="Loading"
      role="status"
    >
      {/* counter-parallax wrapper — contents lag the panel for depth */}
      <motion.div
        className="absolute inset-0"
        initial={intro ? false : { y: "-30%" }}
        animate={{ y: "0%" }}
        exit={{ y: "30%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* sky — on screen from the first frame, then a slow push-in */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/cosmic/sky-min.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          style={{ transformOrigin: "50% 100%" }}
          initial={{ scale: 1 }}
          animate={{ scale: ready ? 1.05 : 1 }}
          transition={at(0, 2.6)}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(7,10,28,0) 0%, rgba(7,10,28,0.55) 100%)" }} />

        {/* the wheel + moon */}
        <div className="absolute inset-x-0 top-[13%] flex justify-center">
          <div className="relative aspect-square w-[86vw] max-w-[400px]">
            {/* flare behind everything, brightening as the moon fills */}
            <motion.div
              className="absolute inset-[-18%] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,214,130,0.55) 0%, rgba(255,170,60,0.18) 35%, rgba(255,170,60,0) 62%)", willChange: "transform, opacity" }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={ready ? { opacity: full ? 1 : 0.4, scale: full ? 1.08 : 0.9 } : { opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.6, ease: OUT }}
            />
            {/* zodiac wheel turns in and settles */}
            <motion.div
              className="absolute inset-0"
              style={{ willChange: "transform, opacity" }}
              initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
              animate={ready ? { rotate: 30, scale: 1, opacity: 1 } : { rotate: -90, scale: 0.6, opacity: 0 }}
              transition={{ rotate: at(0, 2.4), scale: at(0, 1.6), opacity: at(0, 0.5) }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cosmic/wheel-min.webp" alt="" className="h-full w-full" />
            </motion.div>
            {/* moon in the centre, waxing through real phases */}
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[35%] -translate-x-1/2 -translate-y-1/2"
              style={{ willChange: "transform, opacity" }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={ready ? { scale: full ? 1.05 : 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
              transition={at(0.1, 0.7)}
            >
              {WAX.map((frame, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={frame}
                  src={`/cosmic/phase-${frame}.webp`}
                  alt=""
                  className="absolute inset-0 h-full w-full transition-opacity duration-200"
                  style={{ opacity: i === phase ? 1 : 0 }}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* clouds drifting in from both sides */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/cosmic/clouds.webp"
          alt=""
          className="pointer-events-none absolute left-[-18%] top-[56%] w-[95%] max-w-none"
          style={{ willChange: "transform, opacity" }}
          initial={{ x: "-35%", opacity: 0 }}
          animate={ready ? { x: "0%", opacity: 0.95 } : { x: "-35%", opacity: 0 }}
          transition={at(0.25, 1.4)}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/cosmic/clouds.webp"
          alt=""
          className="pointer-events-none absolute right-[-22%] top-[49%] w-[80%] max-w-none"
          style={{ scaleX: -1, willChange: "transform, opacity" }}
          initial={{ x: "35%", opacity: 0 }}
          animate={ready ? { x: "0%", opacity: 0.8 } : { x: "35%", opacity: 0 }}
          transition={at(0.25, 1.4)}
        />

        {/* the Divasya wordmark in gold, rising into place */}
        <div className="absolute inset-x-0 top-[74.5%] flex justify-center">
          <motion.span
            role="img"
            aria-label="Divasya"
            className="block"
            style={{
              height: 54,
              aspectRatio: "985 / 355",
              background: "linear-gradient(100deg, #E9B44C 0%, #FFF1C9 45%, #F2C462 60%, #C98A2B 100%)",
              WebkitMask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
              mask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
            }}
            // opacity and transform only — a clip-path wipe repaints the
            // masked gradient on every frame
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={ready ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
            transition={at(0.8, 0.8)}
          />
        </div>

        {/* a row of diyas rising at the foot, flames breathing */}
        <motion.div
          className="absolute inset-x-0 bottom-[5%] flex justify-center"
          style={{ willChange: "transform, opacity" }}
          initial={{ y: 70, opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1 } : { y: 70, opacity: 0 }}
          transition={at(0.45, 0.9)}
        >
          <div className="relative w-[96%] max-w-[460px]">
            <motion.div
              className="absolute inset-x-[5%] bottom-[30%] top-[-10%] rounded-full"
              style={{ background: "radial-gradient(60% 50% at 50% 60%, rgba(255,170,60,0.45), rgba(255,140,40,0) 70%)" }}
              animate={{ opacity: [0.6, 1, 0.7, 0.95, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cosmic/diyas.webp" alt="" className="relative w-full" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
