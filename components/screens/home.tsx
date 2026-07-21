"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, ChevronRight, Share2, Sun, Sunrise } from "lucide-react";
import {
  IconEye, IconDiya, IconMandir, IconMala, IconChat, IconLotus,
  IconWheel, IconCompass, IconFlame, IconBell, IconStar,
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
  useEffect(() => {
    let on = true;
    getShlokaOfDay().then((s) => on && setShloka(s));
    getDailyHoroscope(rashi.split(" ")[0]).then((h) => on && h && setHoroscope(h));
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
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      {/* header */}
      <div className="flex items-center justify-between px-5 pt-2">
        <button onClick={() => go("menu")} className="grid h-9 w-9 place-items-center rounded-full surface lg:invisible">
          <Menu size={18} className="text-ink" />
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
      <div className="flex items-center gap-3 px-5 pt-6">
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
        className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-stretch gap-3 rounded-2xl surface p-3 text-left"
      >
        <div className="flex flex-col justify-center gap-1.5 border-r pr-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-1.5 text-[12px] text-muted"><Sunrise size={13} className="text-[var(--amber)]" /> {pg?.sunrise ?? "…"}</div>
          <div className="flex items-center gap-1.5 text-[12px] text-muted"><Sun size={13} className="text-[var(--ochre-deep)]" /> {pg?.sunset ?? "…"}</div>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <div className="text-[11px] uppercase tracking-wider text-muted">
            Now · Choghadiya · {pg?.weekdayShort ?? ""}
          </div>
          {chog ? (
            <div className="flex items-center gap-2">
              <span className={cx("text-[15px] font-semibold", chog.good ? "text-[var(--good)]" : "text-[var(--avoid)]")}>
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
        <ChevronRight size={18} className="self-center text-muted" />
      </button>

      {/* Aaj ka Sandesh — daily shloka from the backend */}
      <div className="px-5 pt-6">
        <div className="overflow-hidden rounded-2xl card-temple p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold">Aaj ka Sandesh</span>
            <span className="text-[11px] text-muted">{pg ? `${pg.weekday} · ${pg.dateLabel}` : ""}</span>
          </div>
          <p className="mt-3 font-deva text-[17px] leading-relaxed text-ink">
            {shloka?.deva ?? "…"}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">
            {shloka ? `${shloka.meaning} · ${shloka.source}` : ""}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12.5px] text-muted">{pg?.vrat ? `Aaj: ${pg.vrat}` : pg ? `${pg.masa} maas · ${pg.nakshatra}` : ""}</span>
            <button
              onClick={() => go("sandesh")}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] btn-gold"
            >
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* japa streak */}
      <button
        onClick={() => go("mala")}
        className="mx-5 mt-4 flex w-[calc(100%-2.5rem)] items-center gap-4 rounded-2xl surface p-4 text-left"
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
      <div className="px-5 pt-7">
        <SectionLabel>Explore</SectionLabel>
        <div className="grid grid-cols-4 gap-2.5 lg:grid-cols-8 lg:gap-3">
          {GRID.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.label}
                onClick={() => go(g.to as never, ("params" in g ? g.params : undefined) as never)}
                className="flex flex-col items-center gap-2 rounded-2xl surface px-1 py-3.5"
              >
                <Icon size={21} className="text-[var(--amber)]" strokeWidth={1.7} />
                <span className="text-center text-[11px] leading-tight text-ink">{g.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* next festival — real dates from backend */}
      {nextFestival && (
        <div className="px-5 pt-7">
          <button onClick={() => go("festivals")} className="flex w-full items-center gap-3 overflow-hidden rounded-2xl surface p-3 text-left">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl" style={{ background: "linear-gradient(160deg, rgba(255,217,204,0.7), rgba(206,185,118,0.25))", border: "1px solid var(--line-gold)" }}>
              <IconLotus size={28} className="text-[var(--amber-deep)]" />
            </div>
            <div className="flex-1">
              <div className="text-[11px] uppercase tracking-wider text-muted">
                {new Date(nextFestival.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
              </div>
              <div className="font-display text-[17px] text-ink">{nextFestival.name}</div>
              <div className="text-[12px] text-muted">
                {nextFestival.muhurat || nextFestival.about || "View pooja vidhi"}
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
        </div>
      )}

      {/* daily horoscope — AI-generated, Supabase-cached */}
      <div className="px-5 pt-4">
        <div className="rounded-2xl surface p-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-[16px] text-ink">Today · {rashi.split(" ")[0]}</span>
            <IconStar size={18} className="text-[var(--ochre-deep)]" />
          </div>
          {horoscope ? (
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{horoscope}</p>
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
        <div className="px-5 pt-7">
          <SectionLabel action={<button onClick={() => go("library")} className="text-[12px] text-[var(--amber-deep)]">Explore all</button>}>
            Spiritual Library
          </SectionLabel>
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 no-scrollbar">
            {library.slice(0, 4).map((l) => (
              <button key={l.id} onClick={() => go("library")} className="w-40 shrink-0 overflow-hidden rounded-2xl surface text-left">
                <div className="h-24 w-full" style={{ background: `linear-gradient(160deg, ${l.tint}33, ${l.tint}11)` }} />
                <div className="p-3">
                  <div className="text-[13px] font-medium leading-tight text-ink">{l.title}</div>
                  <div className="mt-1 text-[11px] text-muted">{l.read} read</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 px-5 pb-2 pt-8">
        <Logomark size={14} className="text-[var(--amber)]" />
        <span className="text-[11px] tracking-[0.25em] text-muted">DIVASYA · SPIRITUAL JOURNEY</span>
      </div>
    </div>
  );
}
