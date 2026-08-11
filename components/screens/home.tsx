"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { IconEye, IconGanesha, IconLotus, IconShare } from "../icons";
import { useApp, type ScreenName } from "../app-context";
import { NAV, NAV_ORDER } from "../nav-map";
import { DeityPortrait, DevotionalIllustration, Logomark, cx, type DevotionalIllustrationName } from "../ui";
import { Iconify } from "../iconify";
import { usePanchang } from "@/lib/use-panchang";
import {
  useCatalog, getUpcomingFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope,
  Festival, Article, Shloka,
} from "@/lib/catalog";
import { rashiLabel } from "@/lib/astro";

let firedOnce = false;

type Block = {
  label: string;
  icon: string;
  art?: DevotionalIllustrationName;
  to: ScreenName;
  params?: Record<string, unknown>;
};

// Everything the app can do, grouped and surfaced on home.
//   stack — mark above the name, 3-up. For the two big sections, where the
//           tiles are the main way in and want presence.
//   row   — mark beside the name, 2-up. For the short utility list, where a
//           column of tall tiles would be all air.
// Home is a digest, not the directory. Each shelf shows the first few of its
// group and hands off to the category page for the rest — the full list lives
// in the Menu. Both read the same nav map, so they cannot disagree.
const SECTIONS: { title: string; tab: string; layout: "stack" | "row"; blocks: Block[] }[] =
  NAV_ORDER.map((id) => ({
    title: NAV[id].title,
    tab: id,
    // Every shelf reads the same way — a mark over the name, three to a row.
    // Guides used to be a row of pills; it now matches its neighbours.
    layout: "stack",
    // three fills the 3-up grid exactly, leaving no ragged last row.
    blocks: NAV[id].entries.slice(0, 3),
  }));

// Some tabs open their own page; some scroll to a section of this one. The
// chart, the astrology and devotion shelves, festivals and the guides are
// places worth leaving home for, so they navigate. Store and Library have their
// shelf right here, so they scroll to it — a tab with `to` navigates, a tab
// without it jumps to its section.
const TABS: { id: string; label: string; to?: ScreenName; params?: Record<string, unknown> }[] = [
  { id: "kundli", label: "My Kundli", to: "kundli" },
  { id: "astro", label: "Astro", to: "category", params: { id: "astro" } },
  { id: "devotion", label: "Devotion", to: "category", params: { id: "devotion" } },
  { id: "festival", label: "Festival", to: "festivals" },
  { id: "store", label: "Store" },
  { id: "tools", label: "Guides", to: "category", params: { id: "tools" } },
  { id: "library", label: "Library" },
];

// Poster verses. Unlike festival dates these are safe to hold locally: they are
// ancient, fixed and among the best known lines in the tradition, so there is
// nothing to go stale or to get wrong by a day.
const POSTERS: { deva: string; meaning: string; source: string; tint: [string, string] }[] = [
  {
    deva: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    meaning: "You have the right to action alone, never to its fruits.",
    source: "Bhagavad Gita 2.47",
    tint: ["#7E1D2E", "#3F0C17"],
  },
  {
    deva: "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः।",
    meaning: "May all be happy, may all be free from illness.",
    source: "Shanti Mantra",
    tint: ["#0F4F49", "#052A26"],
  },
  {
    deva: "वसुधैव कुटुम्बकम्।",
    meaning: "The world is one family.",
    source: "Maha Upanishad 6.72",
    tint: ["#4A2472", "#22103E"],
  },
  {
    deva: "असतो मा सद्गमय।",
    meaning: "Lead me from the unreal to the real.",
    source: "Brihadaranyaka Upanishad 1.3.28",
    tint: ["#153C6B", "#071D38"],
  },
  {
    deva: "योगः कर्मसु कौशलम्।",
    meaning: "Yoga is skill in action.",
    source: "Bhagavad Gita 2.50",
    tint: ["#8A3B08", "#4A1D03"],
  },
];

