"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { IconDiya, IconBell, IconFlower, IconShankh, IconAarti } from "../icons";
import { useApp } from "../app-context";
import { cx, DeityGlyph } from "../ui";
import { DEITIES } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { bell, conch, ting } from "@/lib/sound";

export function MandirScreen() {
  const { back, deityId, setDeity, addPunya, haptic } = useApp();
  const deities = useCatalog(getDeities, DEITIES);
  const deity = deities.find((d) => d.id === deityId) ?? deities[0];

  const [lit, setLit] = useState(false);
  const [aarti, setAarti] = useState(false);
  const [bellKey, setBellKey] = useState(0);
  const [petals, setPetals] = useState<{ id: number; x: number; e: string }[]>([]);
  const [blessing, setBlessing] = useState(false);

  function lightDiya() {
    setLit((v) => !v);
    if (!lit) { ting(); haptic(12); checkDarshan(true, aarti); }
  }
  function ringBell() {
    setBellKey((k) => k + 1);
    bell(700, 1.4, 0.2);
    haptic([10, 30, 10]);
  }
  function offerFlower() {
    const tints = ["#C88131", "#CEB976", "#E8A87C", "#D9954C"];
    const next = Array.from({ length: 9 }).map((_, i) => ({
      id: Date.now() + i,
      x: 14 + Math.random() * 72,
      e: tints[Math.floor(Math.random() * tints.length)],
    }));
    setPetals((p) => [...p, ...next]);
    haptic(8);
    setTimeout(() => setPetals((p) => p.slice(next.length)), 2600);
  }
  function blowConch() { conch(); haptic([14, 40, 14]); }
  function toggleAarti() {
    setAarti((v) => { const nv = !v; if (nv) { bell(540, 1.8, 0.18); checkDarshan(lit, true); } return nv; });
  }
  function checkDarshan(d: boolean, a: boolean) {
    if (d && a && !blessing) { setBlessing(true); addPunya(21, "darshan"); }
  }

  const actions = [
    { label: lit ? "Diya Lit" : "Light Diya", icon: IconDiya, on: lit, run: lightDiya },
    { label: "Ring Bell", icon: IconBell, on: false, run: ringBell },
    { label: "Offer Flower", icon: IconFlower, on: false, run: offerFlower },
    { label: "Blow Conch", icon: IconShankh, on: false, run: blowConch },
    { label: aarti ? "Aarti Playing" : "Play Aarti", icon: IconAarti, on: aarti, run: toggleAarti },
  ];

  return (
    <div className="flex h-full flex-col pt-12">
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <div>
          <div className="font-display text-lg leading-tight text-ink">My Mandir</div>
          <div className="text-[11px] text-muted">{deity.name} · {deity.aarti}</div>
        </div>
      </div>

      {/* deity selector */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-5 pb-1 no-scrollbar">
        {deities.map((d) => (
          <button
            key={d.id}
            onClick={() => { setDeity(d.id); setBlessing(false); haptic(8); }}
            className={cx("flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-3.5 text-[12px]",
              d.id === deityId ? "ring-gold text-ink" : "surface text-muted")}
            style={d.id === deityId ? { background: "rgba(206,185,118,0.16)" } : undefined}
          >
            <DeityGlyph deity={d} size={22} /> {d.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* the shrine */}
      <div className="relative mx-5 mt-3 flex-1 overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(180deg, #FFF8E9, #F6ECD0)", border: "1px solid var(--line-gold)" }}>

        {/* toran / garland — antique bead string */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-around px-3 pt-2.5">
          {Array.from({ length: 17 }).map((_, i) => (
            <span key={i} className="block h-1.5 w-1.5 rounded-full"
              style={{ background: i % 2 ? "var(--amber)" : "var(--ochre)", opacity: 0.6, transform: `translateY(${i % 2 ? 5 : 0}px)` }} />
          ))}
        </div>

        {/* niche + deity */}
        <div className="absolute inset-x-0 top-10 flex flex-col items-center">
          <div className="relative grid h-44 w-40 place-items-center rounded-t-full"
            style={{ background: "radial-gradient(circle at 50% 65%, rgba(200,129,49,0.16), transparent 70%)", border: "1px solid rgba(156,133,68,0.45)", borderBottom: "none" }}>
            <motion.div
              animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: lit ? "drop-shadow(0 0 22px rgba(200,129,49,0.45))" : "none" }}>
              <DeityGlyph deity={deity} size={104} />
            </motion.div>
          </div>
          <div className="mt-2 font-deva text-[18px] text-gold">{deity.deva}</div>
          <div className="text-[11px] text-muted">{deity.tagline}</div>
        </div>

        {/* diyas */}
        {[18, 82].map((x) => (
          <div key={x} className="absolute bottom-24 flex flex-col items-center" style={{ left: `${x}%`, transform: "translateX(-50%)" }}>
            <AnimatePresence>
              {lit && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                  className="mb-0.5 h-5 w-3 rounded-full flame-glow"
                  style={{ background: "radial-gradient(circle at 50% 70%, #FFF3C0, #E89B45 60%, #C86A28)" }}>
                  <motion.div animate={{ scaleY: [1, 1.25, 0.9, 1.15, 1], opacity: [1, 0.85, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="h-full w-full" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="block h-3 w-6 rounded-b-[10px]"
              style={{ background: "linear-gradient(180deg,#B08434,#7A5A22)", border: "1px solid var(--line-gold)", borderTop: "none" }} />
          </div>
        ))}

        {/* bell */}
        <motion.div
          key={bellKey}
          animate={{ rotate: [0, 16, -14, 10, -7, 0] }} transition={{ duration: 0.7 }}
          className="absolute right-5 top-11"><IconBell size={26} className="text-[var(--ochre-deep)]" /></motion.div>

        {/* falling petals */}
        <AnimatePresence>
          {petals.map((p) => (
            <motion.span key={p.id} className="absolute" style={{ left: `${p.x}%`, top: 40 }}
              initial={{ y: 0, opacity: 0, rotate: 0 }}
              animate={{ y: 300, opacity: [0, 1, 1, 0], rotate: 180 }}
              transition={{ duration: 2.4, ease: "easeIn" }}>
              <span className="block h-2.5 w-2.5 rounded-full" style={{ background: p.e, opacity: 0.85 }} />
            </motion.span>
          ))}
        </AnimatePresence>

        {/* aarti visualizer */}
        <AnimatePresence>
          {aarti && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-14 flex items-end justify-center gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span key={i} className="w-1 rounded-full bg-[var(--amber)]"
                  animate={{ height: [6, 8 + ((i * 7) % 22), 6] }}
                  transition={{ duration: 0.6 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut" }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* blessing */}
        <AnimatePresence>
          {blessing && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="absolute inset-x-4 bottom-3 rounded-2xl px-4 py-2.5 text-center surface ring-gold">
              <div className="font-deva text-[14px] text-ink">दर्शन सम्पूर्ण</div>
              <div className="text-[11.5px] text-muted">{deity.name} blesses you · +21 Punya</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ritual actions */}
      <div className="grid grid-cols-5 gap-2 px-4 pb-6 pt-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={a.run}
              className={cx("flex flex-col items-center gap-1.5 rounded-2xl py-3", a.on ? "btn-saffron" : "surface")}>
              <Icon size={19} className={a.on ? "" : "text-[var(--amber)]"} strokeWidth={1.8} />
              <span className={cx("text-center text-[9.5px] leading-tight", a.on ? "" : "text-muted")}>{a.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
