"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CaretLeft, Compass, X } from "@phosphor-icons/react";
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
  ZONES16.map((z) => [z.code, {
    zone: z.sanskrit || z.direction,
    use: z.lifeArea,
    tip: `Ideal for ${z.idealFor.join(", ")}. Avoid ${z.avoidFor.join(", ") || "nothing critical"}. Element ${z.element}.`,
  }])
);

export function VastuScreen() {
  const { back } = useApp();
  const [heading, setHeading] = useState(0);
  const [live, setLive] = useState(false);
  const [ar, setAr] = useState(false);
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
            className="flex shrink-0 items-center gap-1 rounded-[5px] px-2 py-1 text-[11px] text-ink"
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
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white">Facing {facing}</div>
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2">
              <div className="text-[11px] font-medium text-white">{z.zone} · {z.use}</div>
              <div className="text-[10px] text-white/80">{z.tip}</div>
            </div>
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
          </div>
        </div>
      )}

      {/* compass dial */}
      {!ar && (
        <div className="flex flex-col items-center gutter">
          <div className="mt-3" style={{ width: 280, height: 280 }}>
            <CompassRose heading={heading} live={live} />
          </div>

          {/* Heading and facing sit below the dial, clear of the needle. */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-[30px] leading-none tnum text-ink">{Math.round(heading)}°</span>
            <span className="text-[13px] font-medium text-gold">{facing}</span>
          </div>

          {!live && (
            <button onClick={enableCompass} className="mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-[11.5px] btn-saffron">
              <Compass size={14} /> Enable live compass
            </button>
          )}
          {live && (
            <div className="mt-4 text-center text-[10px] leading-relaxed text-[var(--muted-2)]">
              Lay the phone flat to read the dial · hold it upright for the camera view
            </div>
          )}

          <div className="mt-5 w-full rounded-2xl card-temple p-3">
            <div className="eyebrow text-gold">Facing {z.zone}</div>
            <div className="mt-1 text-[13.5px] text-ink">{z.use}</div>
            <div className="mt-1 text-[11px] leading-relaxed text-muted">{z.tip}</div>
          </div>
        </div>
      )}

      {/* zone guide */}
      <div className="mt-4 flex-1 overflow-y-auto gutter screen-bottom no-scrollbar">
        <h3 className="mb-2 section-title">Direction Guide</h3>
        <div className="overflow-hidden rounded-2xl surface">
          {(["NE", "E", "SE", "S", "SW", "W", "NW", "N"] as const).map((d, i) => {
            const zd = zoneFor(d);
            return (
              <div key={d} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                <span className="mt-0.5 w-8 text-[11.5px] font-medium text-gold">{d}</span>
                <div>
                  <div className="text-[11.5px] text-ink">{zd.zone} · {zd.use}</div>
                  <div className="text-[10.5px] leading-snug text-muted">{zd.tip}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
