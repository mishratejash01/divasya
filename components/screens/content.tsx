"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ChevronLeft, Download, Share2, Sun, Moon, Check, Play, Clock } from "lucide-react";
import { useApp } from "../app-context";
import { cx } from "../ui";
import {
  PANCHANG, CHOGHADIYA, currentChoghadiya, SHLOKA, HOROSCOPE_TODAY, LIBRARY, deityById,
} from "@/lib/demo";
import { rashiLabel } from "@/lib/astro";

function Header({ title, sub }: { title: string; sub?: string }) {
  const { back } = useApp();
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
      <div>
        <div className="font-display text-lg leading-tight text-ink">{title}</div>
        {sub && <div className="text-[11px] text-muted">{sub}</div>}
      </div>
    </div>
  );
}

/* ---------------- Panchang ---------------- */
export function PanchangScreen() {
  const now = currentChoghadiya();
  const grid = [
    ["Tithi", PANCHANG.tithi], ["Nakshatra", PANCHANG.nakshatra],
    ["Yoga", PANCHANG.yoga], ["Karana", PANCHANG.karana],
    ["Vaar", PANCHANG.weekday], ["Maas", PANCHANG.masa],
  ];
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <Header title="Panchang" sub={`${PANCHANG.weekday} · ${PANCHANG.masa}`} />
      <div className="mx-5 flex gap-3 rounded-2xl surface p-4">
        <div className="flex-1 space-y-2 border-r pr-3" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center gap-2 text-[13px] text-ink"><Sun size={15} className="text-[var(--saffron-soft)]" /> {PANCHANG.sunrise}</div>
          <div className="flex items-center gap-2 text-[13px] text-ink"><Sun size={15} className="rotate-180 text-muted" /> {PANCHANG.sunset}</div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-[13px] text-ink"><Moon size={15} className="text-[var(--saffron-soft)]" /> {PANCHANG.moonrise}</div>
          <div className="flex items-center gap-2 text-[13px] text-ink"><Moon size={15} className="text-muted" /> {PANCHANG.moonset}</div>
        </div>
      </div>

      <div className="mx-5 mt-4 grid grid-cols-2 gap-2.5">
        {grid.map(([k, v]) => (
          <div key={k} className="rounded-2xl surface p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted">{k}</div>
            <div className="mt-0.5 text-[15px] text-ink">{v}</div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-6">
        <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Choghadiya · Today</h3>
        <div className="overflow-hidden rounded-2xl surface">
          {CHOGHADIYA.map((c, i) => {
            const active = c.name === now.name && c.from === now.from;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                <span className={cx("h-2 w-2 rounded-full", c.good ? "bg-[var(--good)]" : "bg-[var(--avoid)]")} />
                <span className="w-20 text-[14px] text-ink">{c.name}</span>
                <span className="flex-1 text-[12px] text-muted">{c.from} – {c.to}</span>
                {active && <span className="rounded-full px-2 py-0.5 text-[10px] btn-saffron">NOW</span>}
                <span className={cx("text-[11px]", c.good ? "text-[var(--good)]" : "text-[var(--avoid)]")}>{c.good ? "Shubh" : "Avoid"}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 rounded-2xl surface p-4">
          <div className="text-[13px] text-ink">Rahu Kaal</div>
          <div className="text-[12px] text-[var(--avoid)]">{PANCHANG.rahuKaal} · avoid new beginnings</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Festivals ---------------- */
const SAMAGRI = ["Fresh fruits", "Flowers", "Milk", "Incense sticks", "Curd", "Diya (lamp)", "Honey", "Sweets", "Rice"];
const VIDHI = [
  "Wake before sunrise, bathe and wear clean clothes.",
  "Clean the puja space and place Lord Krishna's idol or photo.",
  "Light a diya and incense; offer flowers and fresh fruits.",
  "Offer panchamrit — milk, curd, honey — and sweets.",
  "Chant 'Om Namo Bhagavate Vasudevaya' 108 times.",
  "Observe the fast and read the Rohini Vrat katha.",
  "Conclude with aarti and distribute prasad.",
];
const UPCOMING = [
  { name: "Maha Shivratri", date: "8 Mar 2026", e: "🔱" },
  { name: "Holika Dahan", date: "13 Mar 2026", e: "🔥" },
  { name: "Holi", date: "14 Mar 2026", e: "🎨" },
  { name: "Chaitra Navratri", date: "29 Mar 2026", e: "🔆" },
];

export function FestivalsScreen() {
  const { go } = useApp();
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <Header title="Festivals & Pooja" />
      <div className="mx-5 overflow-hidden rounded-2xl surface">
        <div className="grid h-36 w-full place-items-center text-6xl" style={{ background: "linear-gradient(160deg, #2a2140, #14101f)" }}>🧘</div>
        <div className="p-4">
          <div className="text-[11px] uppercase tracking-wider text-muted">Today · 25 Feb 2026</div>
          <div className="font-display text-xl text-ink">{PANCHANG.vrat}</div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            A festival dedicated to Lord Krishna, observed on the Rohini Nakshatra. Devotees fast and perform rituals for prosperity and well-being.
          </p>
          <div className="mt-2 text-[12px] text-gold">Muhurat · 06:49 AM — 06:17 PM</div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Required Samagri · tick to shop</h3>
        <div className="grid grid-cols-2 gap-2">
          {SAMAGRI.map((s) => (
            <button key={s} onClick={() => setDone((d) => ({ ...d, [s]: !d[s] }))}
              className="flex items-center gap-2.5 rounded-xl surface px-3 py-2.5 text-left">
              <span className={cx("grid h-5 w-5 place-items-center rounded-md border", done[s] ? "btn-saffron border-transparent" : "")}
                style={{ borderColor: done[s] ? "transparent" : "var(--line-strong)" }}>
                {done[s] && <Check size={13} />}
              </span>
              <span className={cx("text-[13px]", done[s] ? "text-muted line-through" : "text-ink")}>{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Pooja Vidhi</h3>
        <div className="space-y-2">
          {VIDHI.map((v, i) => (
            <div key={i} className="flex gap-3 rounded-2xl surface p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] btn-saffron">{i + 1}</span>
              <span className="text-[13px] leading-relaxed text-ink">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => go("puja")} className="mt-4 w-full rounded-2xl py-3.5 text-[14px] btn-saffron">Book this Puja with a Pandit</button>
      </div>

      <div className="px-5 pt-7">
        <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Upcoming</h3>
        <div className="overflow-hidden rounded-2xl surface">
          {UPCOMING.map((u, i) => (
            <div key={u.name} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
              <span className="text-2xl">{u.e}</span>
              <span className="flex-1 text-[14px] text-ink">{u.name}</span>
              <span className="text-[12px] text-muted">{u.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Library ---------------- */
const ARTICLE = `Meditation is a practice where an individual uses a technique — such as mindfulness, or focusing the mind on a particular object, thought, or activity — to train attention and awareness, and achieve a mentally clear and emotionally calm and stable state.

Through regular practice, meditation allows the mind to gradually detach from stress, distractions, and overwhelming thoughts. It encourages stillness, emotional balance, and a sense of grounded clarity.

Benefits: reduced stress, improved focus, better emotional regulation, and a deeper connection with your inner self.`;

export function LibraryScreen() {
  const [open, setOpen] = useState<string | null>(null);
  const items = [...LIBRARY, { id: "l4", title: "Understanding Karma", sub: "The law of cause and effect", read: "5 min", grad: ["#8a6a3a", "#4a3416"] }];
  if (open) {
    const it = items.find((x) => x.id === open)!;
    return (
      <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
        <Header title="Spiritual Library" />
        <div className="h-40 w-full" style={{ background: `linear-gradient(160deg, ${it.grad[0]}, ${it.grad[1]})` }} />
        <div className="px-5 pt-4">
          <div className="font-display text-2xl text-ink">{it.title}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[12px] text-muted"><Clock size={12} /> {it.read} read</div>
          <p className="mt-4 whitespace-pre-wrap text-[14px] leading-relaxed text-muted">{ARTICLE}</p>
          <button onClick={() => setOpen(null)} className="mt-5 text-[13px] text-[var(--saffron-soft)]">← Back to library</button>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <Header title="Spiritual Library" />
      <div className="grid grid-cols-2 gap-3 px-5">
        {items.map((l, i) => (
          <button key={l.id} onClick={() => setOpen(l.id)} className="overflow-hidden rounded-2xl surface text-left">
            <div className="relative h-28 w-full" style={{ background: `linear-gradient(160deg, ${l.grad[0]}, ${l.grad[1]})`, opacity: 0.9 }}>
              {i % 2 === 1 && <span className="absolute inset-0 grid place-items-center"><Play size={26} className="text-white/90" fill="currentColor" /></span>}
            </div>
            <div className="p-3">
              <div className="text-[13px] font-medium leading-tight text-ink">{l.title}</div>
              <div className="mt-1 text-[11px] text-muted">{l.read} {i % 2 ? "video" : "read"}</div>
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
    const text = `🪔 Aaj ka Sandesh — ${name}\n\n${SHLOKA.deva}\n${SHLOKA.translit}\n"${SHLOKA.meaning}"\n\nShared via Divasya 🕉`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <Header title="Aaj ka Sandesh" />
      <div className="px-5">
        <div ref={card} className="overflow-hidden rounded-3xl p-6"
          style={{ background: "linear-gradient(165deg, #241a12, #110c08)", border: "1px solid rgba(184,145,80,0.3)" }}>
          <div className="flex items-center justify-between">
            <span className="font-display tracking-[0.3em] text-gold">DIVASYA</span>
            <span className="text-[11px] text-muted">{PANCHANG.weekday} · {PANCHANG.tithi}</span>
          </div>
          <div className="mt-5 text-center text-5xl">{deity.symbol}</div>
          <div className="mt-3 text-center font-deva text-[20px] leading-relaxed text-ink">{SHLOKA.deva}</div>
          <div className="mt-2 text-center text-[12.5px] italic text-muted">{SHLOKA.translit}</div>
          <div className="my-4 h-px w-full" style={{ background: "var(--line)" }} />
          <div className="text-center text-[13px] leading-relaxed text-ink/90">{HOROSCOPE_TODAY}</div>
          <div className="mt-5 text-center">
            <div className="text-[12px] text-muted">A blessing for</div>
            <div className="font-display text-lg text-gold">{name} · {rashi.split(" ")[0]}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={whatsapp} className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 text-[14px] btn-saffron">
            <Share2 size={16} /> Share to WhatsApp
          </button>
          <button onClick={download} disabled={busy} className="grid h-[52px] w-[52px] place-items-center rounded-2xl btn-ghost">
            <Download size={18} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted">Auto-generated daily · personalised with your rashi & deity</p>
      </div>
    </div>
  );
}
