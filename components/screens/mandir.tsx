"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { DeityGlyph, cx } from "../ui";
import { PageHeader } from "../page-header";
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
  lakshmi: ["lotus", "marigold", "rose"],
  vishnu: ["tulsi", "lotus", "marigold"],
  ram: ["marigold", "rose", "tulsi"],
  saraswati: ["jasmine", "lotus"],
  surya: ["marigold", "hibiscus"],
  shani: ["kaner", "marigold"],
  kartikeya: ["marigold", "jasmine", "rose"],
  radhakrishna: ["lotus", "rose", "tulsi"],
};
// Deities beyond the catalog's first five — each has its own illustration
// (/spot/deity-<id>.png) and aarti (/aarti/<id>.mp3).
const EXTRA_GODS: God[] = [
  { id: "lakshmi", name: "Maa Lakshmi", deva: "माँ लक्ष्मी", color: "#C0392B", tagline: "Giver of prosperity", aarti: "Om Jai Lakshmi Mata" },
  { id: "vishnu", name: "Shri Vishnu", deva: "श्री विष्णु", color: "#2E5B9A", tagline: "Preserver of the universe", aarti: "Om Jai Jagdish Hare" },
  { id: "ram", name: "Shri Ram", deva: "श्री राम", color: "#3F7F86", tagline: "Maryada Purushottam", aarti: "Aarti Shri Ramchandra Kripalu" },
  { id: "saraswati", name: "Maa Saraswati", deva: "माँ सरस्वती", color: "#7A8CA8", tagline: "Goddess of wisdom", aarti: "Jai Saraswati Mata" },
  { id: "surya", name: "Surya Dev", deva: "सूर्य देव", color: "#D9822B", tagline: "The radiant Sun", aarti: "Om Jai Surya Bhagwan" },
  { id: "shani", name: "Shani Dev", deva: "शनि देव", color: "#2B3F73", tagline: "Lord of karma and justice", aarti: "Jai Jai Shani Dev" },
  { id: "kartikeya", name: "Kartikeya", deva: "कार्तिकेय", color: "#C9772B", tagline: "The divine commander", aarti: "Shri Kartikey Aarati" },
  { id: "radhakrishna", name: "Radha-Krishna", deva: "राधा-कृष्ण", color: "#D46A9A", tagline: "Divine love", aarti: "Aarti Yugal Kishore Ki" },
];

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
  const { back, deityId: profileDeityId, setDeity, addPunya, haptic } = useApp();
  // own selection so switching works even when no profile is loaded; synced to the profile when there is one
  const [pickedId, setPickedId] = useState<string | null>(null);
  const deityId = pickedId ?? profileDeityId;
  const catalogGods = useCatalog(getDeities, DEITIES) as unknown as God[];
  const gods = [...catalogGods, ...EXTRA_GODS.filter((g) => !catalogGods.some((c) => c.id === g.id))];
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
  // The aarti song is started inside the tap handler itself — browsers only
  // allow audio that begins from a user gesture, and starting it later from an
  // effect is silently blocked (which is what made the aarti appear mute).
  const songRef = useRef<HTMLAudioElement | null>(null);
  const [audioMsg, setAudioMsg] = useState<"" | "missing" | "blocked">("");
  const [paused, setPaused] = useState(false);

  function stopSong() {
    const s = songRef.current;
    if (s) { s.pause(); s.src = ""; songRef.current = null; }
  }
  function startSong() {
    stopSong();
    setAudioMsg("");
    setPaused(false);
    const s = new Audio(`/aarti/${deity.id}.mp3`);
    s.loop = true;
    s.volume = 0.9;
    s.onerror = () => setAudioMsg("missing");
    songRef.current = s;
    s.play().catch((e: { name?: string }) => setAudioMsg(e?.name === "NotAllowedError" ? "blocked" : "missing"));
  }
  function togglePause() {
    const s = songRef.current;
    if (!s) { startSong(); return; }
    if (s.paused) {
      s.play().then(() => { setPaused(false); setAudioMsg(""); }).catch(() => setAudioMsg("blocked"));
    } else {
      s.pause();
      setPaused(true);
    }
  }
  function toggleAarti() {
    if (aarti) { setAarti(false); stopSong(); return; }
    setAarti(true);
    setLit(true); // the aarti begins with the diyas lit
    startSong();
    bell(540, 1.8, 0.18);
    checkDarshan(true, true);
  }

  // stop the song when the deity changes or the screen closes
  useEffect(() => { setAarti(false); stopSong(); }, [deity.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stopSong(), []); // eslint-disable-line react-hooks/exhaustive-deps
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

    // opening: conch, first bell, and a welcoming flower shower; the bell then
    // keeps time softly beneath the song
    conch();
    haptic([14, 40, 14]);
    ring();
    const firstFlowers = window.setTimeout(shower, 1800);
    const bellIv = window.setInterval(ring, 4000);
    const flowerIv = window.setInterval(shower, 9000);
    return () => {
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
    <div className="relative flex h-full flex-col overflow-hidden" style={{ background: "#3a230c" }}>
      <PageHeader
        title="My Mandir"
        subtitle={`${deity.name} · ${deity.aarti}`}
        onBack={back}
        art="/home/tools/my-mandir.png"
        gradient="linear-gradient(135deg, #5B2160 0%, #2E0F32 100%)"
        shadow="rgba(46,15,50,0.30)"
      />

      {/* body — a column on mobile; on desktop a row with the deity picker as a
          vertical stack of big blocks on the left and the shrine beside it */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col lg:flex-row lg:gap-7 lg:px-6 lg:pt-5">

        {/* deity selector — horizontal chips on mobile, tall block list on desktop */}
        <div className="relative z-10 -mx-1 flex gap-2 overflow-x-auto gutter pt-3 pb-1 no-scrollbar lg:mx-0 lg:w-[220px] lg:shrink-0 lg:flex-col lg:gap-2.5 lg:overflow-visible lg:p-0 lg:pt-1">
          {gods.map((d) => {
            const on = d.id === deityId;
            return (
              <button
                key={d.id}
                onClick={() => { setPickedId(d.id); setDeity(d.id); setBlessing(false); setAarti(false); haptic(8); }}
                className={cx(
                  "flex shrink-0 items-center gap-1.5 rounded-lg py-1 pl-1 pr-3 text-[11px]",
                  "lg:w-full lg:shrink lg:gap-3 lg:rounded-2xl lg:py-2.5 lg:pl-2.5 lg:pr-3 lg:text-[14px]",
                  on ? "ring-gold text-ink" : "surface text-muted lg:text-ink",
                )}
                style={on ? { background: "rgba(255,244,222,0.96)" } : undefined}
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
        <div className="flex min-h-0 flex-1 flex-col justify-end">

          {/* the shrine — the ornate golden mandir sits directly on the page,
              no card or backdrop, so the temple artwork is the whole view */}
          <div className="absolute inset-0 z-0 overflow-hidden">

            {/* the marble shrine is the whole scene; the deity is seated inside
                its carved arch niche, on the platform, framed by the pillars,
                lamps and carvings of the temple itself. */}
            <div className="absolute left-1/2 top-0 overflow-hidden" style={{ aspectRatio: "1024 / 1536", height: "113%", minWidth: "100%", transform: "translate(-50%, -13%)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mandir/shrine-bg.png" alt="" className="absolute inset-0 h-full w-full object-cover" />

              {/* deity seated in the arch niche, resting on the platform */}
              <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "15.5%", width: "40%", height: "50%" }}>
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[135%] w-[135%] -translate-x-1/2 -translate-y-1/2"
                  style={{ background: "radial-gradient(circle, rgba(255,224,158,0.42) 0%, rgba(255,208,124,0) 62%)" }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={deity.id}
                  src={`/spot/deity-${deity.id}.png`}
                  alt={deity.name}
                  className="relative z-10 h-full w-full object-contain object-bottom"
                  style={{ filter: lit ? "drop-shadow(0 0 26px rgba(255,198,98,0.8))" : "drop-shadow(0 8px 16px rgba(80,40,10,0.30))" }}
                />
              </div>

              {/* falling flowers — the deity's own blooms, showering inside the shrine */}
              <AnimatePresence>
                {petals.map((p) => (
                  <motion.span key={p.id} className="pointer-events-none absolute z-20" style={{ left: `${p.x}%`, top: "-6%" }}
                    initial={{ y: 0, opacity: 0, rotate: p.rot }}
                    animate={{ y: 520, opacity: [0, 1, 1, 0], rotate: p.rot + 180 }}
                    transition={{ duration: p.dur, ease: "easeIn" }}>
                    <FlowerFall slug={p.slug} />
                  </motion.span>
                ))}
              </AnimatePresence>

              {/* the shrine sits in low light until a diya is lit, then warms up */}
              <motion.div
                className="pointer-events-none absolute inset-0 z-20"
                style={{ background: "radial-gradient(circle at 50% 62%, rgba(20,8,2,0.30) 0%, rgba(14,6,2,0.68) 100%)" }}
                initial={false}
                animate={{ opacity: lit ? 0 : 1 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />

              {/* two brass diyas on the marble platform — tap either to light both */}
              <ShrineDiya lit={lit} onTap={lightDiya} style={{ left: "13%", bottom: "13.6%" }} />
              <ShrineDiya lit={lit} onTap={lightDiya} style={{ right: "13%", bottom: "13.6%" }} />

              {/* aarti — performed the way a pandit waves it: the thali is lifted
                  before the deity and moved in slow clockwise circles, with
                  agarbati smoke trailing from it. */}
              <AnimatePresence>
                {aarti && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.8 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 z-30 -translate-x-1/2"
                    style={{ bottom: "24%" }}
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
                        className="w-28 object-contain"
                        style={{ filter: "drop-shadow(0 0 22px rgba(255,180,70,0.85))", transformOrigin: "50% 35%" }}
                        animate={{ rotate: [-5, 5, -5] }}
                        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* blessing */}
            <AnimatePresence>
              {blessing && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-x-6 top-28 z-40 mx-auto flex max-w-xs items-center gap-3 rounded-2xl px-3 py-2 text-left surface ring-gold">
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

          {/* now playing — the aarti's title, its state and a play/pause control */}
          <AnimatePresence>
            {aarti && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
                className="relative z-10 mx-auto mb-2 flex w-[calc(100%-2rem)] max-w-sm shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5"
                style={{ background: "rgba(36,16,8,0.92)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mandir/aarti-thali.png" alt="" className="h-10 w-10 shrink-0 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[#FDEFD6]">{deity.aarti}</div>
                  <div className="text-[10.5px] text-[#F3D6B0]">
                    {audioMsg === "missing" ? `Aarti audio for ${deity.name} is coming soon`
                      : audioMsg === "blocked" ? "Tap play to start the aarti"
                      : paused ? "Paused" : "Now playing"}
                  </div>
                </div>
                {audioMsg !== "missing" && (
                  <button
                    onClick={togglePause}
                    aria-label={paused || audioMsg === "blocked" ? "Play aarti" : "Pause aarti"}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                    style={{ background: "var(--bhagwa)" }}
                  >
                    {paused || audioMsg === "blocked"
                      ? <Play size={18} weight="fill" className="text-white" />
                      : <Pause size={18} weight="fill" className="text-white" />}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ritual actions — round chips wrapping onto two rows (3 + 2), centred */}
          <div className="absolute inset-x-1.5 z-20 flex flex-col flex-wrap content-between gap-y-4" style={{ top: "30%", height: 254 }}>
            {actions.map((a) => (
              <button key={a.label} onClick={a.run} className="flex w-14 flex-col items-center gap-1.5">
                <span
                  className={cx(
                    "grid h-14 w-14 place-items-center rounded-full transition-all",
                    "",
                  )}
                  style={{
                    background: a.on
                      ? "radial-gradient(circle at 50% 35%, #FFF0CF, #FFD08A)"
                      : "var(--surface-2)",
                    border: a.on ? "2px solid var(--bhagwa)" : "1px solid var(--line-gold)",
                    boxShadow: a.on ? "0 0 0 4px rgba(255,190,80,0.35), 0 0 22px rgba(255,170,60,0.75)" : "0 1px 3px rgba(80,48,22,0.07)",
                  }}
                >
                  {a.diya ? (
                    <DiyaIcon lit={a.on} />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.img} alt="" className="h-9 w-9 object-contain" />
                  )}
                </span>
                <span className={cx("text-center text-[9.5px] leading-tight", a.on ? "font-medium text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]")}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>{/* /right */}
      </div>{/* /body */}
    </div>
  );
}

/**
 * A brass diya standing on the shrine platform. Tap to light it: the flame
 * rises and flickers, a warm glow breathes around it, and it stays lit. While
 * unlit, a soft ring pulses so the diya reads as something to touch.
 */
function ShrineDiya({ lit, onTap, style }: { lit: boolean; onTap: () => void; style: React.CSSProperties }) {
  return (
    <motion.button
      onClick={onTap}
      whileTap={{ scale: 0.92 }}
      aria-label={lit ? "Diya lit" : "Light the diya"}
      className="absolute z-30 aspect-square"
      style={{ width: "17%", ...style }}
    >
      {/* warm glow that breathes once lit */}
      <motion.span
        className="pointer-events-none absolute rounded-full"
        style={{ left: "-60%", top: "-70%", width: "220%", height: "220%", background: "radial-gradient(circle, rgba(255,190,80,0.65) 0%, rgba(255,160,50,0) 62%)" }}
        animate={lit ? { opacity: [0.75, 1, 0.8, 1], scale: [1, 1.08, 0.97, 1.05] } : { opacity: 0, scale: 0.6 }}
        transition={lit ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
      />
      {/* invitation ring while unlit */}
      {!lit && (
        <motion.span
          className="pointer-events-none absolute inset-[-8%] rounded-full"
          style={{ border: "1.5px solid rgba(255,255,255,0.85)" }}
          animate={{ scale: [0.9, 1.25], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      {/* wick */}
      <span className="absolute left-1/2 rounded-full" style={{ bottom: "44%", width: "3%", height: "12%", marginLeft: "-1.5%", background: "#3a2410" }} />
      {/* flame */}
      <AnimatePresence>
        {lit && (
          <motion.span
            key="flame"
            className="absolute left-1/2"
            style={{
              bottom: "50%", width: "22%", height: "58%", marginLeft: "-11%",
              borderRadius: "50% 50% 50% 50% / 74% 74% 28% 28%",
              background: "linear-gradient(180deg,#FFF6D2 0%,#FFC24B 45%,#FF7A18 100%)",
              transformOrigin: "50% 100%",
              boxShadow: "0 0 16px 6px rgba(255,180,70,0.6)",
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: [1, 1.16, 0.94, 1.1, 1], rotate: [-3, 3, -2, 2, -3], opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ scaleY: { duration: 1.1, repeat: Infinity }, rotate: { duration: 1.1, repeat: Infinity }, opacity: { duration: 0.4 } }}
          />
        )}
      </AnimatePresence>
      {/* brass bowl */}
      <svg viewBox="0 0 48 30" className="absolute inset-x-0 bottom-0 w-full" aria-hidden>
        <defs>
          <linearGradient id="shrineBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E7B45E" />
            <stop offset="1" stopColor="#8A5A1E" />
          </linearGradient>
        </defs>
        <path d="M4 8 Q24 3 44 8 Q39 26 24 26 Q9 26 4 8 Z" fill="url(#shrineBowl)" />
        <ellipse cx="24" cy="8" rx="20" ry="3.6" fill="#B98A3E" />
        <ellipse cx="24" cy="7.4" rx="16.5" ry="2.4" fill={lit ? "#FFD98A" : "#5b3a16"} />
        <rect x="18" y="25" width="12" height="3.2" rx="1.4" fill="#8A5A1E" />
      </svg>
    </motion.button>
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

