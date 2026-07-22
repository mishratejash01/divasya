"use client";

import { useState } from "react";
import { Baby, CaretLeft, Sparkle } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { cx } from "../ui";
import { useCatalog, getNakshatraSyllables, getBabyNames } from "@/lib/catalog";

type G = "m" | "f";
const NAKSHATRAS = [
  { name: "Rohini", syl: ["O", "Va", "Vi"], deity: "Brahma", planet: "Moon" },
  { name: "Krittika", syl: ["A", "Ee", "U", "E"], deity: "Agni", planet: "Sun" },
  { name: "Ashwini", syl: ["Ch", "La"], deity: "Ashwini Kumaras", planet: "Ketu" },
  { name: "Mrigashira", syl: ["Ka", "Ki"], deity: "Soma", planet: "Mars" },
  { name: "Pushya", syl: ["Da", "H"], deity: "Brihaspati", planet: "Saturn" },
  { name: "Magha", syl: ["Ma", "Mi"], deity: "Pitrs", planet: "Ketu" },
];
const NAMES: { n: string; g: G; m: string; syl: string }[] = [
  { n: "Om", g: "m", m: "The sacred primordial sound", syl: "O" },
  { n: "Ojas", g: "m", m: "Divine vital energy", syl: "O" },
  { n: "Vivaan", g: "m", m: "Full of life; dawn of a new era", syl: "Vi" },
  { n: "Vihaan", g: "m", m: "The first ray of morning", syl: "Vi" },
  { n: "Vaibhav", g: "m", m: "Prosperity and grandeur", syl: "Va" },
  { n: "Varun", g: "m", m: "Lord of the waters", syl: "Va" },
  { n: "Vivaana", g: "f", m: "Lord Krishna; lively", syl: "Vi" },
  { n: "Vanya", g: "f", m: "Of the forest; gracious", syl: "Va" },
  { n: "Vidya", g: "f", m: "Knowledge; Goddess Saraswati", syl: "Vi" },
  { n: "Vamika", g: "f", m: "Goddess Durga", syl: "Va" },
  { n: "Aarav", g: "m", m: "Peaceful; the right way", syl: "A" },
  { n: "Aarush", g: "m", m: "First ray of the sun", syl: "A" },
  { n: "Arjun", g: "m", m: "Bright; the great Pandava", syl: "A" },
  { n: "Aadhya", g: "f", m: "The first power; Goddess Durga", syl: "A" },
  { n: "Ananya", g: "f", m: "Unique; matchless", syl: "A" },
  { n: "Ishaan", g: "m", m: "Lord Shiva; the sun", syl: "Ee" },
  { n: "Ishita", g: "f", m: "Mastery; one who desires", syl: "Ee" },
  { n: "Uma", g: "f", m: "Goddess Parvati", syl: "U" },
  { n: "Urvi", g: "f", m: "The earth", syl: "U" },
  { n: "Utkarsh", g: "m", m: "Progress; prosperity", syl: "U" },
  { n: "Esha", g: "f", m: "Desire; Goddess Parvati", syl: "E" },
  { n: "Ekansh", g: "m", m: "Whole; complete", syl: "E" },
  { n: "Chinmay", g: "m", m: "Full of supreme bliss", syl: "Ch" },
  { n: "Chetan", g: "m", m: "Consciousness; life", syl: "Ch" },
  { n: "Chaaru", g: "f", m: "Beautiful; graceful", syl: "Ch" },
  { n: "Lakshya", g: "m", m: "Aim; target", syl: "La" },
  { n: "Lavanya", g: "f", m: "Grace; beauty", syl: "La" },
  { n: "Karan", g: "m", m: "Wise; the great warrior", syl: "Ka" },
  { n: "Kartik", g: "m", m: "Son of Shiva; bestower of courage", syl: "Ka" },
  { n: "Kavya", g: "f", m: "Poetry", syl: "Ka" },
  { n: "Kiaan", g: "m", m: "Grace of God", syl: "Ki" },
  { n: "Kirti", g: "f", m: "Fame; glory", syl: "Ki" },
  { n: "Daksh", g: "m", m: "Capable; a Prajapati", syl: "Da" },
  { n: "Devansh", g: "m", m: "Part of the divine", syl: "Da" },
  { n: "Daya", g: "f", m: "Compassion; mercy", syl: "Da" },
  { n: "Hari", g: "m", m: "Lord Vishnu", syl: "H" },
  { n: "Hema", g: "f", m: "Golden; Goddess Lakshmi", syl: "H" },
  { n: "Madhav", g: "m", m: "Lord Krishna", syl: "Ma" },
  { n: "Mahi", g: "f", m: "The earth", syl: "Ma" },
  { n: "Manvi", g: "f", m: "Kind-hearted girl", syl: "Ma" },
  { n: "Mira", g: "f", m: "Devotee of Krishna", syl: "Mi" },
  { n: "Mihir", g: "m", m: "The sun", syl: "Mi" },
];

