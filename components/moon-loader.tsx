"use client";

import { motion } from "framer-motion";

/**
 * The loading screen shown while a new screen opens. A moon on a night sky that
 * cycles through its phases — full, waning to a half, to a thin crescent and
 * back — by sweeping a soft shadow across a lit disc. Calm and celestial.
 */
export function MoonLoader() {
  const stars = [
    { x: 16, y: 24, s: 2, d: 0.0 },
    { x: 80, y: 18, s: 1.5, d: 0.6 },
    { x: 30, y: 72, s: 1.5, d: 1.1 },
    { x: 72, y: 66, s: 2, d: 0.3 },
    { x: 50, y: 12, s: 1, d: 0.9 },
    { x: 12, y: 52, s: 1, d: 1.4 },
    { x: 88, y: 46, s: 1.5, d: 0.75 },
    { x: 62, y: 84, s: 1, d: 0.2 },
  ];
  const SIZE = 128;
  const NIGHT = "#0A0D22";

  return (
    <motion.div
      className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{ background: "radial-gradient(120% 90% at 50% 34%, #141A38 0%, #0A0D22 52%, #05060F 100%)" }}
      aria-label="Loading"
      role="status"
    >
      {stars.map((st, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s * 2, height: st.s * 2, background: "#FBE7B8" }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 2.4, delay: st.d, ease: "easeInOut" }}
        />
      ))}

      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* soft outer glow */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 46px 10px rgba(247,226,176,0.22)" }}
        />
        {/* the moon: a lit disc with a shadow disc sweeping across it to make phases */}
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            width: SIZE,
            height: SIZE,
            background: "radial-gradient(62% 62% at 38% 34%, #FFFDF6 0%, #F6E6C0 46%, #E7CE96 100%)",
            boxShadow: "inset -14px -12px 30px rgba(120,96,48,0.40)",
          }}
        >
          <motion.div
            className="absolute top-0 rounded-full"
            style={{ width: SIZE, height: SIZE, left: 0, background: NIGHT }}
            animate={{ x: [-SIZE, SIZE] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
