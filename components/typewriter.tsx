"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Types its text out character-by-character the first time it scrolls into view,
 * with a blinking caret that disappears once the line is complete. Respects
 * reduced-motion (shows the full text at once).
 */
export function Typewriter({
  text,
  className,
  style,
  speed = 34,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
  speed?: number;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStarted(true);
      setShown(text.length);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text.length]);

  useEffect(() => {
    if (!started) return;
    setShown(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [started, text, speed]);

  const done = shown >= text.length;
  return (
    <p ref={ref} className={className} style={style}>
      {text.slice(0, shown)}
      {!done && <span className="tw-caret" aria-hidden>|</span>}
    </p>
  );
}
