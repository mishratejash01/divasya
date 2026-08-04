"use client";

import { useState } from "react";
import { ArrowRight, CaretLeft, Check, Lock } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, ScreenHeader } from "../ui";

/* ------------------------------------------------------------------ *
 * Divine Transformation Journeys — structured multi-day sadhana.
 *
 * A journey is a fixed run of days; each day carries a few titled parts
 * whose labels differ by journey (a Hanuman day has a Story, a Gita day
 * a Verse, a Shiva day a Practice). Content is seeded here to show the
 * shape of the feature; progress is kept in component state so marking a
 * day complete moves the ring in real time.
 * ------------------------------------------------------------------ */

type Part = { label: string; text: string };
type Journey = {
  id: string;
  title: string;
  deva: string; // devanagari subtitle
  deityId: string; // for the portrait medallion
  accent: string; // warm, deity-appropriate accent
  soft: string; // faint wash of the accent
  days: number;
  promise: string; // one-line invitation
  mantra: string; // a short sacred line
  seedDone: number; // days already completed on open
  dayTitles: string[]; // one real title per day
  details: Record<number, Part[]>; // authored parts, 1-indexed
};

const JOURNEYS: Journey[] = [
  {
    id: "hanuman",
    title: "21-Day Hanuman Courage",
    deva: "॥ हनुमान साधना ॥",
    deityId: "hanuman",
    accent: "#C0561F",
    soft: "rgba(192,86,31,0.09)",
    days: 21,
    promise: "Three weeks to trade fear for the fearless heart of Bajrangbali.",
    mantra: "ॐ हं हनुमते नमः",
    seedDone: 4,
    dayTitles: [
      "The First Step of Faith",
      "Naming Your Fear",
      "The Strength You Forgot",
      "Rising Before the Sun",
      "Seva Without Reward",
      "Crossing the Ocean",
      "Facing the Mountain",
      "The Calm in the Storm",
      "Devotion as Armour",
      "Lifting Others",
      "The Unshaken Mind",
      "Burning Away Doubt",
      "The Patience of the Brave",
      "The Roar Within",
      "Carrying the Whole Mountain",
      "The Humility of the Mighty",
      "When the Path Narrows",
      "The Heart of a Servant",
      "Fear Bows to Faith",
      "The Courage to Begin Again",
      "Ram in Every Breath",
    ],
    details: {
      1: [
        { label: "Story", text: "Before he leapt the ocean, Hanuman had forgotten his own power — until Jambavan reminded him who he was. Courage often begins with remembering." },
        { label: "Reflection", text: "What would you attempt today if you truly believed in your own strength?" },
        { label: "Meditation", text: "Sit five minutes. Breathing in, say 'Ram' within; breathing out, let your shoulders fall." },
        { label: "Action", text: "Do one small thing you have been avoiding out of fear. Only one." },
      ],
      2: [
        { label: "Story", text: "At Lanka's gate stood Lankini, the guardian of doubt. Hanuman did not argue — one steady blow, and the way opened." },
        { label: "Reflection", text: "Name the fear you meet most often. Named aloud, it loses half its size." },
        { label: "Meditation", text: "Picture the fear as a shape before you. Watch it grow smaller with every exhale." },
        { label: "Action", text: "Write one fear on paper. Read it once, then tear it up." },
      ],
      3: [
        { label: "Story", text: "The vanaras despaired at the sea's width. Hanuman alone grew until the ocean looked small — strength is a decision before it is a deed." },
        { label: "Reflection", text: "Where are you shrinking yourself to fit a fear that is smaller than you?" },
        { label: "Meditation", text: "Sit tall. With each breath imagine your chest filling with warm light, steady as a flame in still air." },
        { label: "Action", text: "Say yes to one thing today that your fear would refuse." },
      ],
      4: [
        { label: "Story", text: "Rising in the dark, Hanuman would chant Ram's name before the world awoke. The bravest hours are the quiet ones no one sees." },
        { label: "Reflection", text: "What would change if the first thing you touched each morning was your practice, not your phone?" },
        { label: "Meditation", text: "Before speaking to anyone today, take eleven slow breaths with the name 'Ram'." },
        { label: "Action", text: "Wake fifteen minutes earlier and sit in silence before the day claims you." },
      ],
      5: [
        { label: "Story", text: "Hanuman crossed the ocean, found Sita, and asked for nothing. His strength was never for himself — it was seva, service offered as worship." },
        { label: "Reflection", text: "Courage grown for your own sake tires quickly. Courage grown to serve never runs dry. Whom does yours serve?" },
        { label: "Meditation", text: "Sit ten minutes. On each breath, silently offer your day's effort: 'This is for you, Prabhu.'" },
        { label: "Action", text: "Help one person today without letting them know it was you." },
      ],
    },
  },
  {
    id: "gita",
    title: "28-Day Bhagavad Gita",
    deva: "॥ श्रीमद्भगवद्गीता ॥",
    deityId: "krishna",
    accent: "#3E6B8A",
    soft: "rgba(62,107,138,0.09)",
    days: 28,
    promise: "One verse a day — Krishna's counsel on Kurukshetra, walked into your own life.",
    mantra: "ॐ नमो भगवते वासुदेवाय",
    seedDone: 0,
    dayTitles: [
      "Arjuna's Doubt, Your Doubt",
      "The Eternal Self",
      "Action Without Attachment",
      "The Fire of Knowledge",
      "Renunciation and Work",
      "Steadying the Mind",
      "Knowing the Divine",
      "The Imperishable",
      "The Royal Secret",
      "Divine Glories",
      "The Cosmic Vision",
      "The Path of Love",
      "The Field and the Knower",
      "The Three Gunas",
      "The Eternal Tree",
      "Divine and Demonic",
      "Three Kinds of Faith",
      "Steadiness in Loss",
      "Duty as Worship",
      "The Witness Within",
      "Praise and Blame Alike",
      "Mastering Desire",
      "Faith That Steadies",
      "The Mind as Friend",
      "Seeing the One in All",
      "Letting Go of the Fruit",
      "Surrender and Peace",
      "The Song Made Yours",
    ],
    details: {
      1: [
        { label: "Verse", text: "\"Whence has this weakness come upon you at this critical hour?\" (2.2) — Krishna meets Arjuna's collapse not with pity but with a question." },
        { label: "Podcast", text: "Listen · 'When the Bow Slips from Our Hands' (9 min)" },
        { label: "Challenge", text: "Notice the one moment today you want to put your 'bow' down. Stay in it a breath longer." },
        { label: "Journal", text: "What battle am I asking to be excused from? What is it really costing me?" },
      ],
      2: [
        { label: "Verse", text: "\"The wise grieve neither for the living nor the dead. Never was there a time I was not.\" (2.11–12)" },
        { label: "Podcast", text: "Listen · 'The Part of You Nothing Can Touch' (11 min)" },
        { label: "Challenge", text: "When something rattles you today, ask: does this reach the self, or only the surface?" },
        { label: "Journal", text: "Name one thing I feared losing that, looked at closely, was never truly me." },
      ],
      3: [
        { label: "Verse", text: "\"You have a right to your action, never to its fruits.\" (2.47) — the whole Gita folded into a single line." },
        { label: "Podcast", text: "Listen · 'Nishkaam Karma, in a Traffic Jam' (10 min)" },
        { label: "Challenge", text: "Do one task today fully, then release the outcome the moment it leaves your hands." },
        { label: "Journal", text: "Where does my peace depend on a result I cannot control?" },
      ],
      4: [
        { label: "Verse", text: "\"As a kindled fire reduces wood to ashes, the fire of knowledge burns all karma to ash.\" (4.37)" },
        { label: "Podcast", text: "Listen · 'What Understanding Dissolves' (12 min)" },
        { label: "Challenge", text: "Catch one old story you tell about yourself and question whether it is still true." },
        { label: "Journal", text: "Which belief have I outgrown but still obey out of habit?" },
      ],
      5: [
        { label: "Verse", text: "\"He who works without attachment, offering his deeds to the Divine, is untouched by sin as a lotus leaf by water.\" (5.10)" },
        { label: "Podcast", text: "Listen · 'The Lotus Leaf Mind' (10 min)" },
        { label: "Challenge", text: "Offer your busiest hour today silently to Krishna before you begin it." },
        { label: "Journal", text: "What would my work feel like if each task were a small offering, not a demand?" },
      ],
    },
  },
  {
    id: "shiva",
    title: "40-Day Shiva Sadhana",
    deva: "॥ महादेव साधना ॥",
    deityId: "shiva",
    accent: "#6E5E8A",
    soft: "rgba(110,94,138,0.10)",
    days: 40,
    promise: "Forty days of stillness — dissolving, one layer at a time, into the calm of Kailash.",
    mantra: "ॐ नमः शिवाय",
    seedDone: 0,
    dayTitles: [
      "Stillness", "The Breath", "Letting Go", "The Witness", "Silence",
      "Ash and Impermanence", "The Inner Flame", "Dissolving the Ego", "The Sound of Om", "Emptiness",
      "Detachment", "The Third Eye", "Cool Moonlight", "Acceptance", "The Mountain Mind",
      "Non-Doing", "Between Two Thoughts", "Fearlessness", "The Eternal Now", "Surrender to Shakti",
      "The Dance of Change", "Solitude", "The Poison You Hold", "Grace", "The Formless",
      "Contentment", "The Silent Guru", "Watching Desire Pass", "The Unmoved Centre", "Compassion Unbound",
      "The Night of Shiva", "Dropping the Story", "Pure Presence", "The Sacred Ordinary", "Dissolving Edges",
      "The Light of Awareness", "Wholeness", "The Return to Source", "Boundless Peace", "You Are That",
    ],
    details: {
      1: [
        { label: "Theme", text: "Stillness — before the universe stirred, there was Shiva, unmoving. Everything you seek grows in quiet, not in noise." },
        { label: "Practice", text: "Sit ten minutes without adjusting, without reaching for anything. Let 'ॐ नमः शिवाय' rise and fall on its own." },
      ],
      2: [
        { label: "Theme", text: "The Breath — Shiva's first gift to a seeker is the breath itself, the bridge between the body and the boundless." },
        { label: "Practice", text: "Follow the breath at the tip of the nose for twelve rounds. When the mind wanders, return without blame." },
      ],
      3: [
        { label: "Theme", text: "Letting Go — Mahadev holds the whole cosmos yet clings to nothing. To carry lightly is its own kind of power." },
        { label: "Practice", text: "On each out-breath, silently set down one thing you are gripping — a worry, a wish, a grudge." },
      ],
      4: [
        { label: "Theme", text: "The Witness — the Mahayogi watches all that arises without being moved by it. You are the sky, not the passing weather." },
        { label: "Practice", text: "For ten minutes, name each thought softly — 'thinking' — and let it drift past like cloud over Kailash." },
      ],
      5: [
        { label: "Theme", text: "Silence — Shiva's deepest teaching was given in stillness, guru to disciple, without a single word." },
        { label: "Practice", text: "Keep five minutes of complete outer and inner silence. Do nothing. Seek nothing. Simply be present." },
      ],
    },
  },
];

