"use client";

import { useEffect, useRef, useState } from "react";
import { CaretRight } from "@phosphor-icons/react";
import {
  IconAarti, IconBaby, IconBell, IconChat, IconCompass, IconDarshan, IconDiya,
  IconEye, IconFlower, IconJournal, IconLotus, IconMala, IconMandir, IconMore,
  IconGanesha, IconSandesh, IconShare, IconStar, IconWheel,
  type IconComponent,
} from "../icons";
import { useApp, type ScreenName } from "../app-context";
import { DeityPortrait, Logomark, cx } from "../ui";
import { usePanchang } from "@/lib/use-panchang";
import {
  useCatalog, getUpcomingFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope,
  Festival, Article, Shloka,
} from "@/lib/catalog";
import { rashiLabel } from "@/lib/astro";

let firedOnce = false;

type Block = {
  label: string;
  icon: IconComponent;
  to: ScreenName;
  params?: Record<string, unknown>;
};

// Everything the app can do, grouped and surfaced on home.
//   stack — mark above the name, 3-up. For the two big sections, where the
//           tiles are the main way in and want presence.
//   row   — mark beside the name, 2-up. For the short utility list, where a
//           column of tall tiles would be all air.
const SECTIONS: { title: string; layout: "stack" | "row"; blocks: Block[] }[] = [
  {
    title: "Astrology & Guidance",
    layout: "stack",
    blocks: [
      { label: "My Kundli", icon: IconStar, to: "kundli" },
      { label: "AI Jyotishi", icon: IconEye, to: "ai", params: { mode: "jyotishi" } },
      { label: "Talk to Devta", icon: IconDiya, to: "ai", params: { mode: "deity" } },
      { label: "Panchang", icon: IconWheel, to: "panchang" },
      { label: "Consult", icon: IconChat, to: "consult" },
      { label: "Naamkaran", icon: IconBaby, to: "naamkaran" },
    ],
  },
  {
    title: "Devotion",
    layout: "stack",
    blocks: [
      { label: "Mala Jaap", icon: IconMala, to: "mala" },
      { label: "My Mandir", icon: IconMandir, to: "mandir" },
      { label: "Online Puja", icon: IconLotus, to: "puja" },
      { label: "Live Darshan", icon: IconDarshan, to: "temple" },
      { label: "Chadhava", icon: IconFlower, to: "puja", params: { tab: "chadhava" } },
      { label: "Festivals", icon: IconAarti, to: "festivals" },
    ],
  },
  {
    title: "Tools",
    layout: "row",
    blocks: [
      { label: "Vastu", icon: IconCompass, to: "vastu" },
      { label: "Library", icon: IconJournal, to: "library" },
      { label: "Sandesh", icon: IconSandesh, to: "sandesh" },
      { label: "All features", icon: IconMore, to: "menu" },
    ],
  },
];

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

  // Rows beside the mark, in three steps: the name is the title, the sign sits
  // a step under it, and the birth and day details run smaller beneath. Birth
  // details only appear when the profile actually carries them.
  const userRows: { text: string; lead?: boolean }[] = [
    { text: rashi, lead: true },
    profile?.dob
      ? {
          text: `Born ${new Date(profile.dob + "T00:00:00").toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}${profile.tob ? ` · ${profile.tob}` : ""}`,
        }
      : null,
    profile?.birthplace ? { text: profile.birthplace } : null,
    pg ? { text: `${pg.weekday} · ${pg.dateLabel}` } : null,
    pg ? { text: `${pg.tithiDisplay} · ${pg.nakshatra}` } : null,
  ].filter(Boolean) as { text: string; lead?: boolean }[];

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
      {/* Header is desktop-only. On mobile the fixed tab bar is the navigation,
          so a top bar would just be a second one competing with it. */}
      <div className="hidden items-center justify-end gutter pt-2 lg:flex">
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
          <IconBell size={16} className="text-ink" />
        </button>
      </div>

      {/* What is running now — the one time-sensitive thing on the screen, so
          it gets a status dot and reads in a single glance. */}
      <div className="gutter pt-2">
        <button
          onClick={() => go("panchang")}
          className="flex w-full items-center gap-2.5 rounded-2xl surface px-3 py-2.5 text-left"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: chog ? (chog.good ? "var(--good)" : "var(--avoid)") : "var(--muted-2)" }}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] text-ink">
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
            </div>
            <div className="mt-0.5 truncate text-[10.5px] tnum text-muted">
              Sunrise {pg?.sunrise ?? "…"} · Sunset {pg?.sunset ?? "…"} · Rahu {pg?.rahuKaal ?? "—"}
            </div>
          </div>
          <CaretRight size={16} className="shrink-0 text-muted" />
        </button>
      </div>

      {/* Aaj ka Sandesh — the anchor. With the day stated once above, this card
          carries only the verse, its reading and the share, so the shloka gets
          the room to actually land. */}
      <div className="gutter pt-2">
        <div className="rounded-2xl surface p-3">
          <span className="eyebrow text-muted">Aaj ka Sandesh</span>
          <p className="mt-2 measure font-deva text-[18px] leading-[1.85] text-ink">
            {shloka?.deva ?? "…"}
          </p>
          <div className="mt-3 rounded-xl p-3" style={{ background: "var(--bhagwa-dark)" }}>
            <p className="measure text-[11.5px] leading-relaxed text-white/92">
              {shloka?.meaning ?? ""}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate text-[10.5px] text-white/72">{shloka?.source ?? ""}</span>
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

      {/* Who this chart belongs to. The mark is framed on all four sides and
          stretches the full height of the block; the details run beside it as
          rows, stepping down in size from the name. */}
      <div className="gutter pt-1.5">
        <div className="flex items-stretch gap-3 rounded-2xl surface p-2.5">
          <div
            className="grid w-[68px] shrink-0 place-items-center self-stretch overflow-hidden rounded-xl"
            // 2px reads as a mount around the picture; 1px read as a hairline
            style={{ background: "var(--surface-2)", border: "2px solid var(--ink)" }}
          >
            <DeityPortrait
              fallback={<IconGanesha size={46} className="text-[var(--bhagwa-deep)]" strokeWidth={1.3} />}
            />
          </div>

          <div className="min-w-0 flex-1 py-0.5">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display text-[19px] leading-tight text-ink">{name}</span>
              {/* A vrat is the one thing that changes what someone does today,
                  so it keeps the accent instead of joining the run of rows. */}
              {pg?.vrat && (
                <span
                  className="shrink-0 rounded-[4px] px-1.5 py-0.5 text-[10px] text-white"
                  style={{ background: "var(--bhagwa)" }}
                >
                  {pg.vrat}
                </span>
              )}
            </div>
            {userRows.map((r) => (
              <div
                key={r.text}
                className={cx(
                  "truncate tnum leading-snug text-ink",
                  r.lead ? "mt-1 text-[12.5px]" : "mt-0.5 text-[11px]"
                )}
              >
                {r.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* japa streak */}
      <button
        onClick={() => go("mala")}
        className="gutter-m mt-1.5 flex gutter-w items-center gap-4 rounded-2xl surface p-3 text-left"
      >
        {/* Bare mark, set large. The tinted disc behind it was a container
            doing nothing but shrinking the thing it contained. */}
        <IconMala size={38} className="shrink-0 text-[var(--bhagwa)]" strokeWidth={1.4} />
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
        <div key={sec.title} className="gutter pt-1.5">
          <section className="rounded-2xl surface p-2.5">
            <h3 className="section-title mb-2.5">{sec.title}</h3>
            <div
              className={cx(
                "grid gap-2",
                sec.layout === "row" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3 lg:grid-cols-6"
              )}
            >
              {sec.blocks.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.label}
                    onClick={() => go(b.to, b.params)}
                    className={cx(
                      "rounded-xl transition-colors hover:bg-[rgba(222,107,31,0.09)]",
                      sec.layout === "row"
                        ? "flex items-center gap-2.5 px-2.5 py-2.5 text-left"
                        : "flex flex-col items-center gap-2 px-1 py-3"
                    )}
                    style={{ background: "var(--surface-2)" }}
                  >
                    <Icon size={20} className="shrink-0 text-[var(--bhagwa)]" strokeWidth={1.5} />
                    <span
                      className={cx(
                        "text-[11px] leading-tight text-ink",
                        sec.layout === "row" ? "truncate" : "text-center"
                      )}
                    >
                      {b.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
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

      {/* daily horoscope — AI-generated, Supabase-cached */}
      <div className="gutter pt-1.5">
        <div className="rounded-2xl surface p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[14.5px] text-ink">Today · {rashi.split(" ")[0]}</span>
          </div>
          {horoscope ? (
            <p className="mt-2 measure text-[11.5px] leading-relaxed text-muted">{horoscope}</p>
          ) : horoscopeReady ? (
            <p className="mt-2 measure text-[11.5px] leading-relaxed text-muted">
              Today&apos;s reading isn&apos;t ready yet. Ask the Jyotishi below and it will read your chart directly.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="shimmer h-3 w-full rounded-full" style={{ background: "var(--surface-2)" }} />
              <div className="shimmer h-3 w-4/5 rounded-full" style={{ background: "var(--surface-2)" }} />
            </div>
          )}
          <button
            onClick={() => go("ai", { mode: "jyotishi" })}
            className="mt-3 inline-flex items-center gap-1.5 rounded-[5px] px-4 py-2.5 text-[12px] btn-saffron"
          >
            <IconEye size={14} /> Ask the AI Jyotishi
          </button>
        </div>
      </div>

      {/* library — in the same panel form as every other section */}
      {library.length > 0 && (
        <div className="gutter pt-1.5">
          <section className="rounded-2xl surface p-2.5">
            <div className="mb-2.5 flex items-end justify-between">
              <h3 className="section-title">Spiritual Library</h3>
              <button onClick={() => go("library")} className="text-[11px] text-[var(--bhagwa-deep)]">
                Explore all
              </button>
            </div>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 no-scrollbar">
              {library.slice(0, 4).map((l) => (
                <button
                  key={l.id}
                  onClick={() => go("library")}
                  className="w-[136px] shrink-0 overflow-hidden rounded-xl text-left"
                  style={{ background: "var(--surface-2)" }}
                >
                  {/* Flat faded field. No glyph — a decorative icon floating in
                      a frame reads as a stock placeholder, and says nothing the
                      title doesn't already say. */}
                  <div className="h-[58px] w-full" style={{ background: `${l.tint}30` }} />
                  <div className="p-2.5">
                    {/* two lines reserved so "N min read" shares a baseline
                        across the row whether the title wraps or not */}
                    <div className="line-clamp-2 min-h-[2.3em] text-[11px] font-medium leading-tight text-ink">
                      {l.title}
                    </div>
                    <div className="mt-1 text-[10px] text-muted">{l.read} read</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 gutter pb-2 pt-5">
        <Logomark size={13} className="text-[var(--amber)]" />
        <span className="text-[10.5px] text-muted">Divasya · Spiritual Journey</span>
      </div>
    </div>
  );
}
