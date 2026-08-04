"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CaretDown, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader } from "../ui";
import { Iconify } from "../iconify";

/* ────────────────────────────────────────────────────────────────
   Bhagavad Gita — the Verse Experience.

   Each verse is revealed through six layers: the Sanskrit itself, a
   clear translation, a plain-words reading, one thing to try today,
   what the three great acharyas said, and where the verse lands in a
   modern life. The Sanskrit sits in a gold-framed card styled after a
   printed scripture page; the softer layers open as an accordion so
   the reader takes the verse one breath at a time.
   ──────────────────────────────────────────────────────────────── */

// Almanac palette — the same gold/cream/kumkum a printed panchang or
// pothi carries, so the verse reads as scripture, not as a UI card.
const GOLD = "#B98A2E", GOLD_D = "#9A6B1E", INK_M = "#5A2A14", INK_S = "#8a5a2a";
const LINE = "rgba(185,138,46,.35)", CREAM = "#F4E4BE";

type Acharya = { name: string; line: string };
type Modern = { area: string; line: string };

type Verse = {
  id: string;          // chip label, e.g. "2.47"
  ref: string;         // "Chapter 2 · Verse 47"
  theme: string;       // one-line theme
  deva: string[];      // Sanskrit lines (Devanagari)
  translit: string[];  // transliteration lines
  translation: string; // clear English
  simple: string;      // plain, kind reading
  today: string;       // one concrete thing to do
  acharyas: Acharya[]; // Shankara, Ramanuja, Madhva
  modern: Modern[];    // career / relationships / mind
};

