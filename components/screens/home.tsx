"use client";

import { useEffect, useRef, useState } from "react";
import { CaretRight, List, ShareNetwork } from "@phosphor-icons/react";
import {
  IconBell, IconChat, IconCompass, IconDiya, IconEye, IconFlame, IconJournal,
  IconLotus, IconMala, IconMandir, IconStar, IconSunrise, IconSunset, IconWheel,
  Ornament,
} from "../icons";
import { useApp } from "../app-context";
import { Avatar, SectionLabel, Wordmark, Logomark, cx } from "../ui";
import { usePanchang } from "@/lib/use-panchang";
import {
  useCatalog, getUpcomingFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope,
  Festival, Article, Shloka,
} from "@/lib/catalog";
import { rashiLabel } from "@/lib/astro";

let firedOnce = false;

const GRID = [
  { label: "My Kundli", icon: IconStar, to: "kundli" },
  { label: "AI Jyotishi", icon: IconEye, to: "ai", params: { mode: "jyotishi" } },
  { label: "Talk to Devta", icon: IconDiya, to: "ai", params: { mode: "deity" } },
  { label: "My Mandir", icon: IconMandir, to: "mandir" },
  { label: "Mala Jaap", icon: IconMala, to: "mala" },
  { label: "Consult", icon: IconChat, to: "consult" },
  { label: "Online Puja", icon: IconLotus, to: "puja" },
  { label: "Panchang", icon: IconWheel, to: "panchang" },
  { label: "Vastu", icon: IconCompass, to: "vastu" },
] as const;

function salutation(d: Date): string {
  const h = d.getHours();
  if (h < 12) return "Suprabhat,";
  if (h < 17) return "Namaste,";
  return "Shubh Sandhya,";
}

