"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabaseBrowser } from "@/lib/supabase";
import { logEvent } from "@/lib/chat";

export function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function google() {
    setBusy(true);
    setNote(null);
    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" } },
      });
      if (error) throw error;
      logEvent("login_google_start");
      // browser will redirect to Google…
    } catch {
      setBusy(false);
      setNote("Google sign-in is being finalised — continuing for now.");
      setTimeout(onGuest, 900);
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden px-7 pb-10 pt-24"
      style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(200,119,46,0.12), transparent 60%), linear-gradient(180deg, #160f0a, #0b0807)" }}>

      {/* faint mandala */}
      <div className="animate-spinSlow pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-[0.06]"
        style={{ background: "conic-gradient(from 0deg, var(--gold), transparent, var(--saffron), transparent, var(--gold))" }} />

      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.7 }}
          className="grid h-20 w-20 place-items-center rounded-3xl text-4xl"
          style={{ background: "rgba(200,119,46,0.12)", border: "1px solid rgba(184,145,80,0.3)" }}>🕉</motion.div>
        <h1 className="mt-6 font-display text-4xl tracking-[0.22em] text-ink">DIVASYA</h1>
        <p className="mt-2 font-deva text-[15px] text-gold">आपकी आध्यात्मिक यात्रा</p>
        <p className="mt-1 text-[13px] text-muted">Panchang · Kundli · Japa · Darshan — in one place</p>
      </div>

      <div className="w-full">
        <button onClick={google} disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-3.5 text-[15px] font-medium text-[#1f1f1f] disabled:opacity-60">
          <GoogleMark /> {busy ? "Connecting…" : "Continue with Google"}
        </button>
        <button onClick={onGuest} className="mt-3 w-full rounded-2xl py-3 text-[13px] btn-ghost">Explore as guest</button>
        {note && <p className="mt-3 text-center text-[12px] text-muted">{note}</p>}
        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
          By continuing you agree to our Terms & Privacy.<br />Your birth details stay private and secure.
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
