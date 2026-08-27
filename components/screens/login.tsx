"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app-context";
import { cx } from "../ui";

/**
 * Google-only sign-in. Phone OTP was removed from the screen entirely: no SMS
 * provider is configured, so the field could only ever apologise. When phone
 * login is introduced for real, rebuild the flow against lib/db.ts
 * sendPhoneOtp/verifyPhoneOtp, which remain in place and working.
 */
export function LoginScreen() {
  const { signInGoogle } = useApp();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function google() {
    setBusy(true); setNote(null);
    try {
      await signInGoogle();  // full-page redirect
    } catch (e) {
      setBusy(false);
      // Show the real cause — a generic apology hides exactly the detail
      // that lets a sign-in problem be fixed remotely.
      const detail = (e as Error)?.message?.slice(0, 140);
      setNote(detail ? `Google sign-in failed: ${detail}` : "Couldn't start Google sign-in. Please try again.");
    }
  }

  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden" style={{ background: "#0B0A09" }}>
      {/* The photograph is the screen. Anchored to the top so the face stays
          above the vignette however tall the phone is. */}
      <img
        src="/login/hero.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "50% 22%" }}
      />

      {/* Black from below. Three stops rather than one, so the type sits on
          solid black while the sage's face stays clear of it. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,10,9,0) 30%, rgba(11,10,9,0.55) 52%, rgba(11,10,9,0.93) 70%, #0B0A09 84%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full px-5 pb-7"
      >
        <p className="text-[12.5px] font-medium leading-none tracking-[0.01em] text-white">
          India&apos;s No.1 spiritual companion
        </p>
        <h1 className="mt-2 font-display text-[40px] leading-none tracking-[-0.025em] text-white">
          Divasya
        </h1>
        <p className="mt-2 font-deva text-[13px] leading-none text-[var(--bhagwa-soft)]">
          आपकी आध्यात्मिक यात्रा
        </p>

        <button
          onClick={google}
          disabled={busy}
          className={cx(
            "mt-6 flex w-full items-center justify-center gap-2.5 rounded-[6px] py-3 text-[13px] font-medium text-ink",
            busy && "opacity-60",
          )}
          style={{ background: "#FFFFFF" }}
        >
          <GoogleMark /> {busy ? "Connecting…" : "Continue with Google"}
        </button>

        {note && <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[#FFB4A2]">{note}</p>}

        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/55">
          Your birth details stay private. <a href="/privacy" className="underline text-white/70">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8C43.9 38 46.5 31.8 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.4 0-11.8-3.7-13.7-8.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
