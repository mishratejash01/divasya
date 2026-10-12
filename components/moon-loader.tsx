"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * The cosmic curtain — the cut between every screen, built from the Divasya
 * art set in /public/cosmic.
 *
 *  1. A night-sky panel (Milky Way over the hills) sweeps up from the bottom
 *     with a curved leading edge, while the old screen sinks behind it.
 *  2. The golden zodiac wheel spins up into place, the moon in its centre
 *     waxes through its real phases (new → crescent → half → gibbous → full)
 *     and flares, the clouds drift in from both sides and a row of diyas
 *     rises at the foot of the sky.
 *  3. The panel carries on up and off with a curved trailing edge, revealing
 *     the new screen rising into place.
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

export function MoonLoader({ intro = false }: { intro?: boolean }) {
  const step = intro ? 260 : 125;
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ids = WAX.map((_, i) => window.setTimeout(() => setPhase(i), 120 + i * step));
    return () => ids.forEach(clearTimeout);
  }, [step]);
  const full = phase === WAX.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: "#070A1C" }}
      initial={intro ? false : { y: "100%", borderTopLeftRadius: 700, borderTopRightRadius: 700 }}
      animate={{ y: "0%", borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      exit={{ y: "-100%", borderBottomLeftRadius: 700, borderBottomRightRadius: 700 }}
      transition={{ duration: 0.55, ease: EASE }}
      aria-label="Loading"
      role="status"
    >
      {/* counter-parallax wrapper — contents lag the panel for depth */}
      <motion.div
        className="absolute inset-0"
        initial={intro ? false : { y: "-30%" }}
        animate={{ y: "0%" }}
        exit={{ y: "30%" }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        {/* sky — a slow push-in */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/cosmic/sky-min.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-bottom"
          initial={{ scale: intro ? 1 : 1.18 }}
          animate={{ scale: intro ? 1.06 : 1.02 }}
          transition={{ duration: intro ? 2.6 : 1.4, ease: OUT }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 40%, rgba(7,10,28,0) 0%, rgba(7,10,28,0.55) 100%)" }} />

        {/* the wheel + moon */}
        <div className="absolute inset-x-0 top-[13%] flex justify-center">
          <div className="relative aspect-square w-[86vw] max-w-[400px]">
            {/* flare behind everything once the moon is full */}
            <motion.div
              className="absolute inset-[-18%] rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,214,130,0.55) 0%, rgba(255,170,60,0.18) 35%, rgba(255,170,60,0) 62%)" }}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: full ? 1 : 0.35, scale: full ? 1.08 : 0.85 }}
              transition={{ duration: 0.5, ease: OUT }}
            />
            {/* zodiac wheel: spins up into place, then keeps turning slowly */}
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: -150, scale: 0.35, opacity: 0 }}
              animate={{ rotate: intro ? 40 : 18, scale: 1, opacity: 1 }}
              transition={{ rotate: { duration: intro ? 2.6 : 1.4, ease: OUT }, scale: { duration: 0.9, ease: OUT }, opacity: { duration: 0.35 } }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cosmic/wheel-min.webp" alt="" className="h-full w-full" />
            </motion.div>
            {/* moon in the centre, waxing through real phases */}
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[35%] -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: full ? 1.06 : 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
            >
              {WAX.map((frame, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={frame}
                  src={`/cosmic/phase-${frame}.webp`}
                  alt=""
                  className="absolute inset-0 h-full w-full transition-opacity duration-150"
                  style={{ opacity: i === phase ? 1 : 0, filter: full ? "drop-shadow(0 0 18px rgba(255,200,100,0.85))" : "none" }}
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
          initial={{ x: "-45%", opacity: 0 }}
          animate={{ x: "0%", opacity: 0.95 }}
          transition={{ duration: intro ? 2.2 : 1.1, ease: OUT }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src="/cosmic/clouds.webp"
          alt=""
          className="pointer-events-none absolute right-[-22%] top-[49%] w-[80%] max-w-none"
          style={{ scaleX: -1 }}
          initial={{ x: "45%", opacity: 0 }}
          animate={{ x: "0%", opacity: 0.8 }}
          transition={{ duration: intro ? 2.2 : 1.1, ease: OUT, delay: 0.06 }}
        />

        {/* the Divasya wordmark in gold, wiped in left to right as it rises */}
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
            initial={{ clipPath: "inset(0 100% 0 0)", y: 14 }}
            animate={{ clipPath: "inset(0 0% 0 0)", y: 0 }}
            transition={{ duration: intro ? 0.9 : 0.6, delay: intro ? 0.5 : 0.22, ease: OUT }}
          />
        </div>

        {/* a row of diyas rising at the foot, flames breathing */}
        <motion.div
          className="absolute inset-x-0 bottom-[5%] flex justify-center"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.75, delay: 0.15, ease: OUT }}
        >
          <div className="relative w-[96%] max-w-[460px]">
            <motion.div
              className="absolute inset-x-[5%] bottom-[30%] top-[-10%] rounded-full"
              style={{ background: "radial-gradient(60% 50% at 50% 60%, rgba(255,170,60,0.45), rgba(255,140,40,0) 70%)" }}
              animate={{ opacity: [0.6, 1, 0.7, 0.95, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cosmic/diyas.webp" alt="" className="relative w-full" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
