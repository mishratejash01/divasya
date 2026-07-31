"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { IconSunrise, IconSunset } from "../icons";
import { toPng } from "html-to-image";
import { Bank, Check, Coins, DownloadSimple, Fire, FlowerLotus, Heart, type Icon, Moon, Shield, Sparkle, Sun, Sword, WhatsappLogo } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, Logomark, Pill, ScreenHeader, cx } from "../ui";
import { deityById } from "@/lib/demo";
import { rashiLabel } from "@/lib/astro";
import {
  useCatalog, getFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope, tr,
  type Festival, type Shloka,
} from "@/lib/catalog";
import { useFullPanchang, usePanchang, type ChoghadiyaSlot } from "@/lib/use-panchang";

function Header({ title, sub }: { title: string; sub?: string }) {
  const { back } = useApp();
  return (
    <ScreenHeader title={title} sub={sub} onBack={back} />
  );
}

/* ---------------- Panchang ---------------- */

/** One titled white panel. Same unit as the home screen: the heading and the
 *  rows it governs live inside one box, so nothing is ambiguous about which
 *  heading owns which rows. */
function Panel({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="gutter pt-1.5">
      <section className="overflow-hidden rounded-2xl surface">
        <div className="px-3 pb-2 pt-2.5">
          <h3 className="section-title">{title}</h3>
          {/* Every one of these words is Sanskrit. A line of plain English under
              the heading is the difference between a table you can read and a
              table you can only look at. */}
          {note && <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--muted-2)]">{note}</p>}
        </div>
        {children}
      </section>
    </div>
  );
}

/** Label left, value right, and the time it runs out underneath — which is the
 *  part people actually came for. */
function Row({ label, value, until, gloss }: { label: string; value: string; until?: string | null; gloss?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2.5" style={{ borderTop: "1px solid var(--line)" }}>
      <div className="min-w-0">
        <div className="text-[12px] text-ink">{label}</div>
        {gloss && <div className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted-2)]">{gloss}</div>}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[12.5px] text-ink">{value}</div>
        {until && <div className="mt-0.5 text-[10px] tnum text-[var(--muted-2)]">till {until}</div>}
      </div>
    </div>
  );
}

/**
 * What each choghadiya is for. The old row said only "Shubh" or "Avoid", which
 * tells you the verdict but not the reason, and the names themselves — Labh,
 * Rog, Udveg — carry the meaning for anyone who knows Sanskrit and nothing at
 * all for anyone who doesn't.
 */
const CHOGHADIYA: Record<string, { meaning: string; use: string }> = {
  Amrit: { meaning: "Nectar", use: "Best hour of the day — good for anything" },
  Shubh: { meaning: "Auspicious", use: "Ceremonies, marriage, worship" },
  Labh: { meaning: "Gain", use: "Business, new work, money matters" },
  Char: { meaning: "Moving", use: "Travel and errands" },
  Udveg: { meaning: "Unrest", use: "Routine work only" },
  Rog: { meaning: "Illness", use: "Postpone anything important" },
  Kaal: { meaning: "Loss", use: "Postpone anything important" },
};

function ChoghadiyaRow({ slot }: { slot: ChoghadiyaSlot }) {
  const info = CHOGHADIYA[slot.name];
  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2.5"
      style={{
        borderTop: "1px solid var(--line)",
        background: slot.active ? "var(--surface-2)" : undefined,
      }}
    >
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ background: slot.good ? "var(--good)" : "var(--avoid)" }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-[12.5px] text-ink">{slot.name}</span>
          {info && <span className="text-[10.5px] text-[var(--muted-2)]">{info.meaning}</span>}
          {slot.active && (
            <span className="rounded-[3px] px-1.5 py-px text-[9px] btn-saffron">Now</span>
          )}
        </div>
        {info && <div className="mt-0.5 text-[10.5px] leading-relaxed text-ink">{info.use}</div>}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[11px] tnum text-ink">{slot.from}</div>
        <div className="text-[11px] tnum text-[var(--muted-2)]">{slot.to}</div>
      </div>
    </div>
  );
}

