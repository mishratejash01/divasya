"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useApp } from "../app-context";
import { Logomark } from "../ui";

export function LoginScreen() {
  const { signInGoogle, denied } = useApp();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function google() {
    setBusy(true);
    setNote(null);
    try {
      await signInGoogle(); // redirects to Google
    } catch {
      setBusy(false);
      setNote("Couldn't start Google sign-in. Please try again.");
    }
  }

  return (
    <div
      className="relative flex h-full flex-col items-center justify-between overflow-hidden px-7 pb-10 pt-24"
      style={{
        background:
          "radial-gradient(120% 70% at 50% 0%, rgba(255,217,204,0.55), transparent 55%), radial-gradient(90% 60% at 50% 100%, rgba(206,185,118,0.28), transparent 60%)",
      }}
    >
      {/* slow celestial ring */}
      <div className="animate-spinSlow pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 text-[var(--ochre)] opacity-25">
        <Logomark size={340} />
      </div>

      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[var(--amber)]"
        >
          <Logomark size={92} />
        </motion.div>
        <h1 className="mt-6 font-display text-[44px] leading-none tracking-[0.06em] text-[var(--amber)]">Divasya</h1>
        <p className="mt-3 font-deva text-[15px] text-gold">आपकी आध्यात्मिक यात्रा</p>
        <p className="mt-1.5 text-[13px] text-muted">Understand your time. Move with it.</p>
      </div>

      <div className="w-full max-w-[360px]">
        {denied && (
          <div
            className="mb-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-left"
            style={{ background: "rgba(180,86,75,0.08)", border: "1px solid rgba(180,86,75,0.28)" }}
          >
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-[var(--avoid)]" />
            <div>
              <div className="text-[13px] font-medium text-ink">Access is invite-only</div>
              <div className="text-[12px] leading-snug text-muted">
                This Google account isn't on the approved list. Please sign in with an authorised email, or contact the admin.
              </div>
            </div>
          </div>
        )}

        <button
          onClick={google}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl py-3.5 text-[15px] font-medium text-ink surface disabled:opacity-60"
          style={{ borderColor: "var(--line-strong)" }}
        >
          <GoogleMark /> {busy ? "Connecting…" : "Continue with Google"}
        </button>

        {note && <p className="mt-3 text-center text-[12px] text-[var(--avoid)]">{note}</p>}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
          Sign-in is by Google only, for approved members.<br />
          Your birth details stay private and secure.
        </p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8C43.9 38 46.5 31.8 46.5 24.5z" />
      <path fill="#FBBC05" d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.5 10.7l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.4 0-11.8-3.7-13.7-8.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z" />
    </svg>
  );
}
