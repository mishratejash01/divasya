"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowCounterClockwise, CaretRight, Check, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import confetti from "canvas-confetti";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { MANTRAS, TARGETS } from "@/lib/demo";
import { useCatalog, getMantras } from "@/lib/catalog";
import { bell, startAmbient, stopAmbient, setAmbientMuted, ting } from "@/lib/sound";

const DEFAULT_MALA_SIZE = 248;
const SLIDE_THUMB_TRAVEL_INSET = 38;

// The mala's material — sets the colour of the un-chanted beads and the guru
// bead. Chanted beads always warm to gold regardless of material.
const MALAS = {
  rudraksha: { label: "Rudraksha", bead: "radial-gradient(circle at 34% 28%, #8A5A2C, #452A12 82%)", guru: "radial-gradient(circle at 34% 28%, #B98A4A, #6E4620 60%, #3E260F)", texture: "https://images.unsplash.com/photo-1678920005141-8832ef4a090a?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1200", beadTexture: "https://www.birthastro.com/rudraksha/images/one-mukhi-rudraksha.png" },
  tulsi: { label: "Tulsi", bead: "radial-gradient(circle at 34% 28%, #C79B5E, #7A4A2C 82%)", guru: "radial-gradient(circle at 34% 28%, #F5E3B4, #C88131 60%, #8A5A22)", texture: "https://tulsirudra.com/cdn/shop/articles/A53_22312d5e-72ab-443c-b3bf-420a66ebf29a.jpg?crop=center&height=500&v=1751611021&width=600", beadTexture: "https://cdn.shopify.com/s/files/1/0636/2716/5830/files/tulsi_mala_original_3.png?v=1773810078" },
  sphatik: { label: "Sphatik", bead: "radial-gradient(circle at 32% 26%, #FFFFFF, #C7D4DE 60%, #93A6B4 92%)", guru: "radial-gradient(circle at 32% 26%, #FFFFFF, #DDE7EE 55%, #A9B8C4)", texture: "https://www.shivaago.com/wp-content/uploads/2023/05/Resize_20230516_114651_1482.jpg", beadTexture: "https://www.ratanrashi.com/product_images/product_3611_8624_large.jpg" },
} as const;

const MALA_TYPES = ["rudraksha", "tulsi", "sphatik"] as const;

