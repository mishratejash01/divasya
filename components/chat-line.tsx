"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * One line of a chat transcript. Every line sits on the left — the speaker's
 * avatar, their name in small type, then the words on the page itself with no
 * bubble around them — so a conversation reads like a written exchange rather
 * than two columns of coloured blocks. Your own lines carry your portrait.
 */
export function ChatLine({ avatar, name, mine, children }: {
  avatar: ReactNode;
  name: string;
  mine?: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="flex items-start gap-2.5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="mt-0.5 shrink-0">{avatar}</span>
      <div className="min-w-0 flex-1">
        <div
          className="text-[10.5px] font-medium leading-none"
          style={{ color: mine ? "var(--bhagwa-deep)" : "#153C6B" }}
        >
          {name}
        </div>
        <div className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{children}</div>
      </div>
    </motion.div>
  );
}

/** The user's own portrait in the thread. */
export function UserAvatar({ size = 28 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/user-rishi.png"
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size, background: "#FCE3CF", boxShadow: "0 0 0 1px rgba(0,0,0,0.08)" }}
    />
  );
}

/**
 * While the chat input has focus the keyboard is up, so the tab bar is hidden
 * (it would sit behind the keyboard and leave its gap under the composer).
 * Returns whether we're typing, plus focus handlers for the input.
 */
export function useTyping() {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    document.body.classList.toggle("is-typing", typing);
    return () => document.body.classList.remove("is-typing");
  }, [typing]);
  return { typing, onFocus: () => setTyping(true), onBlur: () => setTyping(false) };
}
