"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowClockwise } from "@phosphor-icons/react";

/**
 * A full-screen offline page. Much of Divasya — panchang, kundli, the AI
 * Jyotishi, live darshan, the store — needs the network, so when the device
 * drops its connection this takes over the whole app and waits. It dismisses
 * itself the moment the browser fires `online`, and the Try Again button
 * re-checks in case the radios were slow to report back.
 */
export function OfflineGate() {
  const [offline, setOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && navigator.onLine === false);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;

  const retry = () => {
    setChecking(true);
    // navigator.onLine flips on its own; give the radios a beat to report back.
    window.setTimeout(() => {
      setChecking(false);
      setOffline(navigator.onLine === false);
    }, 850);
  };

  return <OfflineScreen checking={checking} onRetry={retry} />;
}

/** The offline page itself — presentational, so it can also be previewed. */
export function OfflineScreen({ checking, onRetry }: { checking: boolean; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-8 text-center"
      style={{
        background: "radial-gradient(120% 88% at 50% 8%, #FFF8ED 0%, #FFE7C6 46%, #F6C57E 100%)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)",
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
      }}
      role="alertdialog"
      aria-live="assertive"
    >
      {/* emblem — a signal cut by a kumkum slash, wrapped in a warm halo */}
      <motion.div
        initial={{ scale: 0.9, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <svg width="140" height="140" viewBox="0 0 132 132" aria-hidden>
          <defs>
            <radialGradient id="offGlow" cx="0.5" cy="0.44" r="0.58">
              <stop offset="0" stopColor="rgba(255,203,116,0.6)" />
              <stop offset="1" stopColor="rgba(255,203,116,0)" />
            </radialGradient>
          </defs>
          <circle cx="66" cy="66" r="62" fill="url(#offGlow)" />
          {/* wifi arcs + node */}
          <path d="M38 64 A40 40 0 0 1 94 64" fill="none" stroke="#D65403" strokeWidth="6.5" strokeLinecap="round" opacity="0.92" />
          <path d="M49 73 A25 25 0 0 1 83 73" fill="none" stroke="#E8892E" strokeWidth="6.5" strokeLinecap="round" opacity="0.85" />
          <circle cx="66" cy="86" r="5.6" fill="#8A2B22" />
          {/* the slash — connection broken */}
          <line x1="35" y1="35" x2="97" y2="97" stroke="#FFF4E4" strokeWidth="12" strokeLinecap="round" />
          <line x1="35" y1="35" x2="97" y2="97" stroke="#8A2B22" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="mt-4 font-display text-[24px] font-semibold leading-tight text-ink">No Internet Connection</h1>
        <p className="mt-1.5 font-deva text-[15px] text-[var(--bhagwa-deep)]">इंटरनेट कनेक्शन नहीं है</p>
        <p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-[var(--icon-ink)]" style={{ opacity: 0.9 }}>
          You&apos;re offline. Panchang, Kundli, Live Darshan and the AI Jyotishi need a connection — please reconnect to continue your sadhana.
        </p>

        <button
          onClick={onRetry}
          disabled={checking}
          className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13.5px] font-medium text-white transition-opacity active:opacity-80 disabled:opacity-70"
          style={{ background: "var(--icon-ink)" }}
        >
          <motion.span
            animate={checking ? { rotate: 360 } : { rotate: 0 }}
            transition={checking ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            className="grid place-items-center"
          >
            <ArrowClockwise size={16} weight="bold" />
          </motion.span>
          {checking ? "Checking…" : "Try Again"}
        </button>
      </motion.div>

      <div className="mt-9 flex items-center gap-1.5 text-[11px] text-[var(--muted-2)]">
        <span className="font-display font-medium">Divasya</span>
        <span aria-hidden>·</span>
        <span>waiting for the network</span>
      </div>
    </motion.div>
  );
}
