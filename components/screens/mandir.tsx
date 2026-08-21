"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Iconify } from "../iconify";
import { useApp } from "../app-context";
import { DeityGlyph, ScreenHeader, cx } from "../ui";
import { DEITIES } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { bell, conch, ting } from "@/lib/sound";

type God = { id: string; name: string; deva: string; color: string; tagline: string; aarti: string };

export function MandirScreen() {
  const { back, deityId, setDeity, addPunya, haptic } = useApp();
  const gods = useCatalog(getDeities, DEITIES) as unknown as God[];
  const deity = gods.find((g) => g.id === deityId) ?? gods[0];

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
      x: 30 + Math.random() * 40,
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
    { label: lit ? "Diya Lit" : "Light Diya", icon: "game-icons:fire-bowl", on: lit, run: lightDiya },
    { label: "Ring Bell", icon: "game-icons:ringing-bell", on: false, run: ringBell },
    { label: "Offer Flower", icon: "game-icons:lotus-flower", on: false, run: offerFlower },
    { label: "Blow Conch", icon: "game-icons:spiral-shell", on: false, run: blowConch },
    { label: aarti ? "Aarti Playing" : "Play Aarti", icon: "game-icons:incense", on: aarti, run: toggleAarti },
  ];

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="My Mandir" sub={`${deity.name} · ${deity.aarti}`} onBack={back} />

      {/* body — a column on mobile; on desktop a row with the deity picker as a
          vertical stack of big blocks on the left and the shrine beside it */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:gap-7 lg:px-6 lg:pt-5">

        {/* deity selector — horizontal chips on mobile, tall block list on desktop */}
        <div className="-mx-1 flex gap-2 overflow-x-auto gutter pt-3 pb-1 no-scrollbar lg:mx-0 lg:w-[220px] lg:shrink-0 lg:flex-col lg:gap-2.5 lg:overflow-visible lg:p-0 lg:pt-1">
          {gods.map((d) => {
            const on = d.id === deityId;
            return (
              <button
                key={d.id}
                onClick={() => { setDeity(d.id); setBlessing(false); haptic(8); }}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-lg py-1 pl-1 pr-3 text-[11px]",
                  "lg:w-full lg:shrink lg:gap-3 lg:rounded-2xl lg:py-2.5 lg:pl-2.5 lg:pr-3 lg:text-[14px]",
                  on ? "ring-gold text-ink" : "surface text-muted lg:text-ink",
                )}
                style={on ? { background: "rgba(206,185,118,0.16)" } : undefined}
              >
                <span className="lg:hidden"><DeityGlyph deity={d} size={20} /></span>
                <span className="hidden lg:block"><DeityGlyph deity={d} size={38} /></span>
                <span className="flex min-w-0 flex-col items-start leading-tight">
                  <span className="truncate">{d.name}</span>
                  <span className="hidden font-deva text-[11px] text-muted lg:block">{d.deva}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* right — the shrine + ritual actions, filling the remaining width */}
        <div className="flex min-h-0 flex-1 flex-col">

          {/* the shrine — the ornate golden mandir sits directly on the page,
              no card or backdrop, so the temple artwork is the whole view */}
          <div className="relative mx-3 mt-2 flex-1 overflow-hidden lg:mx-0 lg:mt-0 lg:h-[560px] lg:flex-none">

            {/* the mandir artwork, with the deity installed on its pedestal.
                The inner box carries the artwork's exact aspect ratio, so the
                murti's percentage position always lands on the pedestal. */}
            <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-6">
              <div className="relative h-[88%]" style={{ aspectRatio: "1024 / 1536" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/artwork/mandir-frame.png" alt="" className="h-full w-full object-contain" />
                {/* the deity murti — standing on the pedestal, inside the niche */}
                <div className="absolute left-1/2 -translate-x-1/2"
                  style={{ bottom: "21.5%", width: "27%", height: "29%", filter: lit ? "drop-shadow(0 0 20px rgba(255,198,98,0.7))" : "drop-shadow(0 3px 8px rgba(60,30,6,0.45))" }}>
                  <MurtiImg deity={deity} />
                </div>
              </div>
            </div>

            {/* hanging bell */}
            <motion.div key={bellKey} animate={{ rotate: [0, 16, -14, 10, -7, 0] }} transition={{ duration: 0.7 }}
              className="absolute right-6 top-6 origin-top">
              <Iconify icon="game-icons:ringing-bell" width={26} height={26} className="text-[#EBC66A]" />
            </motion.div>

            {/* falling petals */}
            <AnimatePresence>
              {petals.map((p) => (
                <motion.span key={p.id} className="absolute" style={{ left: `${p.x}%`, top: "26%" }}
                  initial={{ y: 0, opacity: 0, rotate: 0 }}
                  animate={{ y: 260, opacity: [0, 1, 1, 0], rotate: 180 }}
                  transition={{ duration: 2.4, ease: "easeIn" }}>
                  <span className="block h-2.5 w-2.5 rounded-full" style={{ background: p.e, opacity: 0.9 }} />
                </motion.span>
              ))}
            </AnimatePresence>

            {/* aarti visualizer */}
            <AnimatePresence>
              {aarti && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute inset-x-0 bottom-4 flex items-end justify-center gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <motion.span key={i} className="w-1 rounded-full bg-[var(--bhagwa)]"
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
                  className="absolute inset-x-4 bottom-3 mx-auto max-w-sm rounded-2xl px-4 py-2.5 text-center surface ring-gold">
                  <div className="font-deva text-[12.5px] text-ink">दर्शन सम्पूर्ण</div>
                  <div className="text-[10.5px] text-muted">{deity.name} blesses you · +21 Punya</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ritual actions */}
          <div className="grid grid-cols-5 gap-2 px-4 pb-6 pt-3 lg:w-full lg:max-w-none lg:px-0 lg:pt-4 lg:pb-0">
            {actions.map((a) => (
              <button key={a.label} onClick={a.run}
                className={cx("flex flex-col items-center gap-1.5 rounded-xl py-3", a.on ? "btn-saffron" : "surface")}>
                <Iconify icon={a.icon} width={19} height={19} className={a.on ? "text-white" : "text-[var(--icon-ink)]"} />
                <span className={cx("text-center text-[9px] leading-tight", a.on ? "" : "text-muted")}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>{/* /right */}
      </div>{/* /body */}
    </div>
  );
}

/**
 * The deity murti installed on the mandir's pedestal. Prefers the 2D statue at
 * /deity/<id>-2d.png, falls back to the photo, then a quiet ॐ. It fills its
 * positioned box and sits on the box's bottom edge (object-bottom), so the
 * figure always stands on the pedestal whether it is seated or standing.
 */
function MurtiImg({ deity }: { deity: God }) {
  const candidates = [`/deity/${deity.id}-2d.png`, `/deity/${deity.id}.jpg`];
  const [i, setI] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => { setI(0); }, [deity.id]);
  // catch a 404 that lands before hydration attaches the onError handler
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setI((n) => n + 1);
  });
  const src = candidates[i];
  if (!src)
    return <span className="grid h-full w-full place-items-center font-deva text-[40px] text-[#F0D890]">ॐ</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} key={src} src={src} alt={deity.name} onError={() => setI((n) => n + 1)}
      className="h-full w-full object-contain object-bottom" />
  );
}
