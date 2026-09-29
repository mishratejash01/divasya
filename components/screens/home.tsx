"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CaretRight } from "@phosphor-icons/react";
import { IconEye, IconGanesha, IconLotus, IconShare } from "../icons";
import { useApp, type ScreenName } from "../app-context";
import { NAV, NAV_ORDER } from "../nav-map";
import { DeityPortrait, DevotionalIllustration, cx, type DevotionalIllustrationName } from "../ui";
import { Iconify } from "../iconify";
import { usePanchang } from "@/lib/use-panchang";
import {
  useCatalog, getUpcomingFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope,
  Festival, Article, Shloka,
} from "@/lib/catalog";
import { rashiLabel } from "@/lib/astro";
import { HomeStories, type Story } from "../home-stories";
import { HomeBands, type Band } from "../home-bands";
import { Typewriter } from "../typewriter";
import { LibraryImage } from "../library-image";

let firedOnce = false;

// The presiding devata for each weekday (Sun…Sat), drawn from our deity art.
const DEVATA_BY_DAY: { name: string; deva: string; image: string; line: string }[] = [
  { name: "Surya Dev", deva: "सूर्य देव", image: "/spot/deity-surya.png", line: "Sunday is the day to honour the Sun." },
  { name: "Mahadev", deva: "महादेव", image: "/spot/deity-shiva.png", line: "Monday belongs to Lord Shiva." },
  { name: "Hanuman Ji", deva: "हनुमान जी", image: "/spot/deity-hanuman.png", line: "Tuesday for strength and courage." },
  { name: "Shri Ganesha", deva: "श्री गणेश", image: "/spot/deity-ganesha.png", line: "Wednesday is Ganesha's day." },
  { name: "Shri Vishnu", deva: "श्री विष्णु", image: "/spot/deity-vishnu.png", line: "Thursday is the best day for Vishnu puja." },
  { name: "Maa Lakshmi", deva: "माँ लक्ष्मी", image: "/spot/deity-lakshmi.png", line: "Friday is devoted to the Devi." },
  { name: "Shani Dev", deva: "शनि देव", image: "/spot/deity-shani.png", line: "Saturday is for Shani Dev." },
];

// Deep, patterned grounds for the story cards.
const STORY_GROUND = {
  indigo: "radial-gradient(120% 90% at 50% 18%, #1B2A54 0%, #0A1230 58%, #05060F 100%)",
  maroon: "radial-gradient(120% 90% at 50% 18%, #4A1220 0%, #2A0A12 58%, #140407 100%)",
  teal: "radial-gradient(120% 90% at 50% 18%, #123B3A 0%, #0A2422 58%, #05100F 100%)",
  saffron: "radial-gradient(120% 90% at 50% 18%, #6B2A08 0%, #3E1804 58%, #1C0B02 100%)",
};

// Rashi artwork keyed by the English sign name, for the horoscope card.
const RASHI_ART: Record<string, string> = {
  Aries: "/rashi/mesha.png", Taurus: "/rashi/vrishabha.png", Gemini: "/rashi/mithuna.png",
  Cancer: "/rashi/karka.png", Leo: "/rashi/simha.png", Virgo: "/rashi/kanya.png",
  Libra: "/rashi/tula.png", Scorpio: "/rashi/vrishchika.png", Sagittarius: "/rashi/dhanu.png",
  Capricorn: "/rashi/makara.png", Aquarius: "/rashi/kumbha.png", Pisces: "/rashi/meena.png",
};

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
const TABS: { id: string; label: string; art: string; to?: ScreenName; params?: Record<string, unknown> }[] = [
  { id: "kundli", label: "My Kundli", art: "/home/tools/my-kundli.png", to: "kundli" },
  { id: "astro", label: "Astro", art: "/home/tools/ai-jyotishi.png", to: "category", params: { id: "astro" } },
  { id: "devotion", label: "Devotion", art: "/home/tools/my-mandir.png", to: "category", params: { id: "devotion" } },
  { id: "festival", label: "Festival", art: "/home/tools/festivals.png", to: "festivals" },
  { id: "store", label: "Store", art: "/home/tools/store.png" },
  { id: "tools", label: "Guides", art: "/home/trust/tradition.png", to: "category", params: { id: "tools" } },
  { id: "library", label: "Library", art: "/home/tools/darshan.png" },
];