export function PanchangScreen() {
  const { data: p } = useFullPanchang();
  if (!p) return <div className="h-full pt-24 text-center text-muted">Computing panchang…</div>;
  const daySlots = p.choghadiya.filter((c) => !c.night);
  const nightSlots = p.choghadiya.filter((c) => c.night);
  const kaal = (code: string) => p.kaals.find((k) => k.code === code);
  const AVOID: [string, string, string][] = [
    ["rahu_kaal", "Rahu Kaal", "Start nothing new"],
    ["yamaganda", "Yamaganda", "Best kept quiet"],
    ["gulika", "Gulika Kaal", "Avoid travel and signing"],
  ];
  const paksha = p.tithi.paksha === "shukla" ? "Shukla" : "Krishna";

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <Header title="Panchang" />

      <Panel
        title="Today"
        note="The five limbs of the day — vaar, tithi, nakshatra, yoga and karana. Each ends at its own hour, not at midnight."
      >
        {/* The date and samvat used to sit loose above the first card, left of a
            pill and aligned to nothing. They belong to this panel. */}
        <div className="px-3 pb-2.5" style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <div className="flex items-baseline justify-between gap-3">
            <div className="font-display text-[15px] leading-tight text-ink">{p.home.dateLabel}</div>
            <div className="shrink-0 text-[11px] text-ink">{p.vaara.name_en}</div>
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[10.5px] text-[var(--muted-2)]">
            <span>{p.masa.amanta} {paksha} paksha</span>
            <span>·</span>
            <span className="tnum">Vikram Samvat {p.samvat.vikram}</span>
            <span>·</span>
            <span className="tnum">Shaka {p.samvat.shaka}</span>
          </div>
          {p.home.vrat && <div className="mt-2"><Pill tone="gold">{p.home.vrat}</Pill></div>}
        </div>

        {/* Sun and moon on one strip — four times that belong together. */}
        <div className="grid grid-cols-2" style={{ borderTop: "1px solid var(--line)" }}>
          {([
            [IconSunrise, "Sunrise", p.sun.rise],
            [IconSunset, "Sunset", p.sun.set],
            [null, "Moonrise", p.moon.rise],
            [null, "Moonset", p.moon.set],
          ] as const).map(([Icon, label, value], i) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-2.5"
              style={{
                borderTop: i > 1 ? "1px solid var(--line)" : undefined,
                borderLeft: i % 2 ? "1px solid var(--line)" : undefined,
              }}
            >
              {Icon
                ? <Icon size={15} className="shrink-0 text-[var(--bhagwa)]" strokeWidth={1.7} />
                : <Moon size={15} weight="light" className="shrink-0 text-[var(--bhagwa)]" />}
              <div className="min-w-0">
                <div className="text-[10px] leading-none text-[var(--muted-2)]">{label}</div>
                <div className="mt-1 text-[12.5px] leading-none tnum text-ink">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <Row label="Tithi" gloss="Lunar day" value={`${paksha} ${p.tithi.name}`} until={p.tithi.endsAt} />
        <Row label="Nakshatra" gloss="The moon's constellation" value={p.nakshatra.name} until={p.nakshatra.endsAt} />
        <Row label="Yoga" gloss="Sun and moon combined" value={p.yoga.name} until={p.yoga.endsAt} />
        <Row label="Karana" gloss="Half a tithi" value={p.karana.name} until={p.karana.endsAt} />
        <Row label="Vaar" gloss="Weekday" value={p.vaara.name_sa} />
        <Row
          label="Masa"
          gloss="Lunar month"
          value={`${p.masa.amanta}${p.masa.isAdhika ? " (Adhika)" : ""}`}
        />
      </Panel>

      <Panel
        title="Choghadiya · Day"
        note="Sunrise to sunset split into eight parts. Green is a good window to begin something; red is one to let pass."
      >
        {daySlots.map((c, i) => <ChoghadiyaRow key={i} slot={c} />)}
      </Panel>

      <Panel
        title="Choghadiya · Night"
        note="Sunset to the next sunrise, split the same way."
      >
        {nightSlots.map((c, i) => <ChoghadiyaRow key={i} slot={c} />)}
      </Panel>

      <Panel
        title="Hours to avoid"
        note="Fixed inauspicious windows. They fall at a different hour each weekday."
      >
        {AVOID.map(([code, label, why]) => {
          const k = kaal(code);
          return (
            <div key={code} className="flex items-center justify-between gap-3 px-3 py-2.5"
              style={{ borderTop: "1px solid var(--line)" }}>
              <div className="min-w-0">
                <div className="text-[12.5px] text-ink">{label}</div>
                <div className="mt-0.5 text-[10.5px] text-ink">{why}</div>
              </div>
              <div className="shrink-0 text-right text-[11px] tnum" style={{ color: "var(--avoid)" }}>
                {k ? <>{k.from}<br />{k.to}</> : "—"}
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}

/* ---------------- Festivals ---------------- */
const SAMAGRI = ["Fresh fruits", "Flowers", "Milk", "Incense sticks", "Curd", "Diya (lamp)", "Honey", "Sweets", "Rice"];
const SAMAGRI_HI = ["ताज़े फल", "फूल", "दूध", "अगरबत्ती", "दही", "दीया", "शहद", "मिठाई", "चावल"];

const FESTIVAL_ICONS: Record<string, Icon> = {
  sun: Sun, flame: Fire, heart: Heart, shield: Shield, landmark: Bank,
  flower: FlowerLotus, sword: Sword, moon: Moon, coins: Coins, sparkles: Sparkle,
};
const festivalIcon = (icon?: string) => (icon && FESTIVAL_ICONS[icon]) || FlowerLotus;
const fmtFestivalDate = (iso: string, lang: "en" | "hi" = "en") =>
  new Date(iso).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });

export function FestivalsScreen() {
  const { go, lang } = useApp();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const festivals = useCatalog(getFestivals, []);
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = festivals.filter((f) => f.date >= todayISO);
  const list = upcoming.length ? upcoming : festivals;
  const hero: Festival | undefined = list[0];
  const rest = list.slice(1, 7);
  // Prefer the Hindi list only when one was actually seeded; otherwise show the
  // English items rather than a blank grid.
  const heroSamagri = hero?.samagri?.length ? hero.samagri : SAMAGRI;
  const samagri = lang === "hi"
    ? (hero?.samagri_hi?.length ? hero.samagri_hi : (hero?.samagri?.length ? hero.samagri : SAMAGRI_HI))
    : heroSamagri;
  const vidhi = hero ? (lang === "hi" && hero.vidhi_hi?.length ? hero.vidhi_hi : hero.vidhi) : [];
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <Header title={lang === "hi" ? "पर्व एवं पूजा" : "Festivals & Pooja"} />
      <div className="flex items-center justify-end gutter-m"><LangToggle /></div>
      {/* Festival dates are served from the database — lunar, so they cannot be
          guessed. Say so rather than showing a blank screen. */}
      {!list.length && (
        <div className="gutter-m mt-2 rounded-2xl p-3 text-center">
          <div className="text-[12.5px] text-ink">{lang === "hi" ? "अभी कोई तिथि उपलब्ध नहीं" : "No festival dates loaded"}</div>
          <p className="mx-auto mt-1 measure text-[11px] leading-relaxed text-muted">
            {lang === "hi"
              ? "पंचांग बैकएंड से आता है। अपना कनेक्शन जाँचें, या तब तक आज की तिथि और मुहूर्त के लिए पंचांग खोलें।"
              : "The calendar is served from the backend. Check your connection, or open Panchang for today's tithi and muhurat in the meantime."}
          </p>
          <button
            onClick={() => go("panchang")}
            className="mt-3 rounded-[5px] px-4 py-2 text-[11.5px] btn-saffron"
          >
            {lang === "hi" ? "पंचांग खोलें" : "Open Panchang"}
          </button>
        </div>
      )}
      {/* No boxed hero and no empty faded band — the festival opens straight
          under the header, its details on the plain ground. */}
      {hero && (
        <div className="gutter pt-3">
          <div className="eyebrow text-muted">{fmtFestivalDate(hero.date, lang)}</div>
          <div className="font-display text-xl text-ink">{tr(lang, hero.name, hero.name_hi)}</div>
          {hero.deva && <div className="mt-0.5 font-deva text-[13.5px] text-gold">{hero.deva}</div>}
          {(hero.about || hero.about_hi) && <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{tr(lang, hero.about, hero.about_hi)}</p>}
          {(hero.muhurat || hero.muhurat_hi) && <div className="mt-2 text-[11px] text-gold">{lang === "hi" ? "मुहूर्त" : "Muhurat"} · {tr(lang, hero.muhurat, hero.muhurat_hi)}</div>}
        </div>
      )}

      <div className="gutter pt-4">
        <h3 className="mb-2 section-title lg:text-[17px]">{lang === "hi" ? "आवश्यक सामग्री" : "Required Samagri · tick to shop"}</h3>
        {/* Wider windows fit four across, with a larger tick and label, so the
            list uses the room instead of stranding a column of white. */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {samagri.map((s, i) => {
            const key = String(i);
            return (
            <button key={key} onClick={() => setDone((d) => ({ ...d, [key]: !d[key] }))}
              className="flex items-center gap-2.5 rounded-xl px-1 py-2.5 text-left lg:gap-3 lg:py-3.5">
              <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border lg:h-6 lg:w-6")}
                style={{
                  background: done[key] ? "var(--good)" : "transparent",
                  borderColor: done[key] ? "transparent" : "var(--line-strong)",
                }}>
                {done[key] && <Check size={12} weight="bold" className="text-white" />}
              </span>
              <span className={cx("text-[11.5px] lg:text-[13.5px]", done[key] ? "text-muted line-through" : "text-ink")}>{s}</span>
            </button>
            );
          })}
        </div>
      </div>

      <div className="gutter pt-4">
        {vidhi.length > 0 && (
          <>
            <h3 className="mb-2 section-title">{lang === "hi" ? "पूजा विधि" : "Pooja Vidhi"}</h3>
            <div>
              {vidhi.map((v, i) => (
                <div key={i} className="flex gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] btn-saffron">{i + 1}</span>
                  <span className="text-[11.5px] leading-relaxed text-ink">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button onClick={() => go("puja")} className="mt-4 w-full rounded-2xl py-3.5 text-[12.5px] btn-saffron">{lang === "hi" ? "पंडित से यह पूजा बुक करें" : "Book this Puja with a Pandit"}</button>
      </div>

      {rest.length > 0 && (
        <div className="gutter pt-4">
          <h3 className="mb-2 section-title">{lang === "hi" ? "आगामी" : "Upcoming"}</h3>
          <div className="overflow-hidden">
            {rest.map((f, i) => {
              const Icon = festivalIcon(f.icon);
              return (
                <div key={f.id} className="flex items-center gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--tile-line)]">
                    <Icon size={15} className="text-[var(--bhagwa)]" />
                  </span>
                  <span className="flex-1 text-[12.5px] text-ink">{tr(lang, f.name, f.name_hi)}</span>
                  <span className="text-[11px] text-muted">{fmtFestivalDate(f.date, lang)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Library ---------------- */
// Shelves group the library so it reads as a curated collection, not one long
// grid. The id matches library_articles.category; labels carry both languages.
const LIBRARY_SHELVES: { id: string; en: string; hi: string }[] = [
  { id: "all", en: "All", hi: "सभी" },
  { id: "deities", en: "Deities", hi: "देव" },
  { id: "festivals", en: "Festivals", hi: "पर्व" },
  { id: "practice", en: "Practice", hi: "साधना" },
  { id: "wisdom", en: "Wisdom", hi: "ज्ञान" },
  { id: "jyotish", en: "Jyotish", hi: "ज्योतिष" },
];

function LangToggle() {
  const { lang, setLang, haptic } = useApp();
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full p-1" style={{ background: "var(--surface-2)" }}>
      {(["en", "hi"] as const).map((code) => (
        <button
          key={code}
          onClick={() => { haptic(6); setLang(code); }}
          className={cx("rounded-full px-3 py-1 text-[10.5px]", lang === code ? "btn-saffron" : "text-muted")}
        >
          {code === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}

export function LibraryScreen() {
  const { lang } = useApp();
  const [open, setOpen] = useState<string | null>(null);
  const [shelf, setShelf] = useState("all");
  const items = useCatalog(getLibrary, []);
  const article = open ? items.find((x) => x.id === open) : undefined;
  const heading = lang === "hi" ? "आध्यात्मिक पुस्तकालय" : "Spiritual Library";
  const readWord = lang === "hi" ? "पढ़ने का समय" : "read";

  if (article) {
    return (
      // Read like a broadsheet: a kicker, a centred masthead headline under a
      // double rule, and justified body copy with a dropped initial. The back
      // arrow up top returns to the shelf, so the old "Back to library" line at
      // the foot is gone.
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <ScreenHeader title={heading} onBack={() => setOpen(null)} />

        {/* hero frame — read time straddles the bottom edge, centred */}
        <div className="gutter pt-3">
          <div className="relative">
            <div className="h-44 w-full rounded-lg" style={{ background: `linear-gradient(160deg, ${article.tint}44, ${article.tint}14)` }} />
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-[3px] px-2 py-[2.5px] text-[9.5px] tnum text-ink"
              style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
            >
              {article.read} {readWord}
            </span>
          </div>
        </div>

        {/* masthead */}
        <div className="gutter pt-8 text-center">
          <div className="text-[9.5px] tracking-[0.2em] text-[var(--muted-2)]">Divasya · {heading}</div>
          <h1 className="mx-auto mt-2 max-w-[22ch] font-display text-[25px] leading-[1.12] tracking-[-0.02em] text-ink">
            {tr(lang, article.title, article.title_hi)}
          </h1>
        </div>

        {/* double rule */}
        <div className="gutter pt-4">
          <div style={{ borderTop: "2px solid var(--ink)" }} />
          <div className="mt-[3px]" style={{ borderTop: "1px solid var(--ink)" }} />
        </div>

        {/* body — justified, with a dropped initial on the first letter */}
        <div className="gutter pt-4">
          <p className="whitespace-pre-wrap text-justify text-[12.5px] leading-[1.7] text-ink first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:font-display first-letter:text-[42px] first-letter:leading-[0.72] first-letter:text-[var(--bhagwa-deep)]">
            {tr(lang, article.content, article.content_hi)}
          </p>
        </div>
      </div>
    );
  }

  const shown = shelf === "all" ? items : items.filter((l) => l.category === shelf);
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <Header title={heading} />
      <div className="flex items-center justify-end gutter-m"><LangToggle /></div>
      {/* shelves */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar gutter pb-1">
        {LIBRARY_SHELVES.map((s) => (
          <button
            key={s.id}
            onClick={() => setShelf(s.id)}
            className={cx("shrink-0 rounded-full px-3 py-1.5 text-[11px]", shelf === s.id ? "btn-saffron" : "surface text-muted")}
          >
            {lang === "hi" ? s.hi : s.en}
          </button>
        ))}
      </div>
      {/* Same card as the home shelf: an inset picture with the read time as a
          chip straddling its lower edge, the title beneath. */}
      <div className="grid grid-cols-2 gap-2.5 gutter pt-3">
        {shown.map((l) => (
          <button
            key={l.id}
            onClick={() => setOpen(l.id)}
            className="rounded-xl p-1.5 text-left"
            style={{ background: "var(--surface-2)" }}
          >
            <div className="relative">
              <div className="h-[92px] w-full rounded-lg" style={{ background: `${l.tint}3a` }} />
              <span
                className="absolute bottom-0 right-1.5 translate-y-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[1.5px] text-[9px] tnum text-ink"
                style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
              >
                {l.read} {readWord}
              </span>
            </div>
            <div className="px-1 pb-1 pt-4">
              <div className="line-clamp-2 min-h-[2.3em] text-[11.5px] font-medium leading-tight text-ink">
                {tr(lang, l.title, l.title_hi)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Sandesh share card ---------------- */
export function SandeshScreen() {
  const { deityId, haptic, profile, lang } = useApp();
  const deity = deityById(deityId);
  const card = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });
  const { panchang: pg } = usePanchang();
  const [shloka, setShloka] = useState<Shloka | null>(null);
  useEffect(() => { getShlokaOfDay().then(setShloka); }, []);
  const [horo, setHoro] = useState<string | null>(null);
  useEffect(() => { getDailyHoroscope(rashi.split(" ")[0]).then(setHoro); }, [rashi]);

  async function download() {
    if (!card.current) return;
    setBusy(true);
    try {
      const url = await toPng(card.current, { pixelRatio: 2.5, cacheBust: true });
      const a = document.createElement("a");
      a.href = url; a.download = "aaj-ka-sandesh.png"; a.click();
      haptic(12);
    } catch {} finally { setBusy(false); }
  }
  function whatsapp() {
    const text = `Aaj ka Sandesh · ${pg?.dateLabel ?? ""}\n\n${shloka?.deva ?? ""}\n${shloka?.translit ?? ""}\n"${tr(lang, shloka?.meaning, shloka?.meaning_hi)}"\n\nA blessing for ${name} · ${rashi.split(" ")[0]}\nShared via Divasya`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // ── Scroll pieces, shared between the portrait (phone) and landscape
  //    (desktop) compositions so neither can drift. ──────────────────────
  const GOLD = "#B98A2E", GOLD_D = "#9A6B1E", INK_M = "#5A2A14", INK_S = "#8a5a2a";
  const FINIAL_H = "linear-gradient(180deg,#E7C874,#B9863A 52%,#7d571e)";
  const FINIAL_V = "linear-gradient(90deg,#E7C874,#B9863A 52%,#7d571e)";

  const tassel = (
    <div className="flex flex-col items-center">
      <div style={{ width: 2, height: 20, background: "linear-gradient(#7d571e,#8a2f18)" }} />
      <div style={{ width: 12, height: 10, borderRadius: "6px 6px 4px 4px", background: "linear-gradient(180deg,#a83a1c,#6e2410)", boxShadow: "inset 0 1px 1px rgba(255,205,155,.45)" }} />
      <div style={{ width: 14, height: 13, marginTop: "-1px", background: "repeating-linear-gradient(90deg,#7d2414 0 1.5px,#B9863A 1.5px 3px)", clipPath: "polygon(0 0,100% 0,86% 100%,50% 88%,14% 100%)" }} />
    </div>
  );

  const titleBlock = (
    <div>
      <div className="font-deva text-[13.5px] tracking-wide" style={{ color: GOLD_D }}>॥ आज का सन्देश ॥</div>
      <div className="mt-1 text-[9.5px]" style={{ color: INK_S }}>{pg ? `${pg.weekdayShort} · ${pg.tithiDisplay}` : ""}</div>
    </div>
  );

  const deityMark = (
    <div className="flex justify-center">
      <span className="rounded-full p-[3px]" style={{ background: GOLD }}><DeityGlyph deity={deity} size={58} /></span>
    </div>
  );

  const verseBlock = (
    <div>
      <div className="font-deva text-[20px] leading-[2] lg:text-[23px]" style={{ color: INK_M }}>{shloka?.deva}</div>
      <div className="mt-1.5 text-[11px] italic" style={{ color: INK_S }}>{shloka?.translit}</div>
    </div>
  );

  const divider = (
    <div className="flex items-center justify-center gap-2.5" style={{ color: GOLD }}>
      <span className="h-px w-12" style={{ background: GOLD, opacity: 0.55 }} />
      <span className="text-[11px] leading-none">◆</span>
      <span className="h-px w-12" style={{ background: GOLD, opacity: 0.55 }} />
    </div>
  );

  const blessingLine = (
    <div className="mx-auto max-w-[32ch] text-[12px] leading-relaxed" style={{ color: INK_M }}>
      {horo ?? `Aaj ka din shubh ho · ${pg?.tithiDisplay ?? ""}`}
    </div>
  );

  const astroReadout = (
    <div className="mx-auto flex max-w-[19rem] justify-center rounded-[6px] py-2.5" style={{ border: "1px solid rgba(185,138,46,.4)", background: "rgba(185,138,46,.07)" }}>
      {([["Rashi", rashi.split(" ")[0]], ["Nakshatra", profile?.nakshatra || "—"], ["Tithi", pg?.tithiDisplay || "—"]] as const).map(([l, v], i) => (
        <div key={l} className="flex-1 px-2" style={{ borderLeft: i ? "1px solid rgba(185,138,46,.3)" : undefined }}>
          <div className="text-[8px] uppercase tracking-[0.12em]" style={{ color: GOLD_D }}>{l}</div>
          <div className="mt-0.5 text-[10.5px] font-medium leading-tight" style={{ color: INK_M }}>{v}</div>
        </div>
      ))}
    </div>
  );

  const brandSeal = (
    <div className="flex flex-col items-center gap-1.5">
      <span className="grid h-14 w-14 place-items-center rounded-full" style={{ background: "radial-gradient(circle at 35% 28%, #9a3a1e, #571a08)", boxShadow: "0 3px 8px rgba(0,0,0,.32), inset 0 1px 2px rgba(255,205,155,.45)", border: `1.5px solid ${GOLD}` }}>
        <Logomark size={30} className="text-[#F3E4BE]" />
      </span>
      <span className="font-display text-[16px] leading-none tracking-[0.01em]" style={{ color: INK_M }}>Divasya</span>
      <span className="font-deva text-[8.5px] tracking-[0.2em]" style={{ color: GOLD_D }}>आध्यात्मिक यात्रा</span>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <Header title="Aaj ka Sandesh" />

      {/* The poster is a share card — held to a portrait width and centred, not
          stretched across the page. On desktop the actions sit right under it;
          a phone keeps them pinned to the bottom edge. */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 14 }}>
        <div className="gutter pt-3 lg:pt-8">
          <div className="mx-auto w-full max-w-[440px] lg:max-w-[1140px]">
            {/* A royal proclamation on a scroll — portrait on a phone (rods top
                and bottom), landscape on desktop (rods left and right). */}
            <div ref={card} className="relative flex flex-col lg:flex-row">
              {/* phone top rod (horizontal) with hanging tassels */}
              <div className="relative z-10 h-[22px] lg:hidden">
                <div className="absolute inset-x-1.5 top-1/2 h-[15px] -translate-y-1/2" style={{ borderRadius: 8, background: "linear-gradient(180deg,#8a5a2a,#5a3618 46%,#331d0d 56%,#6e4620)", boxShadow: "0 3px 6px rgba(50,25,8,.35), inset 0 1.5px 0 rgba(255,225,175,.35), inset 0 -2px 3px rgba(0,0,0,.45)" }} />
                <div className="absolute left-0 top-1/2 h-[22px] w-[14px] -translate-y-1/2" style={{ borderRadius: 7, background: FINIAL_H, boxShadow: "0 2px 4px rgba(50,25,8,.4), inset 0 1px 1px rgba(255,240,200,.6), inset 0 -1px 2px rgba(90,55,20,.5)" }} />
                <div className="absolute right-0 top-1/2 h-[22px] w-[14px] -translate-y-1/2" style={{ borderRadius: 7, background: FINIAL_H, boxShadow: "0 2px 4px rgba(50,25,8,.4), inset 0 1px 1px rgba(255,240,200,.6), inset 0 -1px 2px rgba(90,55,20,.5)" }} />
                <div className="absolute left-[2px] top-[15px]">{tassel}</div>
                <div className="absolute right-[2px] top-[15px]">{tassel}</div>
              </div>

              {/* desktop left rod (vertical) with a hanging tassel */}
              <div className="relative z-10 hidden w-[22px] shrink-0 self-stretch lg:block">
                <div className="absolute inset-y-1.5 left-1/2 w-[15px] -translate-x-1/2" style={{ borderRadius: 8, background: "linear-gradient(90deg,#8a5a2a,#5a3618 46%,#331d0d 56%,#6e4620)", boxShadow: "3px 0 6px rgba(50,25,8,.35), inset 1.5px 0 0 rgba(255,225,175,.35), inset -2px 0 3px rgba(0,0,0,.45)" }} />
                <div className="absolute left-1/2 top-0 h-[14px] w-[22px] -translate-x-1/2" style={{ borderRadius: 7, background: FINIAL_V, boxShadow: "0 2px 4px rgba(50,25,8,.4)" }} />
                <div className="absolute bottom-0 left-1/2 h-[14px] w-[22px] -translate-x-1/2" style={{ borderRadius: 7, background: FINIAL_V, boxShadow: "0 2px 4px rgba(50,25,8,.4)" }} />
                <div className="absolute left-1/2 top-[12px] -translate-x-1/2">{tassel}</div>
              </div>

              {/* parchment */}
              <div
                className="relative z-0 -my-1 mx-3.5 min-w-0 flex-1 px-4 py-6 lg:mx-0 lg:my-0 lg:px-10 lg:py-9"
                style={{
                  background: "radial-gradient(130% 120% at 50% -10%, #FCF3DD, #F3E4BE 55%, #E7D2A4)",
                  boxShadow: "inset 0 0 46px rgba(120,80,30,.14)",
                }}
              >
                <div
                  className="rounded-[8px] px-5 py-6 text-center lg:px-10 lg:py-8"
                  style={{ border: "1.5px solid #B98A2E", boxShadow: "inset 0 0 0 3px rgba(185,138,46,.16)" }}
                >
                  {/* portrait (phone) */}
                  <div className="space-y-4 lg:hidden">
                    {titleBlock}
                    {deityMark}
                    {verseBlock}
                    {divider}
                    {blessingLine}
                    {astroReadout}
                    {brandSeal}
                  </div>

                  {/* landscape (desktop) */}
                  <div className="hidden lg:grid lg:grid-cols-[1fr_1px_1fr] lg:items-center lg:gap-14">
                    <div className="space-y-4">
                      {deityMark}
                      {verseBlock}
                    </div>
                    <div className="mx-auto h-[78%] w-px" style={{ background: "rgba(185,138,46,.4)" }} />
                    <div className="space-y-4">
                      {titleBlock}
                      {blessingLine}
                      {astroReadout}
                      {brandSeal}
                    </div>
                  </div>
                </div>
              </div>

              {/* desktop right rod (vertical) with a hanging tassel */}
              <div className="relative z-10 hidden w-[22px] shrink-0 self-stretch lg:block">
                <div className="absolute inset-y-1.5 left-1/2 w-[15px] -translate-x-1/2" style={{ borderRadius: 8, background: "linear-gradient(90deg,#6e4620,#331d0d 44%,#5a3618 54%,#8a5a2a)", boxShadow: "-3px 0 6px rgba(50,25,8,.35), inset -1.5px 0 0 rgba(255,225,175,.32), inset 2px 0 3px rgba(0,0,0,.45)" }} />
                <div className="absolute left-1/2 top-0 h-[14px] w-[22px] -translate-x-1/2" style={{ borderRadius: 7, background: FINIAL_V, boxShadow: "0 2px 4px rgba(50,25,8,.4)" }} />
                <div className="absolute bottom-0 left-1/2 h-[14px] w-[22px] -translate-x-1/2" style={{ borderRadius: 7, background: FINIAL_V, boxShadow: "0 2px 4px rgba(50,25,8,.4)" }} />
                <div className="absolute left-1/2 top-[12px] -translate-x-1/2">{tassel}</div>
              </div>

              {/* phone bottom rod (horizontal) */}
              <div className="relative z-10 h-[22px] lg:hidden">
                <div className="absolute inset-x-1.5 top-1/2 h-[15px] -translate-y-1/2" style={{ borderRadius: 8, background: "linear-gradient(180deg,#6e4620,#331d0d 44%,#5a3618 54%,#8a5a2a)", boxShadow: "0 3px 6px rgba(50,25,8,.35), inset 0 -1.5px 0 rgba(255,225,175,.32), inset 0 2px 3px rgba(0,0,0,.45)" }} />
                <div className="absolute left-0 top-1/2 h-[22px] w-[14px] -translate-y-1/2" style={{ borderRadius: 7, background: FINIAL_H, boxShadow: "0 2px 4px rgba(50,25,8,.4), inset 0 1px 1px rgba(255,240,200,.6), inset 0 -1px 2px rgba(90,55,20,.5)" }} />
                <div className="absolute right-0 top-1/2 h-[22px] w-[14px] -translate-y-1/2" style={{ borderRadius: 7, background: FINIAL_H, boxShadow: "0 2px 4px rgba(50,25,8,.4), inset 0 1px 1px rgba(255,240,200,.6), inset 0 -1px 2px rgba(90,55,20,.5)" }} />
              </div>
            </div>

            {/* Desktop actions — a compact row centred under the scroll */}
            <div className="mt-5 hidden gap-2.5 lg:mx-auto lg:flex lg:max-w-[420px]">
              <button
                onClick={whatsapp}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[13px] font-medium text-white"
                style={{ background: "#25D366" }}
              >
                <WhatsappLogo size={17} weight="fill" /> Share to WhatsApp
              </button>
              <button
                onClick={download}
                disabled={busy}
                aria-label="Download poster"
                className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl btn-ghost disabled:opacity-50"
              >
                <DownloadSimple size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions — phone only, pinned above the tab bar. */}
      <div
        className="shrink-0 flex gap-2.5 gutter above-tabbar pt-2.5 lg:hidden"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--line)" }}
      >
        <button
          onClick={whatsapp}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[12.5px] font-medium text-white"
          style={{ background: "#25D366" }}
        >
          <WhatsappLogo size={17} weight="fill" /> Share to WhatsApp
        </button>
        <button
          onClick={download}
          disabled={busy}
          aria-label="Download poster"
          className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl btn-ghost disabled:opacity-50"
        >
          <DownloadSimple size={20} weight="bold" />
        </button>
      </div>
    </div>
  );
}