/* A small progress ring drawn in the journey's accent. */
function Ring({ done, total, accent, size = 46 }: { done: number; total: number; accent: string; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={accent} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-[12px] font-medium tnum" style={{ color: accent }}>{done}</span>
      </div>
    </div>
  );
}

export function JourneysScreen() {
  const { back, haptic } = useApp();
  const [openId, setOpenId] = useState<string | null>(null);
  // Progress lives here so "mark complete" moves the ring immediately.
  const [progress, setProgress] = useState<Record<string, number>>(
    () => Object.fromEntries(JOURNEYS.map((j) => [j.id, j.seedDone])),
  );
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const journey = openId ? JOURNEYS.find((j) => j.id === openId) ?? null : null;

  /* ---------------- LIST ---------------- */
  if (!journey) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title="Transformation Journeys" onBack={back} />
        <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
          <div className="gutter pt-3 lg:mx-auto lg:max-w-2xl">
            <h2 className="font-display text-[17px] font-medium leading-tight text-ink lg:text-[19px]">Guided sadhana, one day at a time</h2>

            <div className="mt-3.5 space-y-3">
              {JOURNEYS.map((j) => {
                const done = progress[j.id];
                const started = done > 0;
                return (
                  <button
                    key={j.id}
                    onClick={() => { haptic(8); setOpenId(j.id); setExpandedDay(Math.min(done + 1, j.days)); }}
                    className="block w-full rounded-xl p-4 text-left card-temple"
                  >
                    <div className="flex items-start gap-3.5">
                      <DeityGlyph deity={{ id: j.deityId, color: j.accent }} size={52} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="rounded-full px-2 py-0.5 text-[9.5px] font-medium tnum" style={{ background: j.soft, color: j.accent }}>
                            {j.days} days
                          </span>
                          {started && <span className="text-[10px] text-muted tnum">Day {done + 1} of {j.days}</span>}
                        </div>
                        <div className="mt-1 font-display text-[19px] font-medium leading-tight text-ink lg:text-[21px]">{j.title}</div>
                        <div className="mt-0.5 font-deva text-[12px]" style={{ color: j.accent }}>{j.mantra}</div>
                      </div>
                      <Ring done={done} total={j.days} accent={j.accent} />
                    </div>

                    <p className="mt-3 text-[11.5px] leading-relaxed text-muted">{j.promise}</p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10.5px] text-muted">{started ? `${Math.round((done / j.days) * 100)}% complete` : "Not started"}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[11.5px] btn-saffron">
                        {started ? "Continue" : "Begin"}
                        <ArrowRight size={13} weight="bold" />
                      </span>
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

  /* ---------------- DETAIL ---------------- */
  const done = progress[journey.id];
  const current = Math.min(done + 1, journey.days);
  const finished = done >= journey.days;
  const pct = Math.round((done / journey.days) * 100);

  const beginToday = () => {
    haptic(10);
    setExpandedDay(current);
  };
  const markComplete = () => {
    haptic([12, 40, 12]);
    setProgress((p) => ({ ...p, [journey.id]: Math.min(p[journey.id] + 1, journey.days) }));
    setExpandedDay(null);
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={journey.title}
        sub={`${journey.deva} · Day ${current} of ${journey.days}`}
        onBack={() => { setOpenId(null); setExpandedDay(null); }}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        <div className="gutter pt-3 lg:mx-auto lg:max-w-2xl">
          {/* back-to-list + deity header */}
          <button onClick={() => { setOpenId(null); setExpandedDay(null); }} className="mb-3 inline-flex items-center gap-1 text-[11px] text-muted">
            <CaretLeft size={12} weight="bold" /> All journeys
          </button>

          <div className="flex items-center gap-3.5 rounded-xl p-4 card-temple">
            <DeityGlyph deity={{ id: journey.deityId, color: journey.accent }} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-deva text-[13px]" style={{ color: journey.accent }}>{journey.mantra}</div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--line)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: journey.accent, transition: "width 0.5s ease" }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-muted tnum">
                <span>{done} of {journey.days} days</span>
                <span>{pct}%</span>
              </div>
            </div>
          </div>

          {/* day-by-day list */}
          <h3 className="section-title mb-1 mt-5">Your path</h3>
          <div>
            {journey.dayTitles.map((title, i) => {
              const day = i + 1;
              const isDone = day <= done;
              const isCurrent = day === current && !finished;
              const locked = day > current;
              const parts = journey.details[day];
              const expanded = expandedDay === day && !!parts;
              const openable = !locked && !!parts;

              return (
                <div key={day} className="flex gap-3">
                  {/* timeline rail — the node and the line to the next day */}
                  <div className="flex flex-col items-center">
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-medium tnum"
                      style={
                        isDone
                          ? { background: journey.accent, color: "#fff" }
                          : isCurrent
                            ? { background: "#fff", color: journey.accent, border: `2px solid ${journey.accent}` }
                            : { background: "var(--surface-2)", color: "var(--muted-2)", border: "1px solid var(--line)" }
                      }
                    >
                      {isDone ? <Check size={13} weight="bold" /> : locked ? <Lock size={11} weight="fill" /> : day}
                    </span>
                    {day < journey.dayTitles.length && (
                      <span
                        className="w-[2px] flex-1 rounded-full"
                        style={{ minHeight: 16, background: isDone ? journey.accent : "var(--line)", opacity: isDone ? 0.4 : 1 }}
                      />
                    )}
                  </div>

                  {/* the day itself */}
                  <div className="min-w-0 flex-1 pb-2">
                    <button
                      onClick={() => { if (openable) { haptic(6); setExpandedDay(expanded ? null : day); } }}
                      disabled={!openable}
                      className="flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left transition-colors disabled:cursor-default"
                      style={isCurrent ? { background: journey.soft } : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9.5px] uppercase tracking-[0.12em] text-[var(--muted-2)] tnum">Day {day}</span>
                          {isCurrent && <span className="rounded-[3px] px-1.5 py-px text-[8.5px] btn-saffron">Today</span>}
                        </div>
                        <div className={`mt-0.5 text-[13.5px] leading-tight ${locked ? "text-[var(--muted-2)]" : "text-ink"} ${isDone ? "font-normal" : "font-medium"}`}>
                          {title}
                        </div>
                      </div>
                      {parts && !expanded && (
                        <span className="mt-0.5 hidden shrink-0 text-[9.5px] text-[var(--muted-2)] sm:block">
                          {parts.map((p) => p.label).join(" · ")}
                        </span>
                      )}
                    </button>

                    {/* expanded parts */}
                    {expanded && parts && (
                      <div className="mt-1.5 pr-1">
                        <div className="space-y-3 rounded-xl p-3.5" style={{ background: "var(--surface)", border: "1px solid var(--line-gold)" }}>
                          {parts.map((p) => (
                            <div key={p.label}>
                              <div className="eyebrow" style={{ color: journey.accent }}>{p.label}</div>
                              <p className="mt-1 text-[12px] leading-relaxed text-ink">{p.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* sticky practice CTA */}
      <div
        className="shrink-0 gutter above-tabbar pt-2.5"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
      >
        <div className="lg:mx-auto lg:max-w-2xl">
          {finished ? (
            <div className="w-full rounded-2xl py-3.5 text-center text-[12.5px] font-medium" style={{ background: journey.soft, color: journey.accent }}>
              Journey complete · {journey.days} days of sadhana 🙏
            </div>
          ) : expandedDay === current ? (
            <button onClick={markComplete} className="w-full rounded-2xl py-3.5 text-[12.5px] btn-saffron">
              Mark Day {current} complete
            </button>
          ) : (
            <button onClick={beginToday} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[12.5px] btn-saffron">
              Begin today's practice
              <ArrowRight size={15} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
