"use client";

import { useEffect, useState, useCallback, useContext } from "react";
import { createPortal } from "react-dom";
import { portalRoot } from "./portal-root";
import { motion, AnimatePresence } from "framer-motion";
import { RevealText, InstantEntry } from "./reveal-text";

export type Story = {
  id: string;
  bubble: string;      // small round thumbnail for the strip
  ring: string;        // ring accent colour
  label: string;       // caption under the bubble
  kicker: string;      // pill text on the full card, e.g. "DEVATA OF THE DAY"
  title: string;       // big serif title
  subtitle: string;    // one line under the title
  image: string;       // full-bleed art on the card
  cta: string;         // button label
  onCta?: () => void;
  ground: string;      // deep patterned background for the card
  fit?: "cover" | "contain"; // how the art sits in the card (default cover)
};

/**
 * The "Updates" story strip and its immersive full-screen viewer — a row of
 * round bubbles that open Instagram-style story cards with progress bars,
 * tap-to-advance and a call to action. Inspired by devotional daily-update apps.
 */
export function HomeStories({ stories }: { stories: Story[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [origin, setOrigin] = useState({ x: 200, y: 200 });
  const [mounted, setMounted] = useState(false);
  const instant = useContext(InstantEntry);
  useEffect(() => setMounted(true), []);
  if (stories.length === 0) return null;

  return (
    <>
      <div className="stories-divider">
        <span className="stories-dot-run">
          <i /><i /><span className="stories-dot-line" />
        </span>
        <span className="stories-divider-label">Updates</span>
        <span className="stories-dot-run">
          <span className="stories-dot-line" /><i /><i />
        </span>
      </div>

      <div className="stories-strip no-scrollbar">
        {stories.map((s, i) => (
          <motion.button
            key={s.id}
            className="story-bubble"
            onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setOrigin({ x: r.left + r.width / 2, y: r.top + r.width / 2 }); setOpen(i); }}
            initial={instant ? false : { opacity: 0, scale: 0.4, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.7 + i * 0.09 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="story-bubble-ring" style={{ background: s.ring }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.bubble} alt="" className="story-bubble-img" />
            </span>
            <span className="story-bubble-label">{s.label}</span>
          </motion.button>
        ))}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open !== null && (
              <StoryViewer
                stories={stories}
                index={open}
                setIndex={setOpen}
                origin={origin}
                onClose={() => setOpen(null)}
              />
            )}
          </AnimatePresence>,
          portalRoot()
        )}
    </>
  );
}

function StoryViewer({
  stories, index, setIndex, onClose, origin,
}: {
  origin: { x: number; y: number };
  stories: Story[];
  index: number;
  setIndex: (n: number | null) => void;
  onClose: () => void;
}) {
  const s = stories[index];
  const DURATION = 6000;
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setIndex(index + 1 >= stories.length ? null : index + 1);
  }, [index, stories.length, setIndex]);
  const prev = useCallback(() => {
    setIndex(index - 1 < 0 ? 0 : index - 1);
  }, [index, setIndex]);

  // auto-advance with a progress bar
  useEffect(() => {
    setProgress(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setProgress(p);
      if (p >= 1) { next(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, next]);

  return (
    <motion.div
      className="story-viewer"
      initial={{ clipPath: `circle(34px at ${origin.x}px ${origin.y}px)` }}
      animate={{ clipPath: `circle(150% at ${origin.x}px ${origin.y}px)` }}
      exit={{ clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      style={{ background: s.ground }}
    >
      {/* progress bars */}
      <div className="story-progress">
        {stories.map((_, i) => (
          <span key={i} className="story-progress-track">
            <span
              className="story-progress-fill"
              style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
            />
          </span>
        ))}
      </div>

      <button className="story-close" onClick={onClose} aria-label="Close">✕</button>

      {/* left / right tap zones */}
      <button className="story-tap story-tap-left" onClick={prev} aria-label="Previous" />
      <button className="story-tap story-tap-right" onClick={next} aria-label="Next" />

      <motion.div
        key={s.id}
        className="story-card"
        initial={{ x: 60, opacity: 0, rotateY: -14 }}
        animate={{ x: 0, opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1100 }}
      >
        <div className="story-image-wrap" style={{ background: s.ground }}>
          {/* slow Ken Burns push on the art */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={s.image}
            alt=""
            className={s.fit === "contain" ? "story-image contain" : "story-image"}
            initial={{ scale: 1.25, y: 40, opacity: 0 }}
            animate={{ scale: 1.02, y: 0, opacity: 1 }}
            transition={{ scale: { duration: 6, ease: "linear" }, y: { duration: 0.9, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.4 } }}
          />
          <motion.span
            className="story-kicker"
            initial={{ y: 20, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            {s.kicker}
          </motion.span>
        </div>
        <RevealText as="h2" text={s.title} delay={0.3} className="story-title font-display" />
        <motion.p
          className="story-subtitle"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {s.subtitle}
        </motion.p>
        <motion.button
          className="story-cta"
          onClick={() => { s.onCta?.(); onClose(); }}
          initial={{ y: 30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.62 }}
        >
          {s.cta}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
