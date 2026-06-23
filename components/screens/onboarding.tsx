"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../app-context";
import { cx, DeityGlyph } from "../ui";
import { DEITIES } from "@/lib/demo";
import { sunSign } from "@/lib/astro";

export function OnboardingScreen() {
  const { completeOnboarding, haptic } = useApp();
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [birthplace, setBirthplace] = useState("");
  const [loc, setLoc] = useState("");
  const [gender, setGender] = useState("");
  const [deity, setDeity] = useState("krishna");
  const [saving, setSaving] = useState(false);

  const ss = sunSign(dob || null);
  const valid = name.trim().length > 1 && !!dob;

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    haptic(14);
    await completeOnboarding({
      name: name.trim(),
      dob,
      tob: tob || null,
      birthplace: birthplace.trim() || null,
      current_location: loc.trim() || null,
      gender: gender || null,
      deity_id: deity,
    });
    // AppShell switches to the app automatically once onboarded=true
  }

  if (saving) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-5"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(200,119,46,0.12), transparent 60%), linear-gradient(180deg,#160f0a,#0b0807)" }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="font-display text-5xl text-[var(--gold-soft)]">ॐ</motion.div>
        <div className="text-center">
          <div className="font-display text-lg text-ink">Building your cosmic chart…</div>
          <div className="mt-1 text-[12.5px] text-muted">Aligning the planets for {name.split(" ")[0]}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-6 pb-8 pt-16"
      style={{ background: "radial-gradient(120% 70% at 50% 0%, rgba(200,119,46,0.10), transparent 55%), linear-gradient(180deg,#140e0a,#0b0807)" }}>
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl font-display text-[26px] text-[var(--gold-soft)]"
          style={{ background: "radial-gradient(circle at 38% 30%, rgba(196,168,104,0.14), var(--surface-2) 72%)", border: "1px solid var(--line-gold)" }}>ॐ</div>
        <h1 className="mt-3 font-display text-2xl text-ink">Create your spiritual profile</h1>
        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">Your birth details personalise your Panchang, Kundli, horoscope & the AI Jyotishi. They stay private.</p>
      </div>

      <div className="mt-6 space-y-3">
        <Field label="Full name">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date of birth">
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)}
              className="w-full bg-transparent text-[14px] text-ink outline-none [color-scheme:dark]" />
          </Field>
          <Field label="Time of birth">
            <input type="time" value={tob} onChange={(e) => setTob(e.target.value)}
              className="w-full bg-transparent text-[14px] text-ink outline-none [color-scheme:dark]" />
          </Field>
        </div>
        {dob && <div className="-mt-1 px-1 text-[11.5px] text-gold">{ss.symbol} {ss.name} ({ss.indian}) rashi</div>}
        <Field label="Place of birth">
          <input value={birthplace} onChange={(e) => setBirthplace(e.target.value)} placeholder="City, State"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
        </Field>
        <Field label="Current location">
          <input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="City you live in"
            className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted" />
        </Field>

        <div>
          <div className="mb-1.5 px-1 text-[11px] uppercase tracking-wider text-muted">Gender</div>
          <div className="grid grid-cols-3 gap-2">
            {["Male", "Female", "Other"].map((g) => (
              <button key={g} onClick={() => setGender(g)}
                className={cx("rounded-xl py-2.5 text-[13px]", gender === g ? "btn-saffron" : "surface text-muted")}>{g}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 px-1 text-[11px] uppercase tracking-wider text-muted">Your Ishta Devta</div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
            {DEITIES.map((d) => (
              <button key={d.id} onClick={() => setDeity(d.id)}
                className={cx("flex shrink-0 flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-colors", d.id === deity ? "ring-gold" : "surface")}
                style={d.id === deity ? { background: "rgba(196,168,104,0.08)" } : undefined}>
                <DeityGlyph deity={d} size={30} />
                <span className={cx("text-[10.5px]", d.id === deity ? "text-ink" : "text-muted")}>{d.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={submit} disabled={!valid}
        className="mt-6 w-full rounded-2xl py-3.5 text-[15px] btn-saffron disabled:opacity-40">
        Begin my journey
      </button>
      {!valid && <p className="mt-2 text-center text-[11px] text-muted">Name & date of birth are required</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-3.5 py-2.5" style={{ border: "1px solid var(--line-strong)" }}>
      <div className="text-[10.5px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
