"use client";

import { type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { IconSunrise, IconSunset } from "../icons";
import { toPng } from "html-to-image";
import { motion, useReducedMotion } from "framer-motion";
import { InstantEntry } from "../reveal-text";
import { Bank, Check, Coins, DownloadSimple, Fire, FlowerLotus, Heart, type Icon, Moon, Shield, Sparkle, Sun, Sword, WhatsappLogo } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, Logomark, Pill, ScreenHeader, cx } from "../ui";
import { PageHeader } from "../page-header";
import { LibraryImage } from "../library-image";
import { deityById } from "@/lib/demo";
import { rashiLabel } from "@/lib/astro";
import {
  useCatalog, getFestivals, getLibrary, getShlokaOfDay, getDailyHoroscope, tr,
  type Festival, type Shloka,
} from "@/lib/catalog";
import { useFullPanchang, usePanchang, type ChoghadiyaSlot } from "@/lib/use-panchang";

function Header({ title, sub, gradient, shadow, art }: {
  title: string; sub?: string; gradient?: string; shadow?: string; art?: string;
}) {
  const { back } = useApp();
  return (
    <PageHeader title={title} subtitle={sub} onBack={back} gradient={gradient} shadow={shadow} art={art} />
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

// Choghadiya names in Devanagari — a panchang lists them by name, not "Loss".
const CHOG_SA: Record<string, string> = {
  Amrit: "अमृत", Shubh: "शुभ", Labh: "लाभ", Char: "चर", Udveg: "उद्वेग", Rog: "रोग", Kaal: "काल",
};

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

// Almanac palette + ornaments — the panchang is styled like a printed panchang
// page: cream paper, a gold frame, Devanagari headings and ◆ dividers.
const P_GOLD = "#B98A2E", P_INK = "#5A2A14", P_MUT = "#8a5a2a", P_LINE = "rgba(185,138,46,.35)", P_CREAM = "#F4E4BE";
function GoldRule() {
  return (
    <div className="mx-4 my-0.5 flex items-center justify-center gap-2" style={{ color: P_GOLD }}>
      <span className="h-px flex-1" style={{ background: "rgba(185,138,46,.45)" }} />
      <span className="text-[9px] leading-none">◆</span>
      <span className="h-px flex-1" style={{ background: "rgba(185,138,46,.45)" }} />
    </div>
  );
}
function PSection({ sa, en }: { sa: string; en: string }) {
  return (
    <div className="px-4 pb-1 pt-2.5 text-center">
      <div className="font-deva text-[14.5px] leading-tight" style={{ color: P_GOLD }}>{sa}</div>
      <div className="text-[8.5px] uppercase tracking-[0.16em]" style={{ color: P_MUT }}>{en}</div>
    </div>
  );
}

// The day's panchang as a Shahi Farmaan — a royal decree: aged parchment
// between two carved gold rods, unrolling as the page opens, an ornamental
// heading over every section, an artifact beside every entry and a red wax
// seal pressed at the foot.
const F_INK = "#4A1D0E", F_MUT = "#80522A", F_GOLD = "#A8781F", F_RULE = "rgba(168,120,31,.38)";
const PAPER =
  "radial-gradient(120% 60% at 50% 0%, rgba(255,247,222,.65) 0%, rgba(255,247,222,0) 60%)," +
  "radial-gradient(90% 50% at 15% 85%, rgba(150,95,30,.10) 0%, rgba(150,95,30,0) 70%)," +
  "radial-gradient(70% 40% at 90% 30%, rgba(150,95,30,.09) 0%, rgba(150,95,30,0) 70%)," +
  "linear-gradient(180deg, #F3E3BC 0%, #EED9A9 50%, #E9D09A 100%)";

const CHOG_ART: Record<string, string> = {
  Amrit: "chog-amrit", Shubh: "chog-shubh", Labh: "chog-labh", Char: "chog-char",
  Udveg: "chog-udveg", Rog: "chog-rog", Kaal: "chog-kaal",
};

/** A section heading under the Mughal lotus divider. */
function FHeading({ sa, en }: { sa: string; en: string }) {
  return (
    <div className="pb-2 pt-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/panchang/farmaan-divider.webp" alt="" className="mx-auto block w-[92%]" />
      <div className="mt-1.5 font-deva text-[16px] leading-none" style={{ color: F_INK }}>{sa}</div>
      <div className="mt-1 text-[8px] uppercase tracking-[0.24em]" style={{ color: F_MUT }}>{en}</div>
    </div>
  );
}

function Art({ src, size = 34 }: { src: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

type FarmaanPhase = "closed" | "breaking" | "open";

/**
 * The opening of the farmaan: it arrives rolled shut, tied with a red silk
 * ribbon under a wax seal; the seal cracks apart in a spray of gold, the
 * ribbon slips away, the parchment unrolls and the decree is read out
 * section by section. Returning to the page (back) shows it already open.
 */
function useFarmaanPhase(ready: boolean): FarmaanPhase {
  const instant = useContext(InstantEntry);
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<FarmaanPhase>(instant || reduce ? "open" : "closed");
  useEffect(() => {
    if (!ready || phase === "open") return;
    const a = window.setTimeout(() => setPhase("breaking"), 750);
    const b = window.setTimeout(() => setPhase("open"), 1250);
    return () => { window.clearTimeout(a); window.clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  return phase;
}

const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
  const dist = 46 + (i % 3) * 18;
  return { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist * 0.8, s: 3 + (i % 3) };
});

/** The ribbon and wax seal that tie the closed farmaan. */
function FarmaanSeal({ phase }: { phase: FarmaanPhase }) {
  const broken = phase !== "closed";
  const half = (side: -1 | 1) => (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{
        clipPath: side < 0 ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
        background: "radial-gradient(circle at 35% 30%, #D2453A 0%, #9E1F1A 55%, #5E0E0B 100%)",
        boxShadow: "inset 0 -3px 6px rgba(0,0,0,.35), inset 0 3px 6px rgba(255,160,140,.35)",
      }}
      animate={broken ? { x: side * 34, y: 70, rotate: side * 38, opacity: 0 } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.4, 0, 0.6, 1] }}
    >
      <span className="absolute inset-0 grid place-items-center font-deva text-[26px] leading-none" style={{ color: "#F7C9B8", textShadow: "0 1px 0 rgba(0,0,0,.35)" }}>ॐ</span>
    </motion.div>
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] flex translate-y-1/2 items-center justify-center">
      {/* red silk ribbon across the rolled scroll — slips away to both sides */}
      {[-1, 1].map((side) => (
        <motion.span
          key={side}
          className="absolute top-1/2 h-[12px] w-[38%] -translate-y-1/2"
          style={{
            [side < 0 ? "right" : "left"]: "50%",
            background: "linear-gradient(180deg, #E0483D 0%, #A61E1A 55%, #6E0F0C 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,.3)",
          } as React.CSSProperties}
          animate={broken ? { x: side * 220, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.5, 0, 0.75, 0] }}
        />
      ))}
      <motion.div
        className="relative h-[64px] w-[64px]"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={phase === "closed" ? { scale: [0.4, 1.12, 1], opacity: 1 } : { scale: 1.08, opacity: 1 }}
        transition={{ duration: 0.5, delay: phase === "closed" ? 0.35 : 0 }}
      >
        {half(-1)}
        {half(1)}
        {/* gold sparks as it cracks */}
        {SPARKS.map((sp, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: sp.s, height: sp.s, marginLeft: -sp.s / 2, marginTop: -sp.s / 2, background: "#FFD98A", boxShadow: "0 0 6px #FFC14D" }}
            initial={{ opacity: 0 }}
            animate={broken ? { x: sp.x, y: sp.y, opacity: [0, 1, 0], scale: [0.6, 1.2, 0.4] } : { opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </div>
  );
}

export function PanchangScreen() {
  const { data: p } = useFullPanchang();
  const phase = useFarmaanPhase(!!p);
  if (!p) return <div className="h-full pt-24 text-center text-muted">Computing panchang…</div>;
  const daySlots = p.choghadiya.filter((c) => !c.night);
  const nightSlots = p.choghadiya.filter((c) => c.night);
  const kaal = (code: string) => p.kaals.find((k) => k.code === code);
  const paksha = p.tithi.paksha === "shukla" ? "Shukla" : "Krishna";
  const limbs: { sa: string; label: string; value: string; until: string | null; art: string }[] = [
    { sa: "तिथि", label: "Tithi", value: `${paksha} ${p.tithi.name}`, until: p.tithi.endsAt, art: "/home/ticker/tithi.webp" },
    { sa: "वार", label: "Vaar", value: p.vaara.name_sa, until: null, art: "/panchang/vaar.webp" },
    { sa: "नक्षत्र", label: "Nakshatra", value: p.nakshatra.name, until: p.nakshatra.endsAt, art: "/home/ticker/nakshatra.webp" },
    { sa: "योग", label: "Yoga", value: p.yoga.name, until: p.yoga.endsAt, art: "/panchang/yoga.webp" },
    { sa: "करण", label: "Karana", value: p.karana.name, until: p.karana.endsAt, art: "/panchang/karana.webp" },
    { sa: "मास", label: "Masa", value: `${p.masa.amanta}${p.masa.isAdhika ? " (Adhika)" : ""}`, until: null, art: "/panchang/masa.webp" },
  ];
  const sunmoon = [
    { sa: "सूर्योदय", en: "Sunrise", value: p.sun.rise, art: "/home/ticker/sunrise.webp" },
    { sa: "सूर्यास्त", en: "Sunset", value: p.sun.set, art: "/home/ticker/sunset.webp" },
    { sa: "चन्द्रोदय", en: "Moonrise", value: p.moon.rise, art: "/panchang/moonrise.webp" },
    { sa: "चन्द्रास्त", en: "Moonset", value: p.moon.set, art: "/panchang/moonset.webp" },
  ];
  const AVOID = [
    { code: "rahu_kaal", sa: "राहुकाल", en: "Rahu Kaal", why: "Start nothing new", art: "/home/ticker/rahu-kaal.webp" },
    { code: "yamaganda", sa: "यमगण्ड", en: "Yamaganda", why: "Best kept quiet", art: "/panchang/yamaganda.webp" },
    { code: "gulika", sa: "गुलिक", en: "Gulika Kaal", why: "Avoid travel and signing", art: "/panchang/gulika.webp" },
  ];
  const ganesha = deityById("ganesha");
  const chogRows = (slots: ChoghadiyaSlot[]) =>
    slots.map((c, i) => (
      <div key={i} className="flex items-center gap-3 px-1 py-1.5"
        style={{ borderTop: i ? `1px dashed ${F_RULE}` : undefined, background: c.active ? "rgba(168,120,31,.16)" : undefined }}>
        <Art src={`/panchang/${CHOG_ART[c.name] ?? "chog-shubh"}.webp`} size={30} />
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          <span className="font-deva text-[15px] leading-none" style={{ color: c.good ? "#2E6B2F" : "#9E2F22" }}>{CHOG_SA[c.name] ?? c.name}</span>
          <span className="text-[9.5px]" style={{ color: F_MUT }}>{c.name}</span>
          {c.active && <span className="rounded-[3px] px-1.5 py-px text-[8.5px] btn-saffron">अभी</span>}
        </div>
        <span className="shrink-0 text-[11px] tnum" style={{ color: F_INK }}>{c.from} – {c.to}</span>
      </div>
    ));

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom"
      style={{ background: "radial-gradient(120% 70% at 50% 0%, #5A1626 0%, #2B0910 70%)" }}>
      <Header
        title="Panchang"
        sub="Tithi, choghadiya & muhurat"
        art="/home/tools/panchang.webp"
        gradient="linear-gradient(135deg, #7E1D2E 0%, #430D19 100%)"
        shadow="rgba(0,0,0,0.35)"
      />

      <motion.div
        className="pb-6 pt-4 lg:mx-auto lg:max-w-xl"
        initial={phase === "open" ? false : { y: -60, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* the illuminated head of the farmaan; the invocation sits in its arch */}
        <div className="relative z-[3]">
          {phase !== "open" && <FarmaanSeal phase={phase} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/panchang/farmaan-top.webp" alt="" className="relative z-[1] block w-full" />
          <div className="absolute inset-x-[24%] bottom-[4%] top-[42%] z-[2] flex flex-col items-center justify-end text-center">
            {ganesha && <DeityGlyph deity={ganesha} size={38} />}
            <div className="mt-1.5 font-deva text-[10.5px]" style={{ color: F_MUT }}>॥ श्री गणेशाय नमः ॥</div>
          </div>
        </div>

        {/* the parchment unrolls between the rollers */}
        <motion.div
          className="relative -mt-px overflow-hidden"
          initial={phase === "open" ? false : { height: 0 }}
          animate={{ height: phase === "open" ? "auto" : 0 }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
          style={{ backgroundImage: "url(/panchang/farmaan-paper.webp)", backgroundRepeat: "repeat-y", backgroundSize: "100% auto" }}
        >
          <div className={phase === "open" ? "farmaan-read" : "opacity-0"} style={{ paddingLeft: "19%", paddingRight: "19%" }}>
            <div className="text-center">
              <div className="font-deva text-[27px] leading-none" style={{ color: F_INK }}>पञ्चाङ्ग</div>
              <div className="mt-1 text-[8px] uppercase tracking-[0.3em]" style={{ color: F_GOLD }}>Farmaan of the Day</div>
              <div className="mt-2.5 font-display text-[16px] leading-tight" style={{ color: F_INK }}>{p.home.dateLabel}</div>
              <div className="text-[12px]" style={{ color: F_INK }}>{p.vaara.name_en}</div>
              <div className="mt-1 text-[9.5px] leading-snug" style={{ color: F_MUT }}>{p.masa.amanta} {paksha} पक्ष · विक्रम संवत् {p.samvat.vikram} · शक {p.samvat.shaka}</div>
              {p.home.vrat && <div className="mt-2 flex justify-center"><Pill tone="gold">{p.home.vrat}</Pill></div>}
            </div>

          <FHeading sa="पञ्चाङ्ग" en="The Five Limbs" />
          <div className="flex flex-col">
            {limbs.map((l, i) => (
              <div key={l.label} className="flex items-center gap-3 px-1 py-2" style={{ borderTop: i ? `1px dashed ${F_RULE}` : undefined }}>
                <Art src={l.art} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-deva text-[13px] leading-none" style={{ color: F_MUT }}>{l.sa}</span>
                    <span className="text-[8.5px] uppercase tracking-wide" style={{ color: F_MUT }}>{l.label}</span>
                  </div>
                  <div className="mt-1 text-[14px] font-medium leading-tight" style={{ color: F_INK }}>{l.value}</div>
                </div>
                {l.until && <div className="shrink-0 text-right text-[10px] tnum" style={{ color: F_GOLD }}>till<br />{l.until}</div>}
              </div>
            ))}
          </div>

          <FHeading sa="सूर्य व चन्द्र" en="Sun & Moon" />
          <div className="grid grid-cols-2 gap-y-3 px-1 pb-1">
            {sunmoon.map((s) => (
              <div key={s.en} className="flex items-center gap-2.5">
                <Art src={s.art} size={36} />
                <div className="min-w-0">
                  <div className="font-deva text-[11.5px] leading-none" style={{ color: F_MUT }}>{s.sa}</div>
                  <div className="mt-1 text-[13px] leading-none tnum" style={{ color: F_INK }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <FHeading sa="चौघड़िया" en="Choghadiya" />
          {([["दिन", "Day", daySlots], ["रात्रि", "Night", nightSlots]] as const).map(([sa, en, slots]) => (
            <div key={en} className="pb-1">
              <div className="px-1 pb-1 pt-1.5 font-deva text-[13px]" style={{ color: F_GOLD }}>{sa} <span className="text-[9px]" style={{ color: F_MUT }}>{en}</span></div>
              {chogRows(slots)}
            </div>
          ))}

          <FHeading sa="अशुभ काल" en="Hours to Avoid" />
          <div className="flex flex-col pb-2">
            {AVOID.map((a, i) => {
              const k = kaal(a.code);
              return (
                <div key={a.code} className="flex items-center gap-3 px-1 py-2" style={{ borderTop: i ? `1px dashed ${F_RULE}` : undefined }}>
                  <Art src={a.art} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-deva text-[14px] leading-none" style={{ color: F_INK }}>{a.sa}</span>
                      <span className="text-[9px]" style={{ color: F_MUT }}>{a.en}</span>
                    </div>
                    <div className="mt-1 text-[11.5px] font-medium tnum" style={{ color: "#9E2F22" }}>{k ? `${k.from} – ${k.to}` : "—"}</div>
                    <div className="mt-0.5 text-[9.5px] leading-snug" style={{ color: F_MUT }}>{a.why}</div>
                  </div>
                </div>
              );
            })}
          </div>

            <div className="h-3" />
          </div>
        </motion.div>

        {/* the foot: tailpiece, roller and the lotus seal on its tassels */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/panchang/farmaan-bottom.webp" alt="" className="-mt-px block w-full" />
      </motion.div>
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

// Hand-illustrated festival cards, matched to a festival by name so they attach
// automatically as the DB fills the calendar. Anything unmatched keeps its icon.
function festivalArt(name?: string | null, nameHi?: string | null): string | undefined {
  const s = `${name ?? ""} ${nameHi ?? ""}`.toLowerCase();
  if (s.includes("janmashtami") || s.includes("कृष्ण") || s.includes("krishna")) return "/festivals/janmashtami.jpg";
  if (s.includes("ganesh") || s.includes("गणेश") || s.includes("vinayaka")) return "/festivals/ganesh-chaturthi.jpg";
  if (s.includes("navratri") || s.includes("navaratri") || s.includes("durga") || s.includes("dussehra") || s.includes("dashain") || s.includes("नवरात्रि") || s.includes("दुर्गा")) return "/festivals/navratri.jpg";
  if (s.includes("ram navami") || s.includes("ramnavami") || s.includes("राम नवमी")) return "/festivals/ram-navami.jpg";
  if (s.includes("karwa") || s.includes("karva") || s.includes("करवा")) return "/festivals/karwa-chauth.jpg";
  if (s.includes("diwali") || s.includes("deepavali") || s.includes("dhanteras") || s.includes("lakshmi") || s.includes("laxmi") || s.includes("दिवाली") || s.includes("दीपावली") || s.includes("धनतेरस") || s.includes("लक्ष्मी")) return "/festivals/diwali.jpg";
  return undefined;
}
const fmtFestivalDate = (iso: string, lang: "en" | "hi" = "en") =>
  new Date(iso).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric" });

// A lit diya for the empty state — a glowing lamp rather than a bare line of
// grey text, so a screen with no festival still feels tended.
function DiyaArtifact() {
  return (
    <svg viewBox="0 0 140 116" width="132" height="110" aria-hidden>
      <defs>
        <radialGradient id="diyaGlow" cx="50%" cy="42%" r="55%">
          <stop offset="0" stopColor="#FFD98A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diyaFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB020" />
          <stop offset="1" stopColor="#F26B0F" />
        </linearGradient>
        <linearGradient id="diyaBowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C4611F" />
          <stop offset="1" stopColor="#7A340E" />
        </linearGradient>
      </defs>
      <ellipse cx="70" cy="46" rx="48" ry="46" fill="url(#diyaGlow)" />
      <path d="M70 20 C 79 40, 83 51, 70 62 C 57 51, 61 40, 70 20 Z" fill="url(#diyaFlame)" />
      <path d="M70 33 C 74 46, 75 53, 70 59 C 65 53, 66 46, 70 33 Z" fill="#FFE9A8" />
      <rect x="69" y="59" width="2" height="8" rx="1" fill="#5b3a1c" />
      <path d="M30 74 Q70 110 110 74 Z" fill="url(#diyaBowl)" />
      <ellipse cx="70" cy="74" rx="41" ry="8" fill="#D46A22" />
      <ellipse cx="70" cy="73" rx="35" ry="5.5" fill="#7A340E" />
      <path d="M31 73 Q70 85 109 73" stroke="#E98C3E" strokeWidth="1.5" fill="none" opacity="0.55" />
    </svg>
  );
}

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
      <Header
        title={lang === "hi" ? "पर्व एवं पूजा" : "Festivals & Pooja"}
        sub={lang === "hi" ? "व्रत, पर्व एवं पूजा विधि" : "Vrat, parv & pooja vidhi"}
        art="/home/tools/festivals.webp"
        gradient="linear-gradient(135deg, #8A3B08 0%, #4E1F03 100%)"
        shadow="rgba(78,31,3,0.30)"
      />
      <div className="flex items-center justify-end gutter-m"><LangToggle /></div>
      {/* Festival dates are served from the database — lunar, so they cannot be
          guessed. Say so rather than showing a blank screen. */}
      {!list.length && (
        <div className="gutter-m mt-8 flex flex-col items-center text-center lg:mt-14">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spot/festivals.webp" alt="" className="h-36 w-36 object-contain" />
          <div className="mt-4 text-[14px] font-medium text-ink">{lang === "hi" ? "अभी कोई तिथि उपलब्ध नहीं" : "No festival dates loaded"}</div>
          <p className="mx-auto mt-1.5 measure text-[11.5px] leading-relaxed text-muted">
            {lang === "hi"
              ? "आगामी पर्व यहाँ जल्द ही दिखेंगे। तब तक आज की तिथि और मुहूर्त के लिए पंचांग देखें।"
              : "Upcoming festivals will appear here soon. Open Panchang for today's tithi and muhurat in the meantime."}
          </p>
          <button
            onClick={() => go("panchang")}
            className="mt-4 rounded-[6px] px-5 py-2.5 text-[12px] btn-saffron"
          >
            {lang === "hi" ? "पंचांग खोलें" : "Open Panchang"}
          </button>
        </div>
      )}
      {/* Content is left-aligned and uses the width; the hero opens straight
          under the header. */}
      <div>
      {hero && (
        <div className="gutter pt-3">
          <div className="flex items-start gap-3.5">
            {festivalArt(hero.name, hero.name_hi) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={festivalArt(hero.name, hero.name_hi)} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover lg:h-32 lg:w-32"
                style={{ border: "1px solid var(--line-gold)" }} />
            )}
            <div className="min-w-0 flex-1">
              <div className="eyebrow text-muted">{fmtFestivalDate(hero.date, lang)}</div>
              <div className="font-display text-xl text-ink">{tr(lang, hero.name, hero.name_hi)}</div>
              {hero.deva && <div className="mt-0.5 font-deva text-[13.5px] text-gold">{hero.deva}</div>}
            </div>
          </div>
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
        <button onClick={() => go("puja")} className="mt-4 block w-full rounded-2xl py-3.5 text-[12.5px] btn-saffron lg:max-w-sm">{lang === "hi" ? "हमारे पंडितों के साथ पूजाएँ देखें" : "Explore Pujas with Our Pandits"}</button>
      </div>

      {rest.length > 0 && (
        <div className="gutter pt-4">
          <h3 className="mb-2 section-title">{lang === "hi" ? "आगामी" : "Upcoming"}</h3>
          <div className="overflow-hidden">
            {rest.map((f) => {
              const Icon = festivalIcon(f.icon);
              const art = festivalArt(f.name, f.name_hi);
              return (
                <div key={f.id} className="flex items-center gap-3 border-t border-[var(--line)] py-3 first:border-t-0">
                  {art ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" src={art} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover" style={{ border: "1px solid var(--line)" }} />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--tile-line)]">
                      <Icon size={15} className="text-[var(--bhagwa)]" />
                    </span>
                  )}
                  <span className="flex-1 text-[12.5px] text-ink">{tr(lang, f.name, f.name_hi)}</span>
                  <span className="text-[11px] text-muted">{fmtFestivalDate(f.date, lang)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/* ---------------- Library ---------------- */
// Shelves group the library so it reads as a curated collection, not one long
// grid. The id matches library_articles.category; labels carry both languages.
const LIBRARY_SHELVES: { id: string; en: string; hi: string }[] = [
  { id: "all", en: "All", hi: "सभी" },
  { id: "temples", en: "Temples", hi: "मंदिर" },
  { id: "deities", en: "Deities", hi: "देव" },
  { id: "festivals", en: "Festivals", hi: "पर्व" },
  { id: "practice", en: "Practice", hi: "साधना" },
  { id: "wisdom", en: "Wisdom", hi: "ज्ञान" },
  { id: "jyotish", en: "Jyotish", hi: "ज्योतिष" },
];

// Long-form temple profiles from public/library/temples.json (85 temples).
type TempleDoc = {
  id: string; num: number; name: string; location: string; deity: string;
  category: string; significance: string; read: string; sections: { h: string; b: string }[];
};
// Jewel tones cycled across the temple cards so the grid reads as a warm set.
const TEMPLE_TINTS = ["#B07A4E", "#7D728F", "#A45E6B", "#5E7C93", "#9C8544", "#4E7A6B", "#8A5A9C", "#B5482A"];

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
  const [temples, setTemples] = useState<TempleDoc[]>([]);
  const [openTemple, setOpenTemple] = useState<TempleDoc | null>(null);
  const items = useCatalog(getLibrary, []);
  const article = open ? items.find((x) => x.id === open) : undefined;
  const heading = lang === "hi" ? "आध्यात्मिक पुस्तकालय" : "Spiritual Library";
  const readWord = lang === "hi" ? "पढ़ने का समय" : "read";

  useEffect(() => {
    let on = true;
    fetch("/library/temples.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: TempleDoc[]) => { if (on) setTemples(d); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  // ----- a single temple profile: masthead + its narrative sections -----
  if (openTemple) {
    const t = openTemple;
    const tint = TEMPLE_TINTS[t.num % TEMPLE_TINTS.length];
    return (
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
        <ScreenHeader title={heading} onBack={() => setOpenTemple(null)} />
        <div className="gutter pt-3 lg:mx-auto lg:max-w-2xl">
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(157deg, ${tint}22, ${tint}0a 55%, var(--surface))`, border: "1px solid var(--line-gold)" }}>
            <div className="eyebrow text-muted">{t.location}</div>
            <h1 className="mt-1 font-display text-[24px] leading-tight text-ink">{t.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px]">
              {t.deity && <span style={{ color: tint }}>{t.deity}</span>}
              {t.deity && <span className="text-[var(--muted-2)]">·</span>}
              <span className="text-muted">{t.read} {readWord}</span>
            </div>
            {t.significance && <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-dim measure">{t.significance}</p>}
          </div>
          {t.sections.map((s, i) => (
            <div key={i} className="pt-5">
              <h3 className="section-title mb-1.5" style={{ color: tint }}>{s.h}</h3>
              <p className="whitespace-pre-wrap text-[12.5px] leading-[1.72] text-ink">{s.b}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            {article.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <LibraryImage src={article.image} tint={article.tint} className="h-52 w-full rounded-lg" />
            ) : (
              <div className="h-44 w-full rounded-lg" style={{ background: `linear-gradient(160deg, ${article.tint}44, ${article.tint}14)` }} />
            )}
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
      {/* shelves */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar gutter pb-1 pt-4">
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
      {shelf === "temples" ? (
        <div className="grid grid-cols-2 gap-2.5 gutter pt-3">
          {temples.length === 0 && (
            <div className="col-span-2 py-8 text-center text-[11.5px] text-muted">Loading temple profiles…</div>
          )}
          {temples.map((t) => {
            const tint = TEMPLE_TINTS[t.num % TEMPLE_TINTS.length];
            return (
              <button key={t.id} onClick={() => setOpenTemple(t)} className="rounded-xl p-1.5 text-left" style={{ background: "var(--surface-2)" }}>
                <div className="relative grid h-[92px] w-full place-items-center overflow-hidden rounded-lg"
                  style={{ background: `linear-gradient(150deg, ${tint}3a, ${tint}12)` }}>
                  <Bank size={26} style={{ color: tint }} />
                  <span className="absolute bottom-0 right-1.5 translate-y-1/2 whitespace-nowrap rounded-[3px] px-1.5 py-[1.5px] text-[9px] tnum text-ink"
                    style={{ background: "var(--surface)", border: "1px solid var(--line-strong)" }}>
                    {t.read} {readWord}
                  </span>
                </div>
                <div className="px-1 pb-1 pt-4">
                  <div className="line-clamp-2 min-h-[2.3em] text-[11.5px] font-medium leading-tight text-ink">{t.name}</div>
                  <div className="mt-0.5 line-clamp-1 text-[10px] text-muted">{t.location}</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 gutter pt-3">
          {shown.map((l) => (
            <button
              key={l.id}
              onClick={() => setOpen(l.id)}
              className="rounded-xl p-1.5 text-left"
              style={{ background: "var(--surface-2)" }}
            >
              <div className="relative">
                {l.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <LibraryImage src={l.image} tint={l.tint} className="h-[120px] w-full rounded-lg" />
                ) : (
                  <div className="h-[92px] w-full rounded-lg" style={{ background: `${l.tint}3a` }} />
                )}
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
      )}
    </div>
  );
}

/* ---------------- Sandesh share card ---------------- */
// The day's message is Divasya's single daily-wisdom surface — tag it by its
// lineage so it reads as a rotating wisdom feed, not just a lone shloka.
function wisdomKind(meaning = ""): string {
  const m = meaning.toLowerCase();
  if (m.includes("gita")) return "Gita Wisdom";
  if (m.includes("chanakya") || m.includes("niti")) return "Guru Teaching";
  if (m.includes("shiva")) return "Shiva Reflection";
  if (m.includes("hanuman")) return "Hanuman Inspiration";
  if (m.includes("krishna")) return "Krishna's Word";
  return "Divine Wisdom";
}
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
      {shloka && <div className="mt-1.5 text-[8px] uppercase tracking-[0.18em]" style={{ color: GOLD_D }}>{wisdomKind(shloka.meaning)}</div>}
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
