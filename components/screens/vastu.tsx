"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Compass, X } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { ZONES16, zone16 } from "@/lib/vastu";

const DIRS16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

/**
 * A digital compass face. One rotating card carries everything — the degree
 * ring, the letters, the rose and a red north arrow — and turns by -heading so
 * its N settles on true north. A fixed index at the top (the lubber line) marks
 * the heading you are facing. There is no separate free needle: the card's red
 * arrow IS north, which is what a phone compass shows and keeps the two from
 * fighting each other the way they did before.
 */
function CompassRose({ heading, live }: { heading: number; live: boolean }) {
  const C = 100, R = 95;
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const CARD: { d: string; a: number; big: boolean }[] = [
    { d: "N", a: 0, big: true }, { d: "NE", a: 45, big: false }, { d: "E", a: 90, big: true },
    { d: "SE", a: 135, big: false }, { d: "S", a: 180, big: true }, { d: "SW", a: 225, big: false },
    { d: "W", a: 270, big: true }, { d: "NW", a: 315, big: false },
  ];
  const pt = (ang: number, r: number) => {
    const rad = ((ang - 90) * Math.PI) / 180;
    return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
  };
  return (
    <svg viewBox="-4 -4 208 208" width="280" height="280" aria-label="Compass">
      {/* housing */}
      <circle cx={C} cy={C} r={R} fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="1.2" />
      <circle cx={C} cy={C} r={R - 18} fill="none" stroke="var(--line)" strokeWidth="1" />

      {/* rotating card */}
      <g
        style={{
          transform: `rotate(${-heading}deg)`,
          transformOrigin: "100px 100px",
          transition: live ? "transform 0.12s linear" : undefined,
        }}
      >
        {ticks.map((a) => {
          const major = a % 30 === 0;
          const [x1, y1] = pt(a, R - 1);
          const [x2, y2] = pt(a, R - (major ? 10 : 5));
          return (
            <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={major ? "var(--muted)" : "var(--line-strong)"} strokeWidth={major ? 1.3 : 0.7} />
          );
        })}
        {/* degree numbers every 30° */}
        {ticks.filter((a) => a % 30 === 0).map((a) => {
          const [x, y] = pt(a, R - 20);
          return (
            <text key={a} x={x} y={y} fontSize="6.5" textAnchor="middle" dominantBaseline="central"
              fill="var(--muted-2)" className="tnum">{a}</text>
          );
        })}
        {/* cardinal + intercardinal letters */}
        {CARD.map(({ d, a, big }) => {
          const [x, y] = pt(a, R - 34);
          return (
            <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fontSize={big ? 13 : 8.5} fontWeight={big ? 700 : 500}
              fill={d === "N" ? "var(--avoid)" : big ? "var(--ink)" : "var(--muted)"}>{d}</text>
          );
        })}
        {/* the compass needle: a slim red arrow to N, grey tail to S, carried by
            the card so red always lands on true north */}
        <polygon points={`${C},${C - 54} ${C - 7},${C} ${C + 7},${C}`} fill="var(--avoid)" />
        <polygon points={`${C},${C + 54} ${C - 7},${C} ${C + 7},${C}`} fill="var(--muted-2)" />
      </g>

      {/* fixed pivot cap */}
      <circle cx={C} cy={C} r="5.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.6" />

      {/* fixed top index (lubber line) — points down at the card at your heading */}
      <polygon points={`${C},${-2} ${C - 6},${-13} ${C + 6},${-13}`} fill="var(--bhagwa)" />
    </svg>
  );
}
// 16-zone data from the jyotish-grade Vastu engine (lib/vastu).
const ZONE_INFO: Record<string, { zone: string; use: string; tip: string }> = Object.fromEntries(
  ZONES16.map((z) => {
    const ideal = z.idealFor.join(", ");
    const avoid = z.avoidFor.join(", ");
    const area = z.lifeArea.toLowerCase();
    return [z.code, {
      zone: z.sanskrit || z.direction,
      use: z.lifeArea,
      tip: avoid
        ? `This corner carries the ${z.element} element and nurtures ${area}, so it is best given over to ${ideal}. Try to keep ${avoid} out of this zone, as placing them here tends to work against its natural energy.`
        : `This corner carries the ${z.element} element and nurtures ${area}, so it sits comfortably with ${ideal}. There is little you need to keep out of this direction.`,
    }];
  })
);

