"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   A set of original loading motion-graphics for Divasya. Each is
   drawn and animated (no artwork), full-bleed, and self-contained
   so any one can be dropped into app-shell as <XxxLoader />.
   ───────────────────────────────────────────────────────────── */

function Shell({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ background: bg }}
      aria-label="Loading"
      role="status"
    >
      {children}
    </motion.div>
  );
}

/* A — Lotus breathe. Eight petals open and close around a glowing bindu,
   like a slow inhale/exhale. Deep plum ground, gold petals. */
export function LotusLoader() {
  const petals = Array.from({ length: 8 });
  return (
    <Shell bg="radial-gradient(120% 90% at 50% 42%, #3A1330 0%, #21092A 55%, #120417 100%)">
      <div className="relative" style={{ width: 180, height: 180 }}>
        {petals.map((_, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              width: 26,
              height: 74,
              marginLeft: -13,
              marginTop: -74,
              transformOrigin: "50% 100%",
              rotate: `${i * 45}deg`,
              borderRadius: "50% 50% 50% 50% / 62% 62% 38% 38%",
              background: "linear-gradient(180deg, #FFE9A8 0%, #E7A93E 100%)",
            }}
            animate={{ scaleY: [0.55, 1, 0.55], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.05, ease: "easeInOut" }}
          />
        ))}
        <motion.span
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ width: 26, height: 26, marginLeft: -13, marginTop: -13, background: "#FFF3C9", boxShadow: "0 0 24px 6px rgba(255,220,140,0.55)" }}
          animate={{ scale: [0.8, 1.15, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        />
      </div>
    </Shell>
  );
}

/* B — Om halo. A large ॐ pulses with light while a halo ring breathes
   around it. Night indigo ground. */
export function OmLoader() {
  return (
    <Shell bg="radial-gradient(120% 90% at 50% 36%, #14203F 0%, #0A0E22 55%, #05060F 100%)">
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        <motion.span
          className="absolute rounded-full"
          style={{ width: 150, height: 150, border: "1.5px solid rgba(247,210,140,0.45)" }}
          animate={{ scale: [0.86, 1.08, 0.86], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
        />
        <motion.span
          className="font-deva"
          style={{ fontFamily: "var(--font-deva)", fontSize: 92, lineHeight: 1, color: "#FBE2A6", textShadow: "0 0 26px rgba(251,210,140,0.6)" }}
          animate={{ scale: [0.94, 1.06, 0.94], opacity: [0.75, 1, 0.75] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
        >
          ॐ
        </motion.span>
      </div>
    </Shell>
  );
}

/* C — Diya flame. A lamp with a live flame that flickers and sways, throwing
   a warm glow. Warm near-black ground. */
export function DiyaLoader() {
  return (
    <Shell bg="radial-gradient(120% 90% at 50% 60%, #2A160A 0%, #160A04 55%, #0A0402 100%)">
      <div className="relative flex flex-col items-center" style={{ width: 180, height: 180 }}>
        {/* glow */}
        <motion.span
          className="absolute rounded-full"
          style={{ top: 8, width: 120, height: 120, background: "radial-gradient(circle, rgba(255,180,70,0.5) 0%, rgba(255,150,40,0) 68%)" }}
          animate={{ opacity: [0.45, 0.85, 0.45], scale: [0.9, 1.06, 0.9] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
        />
        {/* flame */}
        <motion.span
          style={{
            width: 30, height: 56, marginTop: 30,
            borderRadius: "50% 50% 50% 50% / 74% 74% 30% 30%",
            background: "linear-gradient(180deg, #FFF6D2 0%, #FFC24B 46%, #FF7A18 100%)",
            transformOrigin: "50% 100%",
          }}
          animate={{ scaleY: [1, 1.18, 0.95, 1.12, 1], scaleX: [1, 0.92, 1.05, 0.96, 1], rotate: [-3, 3, -2, 2, -3] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
        />
        {/* diya bowl */}
        <span
          style={{
            marginTop: -4, width: 108, height: 34,
            borderRadius: "0 0 54px 54px",
            background: "linear-gradient(180deg, #C0641E 0%, #7A3A0E 100%)",
            boxShadow: "inset 0 4px 6px rgba(255,200,120,0.35)",
          }}
        />
      </div>
    </Shell>
  );
}

/* D — Chakra. Two concentric dashed rings spin opposite ways around a pulsing
   core — a turning sudarshan/mandala. Gold on black. */
export function ChakraLoader() {
  return (
    <Shell bg="radial-gradient(120% 90% at 50% 40%, #1A1206 0%, #0C0A06 55%, #040404 100%)">
      <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
        <motion.span
          className="absolute rounded-full"
          style={{ width: 150, height: 150, border: "3px dashed rgba(230,180,90,0.85)" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "linear" }}
        />
        <motion.span
          className="absolute rounded-full"
          style={{ width: 96, height: 96, border: "2px dashed rgba(255,214,140,0.7)" }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />
        <motion.span
          className="rounded-full"
          style={{ width: 40, height: 40, background: "radial-gradient(circle at 40% 35%, #FFF3CE, #E6A93E)", boxShadow: "0 0 24px 6px rgba(255,200,110,0.5)" }}
          animate={{ scale: [0.82, 1.12, 0.82] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>
    </Shell>
  );
}
