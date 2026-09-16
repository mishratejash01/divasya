"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../app-context";
import { DeityGlyph, ScreenHeader, cx } from "../ui";
import { DEITIES } from "@/lib/demo";
import { useCatalog, getDeities } from "@/lib/catalog";
import { bell, conch, ting, preloadTempleSounds } from "@/lib/sound";

type God = { id: string; name: string; deva: string; color: string; tagline: string; aarti: string };

// Which flowers each deity likes — used for the "Offer Flower" shower. The slugs
// map to public/mandir/flowers/<slug>.png; a marigold SVG stands in until the
// artwork is dropped in.
const FLOWERS_BY_DEITY: Record<string, string[]> = {
  krishna: ["tulsi", "lotus", "marigold"],
  shiva: ["belpatra", "kaner", "jasmine"],
  hanuman: ["marigold", "rose"],
  durga: ["hibiscus", "rose", "marigold"],
  ganesha: ["hibiscus", "marigold"],
};
const DEFAULT_FLOWERS = ["marigold", "rose", "jasmine"];

type Petal = { id: number; x: number; slug: string; rot: number; dur: number };

// A smooth clockwise circle for the aarti motion — many points so framer moves at
// a constant speed round the loop instead of stuttering between a few corners.
const AARTI_R = 34;
const AARTI_N = 32;
const AARTI_X = Array.from({ length: AARTI_N + 1 }, (_, k) =>
  Math.round(AARTI_R * Math.cos(((-90 + (k * 360) / AARTI_N) * Math.PI) / 180)),
);
const AARTI_Y = Array.from({ length: AARTI_N + 1 }, (_, k) =>
  Math.round(AARTI_R * Math.sin(((-90 + (k * 360) / AARTI_N) * Math.PI) / 180)),
);

