"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx, DeityGlyph, Logomark, BrandWordmark } from "../ui";
import { DEITIES } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { sunSign } from "@/lib/astro";

// One question at a time. Date of birth first (it drives the whole chart), then
// the name, then the softer optional details. A single field per screen keeps the
// form calm and makes each answer feel considered rather than rushed.
type StepKey = "dob" | "name" | "tob" | "birthplace" | "loc" | "gender" | "deity";

// A warm spot illustration per step (public/spot), for the Zepto-style feel.
const STEP_ART: Record<StepKey, string> = {
  dob: "onb-dob", name: "onb-name", tob: "onb-time", birthplace: "onb-birthplace",
  loc: "onb-location", gender: "onb-gender", deity: "onb-deity",
};

// The gender step shows one illustration per option (public/spot/gender-*.png),
// with a glyph fallback until the artwork is dropped in. `sym` is that fallback.
const GENDERS: { key: string; slug: string; sym: string }[] = [
  { key: "Male", slug: "gender-male", sym: "♂" },
  { key: "Female", slug: "gender-female", sym: "♀" },
  { key: "Other", slug: "gender-other", sym: "⚧" },
];

export function OnboardingScreen() {
  const { completeOnboarding, haptic } = useApp();
  const deities = useCatalog(getDeities, DEITIES);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("");
  const [birthplace, setBirthplace] = useState("");
  const [loc, setLoc] = useState("");
  const [gender, setGender] = useState("");
  const [deity, setDeity] = useState("krishna");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  // The rashi "unveiling" splash that plays after DOB, before the name step.
  const [revealRashi, setRevealRashi] = useState(false);

  const ss = sunSign(dob || null);

  const steps: { key: StepKey; required: boolean; ok: boolean }[] = [
    { key: "dob", required: true, ok: !!dob },
    { key: "name", required: true, ok: name.trim().length > 1 },
    { key: "tob", required: false, ok: true },
    { key: "birthplace", required: false, ok: true },
    { key: "loc", required: false, ok: true },
    { key: "gender", required: false, ok: true },
    { key: "deity", required: false, ok: true },
  ];
  const total = steps.length;
  const cur = steps[step];
  const isLast = step === total - 1;

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { const t = setTimeout(() => inputRef.current?.focus(), 260); return () => clearTimeout(t); }, [step]);

  function next() {
    if (!cur.ok) { haptic(4); return; }
    haptic(8);
    if (isLast) return void submit();
    // After the date of birth, unveil the rashi before moving on to the name.
    if (cur.key === "dob" && dob) { haptic([12, 60, 12]); setRevealRashi(true); return; }
    setStep((s) => Math.min(total - 1, s + 1));
  }
  function finishReveal() { setRevealRashi(false); setStep(1); }
  function skip() { haptic(6); setStep((s) => Math.min(total - 1, s + 1)); }
  function back() { haptic(6); setStep((s) => Math.max(0, s - 1)); }
  function onKey(e: KeyboardEvent) { if (e.key === "Enter") { e.preventDefault(); next(); } }

  async function submit() {
    if (saving || !dob || name.trim().length <= 1) return;
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
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <Logomark size={50} className="text-[var(--bhagwa)] animate-spinSlow" />
        <div className="text-center">
          <div className="font-display text-lg text-ink">Building your cosmic chart…</div>
          <div className="mt-1 text-[11px] text-muted">Aligning the planets for {name.split(" ")[0] || "you"}</div>
        </div>
      </div>
    );
  }

  const fieldCls = "w-full rounded-2xl px-4 py-3.5 text-[16px] text-ink outline-none placeholder:text-[var(--muted-2)] focus:border-[var(--bhagwa)]";
  const fieldStyle = { border: "1px solid var(--line-strong)", background: "var(--surface)" };

  const stepBody: Record<StepKey, { title: string; hint: string; node: React.ReactNode }> = {
    dob: {
      title: "When were you born?",
      hint: "Your date of birth aligns your Panchang, Kundli and daily horoscope.",
      node: (
        <>
          <input ref={inputRef} type="date" value={dob} onChange={(e) => setDob(e.target.value)} onKeyDown={onKey}
            className={fieldCls} style={fieldStyle} />
        </>
      ),
    },
    name: {
      title: "What shall we call you?",
      hint: "So Divasya can greet you and personalise your journey.",
      node: (
        <input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={onKey}
          placeholder="Your full name" autoComplete="name" className={fieldCls} style={fieldStyle} />
      ),
    },
    tob: {
      title: "What time were you born?",
      hint: "Optional — but it sharpens your Kundli, lagna and dasha timings.",
      node: (
        <input ref={inputRef} type="time" value={tob} onChange={(e) => setTob(e.target.value)} onKeyDown={onKey}
          className={fieldCls} style={fieldStyle} />
      ),
    },
    birthplace: {
      title: "Where were you born?",
      hint: "Optional — the birth city fixes your chart's coordinates.",
      node: (
        <input ref={inputRef} value={birthplace} onChange={(e) => setBirthplace(e.target.value)} onKeyDown={onKey}
          placeholder="City, State" className={fieldCls} style={fieldStyle} />
      ),
    },
    loc: {
      title: "Where do you live now?",
      hint: "Optional — for accurate local Panchang, sunrise and muhurat.",
      node: (
        <input ref={inputRef} value={loc} onChange={(e) => setLoc(e.target.value)} onKeyDown={onKey}
          placeholder="City you live in" className={fieldCls} style={fieldStyle} />
      ),
    },
    gender: {
      title: "How do you identify?",
      hint: "Optional — it shapes a few personalised readings.",
      node: (
        <div className="grid grid-cols-3 gap-2.5">
          {GENDERS.map((g) => (
            <GenderOption key={g.key} g={g} active={gender === g.key}
              onSelect={() => { setGender(g.key); haptic(6); }} />
          ))}
        </div>
      ),
    },
    deity: {
      title: "Choose your Ishta Devta",
      hint: "The deity you feel closest to — your companion through the app.",
      node: (
        <DeityCarousel deities={deities} value={deity}
          onChange={(id) => { setDeity(id); haptic(8); }} />
      ),
    },
  };

  const body = stepBody[cur.key];

  return (
    <div className="relative flex h-full flex-col overflow-hidden px-6 pb-8 pt-14">
      {/* header — the Divasya wordmark, centred; back arrow floats on the left */}
      <div className="relative flex h-10 items-center justify-center">
        {step > 0 && (
          <button onClick={back} aria-label="Back" className="absolute left-0 grid h-9 w-9 place-items-center">
            <CaretLeft size={20} className="text-ink" />
          </button>
        )}
        <BrandWordmark height={24} priority />
      </div>

      {/* the single question — title + field, centred in the space */}
      <div className="flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* gender and deity carry an illustration per option, so they skip
                the single top artwork the other steps show */}
            {cur.key !== "gender" && cur.key !== "deity" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/spot/${STEP_ART[cur.key]}.png`} alt="" className="mb-5 h-28 w-28 object-contain" />
            )}
            <h1 className="font-display text-[26px] leading-tight text-ink">
              {body.title}
              {cur.required && <span className="text-[var(--icon-ink)]"> *</span>}
            </h1>
            <div className="mt-7 w-full">{body.node}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer — Continue fixed at the bottom */}
      <div className="shrink-0">
        <button onClick={next} disabled={!cur.ok}
          className="w-full rounded-2xl py-3.5 text-[14px] btn-saffron disabled:opacity-40">
          {isLast ? "Begin my journey" : "Continue"}
        </button>
        {!cur.required && !isLast && (
          <button onClick={skip} className="mt-2.5 w-full py-1 text-center text-[11.5px] text-muted">Skip for now</button>
        )}
      </div>

      {/* the rashi unveiling — a warm splash that reveals the user's sign */}
      <AnimatePresence>
        {revealRashi && <RashiReveal ss={ss} onDone={finishReveal} />}
      </AnimatePresence>
    </div>
  );
}

/**
 * One gender option — its own illustration (public/spot/gender-<key>.png) above
 * the label, selectable like a card. Falls back to a glyph until the art lands.
 */
function GenderOption({
  g,
  active,
  onSelect,
}: {
  g: { key: string; slug: string; sym: string };
  active: boolean;
  onSelect: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <button
      onClick={onSelect}
      className={cx(
        "flex flex-col items-center gap-2 rounded-2xl px-2 py-4 transition-colors",
        active ? "btn-saffron" : "surface",
      )}
    >
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/spot/${g.slug}.png`}
          alt=""
          onError={() => setImgOk(false)}
          className="h-20 w-20 object-contain"
        />
      ) : (
        <span className={cx("grid h-16 w-16 place-items-center text-[34px] leading-none", active ? "text-white" : "text-[var(--icon-ink)]")}>
          {g.sym}
        </span>
      )}
      <span className={cx("text-[13px]", active ? "" : "text-muted")}>{g.key}</span>
    </button>
  );
}

