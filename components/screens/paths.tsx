"use client";

import { useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { Iconify } from "../iconify";
import { useApp } from "../app-context";
import { DeityGlyph, ScreenHeader, cx } from "../ui";

/* ---------------------------------------------------------------------------
 *  Divine Paths — deity-led tracks that organise daily sadhana around a chosen
 *  focus. A list of warm, deity-coloured cards; tapping one opens its detail
 *  (essence, focus areas, and real practices that link into the app).
 * ------------------------------------------------------------------------- */

// The screens a practice can open. A subset of the app's ScreenName union, so
// each value passes straight to go() without a cast.
type Target = "mala" | "mandir" | "sandesh" | "festivals" | "panchang";

type Practice = { to: Target; label: string; sub: string; icon: string };
type Focus = { title: string; blurb: string };

type Path = {
  id: string;
  name: string;
  deva: string; // Devanagari accent
  deity: { id?: string; color: string }; // fed to DeityGlyph; id omitted uses a book tile
  book?: boolean; // render a scripture tile instead of a deity portrait (Gita)
  accent: string; // warm jewel tone for the card's identity
  essence: string; // one-line
  intro: string; // a warmer sentence for the detail hero
  focus: Focus[]; // three focus areas
  practices: Practice[];
};

const PATHS: Path[] = [
  {
    id: "shiva",
    name: "Shiva Path",
    deva: "शिव",
    deity: { id: "shiva", color: "#5B4B8A" },
    accent: "#5B4B8A",
    essence: "Stillness, surrender, and the courage to let the old self dissolve.",
    intro:
      "The still one at the heart of change. Walk with Mahadev to quiet the mind, sit in silence, and burn away what no longer serves you.",
    focus: [
      { title: "Meditation", blurb: "Sit with the breath each day and let thought settle like silt in still water." },
      { title: "Inner silence", blurb: "Guard a quiet hour. In stillness the noise of wanting slowly loosens its grip." },
      { title: "Transformation", blurb: "Offer what is worn out to the fire, as an ascetic would, and walk on lighter." },
    ],
    practices: [
      { to: "mala", label: "Mala Jaap", sub: "108 rounds of ॐ नमः शिवाय", icon: "game-icons:prayer-beads" },
      { to: "mandir", label: "My Mandir", sub: "Light a diya and ring the bell", icon: "game-icons:temple-gate" },
    ],
  },
  {
    id: "hanuman",
    name: "Hanuman Path",
    deva: "हनुमान",
    deity: { id: "hanuman", color: "#B5482A" },
    accent: "#B5482A",
    essence: "Devotion turned to strength — discipline, service, and fearlessness.",
    intro:
      "Bhakti made muscular. Walk with Bajrangbali to build steadiness of body and mind, keep your vows, and serve without keeping count.",
    focus: [
      { title: "Strength", blurb: "Ground the body and the mind together; steadiness is built, not wished for." },
      { title: "Discipline", blurb: "Small vows kept daily. Quiet consistency is the real tapasya." },
      { title: "Service", blurb: "Give without tallying the return; seva turns your strength toward others." },
    ],
    practices: [
      { to: "mala", label: "Mala Jaap", sub: "Chant the Hanuman naam", icon: "game-icons:prayer-beads" },
      { to: "mandir", label: "My Mandir", sub: "Daily darshan and offering", icon: "game-icons:temple-gate" },
    ],
  },
  {
    id: "krishna",
    name: "Krishna Path",
    deva: "कृष्ण",
    deity: { id: "krishna", color: "#2C7A8C" },
    accent: "#2C7A8C",
    essence: "Meet life with wisdom and delight; love fully, yet stay unshaken.",
    intro:
      "The playful teacher of the Gita. Walk with Kanha to grow in understanding, love wholeheartedly, and let devotion stay light and joyful.",
    focus: [
      { title: "Wisdom", blurb: "Read a little, reflect more; let understanding ripen into steady action." },
      { title: "Relationships", blurb: "Love as leela — wholeheartedly, and yet unattached to the outcome." },
      { title: "Joy", blurb: "Make room for music, play and gratitude; bhakti is allowed to be light." },
    ],
    practices: [
      { to: "sandesh", label: "Daily Sandesh", sub: "A verse and message each morning", icon: "solar:letter-bold-duotone" },
      { to: "mala", label: "Mala Jaap", sub: "Hare Krishna maha-mantra", icon: "game-icons:prayer-beads" },
    ],
  },
  {
    id: "gita",
    name: "Gita Path",
    deva: "गीता",
    deity: { id: "krishna", color: "#A9791F" },
    book: true,
    accent: "#A9791F",
    essence: "Act with clarity. Master yourself before you set out to lead others.",
    intro:
      "Eighteen chapters of counsel on the battlefield of life. Walk the Gita to steady the senses, do your duty well, and act for the deed, not its fruit.",
    focus: [
      { title: "Self-mastery", blurb: "Rule the senses before they rule you; the self is won turning inward." },
      { title: "Leadership", blurb: "Do your duty quietly and well; example teaches more than any command." },
      { title: "Dharma", blurb: "Act because it is right, not for the fruit — and steadiness follows." },
    ],
    practices: [
      { to: "sandesh", label: "Daily Sandesh", sub: "A shloka to carry through the day", icon: "solar:letter-bold-duotone" },
      { to: "mala", label: "Mala Jaap", sub: "Steady the mind with japa", icon: "game-icons:prayer-beads" },
    ],
  },
  {
    id: "devi",
    name: "Devi Path",
    deva: "देवी",
    deity: { id: "durga", color: "#A83258" },
    accent: "#A83258",
    essence: "The Mother's grace — compassion that protects and provides.",
    intro:
      "Shakti, the living power of the divine feminine. Walk with Maa to soften into compassion, open the hand in gratitude, and stand under Her protection.",
    focus: [
      { title: "Compassion", blurb: "Meet yourself and others with a mother's unhurried patience." },
      { title: "Abundance", blurb: "Gratitude opens the hand; what is shared returns manifold." },
      { title: "Protection", blurb: "Invoke Her shakti when afraid; courage is grace made personal." },
    ],
    practices: [
      { to: "festivals", label: "Festivals", sub: "Observe Navratri and Devi parvs", icon: "solar:calendar-mark-bold-duotone" },
      { to: "mandir", label: "My Mandir", sub: "Offer flowers to the Mother", icon: "game-icons:temple-gate" },
    ],
  },
];

/* A book/scripture tile for the Gita, kept in the same shape and framing as the
   DeityGlyph so the row of paths reads as one set. */
function BookTile({ color, size = 46 }: { color: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 30%, ${color}2b, var(--surface-2) 74%)`,
        border: "1px solid var(--line-gold)",
      }}
    >
      <Iconify icon="solar:book-bold-duotone" width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} style={{ color }} />
    </span>
  );
}

function PathMark({ path, size = 46 }: { path: Path; size?: number }) {
  if (path.book) return <BookTile color={path.accent} size={size} />;
  return <DeityGlyph deity={path.deity} size={size} />;
}

export function PathsScreen() {
  const { back, go, haptic } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  // Paths the seeker has begun — a quiet badge on the card, a settled state on
  // the detail's Begin button.
  const [started, setStarted] = useState<Record<string, boolean>>({});

  const open = PATHS.find((p) => p.id === openId) ?? null;

  /* ------------------------------ DETAIL ------------------------------ */
  if (open) {
    const isStarted = !!started[open.id];
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader
          title={open.name}
          sub="Divine Path"
          onBack={() => { setOpenId(null); haptic(8); }}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
          <div className="gutter pt-4 lg:mx-auto lg:max-w-2xl">

            {/* hero — the path's identity, washed in its own jewel tone */}
            <div
              className="relative overflow-hidden rounded-2xl p-5"
              style={{
                background: `linear-gradient(157deg, ${open.accent}22, ${open.accent}0a 52%, var(--surface))`,
                border: "1px solid var(--line-gold)",
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
                style={{ background: `${open.accent}14` }}
              />
              <div className="relative flex items-center gap-3.5">
                <PathMark path={open} size={56} />
                <div className="min-w-0">
                  <div className="font-deva text-[20px] leading-none" style={{ color: open.accent }}>{open.deva}</div>
                  <h2 className="mt-1 font-display text-[18px] leading-tight text-ink">{open.name}</h2>
                </div>
              </div>
              <p className="relative mt-4 text-[13px] leading-relaxed text-ink-dim measure">{open.intro}</p>
            </div>

            {/* focus areas — the three pillars, each with a short passage */}
            <h3 className="section-title mb-2.5 mt-6">Focus areas</h3>
            <div className="space-y-2.5">
              {open.focus.map((f, i) => (
                <div key={f.title} className="rounded-2xl surface p-4">
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full font-display text-[12px]"
                      style={{ background: `${open.accent}1f`, color: open.accent }}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-ink">{f.title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted measure">{f.blurb}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* practices — real screens the seeker can step into right now */}
            <h3 className="section-title mb-2.5 mt-6">Practices on this path</h3>
            <div className="overflow-hidden rounded-2xl surface">
              {open.practices.map((pr, i) => (
                <button
                  key={pr.to + pr.label}
                  onClick={() => { haptic(10); go(pr.to); }}
                  className={cx(
                    "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]",
                    i > 0 && "border-t border-[var(--line)]",
                  )}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--line-gold)" }}
                  >
                    <Iconify icon={pr.icon} width={20} height={20} className="text-[var(--icon-ink)]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-ink">{pr.label}</div>
                    <div className="truncate text-[11.5px] text-muted">{pr.sub}</div>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-muted" />
                </button>
              ))}
            </div>

            {/* begin — a vow to walk this path */}
            <button
              onClick={() => { setStarted((s) => ({ ...s, [open.id]: true })); haptic([14, 40, 14]); }}
              className={cx(
                "mt-6 w-full rounded-2xl py-3.5 text-center text-[13px]",
                isStarted ? "btn-ghost" : "btn-saffron",
              )}
            >
              {isStarted ? "You are walking this path" : `Begin the ${open.name}`}
            </button>
            {isStarted && (
              <p className="mt-2 text-center text-[11px] text-muted">
                Sankalp taken · return each day to the practices above
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- LIST ------------------------------- */
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Divine Paths" onBack={back} />

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        <div className="gutter pt-4 lg:mx-auto lg:max-w-3xl">
          <div className="mb-4">
            <div className="eyebrow text-gold">देव मार्ग</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted measure">
              Deity-led tracks that gather your daily sadhana around one focus. Choose a path and let its practices lead you.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PATHS.map((p) => {
              const isStarted = !!started[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => { setOpenId(p.id); haptic(8); }}
                  className="group relative overflow-hidden rounded-2xl p-4 text-left transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)]"
                  style={{
                    background: `linear-gradient(156deg, ${p.accent}1c, ${p.accent}06 54%, var(--surface))`,
                    border: "1px solid var(--line-gold)",
                  }}
                >
                  {/* a faint orb in the path's tone */}
                  <div
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full"
                    style={{ background: `${p.accent}12` }}
                  />

                  <div className="relative flex items-center gap-3">
                    <PathMark path={p} size={46} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-display text-[15px] leading-tight text-ink">{p.name}</h3>
                        <span className="font-deva text-[13px] leading-none" style={{ color: p.accent }}>{p.deva}</span>
                      </div>
                      {isStarted && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: p.accent }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.accent }} />
                          In progress
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="relative mt-3 text-[12px] leading-relaxed text-ink-dim">{p.essence}</p>

                  <div className="relative mt-3 flex flex-wrap gap-1.5">
                    {p.focus.map((f) => (
                      <span
                        key={f.title}
                        className="rounded-full px-2.5 py-1 text-[10.5px] font-medium"
                        style={{
                          background: `${p.accent}12`,
                          color: p.accent,
                          border: `1px solid ${p.accent}2b`,
                        }}
                      >
                        {f.title}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
