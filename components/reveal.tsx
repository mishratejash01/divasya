"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a block so it rises and un-blurs the first time it scrolls into view.
 * Self-contained (uses whileInView), so any page can use it without wiring an
 * observer. Reduced-motion users see it immediately (framer respects it).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
