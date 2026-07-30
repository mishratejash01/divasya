"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { IconSunrise, IconSunset } from "../icons";
import { toPng } from "html-to-image";
import { Bank, Check, Coins, DownloadSimple, Fire, FlowerLotus, Heart, type Icon, Moon, Shield, Sparkle, Sun, Sword, WhatsappLogo } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, Pill, ScreenHeader, Wordmark, cx } from "../ui";
import { deityById } from "@/lib/demo";
import { rashiLabel } from "@/lib/astro";
import {
  useCatalog, getFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope,
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

const FESTIVAL_ICONS: Record<string, Icon> = {
  sun: Sun, flame: Fire, heart: Heart, shield: Shield, landmark: Bank,
  flower: FlowerLotus, sword: Sword, moon: Moon, coins: Coins, sparkles: Sparkle,
};
const festivalIcon = (icon?: string) => (icon && FESTIVAL_ICONS[icon]) || FlowerLotus;
const fmtFestivalDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export function FestivalsScreen() {
  const { go } = useApp();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const festivals = useCatalog(getFestivals, []);
  const todayISO = new Date().toISOString().slice(0, 10);
  const upcoming = festivals.filter((f) => f.date >= todayISO);
  const list = upcoming.length ? upcoming : festivals;
  const hero: Festival | undefined = list[0];
  const rest = list.slice(1, 7);
  const samagri = hero?.samagri?.length ? hero.samagri : SAMAGRI;
  const HeroIcon = festivalIcon(hero?.icon);
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <Header title="Festivals & Pooja" />
      {/* Festival dates come from the database and have no local seed — they
          are lunar and cannot be guessed, and a wrong date in a jyotish app is
          worse than none. Say so rather than showing a blank screen. */}
      {!list.length && (
        <div className="gutter-m mt-2 rounded-2xl p-3 text-center">
          <div className="text-[12.5px] text-ink">No festival dates loaded</div>
          <p className="mx-auto mt-1 measure text-[11px] leading-relaxed text-muted">
            The calendar is served from the backend. Check your connection, or open Panchang
            for today&apos;s tithi and muhurat in the meantime.
          </p>
          <button
            onClick={() => go("panchang")}
            className="mt-3 rounded-[5px] px-4 py-2 text-[11.5px] btn-saffron"
          >
            Open Panchang
          </button>
        </div>
      )}
      {/* No boxed hero and no empty faded band — the festival opens straight
          under the header, its details on the plain ground. */}
      {hero && (
        <div className="gutter pt-3">
          <div className="eyebrow text-muted">{fmtFestivalDate(hero.date)}</div>
          <div className="font-display text-xl text-ink">{hero.name}</div>
          {hero.deva && <div className="mt-0.5 font-deva text-[13.5px] text-gold">{hero.deva}</div>}
          {hero.about && <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{hero.about}</p>}
          {hero.muhurat && <div className="mt-2 text-[11px] text-gold">Muhurat · {hero.muhurat}</div>}
        </div>
      )}

      <div className="gutter pt-4">
        <h3 className="mb-2 section-title lg:text-[17px]">Required Samagri · tick to shop</h3>
        {/* Wider windows fit four across, with a larger tick and label, so the
            list uses the room instead of stranding a column of white. */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
          {samagri.map((s) => (
            <button key={s} onClick={() => setDone((d) => ({ ...d, [s]: !d[s] }))}
              className="flex items-center gap-2.5 rounded-xl px-1 py-2.5 text-left lg:gap-3 lg:py-3.5">
              <span className={cx("grid h-5 w-5 shrink-0 place-items-center rounded-full border lg:h-6 lg:w-6")}
                style={{
                  background: done[s] ? "var(--good)" : "transparent",
                  borderColor: done[s] ? "transparent" : "var(--line-strong)",
                }}>
                {done[s] && <Check size={12} weight="bold" className="text-white" />}
              </span>
              <span className={cx("text-[11.5px] lg:text-[13.5px]", done[s] ? "text-muted line-through" : "text-ink")}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gutter pt-4">
        {hero && hero.vidhi?.length > 0 && (
          <>
            <h3 className="mb-2 section-title">Pooja Vidhi</h3>
            <div>
              {hero.vidhi.map((v, i) => (
                <div key={i} className="flex gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] btn-saffron">{i + 1}</span>
                  <span className="text-[11.5px] leading-relaxed text-ink">{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button onClick={() => go("puja")} className="mt-4 w-full rounded-2xl py-3.5 text-[12.5px] btn-saffron">Book this Puja with a Pandit</button>
      </div>

      {rest.length > 0 && (
        <div className="gutter pt-4">
          <h3 className="mb-2 section-title">Upcoming</h3>
          <div className="overflow-hidden">
            {rest.map((f, i) => {
              const Icon = festivalIcon(f.icon);
              return (
                <div key={f.id} className="flex items-center gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--tile-line)]">
                    <Icon size={15} className="text-[var(--bhagwa)]" />
                  </span>
                  <span className="flex-1 text-[12.5px] text-ink">{f.name}</span>
                  <span className="text-[11px] text-muted">{fmtFestivalDate(f.date)}</span>
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
export function LibraryScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const items = useCatalog(getLibrary, []);
  const article = open ? items.find((x) => x.id === open) : undefined;
  if (article) {
    return (
      // Read like a broadsheet: a kicker, a centred masthead headline under a
      // double rule, and justified body copy with a dropped initial. The back
      // arrow up top returns to the shelf, so the old "Back to library" line at
      // the foot is gone.
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <ScreenHeader title="Spiritual Library" onBack={() => setOpen(null)} />

        {/* hero frame — read time straddles the bottom edge, centred */}
        <div className="gutter pt-3">
          <div className="relative">
            <div className="h-44 w-full rounded-lg" style={{ background: `linear-gradient(160deg, ${article.tint}44, ${article.tint}14)` }} />
            <span
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap rounded-[3px] px-2 py-[2.5px] text-[9.5px] tnum text-ink"
              style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}
            >
              {article.read} read
            </span>
          </div>
        </div>

        {/* masthead */}
        <div className="gutter pt-8 text-center">
          <div className="text-[9.5px] tracking-[0.2em] text-[var(--muted-2)]">Divasya · Spiritual Library</div>
          <h1 className="mx-auto mt-2 max-w-[22ch] font-display text-[25px] leading-[1.12] tracking-[-0.02em] text-ink">
            {article.title}
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
            {article.content}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <Header title="Spiritual Library" />
      {/* Same card as the home shelf: an inset picture with the read time as a
          chip straddling its lower edge, the title beneath. */}
      <div className="grid grid-cols-2 gap-2.5 gutter pt-3">
        {items.map((l) => (
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
                {l.read} read
              </span>
            </div>
            <div className="px-1 pb-1 pt-4">
              <div className="line-clamp-2 min-h-[2.3em] text-[11.5px] font-medium leading-tight text-ink">
                {l.title}
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
  const { deityId, haptic, profile } = useApp();
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
    const text = `Aaj ka Sandesh · ${pg?.dateLabel ?? ""}\n\n${shloka?.deva ?? ""}\n${shloka?.translit ?? ""}\n"${shloka?.meaning ?? ""}"\n\nA blessing for ${name} · ${rashi.split(" ")[0]}\nShared via Divasya`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Aaj ka Sandesh" />

      {/* The poster scrolls; the actions are pinned below. */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 14 }}>
        <div className="gutter pt-3">
          <div ref={card} className="card-temple overflow-hidden rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <Wordmark size={14} />
              <span className="text-[10px] text-muted">{pg ? `${pg.weekdayShort} · ${pg.tithiDisplay}` : ""}</span>
            </div>
            <div className="mt-5 flex justify-center"><DeityGlyph deity={deity} size={58} /></div>
            <div className="mt-3 text-center font-deva text-[18px] leading-relaxed text-ink">{shloka?.deva}</div>
            <div className="mt-2 text-center text-[11px] text-muted">{shloka?.translit}</div>
            <div className="my-4 h-px w-full" style={{ background: "var(--line)" }} />
            <div className="text-center text-[11.5px] leading-relaxed text-ink-dim">
              {horo ?? `Aaj ka din shubh ho · ${pg?.tithiDisplay ?? ""}`}
            </div>
            <div className="mt-5 text-center">
              <div className="text-[11px] text-muted">A blessing for</div>
              <div className="font-display text-lg text-gold">{name} · {rashi.split(" ")[0]}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions pinned above the tab bar. Share is WhatsApp green with its own
          mark; download takes a heavier icon so it reads at a glance. */}
      <div
        className="shrink-0 flex gap-2.5 gutter above-tabbar pt-2.5"
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