function luckyNo(name: string) {
  const map = "abcdefghijklmnopqrstuvwxyz";
  let s = 0;
  for (const c of name.toLowerCase()) { const i = map.indexOf(c); if (i >= 0) s += (i % 9) + 1; }
  while (s > 9) s = String(s).split("").reduce((a, b) => a + +b, 0);
  return s || 1;
}

export function NaamkaranScreen() {
  const { back, haptic } = useApp();
  const nakshatras = useCatalog(getNakshatraSyllables, NAKSHATRAS.map((n) => ({ name: n.name, syl: n.syl, deity: n.deity, planet: n.planet })));
  const names = useCatalog(getBabyNames, NAMES.map((n) => ({ n: n.n, g: n.g, m: n.m, syl: n.syl })));
  const [nakName, setNakName] = useState<string | null>(null);
  const [gender, setGender] = useState<G | "all">("all");

  const nak = nakshatras.find((n) => n.name === nakName) ?? nakshatras[0];
  const syllables = nak?.syl ?? [];

  const list = names.filter((x) => syllables.includes(x.syl) && (gender === "all" || x.g === gender));

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <div className="flex items-center gap-3 gutter py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={18} /></button>
        <div>
          <div className="font-display text-lg leading-tight text-ink">Naamkaran</div>
          <div className="text-[11px] text-muted">Auspicious names by Janma Nakshatra</div>
        </div>
        <Baby size={20} className="ml-auto text-[var(--amber)]" />
      </div>

      {/* nakshatra */}
      <div className="gutter">
        <h3 className="mb-2 eyebrow text-muted">Birth Nakshatra</h3>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 no-scrollbar">
          {nakshatras.map((n) => (
            <button key={n.name} onClick={() => { setNakName(n.name); haptic(8); }}
              className={cx("shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px]", n.name === nak?.name ? "btn-saffron" : "surface text-muted")}>
              {n.name}
            </button>
          ))}
        </div>
      </div>

      {/* prescribed syllables */}
      <div className="gutter-m mt-3 flex items-center gap-3 rounded-2xl card-temple p-4">
        <Sparkle size={18} className="text-[var(--amber)]" />
        <div className="flex-1">
          <div className="text-[12px] text-muted">Prescribed starting sounds</div>
          <div className="font-display text-lg text-gold">{syllables.join(" · ")}</div>
        </div>
        <div className="text-right text-[11px] text-muted">{nak?.deity}<br />{nak?.planet}</div>
      </div>

      {/* gender */}
      <div className="gutter-m mt-3 grid grid-cols-3 gap-1 rounded-full p-1 surface">
        {([["all", "All"], ["m", "Boy"], ["f", "Girl"]] as const).map(([g, l]) => (
          <button key={g} onClick={() => setGender(g)} className={cx("rounded-full py-2 text-[12.5px]", gender === g ? "btn-saffron" : "text-muted")}>{l}</button>
        ))}
      </div>

      {/* names */}
      <div className="mt-4 grid grid-cols-2 gap-2.5 gutter">
        {list.map((x) => (
          <div key={x.n} className="rounded-2xl surface p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-display text-[17px] text-ink">{x.n}</span>
              <span className="eyebrow text-muted">{x.g === "m" ? "Boy" : "Girl"}</span>
            </div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{x.m}</div>
            <div className="mt-2 flex items-center justify-between text-[10.5px] text-muted">
              <span>Lucky no. <span className="text-gold">{luckyNo(x.n)}</span></span>
              <span>{x.syl}-</span>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="col-span-2 py-8 text-center text-[13px] text-muted">No names for this filter.</div>}
      </div>
    </div>
  );
}