// Poster verses. Unlike festival dates these are safe to hold locally: they are
// ancient, fixed and among the best known lines in the tradition, so there is
// nothing to go stale or to get wrong by a day.
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

// Our own Cloudinary copies of credited Wikimedia artwork (see
// public/library/CREDITS.md) — no third-party or stock hotlinks.
// Our own 2D deity artwork (public/spot/deity-*.png) — transparent cutouts sat
// on a warm per-deity ground, rather than photographed murtis.
const HOME_DARSHAN = [
  { name: "Shri Krishna", deva: "श्री कृष्ण", image: "/spot/deity-krishna.png", tint: "#2C6470" },
  { name: "Mahadev", deva: "महादेव", image: "/spot/deity-shiva.png", tint: "#6E4E36" },
  { name: "Maa Durga", deva: "माँ दुर्गा", image: "/spot/deity-durga.png", tint: "#A63D34" },
  { name: "Shri Ganesha", deva: "श्री गणेश", image: "/spot/deity-ganesha.png", tint: "#B76C2A" },
];


export function HomeScreen() {
  const { go, haptic, sendPush, profile, lang, user } = useApp();
  const bellRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const darshanRef = useRef<HTMLDivElement>(null);

  // A guest has no chart yet, so the card invites rather than showing the
  // em-dashes of an empty rashi. Tapping it still opens My Kundli, which
  // explains what signing in unlocks.
  const isGuest = !user;
  const name = profile?.name || (isGuest ? "Namaste" : "Devotee");
  const rashi = isGuest
    ? "Sign in to see your chart and daily reading"
    : rashiLabel(profile || { rashi: null, dob: null });

  // Tabs without a destination scroll to their shelf on this page.
  const scrollToSection = (id: string) => {
    const sc = scrollRef.current;
    const el = sc?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!sc || !el) return;
    sc.scrollTo({ top: Math.max(0, el.offsetTop - 96), behavior: "smooth" });
  };

  // A quiet, continuous darshan rail: it pauses briefly when touched so a
  // devotee can inspect a card, then resumes from the same position.
  useEffect(() => {
    const track = darshanRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let last = 0;
    let pausedUntil = 0;
    const pause = () => { pausedUntil = performance.now() + 3200; };
    const tick = (now: number) => {
      if (!last) last = now;
      const loopWidth = track.scrollWidth / 2;
      if (now >= pausedUntil && loopWidth > track.clientWidth) {
        track.scrollLeft += (now - last) * 0.014;
        if (track.scrollLeft >= loopWidth) track.scrollLeft -= loopWidth;
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    track.addEventListener("pointerdown", pause);
    track.addEventListener("wheel", pause, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("wheel", pause);
    };
  }, []);

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

  // Scroll reveal — each .reveal block rises and un-blurs as it enters view.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    root.querySelectorAll(".reveal:not(.reveal-in)").forEach((el) => io.observe(el));
    return () => io.disconnect();
    // re-scan when late-loading sections (library, festivals, live darshan) appear
  }, [library.length, temples.length, festivals.length]);

  // Right-column widgets on desktop — the horoscope prompt above Live Darshan,
  // set once and placed in the aside. On mobile they render inline instead.
  const horoCard = (
    <div className="px-2 py-2">
      <div className="flex items-center gap-2.5">
        {RASHI_ART[rashi.split(" ")[0]] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={RASHI_ART[rashi.split(" ")[0]]} alt="" className="h-12 w-12 shrink-0 object-contain" />
        ) : (
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px]"
            style={{ background: "var(--surface-2)", color: "var(--bhagwa-deep)", border: "1px solid var(--line-card)" }}
          >
            ★
          </span>
        )}
        <div className="min-w-0">
          <div className="eyebrow text-muted">Today&apos;s horoscope</div>
          <div className="font-display text-[15px] leading-tight text-ink">{rashi}</div>
        </div>
      </div>
      {horoscope ? (
        <p className="mt-2.5 measure text-[12px] leading-relaxed text-ink">{horoscope}</p>
      ) : horoscopeReady ? (
        <p className="mt-2.5 measure text-[12px] leading-relaxed text-muted">
          Your reading for today is ready to be drawn from your chart — ask the AI Jyotishi below.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="shimmer h-3 w-full rounded-full" style={{ background: "var(--surface-2)" }} />
          <div className="shimmer h-3 w-4/5 rounded-full" style={{ background: "var(--surface-2)" }} />
        </div>
      )}
      <button
        onClick={() => go("ai", { mode: "jyotishi" })}
        className="mt-3.5 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left active:scale-[0.99]"
        style={{
          background: "linear-gradient(135deg, #0F4F49 0%, #08302C 100%)",
          boxShadow: "0 8px 20px rgba(15,79,73,0.30)",
        }}
      >
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-white">Ask the AI Jyotishi</span>
        <CaretRight size={16} weight="bold" className="shrink-0 text-white/90" />
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

  // "Updates" stories — the day's devata, verse, festival and panchang, opened
  // as immersive full-screen cards.
  const devata = DEVATA_BY_DAY[new Date().getDay()];
  const nextFest = festivals[0];
  const stories: Story[] = [
    {
      id: "devata",
      bubble: devata.image,
      ring: "linear-gradient(135deg, #F2B705, #C1440E)",
      label: "Devata of the day",
      kicker: "Devata of the day",
      title: lang === "hi" ? devata.deva : devata.name,
      subtitle: devata.line,
      image: devata.image,
      fit: "contain",
      ground: STORY_GROUND.indigo,
      cta: "Pray now",
      onCta: () => go("mandir"),
    },
    {
      id: "verse",
      bubble: "/spot/deity-ganesha.png",
      ring: "linear-gradient(135deg, #E7A93E, #7A1D2E)",
      label: "Verse of the day",
      kicker: "Verse of the day",
      title: "Aaj ka Shlok",
      subtitle: shloka ? (lang === "hi" ? (shloka.meaning_hi ?? shloka.meaning) : shloka.meaning) : "Today's wisdom from the scriptures.",
      image: "/spot/deity-ganesha.png",
      fit: "contain",
      ground: STORY_GROUND.maroon,
      cta: "Read more",
      onCta: () => go("sandesh"),
    },
    ...(nextFest ? [{
      id: "festival",
      bubble: "/spot/deity-durga.png",
      ring: "linear-gradient(135deg, #F2B705, #B4564B)",
      label: nextFest.name,
      kicker: "Festival",
      title: nextFest.name,
      subtitle: nextFest.date ?? "An auspicious observance is near.",
      image: "/spot/deity-durga.png",
      fit: "contain" as const,
      ground: STORY_GROUND.saffron,
      cta: "View details",
      onCta: () => go("festivals"),
    }] : []),
    {
      id: "panchang",
      bubble: "/home/quick/panchang.png",
      ring: "linear-gradient(135deg, #6FBFA6, #0F4F49)",
      label: "Aaj ka Panchang",
      kicker: "Aaj ka Panchang",
      title: chog ? chog.name : (pg?.tithiDisplay ?? "Panchang"),
      subtitle: pg ? `${pg.weekdayShort} · ${pg.dateLabel}  ·  Sunrise ${pg.sunrise ?? "…"}` : "Today's timings and muhurat.",
      image: "/home/quick/panchang.png",
      fit: "contain",
      ground: STORY_GROUND.teal,
      cta: "Open Panchang",
      onCta: () => go("panchang"),
    },
  ];

  // Grouped category bands — deep jewel headers over a tray of tools.
  const bands: Band[] = [
    {
      title: "Panchang & Muhurat",
      subtitle: "Tithi, choghadiya and shubh timings for your day.",
      art: "/home/quick/panchang.png",
      grad: "linear-gradient(135deg, #0F4F49 0%, #08302C 100%)",
      onOpen: () => go("panchang"),
      tools: [
        { label: "Panchang", img: "/home/tools/panchang.png", onClick: () => go("panchang") },
        { label: "Muhurat", img: "/home/tools/muhurat.png", onClick: () => go("panchang") },
        { label: "Festivals", img: "/home/tools/festivals.png", onClick: () => go("festivals") },
      ],
    },
    {
      title: "Jyotish & Rashifal",
      subtitle: "Your chart, daily reading and expert jyotishis.",
      art: "/home/quick/ai.png",
      grad: "linear-gradient(135deg, #153C6B 0%, #0A1F3B 100%)",
      onOpen: () => go("category", { id: "astro" }),
      tools: [
        { label: "AI Jyotishi", img: "/home/tools/ai-jyotishi.png", onClick: () => go("ai", { mode: "jyotishi" }) },
        { label: "My Kundli", img: "/home/tools/my-kundli.png", onClick: () => go("kundli") },
        { label: "Talk to Jyotishi", img: "/home/tools/talk-jyotishi.png", onClick: () => go("consult") },
      ],
    },
    {
      title: "Devotion & Puja",
      subtitle: "Mandir, mala jaap, darshan and online puja.",
      art: "/spot/deity-durga.png",
      grad: "linear-gradient(135deg, #5B2160 0%, #2E0F32 100%)",
      onOpen: () => go("category", { id: "devotion" }),
      tools: [
        { label: "My Mandir", img: "/home/tools/my-mandir.png", onClick: () => go("mandir") },
        { label: "Mala Jaap", img: "/home/tools/mala-jaap.png", onClick: () => go("mala") },
        { label: "Online Puja", img: "/home/tools/online-puja.png", onClick: () => go("puja") },
        { label: "Darshan", img: "/home/tools/darshan.png", onClick: () => go("temple") },
      ],
    },
    {
      title: "The Store",
      subtitle: "Rudraksha, malas and puja samagri, delivered home.",
      art: "/home/quick/mala.png",
      grad: "linear-gradient(135deg, #8A3B08 0%, #4E1F03 100%)",
      onOpen: () => go("shop"),
      tools: [
        { label: "Everything", img: "/home/tools/store.png", onClick: () => go("shop") },
        { label: "Rudraksha", img: "/home/tools/rudraksha.png", onClick: () => go("shop") },
        { label: "My Orders", img: "/home/tools/my-orders.png", onClick: () => go("orders") },
      ],
    },
  ];

  return (
    <div ref={scrollRef} className="home-screen h-full overflow-y-auto no-scrollbar screen-bottom lg:pt-3">
      {/* Top bar — mobile only. Haldi ground, black marks, and a strip of text
          tabs beneath that jump to the sections below. The tabs are content,
          not destinations, so they don't repeat what the bottom bar does. */}
      <div
        className="sticky top-0 z-30 lg:hidden"
        style={{
          background: "linear-gradient(155deg, #C0440E 0%, #8A2B22 60%, #6E1D2E 100%)",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        }}
      >
        <div
          className="flex items-center gap-3 gutter"
          style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 22px)", paddingBottom: 18 }}
        >
          <button onClick={() => go("menu")} aria-label="Menu" className="shrink-0">
            <Iconify icon="solar:hamburger-menu-linear" width={25} height={25} className="text-[#FBE8C6]" />
          </button>
          <button onClick={() => go("home")} aria-label="Divasya — Home" className="shrink-0">
            {/* The approved Divasya logo, drawn as a clean ivory knockout (via its
                own artwork as a mask) so the sun-over-the-i, crescent and ™ stay
                crisp on the deep header. */}
            <span
              role="img"
              aria-label="Divasya"
              className="block"
              style={{
                height: 32,
                aspectRatio: "985 / 355",
                background: "#FDEFD6",
                WebkitMask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
                mask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
              }}
            />
          </button>
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
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.14)" }}
            >
              <Iconify icon="solar:bell-linear" width={21} height={21} className="text-[#FBE8C6]" />
            </button>
          </div>
        </div>

        <div className="flex items-end gap-5 gutter overflow-x-auto no-scrollbar pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { haptic(6); t.to ? go(t.to, t.params) : scrollToSection(t.id); }}
              className="shrink-0 whitespace-nowrap pb-1 pt-1 transition-opacity active:opacity-60"
            >
              <span className="text-[13px] font-medium text-[#FDEEDA]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: a main feed on the left that itself bentos into two columns,
          and a fixed widget column on the right holding the AI Jyotishi prompt
          over Live Darshan. Mobile drops both and stays one plain column. */}
      <div className="lg:flex lg:items-start lg:gap-2.5 lg:px-2.5">
      <div className="home-bento min-w-0 lg:flex-1 lg:grid lg:grid-cols-2">

      {/* Updates — the day's stories as round bubbles that open full-screen. */}
      <div className="reveal lg:col-span-2">
        <HomeStories stories={stories} />
      </div>

      {/* Promo carousel — deep-jewel banners for the key journeys. */}
      <div className="reveal pt-2 lg:col-span-2">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-1 no-scrollbar">
          {[
            { img: "/home/promo/app.png", to: () => go("menu") },
            { img: "/home/promo/jyotishi.png", to: () => go("consult") },
            { img: "/home/promo/kundli.png", to: () => go("kundli") },
            { img: "/home/promo/darshan.png", to: () => go("temple") },
            { img: "/home/promo/panchang.png", to: () => go("panchang") },
            { img: "/home/promo/mala.png", to: () => go("mala") },
            { img: "/home/promo/store.png", to: () => go("shop") },
          ].map((banner) => (
            <button
              key={banner.img}
              onClick={() => { haptic(6); banner.to(); }}
              className="aspect-[2/1] w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl active:scale-[0.99]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Image-first devotional discovery: a small darshan window before the
          utility cards, so the home feed feels like a living temple rather
          than a directory of tools. */}
      <div className="reveal gutter pt-2 lg:col-span-2">
        <section className="home-darshan-shelf">
          <div className="home-darshan-heading">
            <div>
              <span className="home-darshan-kicker">Aaj ka darshan</span>
            </div>
            <button onClick={() => go("temple")} className="home-shelf-link flex items-center gap-0.5 text-[11px] text-ink">
              See all <CaretRight size={11} weight="bold" />
            </button>
          </div>
          <div ref={darshanRef} className="home-darshan-track no-scrollbar">
            {[...HOME_DARSHAN, ...HOME_DARSHAN].map((item, index) => (
              <button
                key={`${item.name}-${index}`}
                onClick={() => go("temple")}
                className="home-darshan-card"
                style={{ animationDelay: `${(index % HOME_DARSHAN.length) * 60}ms` }}
              >
                <span className="home-darshan-visual">
                  <span
                    className="home-darshan-tile"
                    style={{
                      background: `radial-gradient(78% 100% at 50% 100%, #FFF6DE 0%, #FFE2A2 22%, ${item.tint}5e 50%, ${item.tint}26 72%, ${item.tint}00 88%)`,
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    className="home-darshan-image"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                </span>
                <span className="home-darshan-name">{lang === "hi" ? item.deva : item.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Aaj ka Sandesh — the anchor. With the day stated once above, this card
          carries only the verse, its reading and the share, so the shloka gets
          the room to actually land. */}
      <div className="gutter pt-2 lg:col-span-2">
        <motion.div
          data-sandesh-top
          className="relative px-2 py-3"
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={() => go("sandesh")}
            aria-label="Share today's shloka"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ border: "1px solid var(--line)", color: "var(--bhagwa-deep)" }}
          >
            <IconShare size={14} />
          </button>

          {/* The message in one language only — Devanagari verse in Hindi,
              plain English meaning in English — typed out like a typewriter. */}
          <Typewriter
            text={shloka ? (lang === "hi" ? shloka.deva : `“${shloka.meaning}”`) : "…"}
            className={cx("mx-auto mt-1 measure text-[19px] leading-[1.9] text-ink", lang === "hi" ? "font-deva" : "font-display italic")}
            style={{ textAlign: "center" }}
          />

          {/* a small gold ornament separates the verse from its meaning */}
          <div className="my-3 flex items-center justify-center gap-2.5" style={{ color: "var(--bhagwa)" }}>
            <span className="h-px w-10" style={{ background: "rgba(242,107,15,0.30)" }} />
            <span className="text-[10px]">✦</span>
            <span className="h-px w-10" style={{ background: "rgba(242,107,15,0.30)" }} />
          </div>

          {/* Hindi gets the translated meaning under the verse; English already
              showed its meaning as the verse, so it only needs the source. */}
          {lang === "hi" && shloka && (
            <p className="mx-auto measure text-[13px] leading-relaxed text-ink" style={{ textAlign: "center" }}>
              {shloka.meaning_hi ?? shloka.meaning}
            </p>
          )}
          {shloka?.source && (
            <p className="mt-2 text-center text-[11px] font-medium" style={{ color: "var(--bhagwa-deep)" }}>
              — {shloka.source}
            </p>
          )}
        </motion.div>
      </div>

      {/* The birth record. Two tiers rather than one stack of look-alike rows:
          who this is on top — portrait, name, sign — then the birth details
          beneath a rule as labelled fields. It reads as a record because that
          is what it is, and it opens the chart it belongs to. */}
      <div data-section="kundli" className="reveal gutter pt-1.5">
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

      {/* Grouped category bands — deep jewel headers over tool trays. */}
      <div className="reveal gutter pt-3 lg:col-span-2">
        <HomeBands bands={bands} />
      </div>

      {/* Old open section shelves — superseded by the bands above. */}
      {false && SECTIONS.map((sec) => (
        <Fragment key={sec.title}>
        <div data-section={sec.tab} className="gutter pt-1.5">
          <section className="home-shelf px-1 pt-1">
            <div className="home-shelf-heading">
              <h3 className="home-shelf-title">{sec.title}</h3>
              <button
                onClick={() => go("category", { id: sec.tab })}
                className="home-shelf-link flex items-center gap-0.5 text-[11px] text-ink"
              >
                See all <CaretRight size={11} weight="bold" />
              </button>
            </div>
            <div className="home-shelf-grid">
              {sec.blocks.map((b) => (
                <button
                  key={b.label}
                  onClick={() => go(b.to, b.params)}
                  className={cx("home-block", sec.layout === "row" && "home-block-row")}
                >
                  {b.art ? (
                    <DevotionalIllustration name={b.art} alt="" className="home-block-art h-12 w-12 shrink-0 lg:h-14 lg:w-14" />
                  ) : (
                    <Iconify icon={b.icon} className="shrink-0 text-[var(--icon-ink)] h-[22px] w-[22px] lg:h-[24px] lg:w-[24px]" />
                  )}
                  <span
                    className={cx(
                      "home-block-label text-[11px] leading-tight text-ink lg:text-[13px]",
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
            <section className="px-1 pt-1">
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
        <div className="reveal gutter pt-6">
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
      <div className="reveal gutter pt-6 lg:hidden">{horoCard}</div>

      {/* library — in the same panel form as every other section */}
      {library.length > 0 && (
        <div data-section="library" className="reveal gutter pt-7 lg:col-span-2">
          <section className="px-1 pt-1">
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
                  className="w-[136px] shrink-0 rounded-xl text-left"
                >
                  {/* The picture is inset from the card's edges, and the read
                      time is a chip straddling its lower edge — a label on the
                      image rather than another line of text under it. */}
                  <div className="relative">
                    {l.image ? (
                      <LibraryImage src={l.image} tint={l.tint} className="h-[104px] w-full rounded-lg" />
                    ) : (
                      <div className="h-[58px] w-full rounded-lg" style={{ background: `${l.tint}3a` }} />
                    )}
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

      {/* Trust row — artifact-led reassurance, warm not corporate. */}
      <div className="reveal gutter pt-8 lg:col-span-2">
        <div className="grid grid-cols-4 gap-2 pt-2">
          {[
            { img: "/home/trust/loved.png", t: "Loved by", s: "lakhs of devotees" },
            { img: "/home/trust/authentic.png", t: "Authentic", s: "temple-verified" },
            { img: "/home/trust/tradition.png", t: "Rooted in", s: "shastra & tradition" },
            { img: "/home/trust/delivery.png", t: "Fast delivery", s: "to your door" },
          ].map((x) => (
            <div key={x.t} className="flex flex-col items-center gap-1.5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.img} alt="" className="h-12 w-12 object-contain" />
              <div className="text-[10px] leading-tight text-ink">
                <span className="font-medium">{x.t}</span>
                <br />
                <span className="text-muted">{x.s}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-4 lg:col-span-2" />

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
