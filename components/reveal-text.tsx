"use client";

import { createContext, useContext } from "react";
import { motion } from "framer-motion";

/** True while a screen is shown by going back: entrances render settled. */
export const InstantEntry = createContext(false);

/** True while a screen is kept alive in the background (home, while another
 *  screen is open): its loops pause until it is shown again. */
export const ScreenParked = createContext(false);

/**
 * Masked line reveal: every word sits in a clipped slot and slides up from
 * below it, staggered — the stark, typographic entrance used across the app's
 * titles. Re-plays whenever `text` changes.
 */
export function RevealText({
  text,
  className,
  delay = 0,
  stagger = 0.045,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "div" | "h1" | "h2" | "h3";
}) {
  const instant = useContext(InstantEntry);
  const words = text.split(" ");
  const M = motion[Tag];
  return (
    <M className={className} aria-label={text} key={text} style={{ display: "block" }}>
      {words.map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom" style={{ paddingBottom: "0.12em", marginBottom: "-0.12em" }}>
          <motion.span
            className="inline-block"
            initial={instant ? false : { y: "115%", rotate: 4 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </M>
  );
}