export function VastuScreen() {
  const { back } = useApp();
  const [heading, setHeading] = useState(0);
  const [live, setLive] = useState(false);
  const [ar, setAr] = useState(false);
  const [openDir, setOpenDir] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const zoneFor = (dir: string) => ZONE_INFO[dir] ?? ZONE_INFO.N;
  const facing = DIRS16[zone16(heading)];
  const z = zoneFor(facing);

  const arRef = useRef(false);
  arRef.current = ar;

  function onOrient(e: DeviceOrientationEvent) {
    const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    const h = ev.webkitCompassHeading != null ? ev.webkitCompassHeading : e.alpha != null ? 360 - e.alpha : null;
    if (h != null) setHeading(h);

    // beta is front-to-back tilt: ~0° lying flat (dial), ~90° held upright
    // (camera). Switch on the way past the middle, with a dead-band so it does
    // not flicker at the threshold.
    const beta = e.beta;
    if (beta != null) {
      if (!arRef.current && beta > 55) toggleAR();
      else if (arRef.current && beta < 35) toggleAR();
    }
  }

  async function enableCompass() {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (D && typeof D.requestPermission === "function") {
        const p = await D.requestPermission();
        if (p !== "granted") return;
      }
      window.addEventListener("deviceorientationabsolute", onOrient, true);
      window.addEventListener("deviceorientation", onOrient, true);
      setLive(true);
    } catch { setLive(true); }
  }

  async function toggleAR() {
    if (ar) { streamRef.current?.getTracks().forEach((t) => t.stop()); setAr(false); return; }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      setAr(true);
      if (!live) enableCompass();
    } catch { /* camera denied */ }
  }

  useEffect(() => () => {
    window.removeEventListener("deviceorientationabsolute", onOrient, true);
    window.removeEventListener("deviceorientation", onOrient, true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Vastu Compass"
        onBack={back}
        right={
          <button
            onClick={toggleAR}
            className="flex shrink-0 items-center gap-1 rounded-[5px] px-2 py-1 text-[12.5px] font-normal text-ink"
            style={{ background: "rgba(0,0,0,0.10)" }}
          >
            {ar ? <X size={12} weight="bold" /> : <Camera size={12} weight="bold" />} {ar ? "Close" : "AR"}
          </button>
        }
      />

      {/* AR camera */}
      {ar && (
        <div className="relative gutter-m mb-3 overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4", background: "#000" }}>
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[12.5px] font-normal text-white">Facing {facing}</div>
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2">
              <div className="text-[12.5px] font-normal text-white">{z.zone} · {z.use}</div>
              <div className="text-[12.5px] font-normal text-white/80">{z.tip}</div>
            </div>
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
          </div>
        </div>
      )}

      {/* compass + details */}
      {!ar && (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar lg:flex-row lg:items-start lg:overflow-hidden">
          {/* LEFT column — the dial */}
          <div className="flex flex-col items-center gutter lg:w-[340px] lg:shrink-0">
            <div className="mt-3" style={{ width: 280, height: 280 }}>
              <CompassRose heading={heading} live={live} />
            </div>

            {/* Heading and facing sit below the dial, clear of the needle. */}
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[30px] leading-none tnum text-ink">{Math.round(heading)}°</span>
              <span className="text-[13px] font-normal text-ink">{facing}</span>
            </div>

            {!live && (
              <button onClick={enableCompass} className="mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-[13px] btn-saffron">
                <Compass size={14} /> Enable live compass
              </button>
            )}
            {live && (
              <div className="mt-4 text-center text-[12.5px] font-normal leading-relaxed text-[var(--muted-2)]">
                Lay the phone flat to read the dial · hold it upright for the camera view
              </div>
            )}
          </div>

          {/* RIGHT column — two separate section blocks: Suggestions + Direction
              Guide. Same surface colour, no shadow, no internal divider lines. */}
          <div className="flex-1 min-h-0 gutter screen-bottom lg:h-full lg:overflow-y-auto lg:no-scrollbar">

            {/* Suggestions — for the direction you're facing now */}
            <div className="mt-4 rounded-2xl p-4 lg:mt-5"
              style={{ background: "var(--surface)", border: "1px solid var(--line-card)" }}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="section-title">Suggestions</h3>
                  <div className="mt-1.5 text-[13.5px] font-medium text-ink">{z.zone} · {z.use}</div>
                  <p className="measure mt-1 text-[13px] font-normal leading-relaxed text-muted">{z.tip}</p>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/vastu-sadhu.webp" alt="Sadhu" className="h-24 w-24 shrink-0 object-contain lg:h-28 lg:w-28" />
              </div>
            </div>

            {/* Direction Guide */}
            <div className="mt-5 rounded-2xl py-3.5"
              style={{ background: "var(--surface)", border: "1px solid var(--line-card)" }}>
              <h3 className="section-title px-4">Direction Guide</h3>
              <div className="mt-1.5 lg:flex lg:items-start lg:gap-4 lg:pr-4">
                {/* the direction rows */}
                <div className="lg:min-w-0 lg:flex-1">
                  {(["NE", "E", "SE", "S", "SW", "W", "NW", "N"] as const).map((d) => {
                    const zd = zoneFor(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setOpenDir(d)}
                        className="flex w-full items-start gap-3 px-4 py-2.5 text-left lg:pr-0"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md px-2 py-1 text-[12px] font-medium text-ink"
                          style={{ background: "rgba(206,185,118,0.18)", border: "1px solid var(--line-gold)" }}>{d}</span>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-ink">{zd.zone} · {zd.use}</div>
                          <p className="measure mt-0.5 hidden text-[12.5px] font-normal leading-relaxed text-muted lg:block">{zd.tip}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* AR/VR promo — sits in the leftover width inside this block */}
                <ArPromo onTry={toggleAR} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE bottom drawer — per-direction details */}
      {openDir && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenDir(null)} />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl surface p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--line-strong)" }} />
            {(() => {
              const zd = zoneFor(openDir);
              return (
                <>
                  <div className="text-[15px] font-normal text-ink">{openDir} · {zd.zone}</div>
                  <div className="mt-1 text-[13px] font-normal text-muted">{zd.use}</div>
                  <div className="mt-2 text-[13px] font-normal leading-relaxed text-muted">{zd.tip}</div>
                </>
              );
            })()}
            <button
              type="button"
              onClick={() => setOpenDir(null)}
              className="mt-5 w-full rounded-2xl px-4 py-3 text-[13px] btn-saffron"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// AR/VR promo — a slim card that fills the leftover width inside the Direction
// Guide block on desktop. One vertical carousel cycling lines about the live view.
function ArPromo({ onTry }: { onTry: () => void }) {
  const slides = [
    { t: "Point, and it reveals", d: "Hold your phone up and every Vastu zone is painted over your actual room, live through the camera." },
    { t: "Walk the space", d: "As you turn, the directions and their ideal uses follow the room with you — no floor plan to draw." },
    { t: "Decide on the spot", d: "See at a glance whether the kitchen, bed or locker sits in a supportive corner, right where you stand." },
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 3800);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  return (
    <aside
      className="relative hidden shrink-0 self-start overflow-hidden rounded-2xl lg:sticky lg:top-1 lg:flex lg:w-[290px] lg:flex-col"
      style={{ background: "linear-gradient(165deg, #C15C1E 0%, #8A2B22 100%)", color: "#fff" }}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="relative p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: "rgba(255,255,255,0.16)" }}>
            <Camera size={16} weight="fill" />
          </span>
          <span className="text-[11px] font-medium tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.85)" }}>AR · VR</span>
        </div>
        <div className="mt-3 font-display text-[18px] leading-tight">See your Vastu, live in the room</div>

        <div className="relative mt-4 h-[124px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[14.5px] font-medium">{slides[i].t}</div>
              <p className="mt-1.5 text-[12.5px] font-normal leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>{slides[i].d}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-1 flex gap-1.5">
          {slides.map((_, k) => (
            <span key={k} className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: k === i ? 18 : 6, background: k === i ? "#fff" : "rgba(255,255,255,0.4)" }} />
          ))}
        </div>

        <button onClick={onTry} className="mt-5 w-full rounded-xl py-2.5 text-[13px] font-medium" style={{ background: "#fff", color: "#8A2B22" }}>
          Try AR view
        </button>
      </div>
    </aside>
  );
}