const VERSES: Verse[] = [
  {
    id: "2.47",
    ref: "Chapter 2 · Verse 47",
    theme: "Do your work; release the fruit",
    deva: [
      "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
      "मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    ],
    translit: [
      "karmaṇy-evādhikāras te mā phaleṣu kadācana",
      "mā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
    ],
    translation:
      "You have a right to your actions alone, never to their fruits. Do not let the fruit be your motive, and do not be attached to inaction either.",
    simple:
      "Your effort is truly yours; the result never fully is — it also depends on time, others, and grace. So give the work your whole heart, but hold the outcome loosely. And don't swing the other way into doing nothing; the answer isn't to stop caring, it's to care without clinging.",
    today:
      "Pick one task today — an email, a workout, a difficult conversation — and do it as well as you can with no bargain attached to how it turns out. Notice how much lighter the doing feels when the result isn't riding on your shoulders.",
    acharyas: [
      { name: "Adi Shankaracharya", line: "Your claim is on the deed, not on its reward; craving the fruit only binds the doer to the wheel of action." },
      { name: "Ramanujacharya", line: "Act as loving service, offering the result to the Lord — then work is worship, not a wage you are owed." },
      { name: "Madhvacharya", line: "The fruit rests in the Lord's hands, not yours; do your duty and trust the giver to give rightly." },
    ],
    modern: [
      { area: "Career", line: "Focus on the quality of your work, not on the promotion — control the input, let the recognition follow." },
      { area: "Relationships", line: "Give love and honesty freely without keeping score of what returns to you." },
      { area: "Mental health", line: "Anxiety often lives in the gap between effort and outcome; guarding only the effort quiets it." },
    ],
  },
  {
    id: "2.48",
    ref: "Chapter 2 · Verse 48",
    theme: "Steadiness is the real yoga",
    deva: [
      "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
      "सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    ],
    translit: [
      "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya",
      "siddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate",
    ],
    translation:
      "Established in yoga, perform your actions, O Arjuna, abandoning attachment and remaining even-minded in success and failure. This evenness of mind is called yoga.",
    simple:
      "Do your work from a steady, settled place inside — not tossed up by a win or crushed by a loss. That inner balance, holding the same calm whether things go your way or not, is itself the practice. Yoga here isn't a posture; it's a temperament you carry into everything you do.",
    today:
      "The next time something goes right and the next time something goes wrong today, pause for one breath before you react. Aim to meet both with the same steady face. That single even breath is a rep of the real yoga.",
    acharyas: [
      { name: "Adi Shankaracharya", line: "Evenness of mind toward gain and loss is yoga; acting from that balance purifies the heart for knowledge." },
      { name: "Ramanujacharya", line: "Stay poised in devotion while you act, unshaken by results, and the act itself becomes a path to the Divine." },
      { name: "Madhvacharya", line: "Equanimity comes from knowing the Lord orders all outcomes; resting in that, one works without agitation." },
    ],
    modern: [
      { area: "Career", line: "Ride neither the high of a big win nor the low of a setback — steady operators outlast the spikes." },
      { area: "Relationships", line: "Meet good days and hard days with the same reliable presence; consistency is what people trust." },
      { area: "Mental health", line: "Emotional balance isn't feeling nothing — it's not being swept away, and it can be practised one breath at a time." },
    ],
  },
  {
    id: "4.7",
    ref: "Chapter 4 · Verse 7",
    theme: "When goodness fades, the Divine returns",
    deva: [
      "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।",
      "अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥",
    ],
    translit: [
      "yadā yadā hi dharmasya glānir bhavati bhārata",
      "abhyutthānam adharmasya tadātmānaṁ sṛjāmy aham",
    ],
    translation:
      "Whenever righteousness declines and unrighteousness rises, O Bharata, then I manifest Myself.",
    simple:
      "Whenever what is right grows weak and what is wrong grows loud, the Divine doesn't stay distant — it steps into the world to set things right again. It's a promise that darkness is never the final word; goodness always finds a way to return, again and again, however long it takes.",
    today:
      "Look for the one small place today where you can be the return of goodness — a fair word, an honest choice, a stand for someone who can't stand for themselves. You don't have to fix the whole world; you just have to restore a little balance where you are.",
    acharyas: [
      { name: "Adi Shankaracharya", line: "The Lord, ever free, takes on form through His own power to protect dharma when it wanes." },
      { name: "Ramanujacharya", line: "Out of love for His devotees the Supreme descends in real form, not illusion, to be near and to rescue." },
      { name: "Madhvacharya", line: "The Lord's descents are full and real, undertaken to uphold the righteous and restore the moral order." },
    ],
    modern: [
      { area: "Career", line: "When a team or culture drifts, someone has to model integrity first — let that person be you." },
      { area: "Relationships", line: "When trust frays, a single honest, repairing gesture can turn the tide back toward good." },
      { area: "Mental health", line: "In your lowest seasons, hold the faith that the balance restores itself — no down phase is permanent." },
    ],
  },
  {
    id: "18.66",
    ref: "Chapter 18 · Verse 66",
    theme: "Let go, take refuge, do not grieve",
    deva: [
      "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।",
      "अहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥",
    ],
    translit: [
      "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja",
      "ahaṁ tvāṁ sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    ],
    translation:
      "Abandon all varieties of duty and simply surrender unto Me alone. I shall free you from all sins; do not grieve.",
    simple:
      "After all the teaching, the final word is tender: stop carrying the whole weight alone. Set down the endless list of what you must be and do, and simply hand your heart to the Divine in trust. 'I will take care of you — do not grieve' is a parent's promise, not a demand. Surrender here isn't defeat; it's rest.",
    today:
      "Name the one worry you've been gripping too tightly, and consciously set it down today — a breath, a prayer, a quiet 'I trust this to You.' Then act on what's actually yours to do, and leave the rest in kinder hands than your own.",
    acharyas: [
      { name: "Adi Shankaracharya", line: "Give up the sense of doership in all duties and rest in the Self; that knowing dissolves all bondage." },
      { name: "Ramanujacharya", line: "Take total refuge in the Lord as the sole means; He Himself becomes your deliverance — this is prapatti, loving surrender." },
      { name: "Madhvacharya", line: "Surrender fully to the supreme Lord, dependent on Him alone, and He lifts the devotee beyond all sin." },
    ],
    modern: [
      { area: "Career", line: "You cannot control every variable — do your part fully, then release the outcome and stop bracing for it." },
      { area: "Relationships", line: "Some things aren't yours to fix; trusting and letting go can heal what gripping tighter never will." },
      { area: "Mental health", line: "'Do not grieve' is permission to lay the burden down — surrender, here, is the deepest kind of rest." },
    ],
  },
];

/* An open gold rule with a diamond centre — the divider a pothi uses. */
function GoldRule() {
  return (
    <div className="flex items-center justify-center gap-2" style={{ color: GOLD }}>
      <span className="h-px w-14" style={{ background: LINE }} />
      <span className="text-[10px] leading-none">◆</span>
      <span className="h-px w-14" style={{ background: LINE }} />
    </div>
  );
}

/* One accordion layer: a titled row with a kumkum icon and a caret that
   opens to reveal its body. */
function Layer({
  icon,
  title,
  sub,
  open,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left"
      >
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
        >
          <Iconify icon={icon} width={19} className="text-[var(--icon-ink)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium leading-tight text-ink">{title}</span>
          <span className="mt-0.5 block truncate text-[11px] leading-tight text-muted">{sub}</span>
        </span>
        <CaretDown
          size={16}
          weight="bold"
          className="shrink-0 text-[var(--muted-2)] transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 pt-0">
          {children}
        </div>
      )}
    </div>
  );
}

/* The full Gita — chapters + all 700 verses (Sanskrit, transliteration, English
   & Hindi) — is bundled at /public/gita.json and fetched on open. The four
   authored verses above stay as the "Go deeper" experience where they match. */
type GVerse = { s: string; t: string; e: string; h: string };
type GChapter = { n: number; count: number; deva: string; name: string; meaning: string };
type GitaData = { chapters: GChapter[]; verses: Record<string, GVerse> };

/* Turn the source's danda pipes into clean Devanagari punctuation. */
function cleanShlok(s: string): string {
  return s.replace(/\s*\|\|[^|]*\|\|\s*/g, " ॥").replace(/\s*\|\s*/g, " । ").trim();
}

export function GitaScreen() {
  const { back, haptic } = useApp();
  const [data, setData] = useState<GitaData | null>(null);
  const [ch, setCh] = useState(2);
  const [v, setV] = useState(47);
  const [open, setOpen] = useState<string | null>("simple");

  useEffect(() => {
    let on = true;
    fetch("/gita.json").then((r) => r.json()).then((d: GitaData) => { if (on) setData(d); }).catch(() => {});
    return () => { on = false; };
  }, []);

  const chapter = data?.chapters.find((c) => c.n === ch) ?? null;
  const gv = data?.verses[`${ch}.${v}`] ?? null;
  const deep = VERSES.find((x) => x.id === `${ch}.${v}`) ?? null;

  const pickChapter = (n: number) => { haptic(6); setCh(n); setV(1); setOpen("simple"); };
  const pickVerse = (n: number) => { haptic(6); setV(n); setOpen("simple"); };
  const toggle = (key: string) => { haptic(5); setOpen((cur) => (cur === key ? null : key)); };
  const step = (dir: number) => {
    if (!data) return;
    const cur = data.chapters.find((c) => c.n === ch);
    if (!cur) return;
    let nc = ch, nv = v + dir;
    if (nv < 1) { nc = ch - 1; if (nc < 1) return; nv = data.chapters.find((c) => c.n === nc)!.count; }
    else if (nv > cur.count) { nc = ch + 1; if (nc > data.chapters.length) return; nv = 1; }
    haptic(6); setCh(nc); setV(nv); setOpen("simple");
  };

  const chipStyle = (on: boolean) =>
    on
      ? { background: GOLD, color: "#fff", fontWeight: 500 as const }
      : { background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--line)" };

  const shlokLines = gv?.s ? cleanShlok(gv.s).split("\n").map((l) => l.trim()).filter(Boolean) : [];
  const translitLines = gv?.t ? gv.t.replace(/\s*\|\|[^|]*\|\|\s*/g, "").split("\n").map((l) => l.trim()).filter(Boolean) : [];

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Gita Wisdom" sub="श्रीमद्भगवद्गीता" onBack={back} />

      {/* chapter + verse filter — rectangular chips riding under the header */}
      <div className="shrink-0 gutter pt-2 lg:mx-auto lg:w-full lg:max-w-5xl">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Adhyaya</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {(data?.chapters ?? []).map((c) => (
              <button key={c.n} onClick={() => pickChapter(c.n)} className="shrink-0 rounded-md px-2.5 py-1 text-[12px] tnum transition-colors" style={chipStyle(c.n === ch)}>{c.n}</button>
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex items-center gap-2 pb-2">
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.14em] text-ink">Shloka</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {Array.from({ length: chapter?.count ?? 0 }).map((_, i) => {
              const nv = i + 1;
              return <button key={nv} onClick={() => pickVerse(nv)} className="shrink-0 rounded-md px-2.5 py-1 text-[12px] tnum transition-colors" style={chipStyle(nv === v)}>{nv}</button>;
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        <div className="gutter pt-1 lg:mx-auto lg:max-w-5xl">
          {/* chapter line + prev/next */}
          {chapter && (
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0 truncate">
                <span className="font-deva text-[12px]" style={{ color: GOLD_D }}>{chapter.deva}</span>
                <span className="ml-2 text-[12px] text-muted">Ch {chapter.n} · {chapter.name}{chapter.meaning ? ` — ${chapter.meaning}` : ""}</span>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => step(-1)} aria-label="Previous verse" className="grid h-8 w-8 place-items-center rounded-md surface"><CaretLeft size={14} weight="bold" className="text-ink" /></button>
                <button onClick={() => step(1)} aria-label="Next verse" className="grid h-8 w-8 place-items-center rounded-md surface"><CaretRight size={14} weight="bold" className="text-ink" /></button>
              </div>
            </div>
          )}

          {!data && <div className="py-16 text-center text-[12.5px] text-muted">Opening the Gita…</div>}

          {gv && (
            <div className="lg:flex lg:items-start lg:gap-6">
              {/* left — scripture frame + art */}
              <div className="mt-1 lg:flex-1 lg:min-w-0">
                <div className="relative overflow-hidden rounded-2xl" style={{ background: CREAM, border: `1.5px solid ${GOLD}`, boxShadow: "inset 0 0 0 3px rgba(185,138,46,.16)" }}>
                  <div className="pointer-events-none absolute inset-[7px] rounded-[13px]" style={{ border: "1px solid rgba(185,138,46,.5)" }} />
                  {(["left-[10px] top-[9px]", "right-[10px] top-[9px]", "left-[10px] bottom-[9px]", "right-[10px] bottom-[9px]"] as const).map((pos) => (
                    <span key={pos} className={`pointer-events-none absolute ${pos} text-[11px] leading-none`} style={{ color: GOLD }}>✦</span>
                  ))}
                  <div className="pointer-events-none absolute inset-x-0 top-8 flex justify-center" style={{ opacity: 0.05 }}>
                    <span className="font-deva leading-none" style={{ color: GOLD, fontSize: 150 }}>ॐ</span>
                  </div>
                  <div className="relative px-5 pb-3 pt-6 text-center">
                    <div className="font-deva text-[10.5px]" style={{ color: INK_S }}>॥ श्रीमद्भगवद्गीता ॥</div>
                    <div className="mt-1.5 flex items-center justify-center gap-3">
                      <span className="font-deva text-[14px] leading-none" style={{ color: GOLD }}>ॐ</span>
                      <span className="text-[12px] uppercase tracking-[0.18em]" style={{ color: GOLD_D }}>Chapter {ch} · Verse {v}</span>
                      <span className="font-deva text-[14px] leading-none" style={{ color: GOLD }}>ॐ</span>
                    </div>
                    {(deep?.theme || chapter?.meaning) && (
                      <div className="mx-auto mt-1.5 max-w-[26ch] font-display text-[15px] leading-tight" style={{ color: INK_M }}>{deep?.theme ?? chapter?.meaning}</div>
                    )}
                  </div>
                  <div className="px-4 pb-1"><GoldRule /></div>
                  <div className="relative px-5 pb-5 pt-3 text-center">
                    <div className="font-deva leading-[2.05]" style={{ color: INK_M }}>
                      {shlokLines.map((line, i) => (<div key={i} className="text-[18px] lg:text-[21px]">{line}</div>))}
                    </div>
                    <div className="mt-3 space-y-0.5">
                      {translitLines.map((line, i) => (<div key={i} className="text-[11.5px] italic leading-relaxed" style={{ color: INK_S }}>{line}</div>))}
                    </div>
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gita-krishna-arjun.webp" alt="Krishna teaching Arjuna" className="mx-auto mt-5 block w-full max-w-xs object-contain lg:mt-6 lg:max-w-sm" />
              </div>

              {/* right — one common block: translation (+ Hindi) + deep layers when authored */}
              <div className="mt-4 lg:mt-1 lg:flex-1 lg:min-w-0">
                <div className="overflow-hidden rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--line-card)" }}>
                  <div className="px-4 pb-2 pt-3.5">
                    <div className="text-[15px] font-semibold text-ink">Translation</div>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink">{gv.e || "—"}</p>
                  </div>
                  {gv.h && (
                    <div className="px-4 pb-3.5 pt-0">
                      <div className="text-[15px] font-semibold text-ink">अर्थ</div>
                      <p className="mt-1 font-deva text-[13px] leading-relaxed text-ink">{gv.h}</p>
                    </div>
                  )}
                  {deep && (
                    <>
                      <div className="px-4 pb-0.5 pt-2.5">
                        <h3 className="section-title">Go deeper</h3>
                      </div>
                      <Layer icon="solar:heart-bold-duotone" title="In simple words" sub="A plain, kind reading" open={open === "simple"} onToggle={() => toggle("simple")}>
                        <p className="text-[13px] leading-relaxed text-ink">{deep.simple}</p>
                      </Layer>
                      <Layer icon="solar:sun-bold-duotone" title="Use it today" sub="One thing to try" open={open === "today"} onToggle={() => toggle("today")}>
                        <p className="text-[13px] leading-relaxed text-ink">{deep.today}</p>
                      </Layer>
                      <Layer icon="solar:book-2-bold-duotone" title="What the acharyas say" sub="Shankara · Ramanuja · Madhva" open={open === "acharyas"} onToggle={() => toggle("acharyas")}>
                        <div className="space-y-3">
                          {deep.acharyas.map((a) => (
                            <div key={a.name} className="flex gap-3">
                              <span className="mt-1 h-full w-[2px] shrink-0 rounded-full" style={{ background: LINE, minHeight: 34 }} />
                              <div>
                                <div className="text-[11.5px] font-medium" style={{ color: GOLD_D }}>{a.name}</div>
                                <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{a.line}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Layer>
                      <Layer icon="solar:compass-bold-duotone" title="For your life now" sub="Career · relationships · mind" open={open === "modern"} onToggle={() => toggle("modern")}>
                        <div className="space-y-2.5">
                          {deep.modern.map((m) => (
                            <div key={m.area}>
                              <div className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted-2)]">{m.area}</div>
                              <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink">{m.line}</p>
                            </div>
                          ))}
                        </div>
                      </Layer>
                    </>
                  )}
                </div>

                <div className="mt-5 flex flex-col items-center gap-1.5">
                  <GoldRule />
                  <div className="mt-1 font-deva text-[11px]" style={{ color: INK_S }}>॥ हरिः ॐ तत् सत् ॥</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
