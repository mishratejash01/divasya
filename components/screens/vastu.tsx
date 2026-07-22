"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CaretLeft, Compass, X } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { ZONES16, zone16 } from "@/lib/vastu";

const DIRS16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
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

  function onOrient(e: DeviceOrientationEvent) {
    const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
    const h = ev.webkitCompassHeading != null ? ev.webkitCompassHeading : e.alpha != null ? 360 - e.alpha : null;
    if (h != null) setHeading(h);
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
        sub="Align your home with the directions"
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
          <div className="relative mt-3" style={{ width: 270, height: 270 }}>
            {/* fixed top pointer */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2" style={{ borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "12px solid var(--bhagwa)" }} />
            <div className="absolute inset-0 rounded-full surface" style={{ border: "1px solid var(--line)", transform: `rotate(${-heading}deg)`, transition: live ? "transform 0.12s linear" : undefined }}>
              {DIRS16.map((d, i) => {
                const a = (i / 16) * 360;
                const main = ["N", "E", "S", "W"].includes(d);
                const cardinal = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"].includes(d);
                return (
                  <div key={d} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateY(-118px) rotate(${-a}deg)` }}>
                    <span className={cx("text-[11px]", d === "N" ? "text-[var(--avoid)] font-medium" : main ? "text-ink font-medium" : cardinal ? "text-gold" : "text-muted")}
                      style={{ transform: `rotate(${heading}deg)`, display: "inline-block" }}>{d}</span>
                  </div>
                );
              })}
              {/* ring + ticks */}
              <div className="absolute inset-6 rounded-full" style={{ border: "1px solid var(--line)" }} />
            </div>
            {/* center */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-4xl text-ink">{Math.round(heading)}°</div>
                <div className="text-[11px] text-gold">{facing}</div>
              </div>
            </div>
          </div>

          {!live && (
            <button onClick={enableCompass} className="mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-[11.5px] btn-saffron">
              <Compass size={14} /> Enable live compass
            </button>
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