/**
 * The Ishta Devta chooser as a swipeable carousel: one idol at a time, swipe or
 * tap the arrows to cycle, and whichever idol is shown is the selection carried
 * forward. Falls back to the deity glyph until the artwork is dropped in.
 */
function DeityCarousel({
  deities,
  value,
  onChange,
}: {
  deities: (typeof DEITIES)[number][];
  value: string;
  onChange: (id: string) => void;
}) {
  const idx = Math.max(0, deities.findIndex((d) => d.id === value));
  const [dir, setDir] = useState(0);
  const go = (delta: number) => {
    const n = (idx + delta + deities.length) % deities.length;
    setDir(delta);
    onChange(deities[n].id);
  };
  const d = deities[idx];

  return (
    <div className="w-full select-none">
      <div className="relative flex items-center justify-center">
        <button type="button" aria-label="Previous deity" onClick={() => go(-1)}
          className="absolute left-0 z-10 grid h-10 w-10 place-items-center rounded-full surface ring-gold">
          <CaretLeft size={18} className="text-ink" />
        </button>

        <div className="relative h-56 w-full overflow-hidden">
          <AnimatePresence mode="popLayout" custom={dir} initial={false}>
            <motion.div
              key={d.id}
              custom={dir}
              initial={{ x: dir >= 0 ? 150 : -150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir >= 0 ? -150 : 150, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
              }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ touchAction: "pan-y" }}
            >
              <IdolImg d={d} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button type="button" aria-label="Next deity" onClick={() => go(1)}
          className="absolute right-0 z-10 grid h-10 w-10 place-items-center rounded-full surface ring-gold">
          <CaretRight size={18} className="text-ink" />
        </button>
      </div>

      <div className="mt-3 font-serif text-[22px] font-semibold text-ink">{d.name}</div>
    </div>
  );
}

