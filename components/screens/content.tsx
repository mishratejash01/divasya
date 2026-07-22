"use client";

import { useEffect, useRef, useState } from "react";
import { IconShare, IconSunrise, IconSunset } from "../icons";
import { toPng } from "html-to-image";
import { Bank, CaretLeft, Check, Clock, Coins, DownloadSimple, Fire, FlowerLotus, Heart, type Icon, Moon, Shield, Sparkle, Sun, Sword } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx, DeityGlyph, Pill, Wordmark } from "../ui";
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
    <div className="flex items-center gap-3 gutter py-3">
      <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={16} /></button>
      <div>
        <div className="font-display text-lg leading-tight text-ink">{title}</div>
        {sub && <div className="text-[10px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------------- Panchang ---------------- */
function ChoghadiyaRow({ slot, first }: { slot: ChoghadiyaSlot; first: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: first ? undefined : "1px solid var(--line)" }}>
      <span className={cx("h-2 w-2 rounded-full", slot.good ? "bg-[var(--good)]" : "bg-[var(--avoid)]")} />
      <span className={cx("w-16 text-[12.5px]", slot.night ? "text-ink-dim" : "text-ink")}>{slot.name}</span>
      <span className="flex-1 text-[11px] tnum text-muted">{slot.from} – {slot.to}</span>
      {slot.active && <span className="rounded-full px-2 py-0.5 text-[9px] btn-saffron">NOW</span>}
      <span className={cx("text-[10px]", slot.good ? "text-[var(--good)]" : "text-[var(--avoid)]")}>{slot.good ? "Shubh" : "Avoid"}</span>
    </div>
  );
}

