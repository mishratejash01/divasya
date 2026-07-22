"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CaretLeft, CircleNotch, ShieldWarning } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Logomark, cx } from "../ui";
import { IconSunrise, IconSunset } from "../icons";
import { usePanchang } from "@/lib/use-panchang";
import * as db from "@/lib/db";

type Step = "phone" | "code";

export function LoginScreen() {
  const { signInGoogle, denied } = useApp();
  const [busy, setBusy] = useState<null | "google" | "otp" | "verify">(null);
  const [note, setNote] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);

  // The panchang route needs no session, so the app can do its job before it
  // asks for anything. That is the idea of this screen.
  const { panchang: p } = usePanchang();
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" });
  const weekday = new Date().toLocaleDateString("en-IN", { weekday: "long" });

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

  return (
    <div className="stage-dawn relative flex h-full flex-col items-center justify-center overflow-hidden px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-[340px] flex-col items-center"
      >
        <div className="text-[var(--bhagwa)]"><Logomark size={50} /></div>

        <h1 className="mt-3.5 font-display text-[32px] leading-none tracking-[-0.02em] text-[var(--bhagwa)]">
          Divasya
        </h1>
        <p className="mt-2 font-deva text-[12.5px] leading-none text-[var(--bhagwa-deep)]">
          आपकी आध्यात्मिक यात्रा
        </p>

        {/* Today, computed live. A sign-in screen that already tells you the
            tithi is making a claim the tagline cannot. */}
        <div className="mt-5 w-full overflow-hidden rounded-2xl surface">
          <div className="flex items-baseline justify-between gap-3 px-3.5 pb-2 pt-2.5">
            <div className="font-display text-[14.5px] leading-none text-ink">{today}</div>
            <div className="text-[11px] leading-none text-ink">{p?.weekday ?? weekday}</div>
          </div>
          <div className="px-3.5 pb-2.5 text-[11px] leading-relaxed text-ink">
            {p
              ? <>{p.tithiDisplay} · {p.nakshatra} nakshatra</>
              : <span className="opacity-45">Reading today&apos;s panchang…</span>}
          </div>
          {/* Labelled. The sunrise and sunset marks are the same silhouette at
              14px, so the icon alone said "a sun" and nothing more. */}
          <div className="grid grid-cols-2" style={{ borderTop: "1px solid var(--line)" }}>
            {([[IconSunrise, "Sunrise", p?.sunrise], [IconSunset, "Sunset", p?.sunset]] as const).map(
              ([Icon, label, value], i) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-2"
                  style={{ borderLeft: i ? "1px solid var(--line)" : undefined }}>
                  <Icon size={14} className="shrink-0 text-[var(--bhagwa)]" strokeWidth={1.7} />
                  <div className="min-w-0">
                    <div className="text-[9.5px] leading-none text-[var(--muted-2)]">{label}</div>
                    <div className="mt-1 text-[11.5px] leading-none tnum text-ink">{value ?? "—"}</div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {denied && (
          <div className="mt-3 flex w-full items-start gap-2.5 rounded-[6px] px-3 py-2.5 text-left"
            style={{ background: "rgba(180,86,75,0.08)", border: "1px solid rgba(180,86,75,0.28)" }}>
            <ShieldWarning size={15} className="mt-px shrink-0 text-[var(--avoid)]" />
            <div>
              <div className="text-[11.5px] font-medium text-ink">Access is invite-only</div>
              <div className="mt-0.5 text-[10.5px] leading-snug text-ink">
                This account isn&apos;t on the approved list. Use an authorised one, or contact the admin.
              </div>
            </div>
          </div>
        )}

        {/* Phone first — it is how most people in India sign in — with Google
            kept as the alternative rather than the only door. */}
        {step === "phone" ? (
          <div className="mt-4 w-full">
            <div className="flex items-stretch overflow-hidden rounded-[6px]"
              style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}>
              <span className="grid shrink-0 place-items-center px-3 text-[13px] tnum text-ink"
                style={{ borderRight: "1px solid var(--line)" }}>+91</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={digits}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
                placeholder="Mobile number"
                className="w-full bg-transparent px-3 py-3 text-[13px] tnum text-ink outline-none placeholder:text-[var(--muted-2)] placeholder:tracking-normal"
              />
            </div>
            <button
              onClick={sendCode}
              disabled={digits.length !== 10 || busy !== null}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] btn-saffron py-3 text-[13px] font-medium disabled:opacity-45"
            >
              {busy === "otp" && <CircleNotch size={14} weight="bold" className="animate-spin" />}
              {busy === "otp" ? "Sending code…" : "Send code"}
            </button>
          </div>
        ) : (
          <div className="mt-4 w-full">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-ink">Code sent to <span className="tnum">{e164}</span></span>
              <button
                onClick={() => { setStep("phone"); setCode(""); setNote(null); }}
                className="flex items-center gap-0.5 text-[11px] text-[var(--bhagwa-deep)]"
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
                "mt-1.5 w-full rounded-[6px] px-3 py-3 text-center tnum text-ink outline-none placeholder:text-[var(--muted-2)]",
                code ? "text-[16px] tracking-[0.4em]" : "text-[13px]",
              )}
              style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
            />
            <button
              onClick={verify}
              disabled={code.length < 4 || busy !== null}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[6px] btn-saffron py-3 text-[13px] font-medium disabled:opacity-45"
            >
              {busy === "verify" && <CircleNotch size={14} weight="bold" className="animate-spin" />}
              {busy === "verify" ? "Checking…" : "Verify and continue"}
            </button>
            <button
              onClick={sendCode}
              disabled={busy !== null}
              className="mt-2 w-full text-center text-[11px] text-[var(--bhagwa-deep)] disabled:opacity-45"
            >
              Send it again
            </button>
          </div>
        )}

        <div className="my-3 flex w-full items-center gap-3">
          <span className="h-px flex-1" style={{ background: "var(--line-strong)" }} />
          <span className="text-[10.5px] text-[var(--muted-2)]">or</span>
          <span className="h-px flex-1" style={{ background: "var(--line-strong)" }} />
        </div>

        <button
          onClick={google}
          disabled={busy !== null}
          className={cx(
            "flex w-full items-center justify-center gap-2.5 rounded-[6px] py-3 text-[13px] font-medium text-ink",
            busy !== null && "opacity-60",
          )}
          style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
        >
          <GoogleMark /> {busy === "google" ? "Connecting…" : "Continue with Google"}
        </button>

        {note && <p className="mt-2.5 text-center text-[11px] leading-relaxed text-[var(--avoid)]">{note}</p>}

        <p className="mt-3 text-center text-[10px] leading-relaxed text-[var(--muted-2)]">
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
