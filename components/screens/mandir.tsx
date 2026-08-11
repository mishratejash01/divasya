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

          {/* the shrine — a temple hall housing the chosen deity's mandir */}
          <div className="relative mx-3 mt-3 flex-1 overflow-hidden rounded-3xl lg:mx-0 lg:mt-0 lg:h-[560px] lg:flex-none"
            style={{ background: "radial-gradient(120% 90% at 50% 12%, #FFF7E6 0%, #F5E7C4 55%, #EAD6A6 100%)", border: "1px solid var(--line-gold)", boxShadow: "inset 0 0 0 1px rgba(206,185,118,0.25)" }}>

            {/* marble floor */}
            <div className="absolute inset-x-0 bottom-0 h-[26%]"
              style={{ background: "linear-gradient(180deg, rgba(160,110,40,0) 0%, rgba(160,110,40,0.10) 40%, rgba(140,95,34,0.22) 100%)", borderTop: "1px solid rgba(185,138,46,0.35)" }} />

            {/* the mandir + caption, centred in the hall */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <div className="relative h-[64%] max-h-[430px] lg:h-[80%] lg:max-h-[480px]">
                <Temple deity={deity} lit={lit} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-deva text-[20px] leading-none text-gold lg:text-[22px]">{deity.deva}</div>
                <div className="mt-1 text-[11px] tracking-wide text-muted">{deity.tagline}</div>
              </div>
            </div>

            {/* hanging bell */}
            <motion.div key={bellKey} animate={{ rotate: [0, 16, -14, 10, -7, 0] }} transition={{ duration: 0.7 }}
              className="absolute right-6 top-6 origin-top">
              <Iconify icon="game-icons:ringing-bell" width={26} height={26} className="text-[var(--icon-ink)]" />
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
 * A carved home-mandir: a curvilinear shikhara topped by a kalash, an
 * entablature on two fluted pillars, a marigold garland draped over the cusped
 * sanctum arch, a stepped plinth, and diyas on the base. The chosen deity's
 * murti sits in the sanctum.
 */
function Temple({ deity, lit }: { deity: God; lit: boolean }) {
  const garland = Array.from({ length: 15 }).map((_, i) => {
    const t = i / 14;
    const ang = Math.PI * (1 - t);
    return { x: 160 + Math.cos(ang) * 72, y: 258 - Math.sin(ang) * 72, i };
  });

  return (
    <div className="relative h-full">
      <svg viewBox="0 0 320 500" className="h-full w-auto" aria-hidden>
        <defs>
          <linearGradient id="mBrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#EBCC77" />
            <stop offset="0.5" stopColor="#C99A3C" />
            <stop offset="1" stopColor="#966420" />
          </linearGradient>
          <linearGradient id="mPillar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8E6220" />
            <stop offset="0.5" stopColor="#F0D890" />
            <stop offset="1" stopColor="#8E6220" />
          </linearGradient>
          <linearGradient id="mDome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F3DE9A" />
            <stop offset="1" stopColor="#B9862C" />
          </linearGradient>
          <radialGradient id="mSanc" cx="0.5" cy="0.34" r="0.8">
            <stop offset="0" stopColor="#FFF1D0" />
            <stop offset="0.7" stopColor="#F1CE88" />
            <stop offset="1" stopColor="#E1AF5E" />
          </radialGradient>
        </defs>

        {/* sanctum opening — drawn first so the frame sits on top of it */}
        <rect x="96" y="168" width="128" height="256" fill="url(#mSanc)" />

        <g stroke="#79521F" strokeWidth="1.2" strokeLinejoin="round">
          {/* stepped plinth */}
          <path d="M20 490 H300 L288 468 H32 Z" fill="url(#mBrass)" />
          <path d="M40 468 H280 L270 446 H50 Z" fill="url(#mBrass)" />
          <rect x="60" y="424" width="200" height="22" rx="2" fill="url(#mBrass)" />

          {/* pillars — capital sits under the lintel, shaft lands on the plinth */}
          {[64, 224].map((px) => (
            <g key={px}>
              <rect x={px - 8} y="170" width="48" height="16" rx="2" fill="url(#mBrass)" />
              <rect x={px} y="186" width="32" height="238" fill="url(#mPillar)" />
              <line x1={px + 10} y1="190" x2={px + 10} y2="420" stroke="#79521F" strokeWidth="0.8" opacity="0.45" />
              <line x1={px + 22} y1="190" x2={px + 22} y2="420" stroke="#79521F" strokeWidth="0.8" opacity="0.45" />
            </g>
          ))}

          {/* lintel across the pillars */}
          <rect x="52" y="150" width="216" height="20" rx="2" fill="url(#mBrass)" />
          {Array.from({ length: 12 }).map((_, i) => (
            <rect key={i} x={60 + i * 17} y="164" width="8" height="6" fill="rgba(121,82,31,0.4)" stroke="none" />
          ))}

          {/* shikhara dome + kalash, centred on the lintel */}
          <rect x="102" y="136" width="116" height="16" rx="2" fill="url(#mBrass)" />
          <path d="M108 138 Q108 74 160 66 Q212 74 212 138 Z" fill="url(#mDome)" />
          <path d="M124 132 Q124 94 160 86 Q196 94 196 132" fill="none" stroke="rgba(121,82,31,0.4)" strokeWidth="1" />
          <path d="M140 124 Q140 104 160 98 Q180 104 180 124" fill="none" stroke="rgba(121,82,31,0.4)" strokeWidth="1" />
          <ellipse cx="160" cy="64" rx="19" ry="6" fill="url(#mBrass)" />
          <circle cx="160" cy="52" r="6.5" fill="url(#mBrass)" />
          <path d="M152 52 Q152 41 160 37 Q168 41 168 52 Z" fill="url(#mBrass)" />
          <line x1="160" y1="37" x2="160" y2="18" stroke="#966420" strokeWidth="2.2" />
          <path d="M160 18 L178 24 L160 30 Z" fill="var(--bhagwa)" stroke="none" />

          {/* singhasan — the deity's seat */}
          <rect x="118" y="402" width="84" height="22" rx="2" fill="url(#mBrass)" />
          <rect x="130" y="388" width="60" height="14" rx="2" fill="url(#mBrass)" />
        </g>

        {/* decorative cusped arch inside the opening (springs from the pillars) */}
        <path d="M96 250 Q96 192 160 188 Q224 192 224 250" fill="none" stroke="url(#mBrass)" strokeWidth="11" strokeLinecap="round" />
        <path d="M104 248 Q104 200 160 196 Q216 200 216 248" fill="none" stroke="rgba(121,82,31,0.3)" strokeWidth="1" />

        {/* marigold garland draped over the arch */}
        <g stroke="none">
          {garland.map((g) => (
            <circle key={g.i} cx={g.x} cy={g.y} r={g.i % 3 === 1 ? 4 : 5.4}
              fill={g.i % 3 === 1 ? "#6E8A3C" : g.i % 2 ? "#EFA436" : "#E07C25"} />
          ))}
          {[90, 230].map((x) => (
            <g key={x}>
              {[0, 1, 2].map((k) => (
                <circle key={k} cx={x} cy={252 + k * 12} r={5 - k * 0.6} fill={k % 2 ? "#EFA436" : "#E07C25"} />
              ))}
            </g>
          ))}
        </g>
      </svg>

      {/* the deity murti, standing on the singhasan. Static, no drop-shadow —
          only a soft golden aura when the diya is lit, so darshan still pays off. */}
      <div
        className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2"
        style={{ filter: lit ? "drop-shadow(0 0 22px rgba(200,129,49,0.5))" : "none" }}>
        <span className="lg:hidden"><DeityMurti deity={deity} size={112} /></span>
        <span className="hidden lg:block"><DeityMurti deity={deity} size={132} /></span>
      </div>

      {/* diyas on the plinth */}
      {[28, 72].map((x) => (
        <div key={x} className="absolute flex flex-col items-center" style={{ left: `${x}%`, bottom: "9%", transform: "translateX(-50%)" }}>
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
          <span className="block h-3 w-7 rounded-b-[12px]"
            style={{ background: "linear-gradient(180deg,#C99A3C,#8A5A22)", border: "1px solid #79521F", borderTop: "none" }} />
        </div>
      ))}
    </div>
  );
}

/**
 * The murti in the sanctum. Prefers the 2D illustrated statue at
 * /deity/<id>-2d.png — a transparent, portrait cut-out that stands in the
 * sanctum like a real idol — then falls back to the photographic /deity/<id>.jpg
 * (framed), then a quiet ॐ tile, so the sanctum is never a broken frame.
 */
function DeityMurti({ deity, size }: { deity: God; size: number }) {
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
    return (
      <span className="grid place-items-center rounded-[12px] font-deva text-[var(--bhagwa-deep)]"
        style={{
          width: size, height: size, fontSize: Math.round(size * 0.4),
          background: "radial-gradient(circle at 40% 30%, rgba(200,129,49,0.18), var(--surface-2) 74%)",
          border: "1px solid var(--line-gold)",
        }}>ॐ</span>
    );
  const is2d = src.endsWith("-2d.png");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} key={src} src={src} alt={deity.name} onError={() => setI((n) => n + 1)}
      className={is2d ? "object-contain object-bottom" : "rounded-[12px] object-cover"}
      style={is2d
        ? { width: Math.round(size * 1.12), height: Math.round(size * 1.5) }
        : { width: size, height: size, border: "1px solid var(--line-gold)" }} />
  );
}