export function MandirScreen() {
  const { back, deityId, setDeity, addPunya, haptic } = useApp();
  const gods = useCatalog(getDeities, DEITIES) as unknown as God[];
  const deity = gods.find((g) => g.id === deityId) ?? gods[0];

  useEffect(() => { preloadTempleSounds(); }, []);

  const [lit, setLit] = useState(false);
  const [aarti, setAarti] = useState(false);
  const [bellKey, setBellKey] = useState(0);
  const [petals, setPetals] = useState<Petal[]>([]);
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
    const set = FLOWERS_BY_DEITY[deity.id] ?? DEFAULT_FLOWERS;
    const next: Petal[] = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      x: 4 + Math.random() * 90,
      slug: set[Math.floor(Math.random() * set.length)],
      rot: Math.random() * 360,
      dur: 2.2 + Math.random() * 1.6,
    }));
    setPetals((p) => [...p, ...next]);
    haptic(8);
    setTimeout(() => setPetals((p) => p.slice(next.length)), 4200);
  }
  function blowConch() { conch(); haptic([14, 40, 14]); }
  function toggleAarti() {
    setAarti((v) => { const nv = !v; if (nv) { bell(540, 1.8, 0.18); checkDarshan(lit, true); } return nv; });
  }
  function checkDarshan(d: boolean, a: boolean) {
    if (d && a && !blessing) { setBlessing(true); addPunya(21, "darshan"); }
  }

  // While the aarti plays, the ritual performs itself the way it does in a temple:
  // the conch sounds at the start, the bell keeps time throughout, and flowers are
  // showered at intervals (pushpanjali) — never continuously. When aarti songs are
  // added, this timeline will be driven by the track instead of fixed intervals.
  useEffect(() => {
    if (!aarti) return;
    const flowerSet = FLOWERS_BY_DEITY[deity.id] ?? DEFAULT_FLOWERS;
    const shower = () => {
      const next: Petal[] = Array.from({ length: 16 }).map((_, i) => ({
        id: Date.now() + i,
        x: 4 + Math.random() * 90,
        slug: flowerSet[Math.floor(Math.random() * flowerSet.length)],
        rot: Math.random() * 360,
        dur: 2.2 + Math.random() * 1.6,
      }));
      setPetals((p) => [...p, ...next]);
      window.setTimeout(() => setPetals((p) => p.slice(next.length)), 4200);
    };
    const ring = () => { setBellKey((k) => k + 1); bell(700, 1.4, 0.1); };

    // the deity's aarti song plays on a loop under the ritual
    const song = new Audio(`/aarti/${deity.id}.mp3`);
    song.loop = true;
    song.volume = 0.9;
    void song.play().catch(() => {});

    // opening: conch, first bell, and a welcoming flower shower; the bell then
    // keeps time softly beneath the song
    conch();
    haptic([14, 40, 14]);
    ring();
    const firstFlowers = window.setTimeout(shower, 1800);
    const bellIv = window.setInterval(ring, 4000);
    const flowerIv = window.setInterval(shower, 9000);
    return () => {
      song.pause();
      song.src = "";
      window.clearTimeout(firstFlowers);
      window.clearInterval(bellIv);
      window.clearInterval(flowerIv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aarti, deity.id]);

  const flowerIcon = (FLOWERS_BY_DEITY[deity.id] ?? DEFAULT_FLOWERS)[0];
  const actions: { label: string; img?: string; diya?: boolean; on: boolean; run: () => void }[] = [
    { label: lit ? "Diya Lit" : "Light Diya", diya: true, on: lit, run: lightDiya },
    { label: "Ring Bell", img: "/mandir/inst/bell.png", on: false, run: ringBell },
    { label: "Offer Flower", img: `/mandir/flowers/${flowerIcon}.png`, on: false, run: offerFlower },
    { label: "Blow Conch", img: "/mandir/inst/shankh.png", on: false, run: blowConch },
    { label: aarti ? "Aarti Playing" : "Play Aarti", img: "/mandir/aarti-thali.png", on: aarti, run: toggleAarti },
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
                onClick={() => { setDeity(d.id); setBlessing(false); setAarti(false); haptic(8); }}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-lg py-1 pl-1 pr-3 text-[11px]",
                  "lg:w-full lg:shrink lg:gap-3 lg:rounded-2xl lg:py-2.5 lg:pl-2.5 lg:pr-3 lg:text-[14px]",
                  on ? "ring-gold text-ink" : "surface text-muted lg:text-ink",
                )}
                style={on ? { background: "rgba(206,185,118,0.16)" } : undefined}
              >
                <DeityThumb d={d} />
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

            {/* no temple frame — the deity's own artwork is the whole shrine,
                floating on a divine glow, with a soft splash of light rising from
                the base it stands on. */}
            <div className="absolute inset-0 flex items-end justify-center p-4 pb-8 lg:p-6">
              <div className="relative flex h-[82%] items-end justify-center">
                {/* divine radiance behind the deity — a soft round orb that fades
                    fully to transparent, so there is no boxy edge */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[125%] w-[125%] -translate-x-1/2 -translate-y-1/2"
                  style={{ background: "radial-gradient(circle, rgba(255,224,158,0.5) 0%, rgba(255,208,124,0.16) 34%, rgba(255,208,124,0) 60%)" }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={deity.id}
                  src={`/spot/deity-${deity.id}.png`}
                  alt={deity.name}
                  className="relative z-10 h-full w-auto object-contain"
                  style={{ filter: lit ? "drop-shadow(0 0 30px rgba(255,198,98,0.75))" : "drop-shadow(0 10px 22px rgba(80,40,10,0.32))" }}
                />
              </div>
            </div>

            {/* marigold toran draped across the top of the shrine */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mandir/toran.png" alt="" className="pointer-events-none absolute inset-x-0 top-0 z-10 mx-auto w-[94%] object-contain" />

            {/* two hanging bells framing the shrine — both swing when rung */}
            {(["left-3", "right-3"] as const).map((side) => (
              <motion.div
                key={`${side}-${bellKey}`}
                animate={{ rotate: [0, 15, -13, 9, -5, 0] }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className={cx("absolute top-1 z-20 w-9 origin-top", side)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mandir/bell.png" alt="" className="h-auto w-full object-contain" />
              </motion.div>
            ))}

            {/* falling flowers — the deity's own blooms, showering top to bottom */}
            <AnimatePresence>
              {petals.map((p) => (
                <motion.span key={p.id} className="pointer-events-none absolute z-20" style={{ left: `${p.x}%`, top: "-8%" }}
                  initial={{ y: 0, opacity: 0, rotate: p.rot }}
                  animate={{ y: 560, opacity: [0, 1, 1, 0], rotate: p.rot + 180 }}
                  transition={{ duration: p.dur, ease: "easeIn" }}>
                  <FlowerFall slug={p.slug} />
                </motion.span>
              ))}
            </AnimatePresence>

            {/* aarti — performed the way a pandit waves it: the thali is lifted
                before the deity and moved in slow clockwise circles (top → right →
                bottom → left), with agarbati smoke trailing from it. */}
            <AnimatePresence>
              {aarti && (
                <motion.div
                  initial={{ opacity: 0, y: 40, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.8 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-1/2 z-20 -translate-x-1/2"
                  style={{ bottom: "34%" }}
                >
                  <motion.div
                    className="flex flex-col items-center"
                    animate={{ x: AARTI_X, y: AARTI_Y }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                  >
                    <Smoke />
                    <motion.img
                      // eslint-disable-next-line @next/next/no-img-element
                      src="/mandir/aarti-thali.png"
                      alt=""
                      className="w-20 object-contain"
                      style={{ filter: "drop-shadow(0 0 20px rgba(255,180,70,0.7))", transformOrigin: "50% 35%" }}
                      animate={{ rotate: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* blessing */}
            <AnimatePresence>
              {blessing && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-4 bottom-3 mx-auto flex max-w-sm items-center gap-3 rounded-2xl px-4 py-2.5 text-left surface ring-gold">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/spot/darshan-done.png" alt="" className="h-12 w-12 shrink-0 object-contain" />
                  <div>
                    <div className="font-deva text-[12.5px] text-ink">दर्शन सम्पूर्ण</div>
                    <div className="text-[10.5px] text-muted">{deity.name} blesses you · +21 Punya</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ritual actions — round chips wrapping onto two rows (3 + 2), centred */}
          <div className="mx-auto flex max-w-[260px] flex-wrap justify-center gap-x-6 gap-y-3.5 px-4 pb-6 pt-4 lg:max-w-none lg:gap-x-7 lg:px-0 lg:pb-0">
            {actions.map((a) => (
              <button key={a.label} onClick={a.run} className="flex w-14 flex-col items-center gap-1.5">
                <span
                  className={cx(
                    "grid h-14 w-14 place-items-center rounded-full transition-all",
                    a.on ? "ring-2 ring-[var(--bhagwa)]" : "",
                  )}
                  style={{
                    background: a.on
                      ? "radial-gradient(circle at 50% 38%, rgba(242,107,15,0.20), rgba(242,107,15,0.06))"
                      : "var(--surface-2)",
                    border: a.on ? "none" : "1px solid var(--line-gold)",
                    boxShadow: a.on ? "0 4px 12px rgba(242,107,15,0.24)" : "0 1px 3px rgba(80,48,22,0.07)",
                  }}
                >
                  {a.diya ? (
                    <DiyaIcon lit={a.on} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.img} alt="" className="h-9 w-9 object-contain" />
                  )}
                </span>
                <span className={cx("text-center text-[9.5px] leading-tight", a.on ? "font-medium text-ink" : "text-muted")}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>{/* /right */}
      </div>{/* /body */}
    </div>
  );
}

/** A clean drawn diya for the Light Diya button, lit or unlit. */
function DiyaIcon({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 48 48" width="34" height="34" aria-hidden>
      <defs>
        <linearGradient id="diyaFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFEBA6" />
          <stop offset="0.5" stopColor="#FFB23C" />
          <stop offset="1" stopColor="#F26B0F" />
        </linearGradient>
        <linearGradient id="diyaBowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C67A3E" />
          <stop offset="1" stopColor="#7A3E1B" />
        </linearGradient>
      </defs>
      {lit && <ellipse cx="24" cy="15" rx="8" ry="11" fill="#FFC24D" opacity="0.4" />}
      {lit && (
        <>
          <path d="M24 7 C 27.5 12.5, 28.5 16.5, 24 22 C 19.5 16.5, 20.5 12.5, 24 7 Z" fill="url(#diyaFlame)" />
          <path d="M24 12.5 C 25.8 15.5, 26 17.5, 24 20.5 C 22 17.5, 22.2 15.5, 24 12.5 Z" fill="#FFF4CE" />
        </>
      )}
      <rect x="23.3" y={lit ? 21 : 18} width="1.4" height={lit ? 4 : 7} rx="0.7" fill="#4a2f14" />
      <path d="M7 27 Q24 23.5 41 27 Q36.5 39 24 39 Q11.5 39 7 27 Z" fill="url(#diyaBowl)" />
      <ellipse cx="24" cy="27" rx="17" ry="3.6" fill="#8a4a22" />
      <ellipse cx="24" cy="26.4" rx="14" ry="2.5" fill="#B87440" />
    </svg>
  );
}

/**
 * A small deity thumbnail for the selector chips — the deity's own artwork
 * (/spot/deity-<id>.png), falling back to its glyph if the art is missing.
 */
function DeityThumb({ d }: { d: God }) {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/spot/deity-${d.id}.png`}
        alt=""
        onError={() => setOk(false)}
        className="h-7 w-7 shrink-0 object-contain lg:h-10 lg:w-10"
      />
    );
  }
  return (
    <>
      <span className="lg:hidden"><DeityGlyph deity={d} size={20} /></span>
      <span className="hidden lg:block"><DeityGlyph deity={d} size={38} /></span>
    </>
  );
}

/**
 * Agarbati smoke — a few soft wisps that rise from the aarti thali, drifting and
 * widening as they fade, so the incense reads as actually burning.
 */
function Smoke() {
  return (
    <div className="pointer-events-none relative h-20 w-16" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-0 left-1/2 rounded-full"
          style={{
            width: 12,
            height: 12,
            background: "radial-gradient(circle, rgba(226,226,226,0.55), rgba(226,226,226,0) 70%)",
            filter: "blur(3px)",
          }}
          initial={{ opacity: 0, y: 0, x: -6, scale: 0.5 }}
          animate={{
            opacity: [0, 0.55, 0.4, 0],
            y: -74,
            x: [-6, i % 2 ? 10 : -16, i % 2 ? -4 : 6],
            scale: [0.5, 1.4, 2.3],
          }}
          transition={{ repeat: Infinity, duration: 2.8 + i * 0.4, delay: i * 0.55, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/**
 * A single falling flower. Prefers the deity's flower artwork at
 * /mandir/flowers/<slug>.png; if it isn't present yet, a marigold bloom drawn in
 * SVG stands in, so the shower always looks right.
 */
function FlowerFall({ slug }: { slug: string }) {
  const [ok, setOk] = useState(true);
  if (ok) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/mandir/flowers/${slug}.png`}
        alt=""
        width={30}
        height={30}
        onError={() => setOk(false)}
        style={{ filter: "drop-shadow(0 1px 2px rgba(120,60,10,0.28))" }}
      />
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden style={{ filter: "drop-shadow(0 1px 1px rgba(120,60,10,0.25))" }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="12" cy="6.4" rx="2.7" ry="5.1" fill="#E39A2E" transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill="#9A5A1E" />
      <circle cx="12" cy="12" r="1.4" fill="#C88131" />
    </svg>
  );
}

