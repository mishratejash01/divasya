"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./app-context";

export function PushToast() {
  const { push, clearPush } = useApp();

  useEffect(() => {
    if (!push) return;
    const id = setTimeout(clearPush, 6500);
    return () => clearTimeout(id);
  }, [push, clearPush]);

  return (
    <AnimatePresence>
      {push && (
        <motion.button
          key={push.title + push.body}
          initial={{ y: -90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          onClick={clearPush}
          className="absolute left-1/2 top-5 z-50 flex w-[calc(100%-1.5rem)] max-w-[420px] -translate-x-1/2 items-start gap-3 rounded-2xl px-3.5 py-3 text-left"
          style={{
            background: "rgba(24,21,17,0.9)",
            border: "1px solid var(--line-gold)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] font-display text-[17px] text-[var(--gold-soft)]"
            style={{ background: "rgba(196,168,104,0.1)", border: "1px solid var(--line-gold)" }}
          >
            ॐ
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold tracking-wide text-ink">Divasya</span>
              <span className="text-[10.5px] text-muted">now</span>
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-ink">{push.title}</div>
            <div className="text-[12.5px] leading-snug text-muted">{push.body}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