// Deep jewel grounds for the darshan cards. Saturated rather than merely dark:
// the temple records carry near-black greys that turn to mud at card size.
const DARSHAN_TINTS: [string, string][] = [
  ["#4A2472", "#241141"],  // deep violet
  ["#7E1D2E", "#430D19"],  // deep maroon
  ["#0F4F49", "#062B27"],  // deep teal
  ["#8A3B08", "#4E1F03"],  // burnt saffron
  ["#153C6B", "#081F3B"],  // deep indigo
  ["#5B2160", "#2E0F32"],  // deep plum
];

export function HomeScreen() {
  const { go, haptic, sendPush, streak, japaToday, profile } = useApp();
  const bellRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

  // Tabs without a destination scroll to their shelf on this page.
  const scrollToSection = (id: string) => {
    const sc = scrollRef.current;
    const el = sc?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!sc || !el) return;
    sc.scrollTo({ top: Math.max(0, el.offsetTop - 96), behavior: "smooth" });
  };

  // live panchang from the jyotish-grade engine (server-side Swiss Ephemeris),
  // fetched via /api/panchang and refreshed every 2 min.
  const { panchang: pg } = usePanchang();
  const chog = pg?.active ?? null;
  // re-render each minute so the greeting stays current
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  // backend content
  const festivals = useCatalog<Festival[]>(() => getUpcomingFestivals(3), []);
  const library = useCatalog<Article[]>(getLibrary, []);
  // Live darshan comes from /api/darshan with proof attached: only temples
  // whose stream verified minutes ago appear, with the exact live video id.
  const [temples, setTemples] = useState<
    { id: string; name: string; deity: string | null; location: string | null; videoId: string }[]
  >([]);
  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await fetch("/api/darshan");
        if (!r.ok) return;
        const d = (await r.json()) as {
          temples: { id: string; name: string; deity: string | null; location: string | null; live: { videoId: string } | null }[];
        };
        if (on) setTemples(
          d.temples.filter((t) => t.live).map((t) => ({
            id: t.id, name: t.name, deity: t.deity, location: t.location, videoId: t.live!.videoId,
          }))
        );
      } catch { /* the rail simply doesn't render */ }
    })();
    return () => { on = false; };
  }, []);
  const [shloka, setShloka] = useState<Shloka | null>(null);
  const [horoscope, setHoroscope] = useState<string | null>(null);
  // Track settled-ness separately: an empty reading is a real answer, and
  // without this the placeholder shimmers forever when the reading can't load.
  const [horoscopeReady, setHoroscopeReady] = useState(false);
  useEffect(() => {
    let on = true;
    setHoroscopeReady(false);
    getShlokaOfDay().then((s) => on && setShloka(s));
    getDailyHoroscope(rashi.split(" ")[0])
      .then((h) => { if (on) { setHoroscope(h || null); setHoroscopeReady(true); } })
      .catch(() => { if (on) { setHoroscope(null); setHoroscopeReady(true); } });
    return () => { on = false; };
  }, [rashi]);

  const nextFestival = festivals[0];

  // One verse per day, stable for the whole day and different tomorrow.
  const poster = POSTERS[Math.floor(Date.now() / 86_400_000) % POSTERS.length];

  // The birth record, as labelled fields rather than a run of sentences. A
  // date and a place mean nothing on their own — "14 Aug 1995" could be
  // anything until something says Born above it. Only fields the profile
  // actually carries are rendered.
  const birthFields = [
    profile?.dob && {
      label: "Born",
      value: new Date(profile.dob + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      }),
    },
    profile?.tob && { label: "Time", value: profile.tob },
    profile?.birthplace && {
      label: "Place",
      // just the town in the field; the full string stays in the tooltip
      value: profile.birthplace.split(",")[0].trim(),
      title: profile.birthplace,
    },
  ].filter(Boolean) as { label: string; value: string; title?: string }[];

  useEffect(() => {
    if (firedOnce || !chog) return;
    firedOnce = true;
    const id = setTimeout(() => {
      sendPush({
        title: chog.good ? `${chog.name} Choghadiya is on` : `${chog.name} Choghadiya · pause new beginnings`,
        body: chog.good
          ? `An auspicious window until ${chog.to}.${pg?.vrat ? ` Aaj ${pg.vrat} hai.` : ""}`
          : `A better window opens at ${chog.to}.${pg?.vrat ? ` Aaj ${pg.vrat} hai.` : ""}`,
        tone: "auspicious",
      });
    }, 4200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendPush, chog]);

  // Right-column widgets on desktop — the horoscope prompt above Live Darshan,
  // set once and placed in the aside. On mobile they render inline instead.
  const horoCard = (
    <div className="rounded-2xl surface p-3">
      <span className="font-display text-[14.5px] text-ink">Today · {rashi.split(" ")[0]}</span>
      {horoscope ? (
        <p className="mt-2 measure text-[11.5px] leading-relaxed text-muted">{horoscope}</p>
      ) : horoscopeReady ? (
        <p className="mt-2 measure text-[11.5px] leading-relaxed text-muted">
          Today&apos;s reading isn&apos;t ready yet. Ask the Jyotishi and it will read your chart directly.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="shimmer h-3 w-full rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="shimmer h-3 w-4/5 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      )}
      <button
        onClick={() => go("ai", { mode: "jyotishi" })}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[6px] py-2.5 text-[12px] btn-saffron"
      >
        <IconEye size={14} /> Ask the AI Jyotishi
      </button>
    </div>
  );

  // a live thumbnail is far lighter than a live iframe — the player embeds
  const darshanThumb = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const darshanVertical = temples.length > 0 && (
    <section className="rounded-2xl surface p-2.5">
      <div className="mb-2.5 flex items-end justify-between">
        <h3 className="section-title">Live Darshan</h3>
        <button onClick={() => go("temple")} className="flex items-center gap-1 text-[11px] text-ink">
          See all <CaretRight size={12} className="shrink-0" />
        </button>
      </div>
      {/* Compact rows: a small rectangular still, the name and place beside it —
          a video list, not a stack of tall posters. */}
      <div className="flex flex-col gap-2.5">
        {temples.slice(0, 6).map((t, i) => {
          const [from, to] = DARSHAN_TINTS[i % DARSHAN_TINTS.length];
          return (
            <button
              key={t.id}
              onClick={() => go("temple")}
              className="flex items-center gap-2.5 text-left"
            >
              <div
                className="relative h-12 w-[74px] shrink-0 overflow-hidden rounded-lg"
                style={{ background: `linear-gradient(125deg, ${from}, ${to})` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={darshanThumb(t.videoId)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                {/* everyone in this rail was proven live minutes ago */}
                <span className="absolute left-1 top-1 z-10 flex items-center gap-0.5 rounded-[2px] px-1 py-[1px] text-[7.5px] font-medium text-white" style={{ background: "#E11900" }}>
                  <span className="h-[3px] w-[3px] rounded-full bg-white" />Live
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium text-ink">{t.name}</div>
                <div className="truncate text-[10.5px] text-muted">{t.deity} · {t.location}</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar screen-bottom lg:pt-3">
      {/* Top bar — mobile only. Haldi ground, black marks, and a strip of text
          tabs beneath that jump to the sections below. The tabs are content,
          not destinations, so they don't repeat what the bottom bar does. */}
      <div className="sticky top-0 z-30 lg:hidden" style={{ background: "var(--bar-yellow)" }}>
        {/* The wordmark row sits taller than the tab strip beneath it, so the
            two rows read as a header and its index rather than as equals. */}
        <div
          className="flex items-center gap-3 gutter"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 11px)", paddingBottom: 11 }}
        >
          {/* The bar's marks carry more weight than the app default — at this
              size the global "light" stroke went spindly on the yellow. */}
          <button onClick={() => go("menu")} aria-label="Menu" className="shrink-0">
            <Iconify icon="solar:hamburger-menu-linear" width={24} height={24} className="text-ink" />
          </button>
          <span className="font-display text-[19px] tracking-[-0.01em] text-ink">Divasya</span>
          <div className="ml-auto flex shrink-0 items-center gap-3.5">
            <button
              ref={bellRef}
              aria-label="Notifications"
              onClick={() =>
                chog &&
                sendPush({
                  title: `${chog.name} Choghadiya ${chog.good ? "· shubh samay" : "chal raha hai"}`,
                  body: `Till ${chog.to}.${pg?.vrat ? ` Aaj ${pg.vrat}.` : ""}`,
                  tone: "auspicious",
                })
              }
            >
              <Iconify icon="solar:bell-linear" width={23} height={23} className="text-ink" />
            </button>
            <button onClick={() => go("menu")} aria-label="Wallet" className="shrink-0">
              <Iconify icon="solar:wallet-linear" width={23} height={23} className="text-ink" />
            </button>
            <button onClick={() => go("menu")} aria-label="Search" className="shrink-0">
              <Iconify icon="solar:magnifer-linear" width={22} height={22} className="text-ink" />
            </button>
          </div>
        </div>

        {/* Packed left with a fixed gap rather than spread edge to edge —
            justify-between stretches the five tabs right across a wide window
            and leaves them floating apart. */}
        <div className="flex items-end gap-5 gutter overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { haptic(6); t.to ? go(t.to, t.params) : scrollToSection(t.id); }}
              className="shrink-0 whitespace-nowrap pb-2 pt-0.5 text-[12.5px] font-medium text-ink transition-opacity active:opacity-60"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: a main feed on the left that itself bentos into two columns,
          and a fixed widget column on the right holding the AI Jyotishi prompt
          over Live Darshan. Mobile drops both and stays one plain column. */}
      <div className="lg:flex lg:items-start lg:gap-2.5 lg:px-2.5">
      <div className="home-bento min-w-0 lg:flex-1 lg:grid lg:grid-cols-2">

      {/* What is running now — the one time-sensitive thing on the screen, so
          it gets a status dot and reads in a single glance. */}
      <div className="gutter pt-2 lg:col-span-2">
        <button
          onClick={() => go("panchang")}
          className="flex w-full items-center gap-2.5 rounded-2xl surface px-3 py-2.5 text-left"
        >
          {/* The supplied Panchang wheel gives this live reading its own visual
              anchor; the small dot still carries the current status. */}
          <span className="relative grid h-10 w-10 shrink-0 place-items-center" aria-hidden>
            <DevotionalIllustration name="panchang" className="h-10 w-10" priority />
            <span
              className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full"
              style={{ background: chog ? (chog.good ? "var(--good)" : "var(--avoid)") : "var(--muted-2)", border: "1px solid var(--surface)" }}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-[12.5px] text-ink">
                {chog ? (
                  <>
                    <span className="font-medium">{chog.name}</span>
                    <span className="text-muted">
                      {" "}· {chog.good ? "Shubh" : "Avoid"} till {chog.to}
                    </span>
                  </>
                ) : (
                  pg?.tithiDisplay ?? "…"
                )}
              </span>
              {/* The date belongs with today, not in the profile block. */}
              <span className="shrink-0 text-[10.5px] tnum text-muted">
                {pg ? `${pg.weekdayShort} · ${pg.dateLabel}` : ""}
              </span>
            </div>
            {/* Sunrise and sunset read as little horizon marks rather than the
                words — a sun lifting for दिन, dropping for सांझ — with the times
                beside them. Rahu Kaal stays as a labelled figure. */}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10.5px] tnum text-muted">
              <span className="inline-flex items-center gap-1">
                <Iconify icon="meteocons:sunrise-fill" width={20} height={20} className="shrink-0" />
                {pg?.sunrise ?? "…"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Iconify icon="meteocons:sunset-fill" width={20} height={20} className="shrink-0" />
                {pg?.sunset ?? "…"}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="opacity-70">Rahu</span> {pg?.rahuKaal ?? "—"}
              </span>
            </div>
          </div>
          <CaretRight size={16} className="shrink-0 text-muted" />
        </button>
      </div>

      {/* Aaj ka Sandesh — the anchor. With the day stated once above, this card
          carries only the verse, its reading and the share, so the shloka gets
          the room to actually land. */}
      <div className="gutter pt-2 lg:col-span-2">
        <div className="rounded-2xl surface p-3">
          <span className="eyebrow text-muted">Aaj ka Sandesh</span>
          <p className="mt-2 measure font-deva text-[18px] leading-[1.85] text-ink">
            {shloka?.deva ?? "…"}
          </p>
          <div className="mt-3 rounded-xl p-3" style={{ background: "var(--bhagwa-dark)" }}>
            <p className="measure text-[11.5px] leading-relaxed text-white/95">
              {shloka?.meaning ?? ""}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate text-[10.5px] text-white/75">{shloka?.source ?? ""}</span>
              <button
                onClick={() => go("sandesh")}
                className="flex shrink-0 items-center gap-1.5 rounded-[5px] px-3.5 py-2 text-[11.5px] btn-white"
              >
                <IconShare size={13} /> Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The birth record. Two tiers rather than one stack of look-alike rows:
          who this is on top — portrait, name, sign — then the birth details
          beneath a rule as labelled fields. It reads as a record because that
          is what it is, and it opens the chart it belongs to. */}
      <div data-section="kundli" className="gutter pt-1.5">
        <button
          onClick={() => go("kundli")}
          className="w-full rounded-2xl surface p-2.5 text-left transition-colors hover:bg-[rgba(242,107,15,0.04)]"
        >
          <div className="flex items-center gap-3">
            <DeityPortrait
              src="/user-rishi.png"
              alt="Rishi"
              fallback={<IconGanesha size={44} className="text-[var(--bhagwa-deep)]" strokeWidth={1.3} />}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-display text-[19px] leading-tight text-ink">{name}</span>
                {/* A vrat changes what someone does today, so it keeps the
                    accent instead of joining the muted run. */}
                {pg?.vrat && (
                  <span
                    className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[10px] text-white"
                    style={{ background: "var(--bhagwa)" }}
                  >
                    {pg.vrat}
                  </span>
                )}
              </div>
              <div className="mt-1 truncate text-[12.5px] text-ink">{rashi}</div>
              {profile?.nakshatra && (
                <div className="mt-0.5 truncate text-[11px] text-muted">{profile.nakshatra} nakshatra</div>
              )}
            </div>
            <CaretRight size={16} className="shrink-0 text-muted" />
          </div>

          {birthFields.length > 0 && (
            <div
              className="mt-2.5 grid gap-2 border-t pt-2.5"
              style={{ borderColor: "var(--line)", gridTemplateColumns: `repeat(${birthFields.length}, minmax(0, 1fr))` }}
            >
              {birthFields.map((f) => (
                <div key={f.label} className="min-w-0" title={f.title}>
                  <div className="eyebrow text-muted">{f.label}</div>
                  <div className="mt-0.5 truncate text-[12px] tnum text-ink">{f.value}</div>
                </div>
              ))}
            </div>
          )}
        </button>
      </div>

      {/* japa streak */}
      <button
        onClick={() => go("mala")}
        className="gutter-m mt-1.5 flex gutter-w items-center gap-4 rounded-2xl surface p-3 text-left"
      >
        {/* Bare mark, set large. The tinted disc behind it was a container
            doing nothing but shrinking the thing it contained. */}
        <DevotionalIllustration name="rudraksha" alt="Rudraksha" className="h-11 w-11 shrink-0" />
        <div className="flex-1">
          <div className="text-[12.5px] font-medium text-ink">{streak}-day japa streak</div>
          <div className="text-[11px] text-muted">{japaToday} chants today · keep it alive</div>
        </div>
        <span className="rounded-[5px] px-4.5 py-2.5 text-[12.5px] btn-saffron">Chant</span>
      </button>

      {/* One white panel per section, holding its title and its blocks
          together. The panel is the unit — a heading floating above loose
          cards left it ambiguous which tiles belonged to which heading. */}
      {SECTIONS.map((sec) => (
        <Fragment key={sec.title}>
        <div data-section={sec.tab} className="gutter pt-1.5">
          <section className="rounded-2xl surface p-2.5">
            <div className="mb-2.5 flex items-end justify-between">
              <h3 className="section-title">{sec.title}</h3>
              <button
                onClick={() => go("category", { id: sec.tab })}
                className="flex items-center gap-0.5 text-[11px] text-ink"
              >
                See all <CaretRight size={11} weight="bold" />
              </button>
            </div>
            <div
              className={cx(
                "grid gap-2",
                sec.layout === "row" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"
              )}
            >
              {sec.blocks.map((b) => (
                <button
                  key={b.label}
                  onClick={() => go(b.to, b.params)}
                  className={cx(
                    "rounded-xl border border-[var(--tile-line)] bg-[var(--tile-bg)] transition-[filter] hover:brightness-[0.98]",
                    sec.layout === "row"
                      ? "flex items-center gap-2.5 px-2.5 py-2.5 text-left"
                      : "flex flex-col items-center gap-2 px-1 py-3 lg:py-3.5"
                  )}
                >
                  {b.art ? (
                    <DevotionalIllustration name={b.art} alt="" className="h-9 w-9 shrink-0 lg:h-11 lg:w-11" />
                  ) : (
                    <Iconify icon={b.icon} className="shrink-0 text-[var(--icon-ink)] h-[22px] w-[22px] lg:h-[24px] lg:w-[24px]" />
                  )}
                  <span
                    className={cx(
                      "text-[11px] leading-tight text-ink lg:text-[13px]",
                      sec.layout === "row" ? "truncate" : "text-center"
                    )}
                  >
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Live darshan carousel, directly under Devotion. Deep jewel grounds
            with white type — the one dark run on an otherwise white screen, so
            it reads as a window into a temple rather than another card. The
            palette is set here rather than taken from the temple records:
            those tints are near-black greys and go muddy at this size. */}
        {sec.tab === "devotion" && temples.length > 0 && (
          <div className="gutter pt-1.5 lg:hidden">
            <section className="rounded-2xl surface p-2.5">
              <div className="mb-2.5 flex items-end justify-between">
                <h3 className="section-title">Live Darshan</h3>
                <button
                  onClick={() => go("temple")}
                  className="flex items-center gap-1 text-[11px] text-ink"
                >
                  See all <CaretRight size={12} className="shrink-0" />
                </button>
              </div>
              <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 no-scrollbar">
                {temples.slice(0, 6).map((t, i) => {
                  const [from, to] = DARSHAN_TINTS[i % DARSHAN_TINTS.length];
                  return (
                    <button
                      key={t.id}
                      onClick={() => go("temple")}
                      className="relative h-[112px] w-[172px] shrink-0 overflow-hidden rounded-xl text-left"
                      style={{ background: `linear-gradient(152deg, ${from}, ${to})` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={darshanThumb(t.videoId)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                      {/* scrim so the name holds against the lighter top stop */}
                      <span
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0) 58%)" }}
                      />
                      {/* everyone in this rail was proven live minutes ago */}
                      <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-[3px] px-1.5 py-[2px] text-[9px] font-medium text-white" style={{ background: "#E11900" }}>
                        <span className="h-1 w-1 rounded-full bg-white" />
                        Live
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-2.5">
                        <span className="block truncate text-[12.5px] font-medium text-white">{t.name}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-white/75">
                          {t.deity} · {t.location}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
        </Fragment>
      ))}

      {/* next festival — real dates from backend */}
      {nextFestival && (
        <div className="gutter pt-1.5">
          <button onClick={() => go("festivals")} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ background: "linear-gradient(160deg, rgba(255,217,204,0.7), rgba(206,185,118,0.25))", border: "1px solid var(--line-gold)" }}>
              <IconLotus size={25} className="text-[var(--amber-deep)]" />
            </div>
            <div className="flex-1">
              <div className="eyebrow text-muted">
                {new Date(nextFestival.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
              </div>
              <div className="font-display text-[15.5px] text-ink">{nextFestival.name}</div>
              <div className="text-[11px] text-muted">
                {nextFestival.muhurat || nextFestival.about || "View pooja vidhi"}
              </div>
            </div>
            <CaretRight size={16} className="text-muted" />
          </button>
        </div>
      )}

      {/* daily horoscope — inline on mobile; on desktop it lives in the right
          column, so this copy is hidden there. */}
      <div className="gutter pt-1.5 lg:hidden">{horoCard}</div>

      {/* library — in the same panel form as every other section */}
      {library.length > 0 && (
        <div data-section="library" className="gutter pt-1.5 lg:col-span-2">
          <section className="rounded-2xl surface p-2.5">
            <div className="mb-2.5 flex items-end justify-between">
              <h3 className="section-title">Spiritual Library</h3>
              <button
                onClick={() => go("library")}
                className="flex items-center gap-1 text-[11px] text-ink"
              >
                Explore all <CaretRight size={12} className="shrink-0" />
              </button>
            </div>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 no-scrollbar">
              {library.slice(0, 4).map((l) => (
                <button
                  key={l.id}
                  onClick={() => go("library")}
                  className="w-[136px] shrink-0 rounded-xl p-1.5 text-left"
                  style={{ background: "var(--surface-2)" }}
                >
                  {/* The picture is inset from the card's edges, and the read
                      time is a chip straddling its lower edge — a label on the
                      image rather than another line of text under it. */}
                  <div className="relative">
                    <div className="h-[58px] w-full rounded-lg" style={{ background: `${l.tint}3a` }} />
                    <span
                      className="absolute bottom-0 right-1.5 translate-y-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[1.5px] text-[8.5px] tnum text-ink"
                      style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
                    >
                      {l.read} read
                    </span>
                  </div>
                  <div className="px-1 pb-0.5 pt-4">
                    {/* two lines reserved so the cards stay the same height
                        across the row whether the title wraps or not */}
                    <div className="line-clamp-2 min-h-[2.3em] text-[11px] font-medium leading-tight text-ink">
                      {l.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* One closing poster, full width. A single verse given the whole column
          lands harder than five competing for a swipe, and the screen ends on
          something worth reading rather than trailing into a footer. It turns
          over daily, so the page is not identical tomorrow. */}
      <div className="gutter pt-1.5 lg:col-span-2">
        <button
          onClick={() => go("sandesh")}
          className="w-full overflow-hidden rounded-2xl p-4 text-left"
          style={{ background: `linear-gradient(148deg, ${poster.tint[0]}, ${poster.tint[1]})` }}
        >
          <span className="block measure font-deva text-[19px] leading-[1.75] text-white">
            {poster.deva}
          </span>
          <span className="mt-3 block measure text-[11.5px] leading-relaxed text-white/85">
            {poster.meaning}
          </span>
          <span className="mt-2 block text-[10px] text-white/60">{poster.source}</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 gutter pb-2 pt-5 lg:col-span-2">
        <Logomark size={13} className="text-[var(--bhagwa)]" />
        <span className="text-[10.5px] text-muted">Divasya · Spiritual Journey</span>
      </div>

      </div>{/* /main feed */}

      {/* Right column — desktop only. Ask the AI Jyotishi over Live Darshan. */}
      <aside className="hidden lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:gap-3 lg:pt-2">
        {horoCard}
        {darshanVertical}
      </aside>

      </div>{/* /feed row */}
    </div>
  );
}
