"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app-context";
import { cx, BrandWordmark } from "../ui";

/**
 * Google sign-in everywhere; Apple sign-in additionally inside the iOS shell
 * (App Store rule 4.8). Phone OTP was removed from the screen: no SMS provider
 * is configured, so the field could only ever apologise. When phone login is
 * introduced for real, rebuild against lib/db.ts sendPhoneOtp/verifyPhoneOtp.
 */
export function LoginScreen() {
  const { signInGoogle, signInApple } = useApp();
  const [busy, setBusy] = useState<false | "google" | "apple">(false);
  const [note, setNote] = useState<string | null>(null);
  // Apple's button belongs only inside the iPhone app (App Store rule 4.8);
  // detected after mount so server and first client render agree.
  const [isIos, setIsIos] = useState(false);
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
    setIsIos(cap?.getPlatform?.() === "ios");
  }, []);

  async function google() {
    setBusy("google"); setNote(null);
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

  async function apple() {
    setBusy("apple"); setNote(null);
    try {
      await signInApple();   // native sheet; SIGNED_IN fires in-page
    } catch (e) {
      setBusy(false);
      const detail = (e as Error)?.message?.slice(0, 140);
      setNote(detail ? `Apple sign-in failed: ${detail}` : "Couldn't start Apple sign-in. Please try again.");
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
        <h1 className="mt-2" aria-label="Divasya">
          <BrandWordmark height={48} priority className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" />
        </h1>
        <p className="mt-2 font-deva text-[13px] leading-none text-[var(--bhagwa-soft)]">
          आपकी आध्यात्मिक यात्रा
        </p>

        <button
          onClick={google}
          disabled={busy !== false}
          className={cx(
            "mt-6 flex w-full items-center justify-center gap-2.5 rounded-[6px] py-3 text-[13px] font-medium text-ink",
            busy !== false && "opacity-60",
          )}
          style={{ background: "#FFFFFF" }}
        >
          <GoogleMark /> {busy === "google" ? "Connecting…" : "Continue with Google"}
        </button>

        {isIos && (
          <button
            onClick={apple}
            disabled={busy !== false}
            className={cx(
              "mt-2 flex w-full items-center justify-center gap-2.5 rounded-[6px] py-3 text-[13px] font-medium text-white",
              busy !== false && "opacity-60",
            )}
            style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.35)" }}
          >
            <AppleMark /> {busy === "apple" ? "Connecting…" : "Continue with Apple"}
          </button>
        )}

        {note && <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[#FFB4A2]">{note}</p>}

        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/55">
          Your birth details stay private. <a href="/privacy" className="underline text-white/70">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}


function AppleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden>
      <path d="M17.05 12.54c-.03-2.92 2.39-4.32 2.5-4.39-1.36-1.99-3.48-2.26-4.23-2.29-1.8-.18-3.51 1.06-4.42 1.06-.9 0-2.32-1.03-3.81-1-1.96.03-3.77 1.14-4.78 2.9-2.04 3.54-.52 8.78 1.47 11.65.97 1.4 2.13 2.98 3.65 2.92 1.46-.06 2.01-.95 3.78-.95 1.77 0 2.26.95 3.81.92 1.58-.03 2.58-1.43 3.54-2.84 1.12-1.63 1.58-3.21 1.6-3.29-.03-.02-3.08-1.18-3.11-4.69zM14.14 3.96c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.86-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.63z"/>
    </svg>
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