/** The idol image for a deity, falling back to its glyph until the art lands. */
function IdolImg({ d }: { d: (typeof DEITIES)[number] }) {
  const [imgOk, setImgOk] = useState(true);
  return imgOk ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/spot/deity-${d.id}.png`}
      alt={d.name}
      draggable={false}
      onError={() => setImgOk(false)}
      className="pointer-events-none h-56 w-auto object-contain drop-shadow-[0_8px_20px_rgba(154,90,30,0.28)]"
    />
  ) : (
    <DeityGlyph deity={d} size={120} />
  );
}

/**
 * A full-screen "unveiling" of the user's rashi, played right after the date of
 * birth is entered. The sign's illustration (public/rashi/<sanskrit>.png) rises
 * out of a glow with its name; if the artwork isn't present yet it falls back to
 * the zodiac symbol so the moment still plays. Taps through, else auto-advances.
 */
function RashiReveal({
  ss,
  onDone,
}: {
  ss: { name: string; indian: string; symbol: string };
  onDone: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onDone}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(120% 90% at 50% 42%, #FFF3DF 0%, #FBE7C6 42%, #F6D79E 100%)" }}
    >
      {/* soft rotating rays behind the sign */}
      <motion.div
        aria-hidden
        className="absolute h-[420px] w-[420px] rounded-full"
        style={{ background: "conic-gradient(from 0deg, rgba(242,107,15,0.16), rgba(255,255,255,0) 22%, rgba(242,107,15,0.16) 50%, rgba(255,255,255,0) 72%, rgba(242,107,15,0.16))" }}
        initial={{ scale: 0.4, opacity: 0, rotate: 0 }}
        animate={{ scale: 1, opacity: 1, rotate: 90 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />
      {/* expanding glow ring */}
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{ border: "1px solid rgba(200,129,49,0.5)" }}
        initial={{ width: 40, height: 40, opacity: 0.8 }}
        animate={{ width: 320, height: 320, opacity: 0 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
      />

      {/* the sign */}
      <motion.div
        initial={{ scale: 0.55, opacity: 0, filter: "blur(10px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 120, damping: 13, delay: 0.15 }}
        className="relative grid place-items-center"
        style={{ filter: "drop-shadow(0 8px 24px rgba(154,90,30,0.35))" }}
      >
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/rashi/${ss.indian.toLowerCase()}.png`}
            alt={ss.name}
            onError={() => setImgOk(false)}
            className="h-44 w-44 object-contain"
          />
        ) : (
          <span className="grid h-44 w-44 place-items-center text-[128px] leading-none text-[var(--bhagwa-deep)]">
            {ss.symbol}
          </span>
        )}
      </motion.div>

      {/* the name */}
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 text-center"
      >
        <div className="font-serif text-[30px] font-semibold tracking-wide text-ink">{ss.indian}</div>
      </motion.div>
    </motion.div>
  );
}