export function HomeScreen() {
  const { go, sendPush, streak, japaToday, profile } = useApp();
  const bellRef = useRef<HTMLButtonElement>(null);
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

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

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      {/* header */}
      <div className="flex items-center justify-between gutter pt-2">
        <button onClick={() => go("menu")} className="grid h-9 w-9 place-items-center rounded-full surface lg:invisible">
          <List size={18} className="text-ink" />
        </button>
        <span className="flex items-center gap-2 lg:hidden">
          <Logomark size={22} className="text-[var(--amber)]" />
          <Wordmark size={21} />
        </span>
        <span className="hidden lg:block" />
        <button
          ref={bellRef}
          onClick={() =>
            chog &&
            sendPush({
              title: `${chog.name} Choghadiya ${chog.good ? "· shubh samay" : "chal raha hai"}`,
              body: `Till ${chog.to}.${pg?.vrat ? ` Aaj ${pg.vrat}.` : ""}`,
              tone: "auspicious",
            })
          }
          className="grid h-9 w-9 place-items-center rounded-full surface"
        >
          <IconBell size={18} className="text-ink" />
        </button>
      </div>

      {/* greeting */}
      <div className="flex items-center gap-3 gutter pt-5">
        <Avatar name={name} size={46} tint="#C88131" />
        <div>
          <div className="text-[13px] text-muted">{salutation(new Date())}</div>
          <div className="font-display text-xl text-ink">{name}</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[12px] text-muted">{rashi}</div>
          <div className="text-[12px] text-gold">{pg?.tithiDisplay ?? ""}</div>
        </div>
      </div>

      {/* live panchang strip */}
      <button
        onClick={() => go("panchang")}
        className="gutter-m mt-4 flex gutter-w items-stretch gap-3 rounded-2xl surface p-3 text-left"
      >
        <div className="flex flex-col justify-center gap-1.5 border-r pr-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-1.5 text-[12px] tnum text-muted"><IconSunrise size={15} className="shrink-0 text-[var(--amber)]" /> {pg?.sunrise ?? "…"}</div>
          <div className="flex items-center gap-1.5 text-[12px] tnum text-muted"><IconSunset size={15} className="shrink-0 text-[var(--ochre-deep)]" /> {pg?.sunset ?? "…"}</div>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="eyebrow text-muted">
            Now · Choghadiya · {pg?.weekdayShort ?? ""}
          </div>
          {chog ? (
            <div className="flex items-center gap-2">
              <span className={cx("text-[15px] font-medium", chog.good ? "text-[var(--good)]" : "text-[var(--avoid)]")}>
                {chog.name}
              </span>
              <span className="text-[12px] text-muted">
                {chog.good ? "Shubh" : "Avoid"} · till {chog.to}
              </span>
            </div>
          ) : (
            <div className="text-[15px] text-ink">{pg?.tithiDisplay ?? "…"}</div>
          )}
          <div className="text-[11px] text-muted">
            Rahu Kaal {pg?.rahuKaal ?? "—"}
          </div>
        </div>
        <CaretRight size={18} className="self-center text-muted" />
      </button>

      {/* Aaj ka Sandesh — the day's shloka. This is the one card carrying the
          brand: the mandala sits behind the verse as a watermark, the verse is
          set large in Devanagari, and a granth rule divides it from its
          reading. Every other card on this screen stays quiet so this one
          doesn't have to compete. */}
      <div className="gutter pt-5">
        <div className="relative overflow-hidden rounded-2xl card-temple p-4">
          <Logomark
            size={172}
            className="pointer-events-none absolute -right-11 -top-11 text-[var(--ochre)] opacity-[0.13]"
          />
          <div className="relative flex items-center justify-between">
            <span className="eyebrow text-gold">Aaj ka Sandesh</span>
            <span className="text-[11px] tnum text-muted">{pg ? `${pg.weekday} · ${pg.dateLabel}` : ""}</span>
          </div>
          <p className="relative mt-3.5 measure font-deva text-[19px] leading-[1.8] text-ink">
            {shloka?.deva ?? "…"}
          </p>
          <Ornament className="relative mt-3.5 measure text-[var(--ochre-deep)]" />
          <p className="relative mt-3 measure text-[12.5px] leading-relaxed text-muted">
            {shloka?.meaning ?? ""}
          </p>
          <div className="relative mt-3.5 flex items-end justify-between gap-3">
            <span className="text-[11.5px] leading-snug text-gold">
              {shloka?.source ?? ""}
              {pg && (
                <span className="block text-muted">
                  {pg.vrat ? `Aaj: ${pg.vrat}` : `${pg.masa} maas · ${pg.nakshatra}`}
                </span>
              )}
            </span>
            <button
              onClick={() => go("sandesh")}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] btn-gold"
            >
              <ShareNetwork size={13} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* japa streak */}
      <button
        onClick={() => go("mala")}
        className="gutter-m mt-3 flex gutter-w items-center gap-4 rounded-2xl surface p-4 text-left"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full" style={{ background: "rgba(200,129,49,0.12)", border: "1px solid var(--line-gold)" }}>
          <IconFlame size={22} className="text-[var(--amber)]" />
        </div>
        <div className="flex-1">
          <div className="text-[14px] font-medium text-ink">{streak}-day japa streak</div>
          <div className="text-[12px] text-muted">{japaToday} chants today · keep it alive</div>
        </div>
        <span className="rounded-full px-3 py-1.5 text-[12px] btn-saffron">Chant</span>
      </button>

      {/* quick grid */}
      <div className="gutter pt-5">
        <SectionLabel>Explore</SectionLabel>
        {/* Nine entries — a 3-up grid divides evenly, where 4-up stranded the
            last tile alone on its own row. */}
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-9 lg:gap-2.5">
          {GRID.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.label}
                onClick={() => go(g.to as never, ("params" in g ? g.params : undefined) as never)}
                className="flex flex-col items-center gap-2 rounded-2xl surface px-1 py-3.5 transition-colors hover:border-[var(--line-gold)]"
              >
                <Icon size={22} className="text-[var(--amber)]" strokeWidth={1.7} />
                <span className="text-center text-[11.5px] leading-tight text-ink">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* next festival — real dates from backend */}
      {nextFestival && (
        <div className="gutter pt-5">
          <button onClick={() => go("festivals")} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ background: "linear-gradient(160deg, rgba(255,217,204,0.7), rgba(206,185,118,0.25))", border: "1px solid var(--line-gold)" }}>
              <IconLotus size={28} className="text-[var(--amber-deep)]" />
            </div>
            <div className="flex-1">
              <div className="eyebrow text-muted">
                {new Date(nextFestival.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
              </div>
              <div className="font-display text-[17px] text-ink">{nextFestival.name}</div>
              <div className="text-[12px] text-muted">
                {nextFestival.muhurat || nextFestival.about || "View pooja vidhi"}
              </div>
            </div>
            <CaretRight size={18} className="text-muted" />
          </button>
        </div>
      )}

      {/* daily horoscope — AI-generated, Supabase-cached */}
      <div className="gutter pt-3">
        <div className="rounded-2xl surface p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[16px] text-ink">Today · {rashi.split(" ")[0]}</span>
            <IconStar size={18} className="text-[var(--ochre-deep)]" />
          </div>
          {horoscope ? (
            <p className="mt-2 measure text-[13px] leading-relaxed text-muted">{horoscope}</p>
          ) : horoscopeReady ? (
            <p className="mt-2 measure text-[13px] leading-relaxed text-muted">
              Today&apos;s reading isn&apos;t ready yet. Ask the Jyotishi below and it will read your chart directly.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="shimmer h-3 w-full rounded-full" style={{ background: "var(--surface-2)" }} />
              <div className="shimmer h-3 w-4/5 rounded-full" style={{ background: "var(--surface-2)" }} />
            </div>
          )}
          <button onClick={() => go("ai", { mode: "jyotishi" })} className="mt-3 text-[12.5px] text-[var(--amber-deep)]">
            Ask the AI Jyotishi about your day
          </button>
        </div>
      </div>

      {/* library — from backend */}
      {library.length > 0 && (
        <div className="gutter pt-5">
          <SectionLabel action={<button onClick={() => go("library")} className="text-[12px] text-[var(--amber-deep)]">Explore all</button>}>
            Spiritual Library
          </SectionLabel>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 no-scrollbar">
            {library.slice(0, 4).map((l) => (
              <button key={l.id} onClick={() => go("library")} className="w-40 shrink-0 overflow-hidden rounded-2xl surface text-left">
                {/* Tinted field carrying the granth glyph, bled off the corner.
                    Was an empty colour block that read as a failed image. */}
                <div
                  className="relative h-[74px] w-full overflow-hidden"
                  style={{ background: `linear-gradient(150deg, ${l.tint}3d, ${l.tint}12)` }}
                >
                  <span className="absolute -bottom-3 -right-2 opacity-40" style={{ color: l.tint }}>
                    <IconJournal size={56} strokeWidth={1.1} />
                  </span>
                </div>
                <div className="p-3">
                  {/* two lines reserved so "N min read" shares a baseline
                      across the row whether the title wraps or not */}
                  <div className="line-clamp-2 min-h-[2.3em] text-[13px] font-medium leading-tight text-ink">
                    {l.title}
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{l.read} read</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 gutter pb-2 pt-7">
        <Logomark size={14} className="text-[var(--amber)]" />
        <span className="text-[11px] tracking-[0.25em] text-muted">DIVASYA · SPIRITUAL JOURNEY</span>
      </div>
    </div>
  );
}
