"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "./app-context";
import { Logomark, Wordmark } from "./ui";

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
          drag
          dragElastic={0.5}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={(_, info) => {
            // a flick or a firm swipe in any direction sends it away
            if (info.offset.y < -32 || Math.abs(info.offset.x) > 90 || info.velocity.y < -450 || Math.abs(info.velocity.x) > 500) clearPush();
          }}
          onClick={clearPush}
          className="absolute left-1/2 top-5 z-50 flex w-[calc(100%-1.5rem)] max-w-[420px] -translate-x-1/2 items-start gap-3 rounded-2xl px-3.5 py-3 text-left"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--line-gold)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "var(--shadow-pop)",
          }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
            style={{ background: "var(--surface-2)", border: "1px solid var(--line-gold)" }}
          >
            <Logomark size={18} className="text-[var(--bhagwa)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <Wordmark size={12} />
              <span className="text-[9.5px] text-muted">now</span>
            </div>
            <div className="mt-0.5 text-[11.5px] font-medium text-ink">{push.title}</div>
            <div className="text-[11px] leading-snug text-muted">{push.body}</div>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
