"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app-context";
import { DevotionalIllustration, ScreenHeader } from "../ui";
import { Iconify } from "../iconify";

type Entry = { id: string; date: string; prompt: string; text: string };

const STORAGE_KEY = "divasya:journal";

// Evening prompts cycle so the page never asks the same thing two nights running.
const EVENING_PROMPTS = [
  "What did you learn today?",
  "What challenge did you overcome?",
  "What blessing did you receive?",
];
const MORNING_PROMPT = "What intention are you setting today?";

// A calm Devanagari accent for each mood — a word, not a sentence.
const MORNING_DEVA = "प्रातः · संकल्प"; // dawn · intention
const EVENING_DEVA = "सन्ध्या · चिंतन"; // dusk · reflection

function pickPrompt(now: Date): { prompt: string; deva: string; morning: boolean } {
  const morning = now.getHours() < 15;
  if (morning) return { prompt: MORNING_PROMPT, deva: MORNING_DEVA, morning: true };
  // Cycle the evening prompts by day-of-month so it feels gently rotating.
  const idx = now.getDate() % EVENING_PROMPTS.length;
  return { prompt: EVENING_PROMPTS[idx], deva: EVENING_DEVA, morning: false };
}

function loadEntries(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is Entry =>
        e && typeof e.id === "string" && typeof e.text === "string" && typeof e.prompt === "string"
    );
  } catch {
    return [];
  }
}

function saveEntries(entries: Entry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    /* storage full or blocked — the box simply won't persist */
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

// A small lit-lamp mark for the empty state — a tended flame rather than a bare
// line of grey text, echoing the diya artifacts elsewhere in the app.
function LotusLamp() {
  return (
    <svg viewBox="0 0 120 108" width="112" height="100" aria-hidden>
      <defs>
        <radialGradient id="jGlow" cx="50%" cy="40%" r="55%">
          <stop offset="0" stopColor="#FFD98A" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="jFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB020" />
          <stop offset="1" stopColor="#F26B0F" />
        </linearGradient>
        <linearGradient id="jPetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0902E" />
          <stop offset="1" stopColor="#B23A1E" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="44" rx="42" ry="40" fill="url(#jGlow)" />
      <path d="M60 20 C 68 38, 71 48, 60 58 C 49 48, 52 38, 60 20 Z" fill="url(#jFlame)" />
      <path d="M60 32 C 64 44, 65 50, 60 55 C 55 50, 56 44, 60 32 Z" fill="#FFE9A8" />
      {/* lotus petals cradling the flame */}
      <path d="M60 70 C 44 70, 34 80, 30 74 C 40 62, 52 64, 60 70 Z" fill="url(#jPetal)" opacity="0.9" />
      <path d="M60 70 C 76 70, 86 80, 90 74 C 80 62, 68 64, 60 70 Z" fill="url(#jPetal)" opacity="0.9" />
      <path d="M60 72 C 48 72, 40 82, 44 88 C 54 80, 58 76, 60 72 Z" fill="#C4611F" />
      <path d="M60 72 C 72 72, 80 82, 76 88 C 66 80, 62 76, 60 72 Z" fill="#C4611F" />
      <ellipse cx="60" cy="72" rx="16" ry="4" fill="#7A340E" />
    </svg>
  );
}

export function JournalScreen() {
  const { back, haptic } = useApp();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [text, setText] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  // Derive the prompt once per mount — a browser component, so new Date() is fine.
  const { prompt, deva, morning } = useMemo(() => pickPrompt(new Date()), []);

  // Hydrate after mount so first render matches the server (empty), then fill in.
  useEffect(() => {
    setEntries(loadEntries());
    setHydrated(true);
  }, []);

  function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      prompt,
      text: trimmed,
    };
    const next = [entry, ...entries];
    setEntries(next);
    saveEntries(next);
    setText("");
    haptic(12);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2200);
  }

  const count = entries.length;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Soul Journal" sub="Reflection, not prediction" onBack={back} />

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        <div className="gutter pt-4 lg:mx-auto lg:max-w-xl">
          {/* Time-aware invocation + composer, on warm paper */}
          <section
            className="relative overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(165deg, rgba(255,217,204,0.30), rgba(255,255,255,0) 60%), var(--surface-2)",
              border: "1px solid var(--line-gold)",
            }}
          >
            {/* faint Om watermark in the corner — a private page, gently blessed */}
            <span
              className="pointer-events-none absolute -right-2 -top-3 font-deva leading-none"
              style={{ color: "var(--bhagwa)", opacity: 0.06, fontSize: 96 }}
              aria-hidden
            >
              ॐ
            </span>

            <div className="relative px-4 pb-4 pt-4 lg:px-5 lg:pt-5">
              <DevotionalIllustration
                name="journal"
                className="pointer-events-none absolute -right-3 -top-4 h-28 w-36 opacity-[0.09]"
                priority
              />
              <div className="flex items-center gap-2">
                <Iconify
                  icon={morning ? "solar:sun-2-bold-duotone" : "solar:moon-stars-bold-duotone"}
                  width={18}
                  height={18}
                  className="text-[var(--icon-ink)]"
                />
                <span className="font-deva text-[12.5px] text-gold">{deva}</span>
              </div>

              <h2 className="mt-2 font-display text-[19px] leading-snug text-ink lg:text-[21px]">
                {prompt}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                {morning
                  ? "Set the tone for the hours ahead. A line or two is enough."
                  : "Let the day settle. Write freely — no one else will read this."}
              </p>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Write from the heart…"
                className="mt-3 w-full resize-none rounded-xl px-3.5 py-3 text-[13.5px] leading-[1.75] text-ink outline-none placeholder:text-[var(--muted-2)]"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--line-gold)",
                }}
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] text-muted" aria-live="polite">
                  {justSaved ? "Saved. Rest easy." : hydrated && count > 0 ? `${count} kept` : "Kept only on this device"}
                </span>
                <button
                  onClick={handleSave}
                  disabled={!text.trim()}
                  className="rounded-xl px-5 py-2.5 text-[12.5px] btn-saffron disabled:opacity-40"
                >
                  Save reflection
                </button>
              </div>
            </div>
          </section>

          {/* Past reflections */}
          <div className="mt-6 flex items-baseline justify-between">
            <h3 className="section-title">Past reflections</h3>
            {hydrated && count > 0 && (
              <span className="text-[10.5px] text-muted">
                {count} reflection{count === 1 ? "" : "s"} kept
              </span>
            )}
          </div>

          {/* Empty state — a tended lamp, not a bare grey line */}
          {hydrated && count === 0 && (
            <div className="mt-3 flex flex-col items-center rounded-2xl px-6 py-9 text-center surface">
              <LotusLamp />
              <p className="mx-auto mt-3 max-w-[30ch] text-[12.5px] leading-relaxed text-ink">
                Your words stay with you.
              </p>
              <p className="mx-auto mt-1 max-w-[30ch] text-[11px] leading-relaxed text-muted">
                Reflection, not prediction.
              </p>
            </div>
          )}

          {hydrated && count > 0 && (
            <div className="mt-3 space-y-2.5">
              {entries.map((e) => (
                <article
                  key={e.id}
                  className="rounded-2xl px-4 py-3.5 surface"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bhagwa)" }} />
                    <span className="text-[10.5px] tnum text-muted">{formatDate(e.date)}</span>
                  </div>
                  <div className="mt-1.5 text-[11.5px] italic leading-snug text-gold">{e.prompt}</div>
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink">
                    {e.text}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