export function PanchangScreen() {
  const { data: p } = useFullPanchang();
  if (!p) return <div className="h-full pt-24 text-center text-muted">Computing panchang…</div>;
  const daySlots = p.choghadiya.filter((c) => !c.night);
  const nightSlots = p.choghadiya.filter((c) => c.night);
  const kaal = (code: string) => p.kaals.find((k) => k.code === code);
  const rahu = kaal("rahu_kaal"), yama = kaal("yamaganda");
  const grid: [string, string][] = [
    ["Tithi", `${p.tithi.paksha === "shukla" ? "Shukla" : "Krishna"} ${p.tithi.name}`],
    ["Nakshatra", p.nakshatra.name],
    ["Yoga", p.yoga.name],
    ["Karana", p.karana.name],
    ["Vaar", p.vaara.name_sa],
    ["Masa", `${p.masa.amanta}${p.masa.isAdhika ? " (Adhika)" : ""}`],
  ];
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <Header title="Panchang" sub={`${p.vaara.name_en} · ${p.home.dateLabel}`} />
      <div className="flex items-center justify-between gap-3 gutter pb-3">
        <div className="text-[10px] tnum text-muted">
          Vikram {p.samvat.vikram}
          {p.samvat.samvatsara ? ` · ${p.samvat.samvatsara}` : ""}
        </div>
        {p.home.vrat && <Pill tone="gold">{p.home.vrat}</Pill>}
      </div>

      <div className="gutter-m flex gap-3 rounded-2xl surface p-4">
        <div className="flex flex-1 items-center gap-2.5 border-r pr-3" style={{ borderColor: "var(--line)" }}>
          <IconSunrise size={15} className="text-[var(--amber)]" strokeWidth={1.7} />
          <div>
            <div className="eyebrow text-muted">Sunrise</div>
            <div className="text-[12.5px] text-ink">{p.sun.rise}</div>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-2.5">
          <IconSunset size={15} className="text-[var(--amber)]" strokeWidth={1.7} />
          <div>
            <div className="eyebrow text-muted">Sunset</div>
            <div className="text-[12.5px] text-ink">{p.sun.set}</div>
          </div>
        </div>
      </div>

      <div className="gutter-m mt-4 grid grid-cols-2 gap-2.5">
        {grid.map(([k, v]) => (
          <div key={k} className="rounded-2xl surface p-3.5">
            <div className="eyebrow text-muted">{k}</div>
            <div className="mt-0.5 text-[13.5px] text-ink">{v}</div>
          </div>
        ))}
      </div>

      <div className="gutter pt-6">
        <h3 className="mb-2 eyebrow text-muted">Choghadiya · Today</h3>
        <div className="overflow-hidden rounded-2xl surface">
          {daySlots.map((c, i) => (
            <ChoghadiyaRow key={i} slot={c} first={i === 0} />
          ))}
        </div>

        <h4 className="mb-2 mt-4 eyebrow text-muted">Night</h4>
        <div className="overflow-hidden rounded-2xl surface-2">
          {nightSlots.map((c, i) => (
            <ChoghadiyaRow key={i} slot={c} first={i === 0} />
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl surface p-4">
            <div className="text-[11.5px] text-ink">Rahu Kaal</div>
            <div className="mt-0.5 text-[11px] tnum text-[var(--avoid)]">{rahu ? `${rahu.from} – ${rahu.to}` : "–"}</div>
            <div className="mt-1 text-[10px] text-muted">Avoid new beginnings</div>
          </div>
          <div className="rounded-2xl surface p-4">
            <div className="text-[11.5px] text-ink">Yamaganda</div>
            <div className="mt-0.5 text-[11px] tnum text-[var(--avoid)]">{yama ? `${yama.from} – ${yama.to}` : "–"}</div>
            <div className="mt-1 text-[10px] text-muted">Best kept quiet</div>
          </div>
        </div>
      </div>
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
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <Header title="Festivals & Pooja" />
      {hero && (
        <div className="gutter-m overflow-hidden rounded-2xl surface">
          {/* Flat faded band. A large glyph centred in a box read as a stock
              placeholder for a photo that was never coming. */}
          <div className="h-16 w-full" style={{ background: "var(--surface-2)" }} />
          <div className="p-4">
            <div className="eyebrow text-muted">{fmtFestivalDate(hero.date)}</div>
            <div className="font-display text-xl text-ink">{hero.name}</div>
            {hero.deva && <div className="mt-0.5 font-deva text-[13.5px] text-gold">{hero.deva}</div>}
            {hero.about && <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{hero.about}</p>}
            {hero.muhurat && <div className="mt-2 text-[11px] text-gold">Muhurat · {hero.muhurat}</div>}
          </div>
        </div>
      )}

      <div className="gutter pt-6">
        <h3 className="mb-2 eyebrow text-muted">Required Samagri · tick to shop</h3>
        <div className="grid grid-cols-2 gap-2">
          {samagri.map((s) => (
            <button key={s} onClick={() => setDone((d) => ({ ...d, [s]: !d[s] }))}
              className="flex items-center gap-2.5 rounded-xl surface px-3 py-2.5 text-left">
              <span className={cx("grid h-5 w-5 place-items-center rounded-md border", done[s] ? "btn-saffron border-transparent" : "")}
                style={{ borderColor: done[s] ? "transparent" : "var(--line-strong)" }}>
                {done[s] && <Check size={12} />}
              </span>
              <span className={cx("text-[11.5px]", done[s] ? "text-muted line-through" : "text-ink")}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="gutter pt-6">
        {hero && hero.vidhi?.length > 0 && (
          <>
            <h3 className="mb-2 eyebrow text-muted">Pooja Vidhi</h3>
            <div className="space-y-2">
              {hero.vidhi.map((v, i) => (
                <div key={i} className="flex gap-3 rounded-2xl surface p-3">
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
        <div className="gutter pt-7">
          <h3 className="mb-2 eyebrow text-muted">Upcoming</h3>
          <div className="overflow-hidden rounded-2xl surface">
            {rest.map((f, i) => {
              const Icon = festivalIcon(f.icon);
              return (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3.5" style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgba(200,129,49,0.10)" }}>
                    <Icon size={15} className="text-[var(--amber)]" />
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
      <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
        <Header title="Spiritual Library" />
        <div className="h-40 w-full" style={{ background: `linear-gradient(160deg, ${article.tint}33, ${article.tint}11)` }} />
        <div className="gutter pt-4">
          <div className="font-display text-2xl text-ink">{article.title}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted"><Clock size={12} /> {article.read} read</div>
          <p className="mt-4 whitespace-pre-wrap text-[12.5px] leading-relaxed text-ink-dim">{article.content}</p>
          <button onClick={() => setOpen(null)} className="mt-5 flex items-center gap-1 text-[11.5px] text-[var(--amber)]">
            <CaretLeft size={13} /> Back to library
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <Header title="Spiritual Library" />
      <div className="grid grid-cols-2 gap-3 gutter">
        {items.map((l) => (
          <button key={l.id} onClick={() => setOpen(l.id)} className="overflow-hidden rounded-2xl surface text-left">
            <div className="h-28 w-full" style={{ background: `linear-gradient(160deg, ${l.tint}33, ${l.tint}11)` }} />
            <div className="p-3">
              <div className="text-[11.5px] font-medium leading-tight text-ink">{l.title}</div>
              <div className="mt-1 text-[10px] text-muted">{l.read} read</div>
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
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <Header title="Aaj ka Sandesh" />
      <div className="gutter">
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

        <div className="mt-4 flex gap-3">
          <button onClick={whatsapp} className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[12.5px] btn-saffron">
            <IconShare size={15} /> Share to WhatsApp
          </button>
          <button onClick={download} disabled={busy} className="grid h-[52px] w-[52px] place-items-center rounded-2xl btn-ghost">
            <DownloadSimple size={16} />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted">Auto-generated daily · personalised with your rashi & deity</p>
      </div>
    </div>
  );
}
