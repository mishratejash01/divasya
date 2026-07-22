"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CaretLeft, CircleNotch, ShieldWarning } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx } from "../ui";
import * as db from "@/lib/db";

type Step = "phone" | "code";

/**
 * Phone sign-in is built but not switched on: Supabase relays the SMS through a
 * provider (Twilio and the like) and none is configured on the project yet, so
 * a real send would fail on the user's side with nothing to show for it. The
 * field stays visible and says plainly that it isn't live; flip this to true
 * once a provider is set up and the whole flow below works as written.
 */
const PHONE_LOGIN_LIVE = false;

export function LoginScreen() {
  const { signInGoogle, denied } = useApp();
  const [busy, setBusy] = useState<null | "google" | "otp" | "verify">(null);
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);

  const digits = phone.replace(/\D/g, "").slice(0, 10);
  const e164 = `+91${digits}`;

  async function google() {
    setBusy("google"); setNote(null);
    try {
      await signInGoogle();  // full-page redirect
    } catch {
      setBusy(null);
      setNote("Couldn't start Google sign-in. Please try again.");
    }
  }

  async function sendCode() {
    if (digits.length !== 10 || busy) return;
    if (!PHONE_LOGIN_LIVE) {
      setNote("Phone sign-in isn't switched on yet. Continue with Google for now.");
      return;
    }
    setBusy("otp"); setNote(null);
    try {
      await db.sendPhoneOtp(e164);
      setStep("code");
      setTimeout(() => codeRef.current?.focus(), 60);
    } catch {
      setNote("Couldn't send the code. Check the number, or continue with Google.");
    } finally { setBusy(null); }
  }

  async function verify() {
    if (code.length < 4 || busy) return;
    setBusy("verify"); setNote(null);
    try {
      await db.verifyPhoneOtp(e164, code);  // SIGNED_IN is picked up by the context
    } catch {
      setNote("That code didn't work. Check it, or ask for a new one.");
      setBusy(null);
    }
  }

  // Fields sit on the dark half of the image, so they are glass rather than
  // white slabs — a white box here would punch a hole in the photograph.
  const fieldStyle = {
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.30)",
  } as const;

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
        /* Full width of the stage. It was pinned to 360px inside a 460px
           frame, which left fifty dead pixels down each side. */
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

        {denied && (
          <div className="mt-4 flex items-start gap-2.5 rounded-[6px] px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,140,120,0.45)" }}>
            <ShieldWarning size={15} className="mt-px shrink-0 text-[#FF9E8A]" />
            <div>
              <div className="text-[11.5px] font-medium text-white">Access is invite-only</div>
              <div className="mt-0.5 text-[10.5px] leading-snug text-white/75">
                This account isn&apos;t on the approved list. Use an authorised one, or contact the admin.
              </div>
            </div>
          </div>
        )}

        {step === "phone" ? (
          <div className="mt-5">
            <div className="flex items-stretch overflow-hidden rounded-[6px]" style={fieldStyle}>
              <span className="grid shrink-0 place-items-center px-3 text-[13px] tnum text-white"
                style={{ borderRight: "1px solid rgba(255,255,255,0.25)" }}>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={digits}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="Mobile number"
                className="w-full bg-transparent px-3 py-3 text-[13px] tnum text-white outline-none placeholder:text-white/55"
              />
            </div>
            <button
              onClick={sendCode}
              disabled={digits.length !== 10 || busy !== null}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] btn-saffron py-3 text-[13px] font-medium disabled:opacity-40"
            >
              {busy === "otp" && <CircleNotch size={14} weight="bold" className="animate-spin" />}
              {busy === "otp" ? "Sending code…" : "Send code"}
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-white/85">Code sent to <span className="tnum">{e164}</span></span>
              <button
                onClick={() => { setStep("phone"); setCode(""); setNote(null); }}
                className="flex items-center gap-0.5 text-[11px] text-[var(--bhagwa-soft)]"
              >
                <CaretLeft size={11} weight="bold" /> Change
              </button>
            </div>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verify()}
              placeholder="6-digit code"
              /* Tracking only once there are digits to space out. Applied
                 unconditionally it spaced the placeholder too, and
                 placeholder:tracking-normal did not win it back. */
              className={cx(
                "mt-1.5 w-full rounded-[6px] px-3 py-3 text-center tnum text-white outline-none placeholder:text-white/55",
                code ? "text-[16px] tracking-[0.4em]" : "text-[13px]",
              )}
              style={fieldStyle}
            />
            <button
              onClick={verify}
              disabled={code.length < 4 || busy !== null}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] btn-saffron py-3 text-[13px] font-medium disabled:opacity-40"
            >
              {busy === "verify" && <CircleNotch size={14} weight="bold" className="animate-spin" />}
              {busy === "verify" ? "Checking…" : "Verify and continue"}
            </button>
            <button onClick={sendCode} disabled={busy !== null}
              className="mt-2 w-full text-center text-[11px] text-[var(--bhagwa-soft)] disabled:opacity-45">
              Send it again
            </button>
          </div>
        )}

        <div className="my-3 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.22)" }} />
          <span className="text-[10.5px] text-white/65">or</span>
          <span className="h-px flex-1" style={{ background: "rgba(255,255,255,0.22)" }} />
        </div>

        <button
          onClick={google}
          disabled={busy !== null}
          className={cx(
            "flex w-full items-center justify-center gap-2.5 rounded-[6px] py-3 text-[13px] font-medium text-ink",
            busy !== null && "opacity-60",
          )}
          style={{ background: "#FFFFFF" }}
        >
          <GoogleMark /> {busy === "google" ? "Connecting…" : "Continue with Google"}
        </button>

        {note && <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[#FFB4A2]">{note}</p>}

        <p className="mt-3 text-center text-[10px] leading-relaxed text-white/55">
          Invite-only. Your birth details stay private.
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