export function MalaScreen() {
  const { back, addJapa, japaLifetime, addPunya, haptic } = useApp();
  const params = useApp().screen.params as { mantraId?: string } | undefined;
  const mantras = useCatalog(getMantras, MANTRAS);

  const [mantraId, setMantraId] = useState(params?.mantraId || mantras[0].id);
  const mantra = mantras.find((m) => m.id === mantraId) ?? mantras[0];
  const [target, setTarget] = useState(108);
  const [malaType, setMalaType] = useState<keyof typeof MALAS>("rudraksha");
  const mala = MALAS[malaType];
  const [count, setCount] = useState(0);
  const [malas, setMalas] = useState(0);
  const [auto, setAuto] = useState(false);
  const [done, setDone] = useState(false);
  const [musicMuted, setMusicMuted] = useState(false);
  const [malaSize, setMalaSize] = useState(DEFAULT_MALA_SIZE);
  const [malaSlideDirection, setMalaSlideDirection] = useState<1 | -1>(1);
  const [slideX, setSlideX] = useState(0);
  const slideTrack = useRef<HTMLDivElement>(null);
  const sliding = useRef(false);
  const slideXRef = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const malaSwipeStart = useRef<number | null>(null);
  const manualHold = useRef(false);

  const progress = count / target;
  const SIZE = malaSize;
  const CENTER = SIZE / 2;
  const R = SIZE * 0.375;
  const circ = 2 * Math.PI * R;

  // bead geometry — one bead per repetition, beads nearly touching like a real mala
  const visibleBeads = target >= 108 ? 54 : target;
  const spacing = circ / visibleBeads;
  const beadR = Math.max(5, Math.min(spacing * 0.52, 7));
  const litBeads = Math.ceil(progress * visibleBeads);

  useEffect(() => {
    startAmbient();
    const unlock = () => startAmbient();
    window.addEventListener("pointerdown", unlock, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      stopAmbient();
    };
  }, []);

  useEffect(() => {
    const fitMala = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const sizeFromHeight = viewportHeight - 332;
      const sizeFromWidth = viewportWidth - 108;
      const nextSize = Math.max(198, Math.min(276, sizeFromHeight, sizeFromWidth));
      setMalaSize(nextSize);
    };

    fitMala();
    window.addEventListener("resize", fitMala);
    window.visualViewport?.addEventListener("resize", fitMala);
    return () => {
      window.removeEventListener("resize", fitMala);
      window.visualViewport?.removeEventListener("resize", fitMala);
    };
  }, []);

  function toggleAmbient() {
    const next = !musicMuted;
    setMusicMuted(next);
    if (!next) startAmbient();
    setAmbientMuted(next);
  }

  function cycleMala(direction: 1 | -1) {
    const current = MALA_TYPES.indexOf(malaType);
    const next = (current + direction + MALA_TYPES.length) % MALA_TYPES.length;
    setMalaSlideDirection(direction);
    setMalaType(MALA_TYPES[next]);
    haptic(6);
  }

  const nextMalaType = MALA_TYPES[(MALA_TYPES.indexOf(malaType) + 1) % MALA_TYPES.length];
  const nextMala = MALAS[nextMalaType];

  function onMalaPointerDown(event: PointerEvent<HTMLDivElement>) {
    malaSwipeStart.current = event.clientX;
  }

  function onMalaPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (malaSwipeStart.current === null) return;
    const distance = event.clientX - malaSwipeStart.current;
    malaSwipeStart.current = null;
    if (Math.abs(distance) < 32) return;
    cycleMala(distance < 0 ? 1 : -1);
  }

  function onSlidePointerDown(event: PointerEvent<HTMLDivElement>) {
    sliding.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateSlide(event.clientX);
  }

  function updateSlide(clientX: number) {
    const track = slideTrack.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const max = Math.max(0, rect.width - SLIDE_THUMB_TRAVEL_INSET);
    const next = Math.max(0, Math.min(max, clientX - rect.left - SLIDE_THUMB_TRAVEL_INSET / 2));
    slideXRef.current = next;
    setSlideX(next);
  }

  function onSlidePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (sliding.current) updateSlide(event.clientX);
  }

  function onSlidePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!sliding.current) return;
    sliding.current = false;
    const track = slideTrack.current;
    const max = track ? Math.max(1, track.getBoundingClientRect().width - SLIDE_THUMB_TRAVEL_INSET) : 1;
    if (slideXRef.current / max > 0.68) cycleMala(1);
    slideXRef.current = 0;
    setSlideX(0);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function chant() {
    startAmbient();
    setDone(false);
    setCount((c) => {
      const n = c + 1;
      addJapa(1);
      if (n % 27 === 0 && n < target) { haptic([12, 30, 12]); ting(); }
      else haptic(10);
      if (n >= target) {
        setMalas((m) => m + 1);
        addPunya(11, "mala-complete");
        setDone(true);
        bell(540, 2.2, 0.26);
        haptic([20, 40, 20, 40, 60]);
        confetti({
          particleCount: 70,
          spread: 64,
          startVelocity: 32,
          gravity: 0.9,
          ticks: 160,
          origin: { y: 0.42 },
          colors: ["#C88131", "#D9954C", "#CEB976", "#9C8544", "#FFD9CC"],
          scalar: 0.9,
        });
        return 0;
      }
      return n;
    });
  }

  useEffect(() => {
    if (auto) {
      timer.current = setInterval(() => {
        if (!manualHold.current) chant();
      }, 1900);
      return () => { if (timer.current) clearInterval(timer.current); };
    }
    if (timer.current) clearInterval(timer.current);
  }, [auto, target, mantraId]); // eslint-disable-line

  function reset() {
    setCount(0); setDone(false); setAuto(false); haptic(8);
  }

  const stats: [string, string][] = [
    ["This mala", String(count)],
    ["Malas today", String(malas)],
    ["Lifetime", japaLifetime.toLocaleString("en-IN")],
  ];

  return (
    <div className="mala-screen flex h-full flex-col">
      <div className="mala-header">
        <ScreenHeader
          title="Mala Jaap"
          onBack={back}
          right={
            <button
              onClick={toggleAmbient}
              aria-label={musicMuted ? "Unmute spiritual music" : "Mute spiritual music"}
              className="mala-sound-button grid h-8 w-8 place-items-center rounded-full"
            >
              {musicMuted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
            </button>
          }
        />
      </div>

      {/* One centered column, not stretched on desktop: the mantra you are
          telling, the mala itself as the hero, then settings, tally, controls. */}
      <div className="mala-scroll flex-1 overflow-hidden no-scrollbar">
        <div className="gutter py-1.5" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}>
          <section className="mala-content mx-auto w-full max-w-[430px] px-3 py-2 lg:max-w-[520px] lg:px-5 lg:py-3">

            {/* the mantra — what you're chanting, named first */}
            <div className="text-center">
              <p className="eyebrow text-muted">{mantra.name.replace(/ ?(Mantra|Maha Mantra)$/i, "")} · {mantra.deity}</p>
              <p className="mt-1 font-deva text-[19px] leading-tight text-ink lg:text-[24px]">{mantra.deva}</p>
              <p className="mt-0.5 truncate text-[10.5px] italic leading-snug text-muted lg:text-[12px]">{mantra.translit}</p>
            </div>

            {/* mantra selector — a single scroll strip so pills never wrap ragged.
                justify-start keeps the selected pill flush-left and unclipped. */}
            <div className="mt-2 flex justify-start gap-1.5 overflow-x-auto no-scrollbar lg:flex-wrap lg:justify-center">
              {mantras.slice(0, 6).map((m) => {
                const on = m.id === mantraId;
                return (
                  <button
                    key={m.id}
                    onClick={() => { setMantraId(m.id); reset(); }}
                    className={cx(
                      "mala-mantra-chip shrink-0 px-3 py-1 text-[11px] transition-colors lg:text-[12.5px]",
                      on ? "text-white" : "ring-gold text-muted"
                    )}
                    style={on ? { background: "var(--icon-ink)" } : undefined}
                  >
                    {m.name.replace(/ ?(Mantra|Maha Mantra)$/i, "")}
                  </button>
                );
              })}
            </div>

            <div
              className="mala-material-preview"
              role="button"
              tabIndex={0}
              aria-label={`${mala.label} mala. Swipe left or right to change material.`}
              onPointerDown={onMalaPointerDown}
              onPointerUp={onMalaPointerUp}
              onPointerCancel={() => { malaSwipeStart.current = null; }}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") cycleMala(-1);
                if (event.key === "ArrowRight") cycleMala(1);
              }}
            >
              <AnimatePresence initial={false} custom={malaSlideDirection} mode="popLayout">
                <motion.div
                  key={malaType}
                  custom={malaSlideDirection}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={{
                    enter: (direction: 1 | -1) => ({ x: direction * 34, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (direction: 1 | -1) => ({ x: direction * -34, opacity: 0 }),
                  }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mala.texture} alt={`${mala.label} mala`} className="mala-material-photo" />
                  <div>
                    <div className="text-[12px] font-medium text-ink">{mala.label} mala</div>
                    <div className="mt-0.5 text-[10.5px] text-muted">Natural material texture</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          {/* the mala — the tap surface, the hero of the screen */}
          <div className="relative mt-3 flex flex-col items-center">
            <button
              onClick={chant}
              onPointerDown={() => { manualHold.current = true; }}
              onPointerUp={() => { manualHold.current = false; }}
              onPointerCancel={() => { manualHold.current = false; }}
              className="relative active:scale-[0.99]"
              style={{ width: SIZE, height: SIZE }}
            >
              {/* the cord — a soft wooden thread the beads are strung on */}
              {/* the 108 beads (or `target` beads) — chanted ones warm to gold */}
              {Array.from({ length: visibleBeads }).map((_, i) => {
                const a = (i / visibleBeads) * Math.PI * 2 - Math.PI / 2;
                const x = CENTER + R * Math.cos(a);
                const y = CENTER + R * Math.sin(a);
                const lit = i < litBeads;
                return (
                  <span
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: x - beadR, top: y - beadR, width: beadR * 2, height: beadR * 2,
                      background: lit
                        ? "radial-gradient(circle at 34% 28%, #FCEBC6, var(--bhagwa-soft) 52%, var(--bhagwa-deep))"
                        : mala.bead,
                      backgroundImage: !lit ? `url(${mala.beadTexture})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: `${(i * 17) % 100}% ${(i * 29) % 100}%`,
                      boxShadow: lit ? "0 0 6px rgba(214,84,3,0.45)" : "inset 0 -1px 1px rgba(0,0,0,0.25)",
                    }}
                  />
                );
              })}

              {/* the moving edge — the next bead to tell, gently pulsing */}
              {!done && count < target && (() => {
                const a = (litBeads / visibleBeads) * Math.PI * 2 - Math.PI / 2;
                const x = CENTER + R * Math.cos(a);
                const y = CENTER + R * Math.sin(a);
                return (
                  <motion.span
                    className="absolute rounded-full"
                    style={{ left: x - beadR - 3, top: y - beadR - 3, width: beadR * 2 + 6, height: beadR * 2 + 6, border: "1.5px solid var(--bhagwa)" }}
                    animate={{ scale: [1, 1.35, 1], opacity: [0.9, 0.3, 0.9] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                );
              })()}

              {/* sumeru / guru bead — the crown of the mala, with a tassel */}
              <div className="absolute" style={{ left: CENTER, top: CENTER - R, transform: "translate(-50%,-50%)" }}>
                {/* tassel above the guru bead */}
                <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "100%" }}>
                  <div className="mx-auto h-3 w-[2px]" style={{ background: "var(--bhagwa-deep)" }} />
                  <div className="mx-auto h-2.5 w-3 rounded-b-full" style={{ background: "linear-gradient(180deg, var(--bhagwa), var(--bhagwa-deep))" }} />
                </div>
                <motion.span
                  className="block rounded-full"
                  style={{
                    width: 24, height: 24,
                    background: mala.guru,
                    border: "1px solid rgba(121,82,31,0.55)",
                  }}
                  animate={{ boxShadow: `0 0 ${8 + progress * 24}px ${2 + progress * 5}px rgba(200,129,49,${0.28 + progress * 0.5})` }}
                />
              </div>

              {/* the count — floating inside the ring, no plate */}
              <div className="absolute inset-0 grid place-items-center">
                {done ? (
                  <div className="flex flex-col items-center">
                    <Check size={36} className="text-[var(--good)]" />
                    <span className="mt-1 font-deva text-[13.5px] text-ink">माला पूर्ण</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="font-display text-[52px] leading-none text-ink tabular-nums">{count}</span>
                    <span className="mt-0.5 text-[11.5px] tnum text-muted">of {target}</span>
                    <span className="mt-1.5 eyebrow text-[var(--bhagwa-deep)]">tap to chant</span>
                  </div>
                )}
              </div>
            </button>

            {/* target chips */}
            <div className="mt-3 flex justify-center gap-1.5">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setTarget(t); reset(); }}
                  className={cx("rounded-[5px] px-2.5 py-1 text-[10.5px] tnum", t === target ? "text-white" : "ring-gold text-muted")}
                  style={t === target ? { background: "var(--icon-ink)" } : undefined}
                >
                  {t}
                </button>
              ))}
            </div>

          </div>{/* /mala */}

            {/* japa tally — hairline row, no boxes */}
            <div className="mt-2.5 grid grid-cols-3 py-1.5 text-center">
              {stats.map(([l, v], i) => (
                <div key={l} className="px-1">
                  <div className="font-display text-[16px] tnum text-ink lg:text-[20px]">{v}</div>
                  <div className="mt-0.5 text-[10px] text-muted lg:text-[11.5px]">{l}</div>
                </div>
              ))}
            </div>

            {/* controls */}
            <div className="mt-2 flex gap-2">
              <button onClick={() => setAuto((a) => !a)} className="mala-auto-button flex flex-1 items-center justify-center py-2.5 text-[12px] font-medium text-white lg:text-[13px]">
                {auto ? "Pause auto-jaap" : "Hands-free auto-jaap"}
              </button>
              <button onClick={reset} className="mala-reset-button grid h-[40px] w-[40px] place-items-center lg:h-[44px] lg:w-[44px]"><ArrowCounterClockwise size={16} /></button>
            </div>
            <div
              ref={slideTrack}
              className="mala-slide-track mt-2"
              onPointerDown={onSlidePointerDown}
              onPointerMove={onSlidePointerMove}
              onPointerUp={onSlidePointerUp}
              onPointerCancel={onSlidePointerUp}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={slideX > 0 ? 1 : 0}
              aria-label={`Slide to change mala to ${nextMala.label}`}
            >
              <span className="mala-slide-label">Slide for {nextMala.label} mala</span>
              <span className="mala-slide-thumb" style={{ transform: `translateX(${slideX}px)` }}>
                <CaretRight size={15} weight="bold" />
              </span>
            </div>
            <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-muted">Chant at your own pace — Divasya keeps the count for you, even with the screen off.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
