"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mounted, setMounted] = useState(false);
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
          <button key={s.id} className="story-bubble" onClick={() => setOpen(i)}>
            <span className="story-bubble-ring" style={{ background: s.ring }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.bubble} alt="" className="story-bubble-img" />
            </span>
            <span className="story-bubble-label">{s.label}</span>
          </button>
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
                onClose={() => setOpen(null)}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

function StoryViewer({
  stories, index, setIndex, onClose,
}: {
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
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
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="story-image-wrap" style={{ background: s.ground }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt="" className={s.fit === "contain" ? "story-image contain" : "story-image"} />
          <span className="story-kicker">{s.kicker}</span>
        </div>
        <h2 className="story-title font-display">{s.title}</h2>
        <p className="story-subtitle">{s.subtitle}</p>
        <button
          className="story-cta"
          onClick={() => { s.onCta?.(); onClose(); }}
        >
          {s.cta}
        </button>
      </motion.div>
    </motion.div>
  );
}
