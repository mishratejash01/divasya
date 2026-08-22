"use client";

// Vastu — five instruments over one computed engine:
//   Compass   flicker-free dial; the card writes straight to the GPU
//   Lens      point the camera, freeze a spot, get the engine's verdict there
//   My Home   map rooms once, get a weighted score, work the remedy checklist
//   Entrance  the 32 padas of the Vastu Purusha Mandala, tap your door
//   Guru      an acharya chat grounded in the same computed facts
//
// The compass fires up to 60 events a second. The old screen pushed each one
// through React state, re-rendering everything — camera view included — every
// tick: the exact flicker reported. Here the heading lives in a ref, a rAF
// loop writes one CSS transform, and React text updates at most 4Hz.

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Check, Compass, PaperPlaneRight, Plus, X } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, FilterChips, cx } from "../ui";
import { supabaseBrowser } from "@/lib/supabase";
import {
  ZONES16, ZONE_CYCLE, zone16, padaInfo, roomVerdict, analyzeHome,
  personalDirections, smoothHeading, type HomeRoom,
} from "@/lib/vastu";
import { ROOM_INFO, type RoomType } from "@/lib/vastu/data";

const DIRS16 = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const ROOM_TYPES = Object.keys(ROOM_INFO) as RoomType[];

// My Home, Entrance and Guru are a paid tier. The engine, tables and chat
// route beneath them stay live; this flag only gates the UI. To launch the
// tier, set NEXT_PUBLIC_VASTU_PREMIUM=1 in Vercel and redeploy — no code.
const PREMIUM = process.env.NEXT_PUBLIC_VASTU_PREMIUM === "1";

/* ---------------- the shared compass core (ref-based, no render storm) ---- */

type CompassCore = {
  live: boolean;
  needsCal: boolean;
  enable: () => Promise<void>;
  headingRef: React.MutableRefObject<number>;
  /** coarse heading for text — updated at most 4Hz */
  coarse: number;
};

function useCompass(active: boolean): CompassCore {
  const headingRef = useRef(0);
  const targetRef = useRef(0);
  const [live, setLive] = useState(false);
  const [needsCal, setNeedsCal] = useState(false);
  const [coarse, setCoarse] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let lastText = 0;
    const tick = (t: number) => {
      headingRef.current = smoothHeading(headingRef.current, targetRef.current, 0.22);
      if (t - lastText > 250) { lastText = t; setCoarse(headingRef.current); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Android fires BOTH deviceorientationabsolute (referenced to true north)
    // and deviceorientation (referenced to wherever the phone was when the app
    // opened). Feeding the relative stream into the heading points the compass
    // the wrong way, so once an absolute reading has arrived the plain event is
    // ignored. iOS fires only deviceorientation, but carries webkitCompassHeading
    // (true north) — always trust that when present.
    let gotAbsolute = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
      const isAbsolute = e.type === "deviceorientationabsolute";
      if (isAbsolute) gotAbsolute = true;

      let h: number | null = null;
      if (ev.webkitCompassHeading != null) {
        h = ev.webkitCompassHeading;                       // iOS — true north
      } else if (isAbsolute && e.alpha != null) {
        h = (360 - e.alpha) % 360;                         // Android absolute — true north
      } else if (!gotAbsolute && e.absolute === true && e.alpha != null) {
        h = (360 - e.alpha) % 360;                         // some browsers flag the plain event absolute
      } else {
        // A relative-only reading is not a compass heading — ignore it (it is
        // what made the dial point the wrong way) and ask for calibration.
        if (!gotAbsolute && ev.webkitCompassHeading == null) setNeedsCal(true);
        return;
      }
      targetRef.current = h;
      // iOS reports accuracy in degrees (negative = uncalibrated); otherwise a
      // clean absolute reading clears the hint.
      if (ev.webkitCompassAccuracy != null) setNeedsCal(ev.webkitCompassAccuracy < 0 || ev.webkitCompassAccuracy > 30);
      else setNeedsCal(false);
    };
    window.addEventListener("deviceorientationabsolute", onOrient as EventListener, true);
    window.addEventListener("deviceorientation", onOrient as EventListener, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientationabsolute", onOrient as EventListener, true);
      window.removeEventListener("deviceorientation", onOrient as EventListener, true);
    };
  }, [active]);

  const enable = useCallback(async () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (D && typeof D.requestPermission === "function") {
        const p = await D.requestPermission();
        if (p !== "granted") return;
      }
      setLive(true);
    } catch { setLive(true); }
  }, []);

  return { live, needsCal, enable, headingRef, coarse };
}

/** One element that follows the smoothed heading via direct style writes. */
function HeadingRotor({ headingRef, invert, className, style, children }: {
  headingRef: React.MutableRefObject<number>;
  invert?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (el.current)
        el.current.style.transform = `rotate(${invert ? -headingRef.current : headingRef.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [headingRef, invert]);
  return <div ref={el} className={className} style={style}>{children}</div>;
}

/**
 * The compass card, rendered ONCE: degree ticks, the sixteen letters and a red
 * north arrow, all static SVG. The card as a whole spins inside a
 * HeadingRotor — its N settles toward magnetic north like a real compass card,
 * and no part of it ever re-renders while it turns.
 */
function RoseCard() {
  const C = 100;
  const pt = (ang: number, r: number): [number, number] => {
    const rad = ((ang - 90) * Math.PI) / 180;
    return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
  };
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full">
      <circle cx={C} cy={C} r={97} fill="var(--surface)" stroke="var(--line)" />
      {Array.from({ length: 72 }, (_, i) => i * 5).map((a) => {
        const major = a % 45 === 0;
        const [x1, y1] = pt(a, major ? 88 : 92);
        const [x2, y2] = pt(a, 96);
        return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={major ? "var(--ink)" : "var(--line-strong)"} strokeWidth={major ? 1.4 : 0.7} />;
      })}
      {/* red north arrow — the card's own N, as on a physical compass */}
      <polygon points={`${C},10 ${C - 5},26 ${C + 5},26`} fill="var(--avoid)" />
      {DIRS16.map((d, i) => {
        const a = i * 22.5;
        const [x, y] = pt(a, d.length > 2 ? 72 : 78);
        const main = ["N", "E", "S", "W"].includes(d);
        return (
          <text key={d} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            transform={`rotate(${a} ${x} ${y})`}
            fontSize={main ? 13 : 7.5} fontWeight={main ? 600 : 400}
            fill={d === "N" ? "var(--avoid)" : main ? "var(--ink)" : "var(--muted, #6b6257)"}>
            {d}
          </text>
        );
      })}
      <circle cx={C} cy={C} r={54} fill="none" stroke="var(--line)" />
    </svg>
  );
}

/* ---------------- shared bits ---------------- */

function ZoneCard({ zoneIdx, rashi }: { zoneIdx: number; rashi: string | null | undefined }) {
  const z = ZONES16[zoneIdx];
  const me = personalDirections(rashi);
  const mine = me && (z.code === me.code || z.direction === me.dir);
  return (
    <div className="rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-medium text-ink">
          {z.direction}{z.sanskrit ? <span className="font-deva text-gold"> · {z.sanskrit}</span> : null}
        </div>
        <div className="text-[10.5px] text-muted">element {ZONE_CYCLE[zoneIdx]} · {z.planet}</div>
      </div>
      <div className="mt-1 text-[12px] leading-relaxed text-ink">{z.lifeArea}</div>
      <div className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
        Belongs here: {z.idealFor.join(", ")}. {z.avoidFor.length ? `Keep away: ${z.avoidFor.join(", ")}.` : ""}
      </div>
      {mine && (
        <div className="mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] btn-saffron">
          Your favourable disha · {me!.lord} rules your {me!.rashi}
        </div>
      )}
    </div>
  );
}

const GRADE_TONE: Record<string, string> = {
  ideal: "var(--good)", good: "var(--good)", neutral: "#9C8544",
  caution: "#B98A2E", dosha: "var(--avoid)", severe: "var(--avoid)",
};

/* ---------------- Compass tab ---------------- */

function CompassTab({ rashi }: { rashi: string | null | undefined }) {
  const c = useCompass(true);
  const zoneIdx = zone16(c.coarse);
  return (
    <div className="flex flex-col items-center gutter pt-2">
      <div className="relative" style={{ width: 268, height: 268 }}>
        {/* the lubber line — fixed; you read your heading against it */}
        <div className="absolute left-1/2 top-[-2px] z-10 -translate-x-1/2"
          style={{ borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "10px solid var(--bhagwa)" }} />
        <HeadingRotor headingRef={c.headingRef} invert className="absolute inset-0">
          <RoseCard />
        </HeadingRotor>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-display text-4xl tnum text-ink">{Math.round(c.coarse)}°</div>
            <div className="text-[11px] text-gold">{ZONES16[zoneIdx].code}</div>
          </div>
        </div>
      </div>

      {!c.live && (
        <button onClick={c.enable} className="mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-[11.5px] btn-saffron">
          <Compass size={14} /> Enable live compass
        </button>
      )}
      {c.needsCal && (
        <div className="mt-3 rounded-full px-3 py-1.5 text-[10.5px]" style={{ background: "var(--surface-2)", color: "var(--avoid)" }}>
          Wave your phone in a figure-8 to calibrate the sensor
        </div>
      )}

      <div className="mt-4 w-full">
        <ZoneCard zoneIdx={zoneIdx} rashi={rashi} />
      </div>
      <p className="mt-2 w-full text-[9.5px] leading-relaxed text-[var(--muted-2)]">
        Reads magnetic north — the reference a vastu pandit&apos;s site compass uses. Declination across
        India stays under 2°, well inside a 22.5° zone. Keep clear of metal and magnets while reading.
      </p>
    </div>
  );
}

/* ---------------- Lens tab (freeze a spot, get the verdict) -------------- */

function LensTab({ rashi, onAskGuru }: { rashi: string | null | undefined; onAskGuru?: (seed: string) => void }) {
  const { haptic } = useApp();
  const c = useCompass(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [frozen, setFrozen] = useState<{ img: string; heading: number } | null>(null);
  const [what, setWhat] = useState<RoomType | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  const [camErr, setCamErr] = useState<string | null>(null);
  async function startCam() {
    setCamErr(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      streamRef.current = s;
      if (videoRef.current) { videoRef.current.srcObject = s; await videoRef.current.play(); }
      setCamOn(true);
      if (!c.live) c.enable();
    } catch (e) {
      // say WHY, honestly — a silent button reads as broken
      const name = (e as DOMException)?.name;
      setCamErr(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow it when asked — or enable Camera for Divasya in your phone's app settings — then try again."
          : name === "NotFoundError"
          ? "No camera was found on this device."
          : "The camera could not start. Close other camera apps and try again."
      );
    }
  }

  function freeze() {
    const v = videoRef.current;
    if (!v) return;
    const cv = document.createElement("canvas");
    cv.width = v.videoWidth || 720; cv.height = v.videoHeight || 960;
    cv.getContext("2d")?.drawImage(v, 0, 0);
    setFrozen({ img: cv.toDataURL("image/jpeg", 0.8), heading: c.headingRef.current });
    setWhat(null); setSaved(false);
    haptic(12);
  }

  const zoneIdx = frozen ? zone16(frozen.heading) : zone16(c.coarse);
  const z = ZONES16[zoneIdx];
  const verdict = frozen && what ? roomVerdict(what, zoneIdx) : null;

  async function saveSnapshot() {
    if (!frozen) return;
    try {
      const sb = supabaseBrowser();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      await sb.from("vastu_snapshots").insert({
        user_id: auth.user.id, zone: zoneIdx, heading: Math.round(frozen.heading),
        room_type: what, note: verdict ? `${verdict.label}: ${verdict.basis}` : null,
      });
      setSaved(true); haptic(8);
    } catch { /* stays unsaved; the button remains */ }
  }

  return (
    <div className="gutter pt-2">
      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4", background: "#000" }}>
        {/* the live camera stays mounted; a frozen frame simply lays over it,
            so resuming never re-negotiates the stream (the old flicker) */}
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        {frozen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frozen.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {!camOn && (
          <div className="absolute inset-0 grid place-items-center">
            <button onClick={startCam} className="flex items-center gap-2 rounded-2xl px-4 py-3 text-[11.5px] btn-saffron">
              <Camera size={14} /> Open the Lens
            </button>
          </div>
        )}
        {camOn && (
          <>
            <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white">
              {frozen ? `Frozen · ${z.direction}` : `${Math.round(c.coarse)}° · ${z.code}${z.sanskrit ? ` ${z.sanskrit}` : ""}`}
            </div>
            <div className="absolute inset-x-0 bottom-3 flex justify-center">
              {frozen ? (
                <button onClick={() => { setFrozen(null); setWhat(null); }} className="rounded-full bg-black/55 px-4 py-2 text-[11.5px] text-white">
                  Resume live view
                </button>
              ) : (
                <button onClick={freeze} aria-label="Freeze this spot"
                  className="grid h-14 w-14 place-items-center rounded-full border-4 border-white/80 bg-white/25" />
              )}
            </div>
          </>
        )}
      </div>

      {camErr && (
        <div className="mt-2 rounded-xl p-2.5 text-[11px] leading-relaxed text-ink" style={{ background: "var(--surface-2)" }}>
          {camErr}
        </div>
      )}

      {!camOn && (
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
          Point the camera at any spot in your home, freeze it, and the engine reads that exact
          direction — what the zone governs, what belongs there, and what to fix.
        </p>
      )}

      {frozen && (
        <div className="mt-3">
          <ZoneCard zoneIdx={zoneIdx} rashi={rashi} />

          <div className="mt-3">
            <div className="eyebrow text-muted">What stands at this spot?</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ROOM_TYPES.map((t) => (
                <button key={t} onClick={() => setWhat(t)}
                  className={cx("rounded-full px-3 py-1.5 text-[10.5px]", what === t ? "btn-saffron" : "surface text-muted")}>
                  {ROOM_INFO[t].label}
                </button>
              ))}
            </div>
          </div>

          {verdict && (
            <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="text-[12px] font-medium" style={{ color: GRADE_TONE[verdict.grade] }}>{verdict.label}</div>
              <div className="mt-1 text-[11.5px] leading-relaxed text-ink">{verdict.basis}</div>
              {verdict.remedy && (
                <div className="mt-2 text-[11px] leading-relaxed text-muted">
                  <span className="text-gold">Remedy · </span>{verdict.remedy}
                </div>
              )}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button onClick={saveSnapshot} disabled={saved}
              className={cx("flex-1 rounded-2xl py-3 text-[11.5px]", onAskGuru ? "btn-white" : "btn-saffron")}>
              {saved ? "Saved to walkthrough" : "Save this reading"}
            </button>
            {onAskGuru && (
              <button
                onClick={() => onAskGuru(
                  `I froze a spot facing ${z.direction}${what ? ` where my ${ROOM_INFO[what].label.toLowerCase()} stands` : ""}. ${verdict ? `The engine says: ${verdict.label} — ${verdict.basis}` : ""} What should I understand and do?`
                )}
                className="flex-1 rounded-2xl py-3 text-[11.5px] btn-saffron">
                Ask the Guru
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- My Home tab (map rooms, score, remedies) --------------- */

type DbRoom = { id: string; room_type: RoomType; zone: number; fixed: boolean };

function HomeTab({ rashi }: { rashi: string | null | undefined }) {
  const { haptic } = useApp();
  const [propId, setPropId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<DbRoom[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<RoomType>("entrance");
  const [newZone, setNewZone] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: auth } = await sb.auth.getUser();
        if (!auth.user) { setRooms([]); return; }
        let { data: prop } = await sb.from("vastu_properties").select("id").eq("user_id", auth.user.id).limit(1).maybeSingle();
        if (!prop) {
          const ins = await sb.from("vastu_properties").insert({ user_id: auth.user.id }).select("id").single();
          prop = ins.data;
        }
        if (!prop) { setRooms([]); return; }
        setPropId(prop.id);
        const { data } = await sb.from("vastu_rooms").select("id,room_type,zone,fixed").eq("property_id", prop.id).order("created_at");
        setRooms((data ?? []) as DbRoom[]);
      } catch { setRooms([]); }
    })();
  }, []);

  async function addRoom() {
    if (!propId || newZone == null) return;
    try {
      const sb = supabaseBrowser();
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) return;
      const { data } = await sb.from("vastu_rooms")
        .insert({ user_id: auth.user.id, property_id: propId, room_type: newType, zone: newZone })
        .select("id,room_type,zone,fixed").single();
      if (data) setRooms((r) => [...(r ?? []), data as DbRoom]);
      setAdding(false); setNewZone(null); haptic(8);
    } catch { /* row not added; the sheet stays open */ }
  }

  async function removeRoom(id: string) {
    setRooms((r) => (r ?? []).filter((x) => x.id !== id));
    try { await supabaseBrowser().from("vastu_rooms").delete().eq("id", id); } catch { /* refetch next open */ }
  }

  async function toggleFixed(id: string, fixed: boolean) {
    setRooms((r) => (r ?? []).map((x) => (x.id === id ? { ...x, fixed } : x)));
    try { await supabaseBrowser().from("vastu_rooms").update({ fixed }).eq("id", id); } catch { /* optimistic */ }
  }

  const analysis = rooms && rooms.length
    ? analyzeHome(rooms.map((r): HomeRoom => ({ room: r.room_type, zone: r.zone })))
    : null;
  const fixedCount = (rooms ?? []).filter((r) => r.fixed).length;

  return (
    <div className="gutter pt-2">
      {rooms === null && <div className="h-24 w-full rounded-2xl shimmer" style={{ background: "var(--surface-2)" }} />}

      {analysis && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface-2)" }}>
          <svg viewBox="0 0 120 120" className="mx-auto h-28 w-28">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none"
              stroke={analysis.score >= 70 ? "var(--good)" : analysis.score >= 50 ? "#B98A2E" : "var(--avoid)"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${(analysis.score / 100) * 326.7} 326.7`}
              transform="rotate(-90 60 60)" />
            <text x="60" y="57" textAnchor="middle" fontSize="26" fontWeight="600" fill="var(--ink)">{analysis.score}</text>
            <text x="60" y="76" textAnchor="middle" fontSize="10" fill="#8a8074">of 100</text>
          </svg>
          <div className="font-display text-[15px] text-ink">{analysis.grade}</div>
          <div className="mt-0.5 text-[10.5px] text-muted">
            Weighted across {analysis.rooms.length} placements · computed by the vastu engine
          </div>
          {analysis.doshas.length > 0 && (
            <div className="mt-1 text-[10.5px] text-muted">{fixedCount} of {analysis.doshas.length} remedies marked done</div>
          )}
        </div>
      )}

      {rooms && rooms.length === 0 && (
        <div className="rounded-2xl p-4 text-center" style={{ background: "var(--surface-2)" }}>
          <div className="text-[12.5px] text-ink">Map your home once, keep it forever.</div>
          <p className="mx-auto mt-1 measure text-[11px] leading-relaxed text-muted">
            Stand at the centre of your home and add each room with its direction. The engine
            scores the whole map and prescribes a remedy for every dosha it finds.
          </p>
        </div>
      )}

      {analysis?.rooms.map((r, i) => {
        const dbRoom = (rooms ?? [])[i];
        const isDosha = ["severe", "dosha", "caution"].includes(r.verdict.grade);
        return (
          <div key={dbRoom?.id ?? i} className="mt-2 rounded-2xl surface p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12.5px] font-medium text-ink">{ROOM_INFO[r.room].label}</div>
                <div className="text-[10.5px] text-muted">{r.zoneName}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-[4px] px-2 py-1 text-[10px]" style={{ background: "var(--surface-2)", color: GRADE_TONE[r.verdict.grade] }}>
                  {r.verdict.label}
                </span>
                {dbRoom && (
                  <button onClick={() => removeRoom(dbRoom.id)} aria-label="Remove room" className="grid h-6 w-6 place-items-center rounded-full text-muted">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-1.5 text-[11px] leading-relaxed text-muted">{r.verdict.basis}</div>
            {r.verdict.remedy && (
              <div className="mt-2 rounded-xl p-2.5" style={{ background: "var(--surface-2)" }}>
                <div className="text-[10.5px] leading-relaxed text-ink">
                  <span className="text-gold">Remedy · </span>{r.verdict.remedy}
                </div>
                {isDosha && dbRoom && (
                  <button onClick={() => toggleFixed(dbRoom.id, !dbRoom.fixed)}
                    className="mt-2 flex items-center gap-1.5 text-[10.5px]"
                    style={{ color: dbRoom.fixed ? "var(--good)" : "var(--bhagwa)" }}>
                    <span className={cx("grid h-4 w-4 place-items-center rounded-[4px] border", dbRoom.fixed ? "btn-saffron border-transparent" : "")}
                      style={{ borderColor: dbRoom.fixed ? "transparent" : "var(--line-strong)" }}>
                      {dbRoom.fixed && <Check size={10} />}
                    </span>
                    {dbRoom.fixed ? "Remedy done" : "Mark remedy done"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {rooms && !adding && (
        <button onClick={() => setAdding(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[11.5px] btn-saffron">
          <Plus size={13} /> Add a room
        </button>
      )}
      {adding && (
        <div className="mt-3 rounded-2xl surface p-3">
          <div className="eyebrow text-muted">Room</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ROOM_TYPES.map((t) => (
              <button key={t} onClick={() => setNewType(t)}
                className={cx("rounded-full px-3 py-1.5 text-[10.5px]", newType === t ? "btn-saffron" : "surface text-muted")}>
                {ROOM_INFO[t].label}
              </button>
            ))}
          </div>
          <div className="mt-3 eyebrow text-muted">Direction from the centre of the home</div>
          <div className="mt-1.5 grid grid-cols-4 gap-1.5">
            {DIRS16.map((d, i) => (
              <button key={d} onClick={() => setNewZone(i)}
                className={cx("rounded-xl py-2 text-[11px]", newZone === i ? "btn-saffron" : "surface text-muted")}>
                {d}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setAdding(false); setNewZone(null); }} className="flex-1 rounded-2xl py-2.5 text-[11.5px] btn-ghost">Cancel</button>
            <button onClick={addRoom} disabled={newZone == null}
              className={cx("flex-1 rounded-2xl py-2.5 text-[11.5px]", newZone != null ? "btn-saffron" : "btn-white")}>
              Add {ROOM_INFO[newType].label}
            </button>
          </div>
        </div>
      )}

      {analysis && personalDirections(rashi) && (
        <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
          <div className="eyebrow text-gold">Your personal disha</div>
          <div className="mt-1 text-[11.5px] leading-relaxed text-ink">{personalDirections(rashi)!.desk}</div>
          <div className="mt-1 text-[11px] leading-relaxed text-muted">{personalDirections(rashi)!.sleep}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Entrance tab (the 32 padas) ---------------------------- */

function EntranceTab() {
  const [sel, setSel] = useState<{ side: "N" | "E" | "S" | "W"; num: number } | null>(null);
  const p = sel ? padaInfo(sel.side, sel.num) : null;
  const Q_TONE = { auspicious: "var(--good)", neutral: "#B98A2E", inauspicious: "var(--avoid)" } as const;

  // A 10×10 frame: the border cells are the 32 padas, walked clockwise the
  // way the mandala is drawn — N1 beside the NW corner through to W8.
  const cells: ({ side: "N" | "E" | "S" | "W"; num: number } | null)[] = [];
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
    if (r === 0 && c >= 1 && c <= 8) cells.push({ side: "N", num: c });
    else if (c === 9 && r >= 1 && r <= 8) cells.push({ side: "E", num: r });
    else if (r === 9 && c >= 1 && c <= 8) cells.push({ side: "S", num: 9 - c });
    else if (c === 0 && r >= 1 && r <= 8) cells.push({ side: "W", num: 9 - r });
    else cells.push(null);
  }

  return (
    <div className="gutter pt-2">
      <p className="text-[10.5px] leading-relaxed text-muted">
        The boundary of the Vastu Purusha Mandala holds 32 padas, each ruled by a devta. Tap where
        your main door sits on the outline of your home (seen from above, north up).
      </p>
      <div className="mx-auto mt-3 grid max-w-[320px] grid-cols-10 gap-[3px]">
        {cells.map((cell, i) => {
          if (!cell) {
            return (
              <div key={i} className="grid aspect-square place-items-center">
                {i === 44 && <span className="font-deva text-[13px] text-gold">ॐ</span>}
              </div>
            );
          }
          const info = padaInfo(cell.side, cell.num);
          const active = sel?.side === cell.side && sel?.num === cell.num;
          return (
            <button key={i} onClick={() => setSel(cell)}
              className={cx("aspect-square rounded-[4px] text-[8.5px] leading-none", active ? "btn-saffron" : "")}
              style={active ? undefined : {
                background: "var(--surface-2)",
                color: Q_TONE[info.quality],
                border: "1px solid var(--line)",
              }}>
              {cell.side}{cell.num}
            </button>
          );
        })}
      </div>

      {p && sel && (
        <div className="mt-3 rounded-2xl p-3" style={{ background: "var(--surface-2)" }}>
          <div className="flex items-baseline justify-between">
            <div className="text-[13px] font-medium text-ink">
              {sel.side}{sel.num} · <span className="font-deva text-gold">{p.devta}</span>
            </div>
            <span className="text-[10.5px] capitalize" style={{ color: Q_TONE[p.quality] }}>{p.quality}</span>
          </div>
          <div className="mt-1 text-[11.5px] leading-relaxed text-ink">{p.effect}</div>
          {p.quality !== "auspicious" && (
            <div className="mt-2 text-[11px] leading-relaxed text-muted">
              <span className="text-gold">Strengthen · </span>
              A door cannot move, but it can be fortified: keep it brightly lit and spotless, a clear
              nameplate, a dehleez (threshold), and mangal torans. Ask the Guru with your exact pada
              for a fuller prescription.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Guru tab (grounded acharya chat) ----------------------- */

type ChatMsg = { role: "user" | "assistant"; content: string };

function GuruTab({ seed, context }: { seed: string | null; context: string }) {
  const { profile, lang } = useApp();
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState(seed ?? "");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (seed) setInput(seed); }, [seed]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content: q }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/vastu/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next, lang, context,
          profile: { name: profile?.name, rashi: profile?.rashi },
        }),
      });
      if (!r.body) throw new Error();
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      setMsgs((m) => [...m, { role: "assistant", content: "" }]);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs((m) => [...m.slice(0, -1), { role: "assistant", content: acc }]);
      }
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "The Guru could not be reached just now. Please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto gutter pt-2 no-scrollbar">
        {msgs.length === 0 && (
          <div className="rounded-2xl p-3 text-[11.5px] leading-relaxed text-muted" style={{ background: "var(--surface-2)" }}>
            Ask anything about your home — where the locker belongs, whether your kitchen&apos;s corner
            troubles you, which colour a bedroom wall wants. The Guru answers from the same computed
            zones, your saved home map, and your own kundli&apos;s disha.
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cx("mb-2 flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cx("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[12px] leading-relaxed",
              m.role === "user" ? "btn-saffron" : "surface text-ink")}>
              {m.content || "…"}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="gutter pb-2 pt-1">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2 surface">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder="Ask the Vastu Guru…"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted"
          />
          <button onClick={send} disabled={busy} aria-label="Send" className="grid h-8 w-8 shrink-0 place-items-center rounded-full btn-saffron">
            <PaperPlaneRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- the screen ---------------- */

export function VastuScreen() {
  const { back, profile } = useApp();
  const [tab, setTab] = useState("compass");
  const [guruSeed, setGuruSeed] = useState<string | null>(null);
  const [homeContext, setHomeContext] = useState("");

  // Refresh the Guru's grounding whenever its tab opens: the saved home map,
  // analysed by the engine right now, becomes the conversation's facts.
  useEffect(() => {
    if (tab !== "guru") return;
    (async () => {
      try {
        const sb = supabaseBrowser();
        const { data: auth } = await sb.auth.getUser();
        if (!auth.user) return;
        const { data } = await sb.from("vastu_rooms").select("room_type,zone").eq("user_id", auth.user.id).limit(30);
        if (!data?.length) { setHomeContext(""); return; }
        const a = analyzeHome(data.map((r) => ({ room: r.room_type as RoomType, zone: r.zone })));
        setHomeContext(
          `Score ${a.score}/100 (${a.grade}). ` +
          a.rooms.map((r) => `${ROOM_INFO[r.room].label} in ${r.zoneName}: ${r.verdict.label} — ${r.verdict.basis}${r.verdict.remedy ? ` Remedy: ${r.verdict.remedy}` : ""}`).join(" | ")
        );
      } catch { /* the Guru still answers from zones + disha */ }
    })();
  }, [tab]);

  const askGuru = (seedText: string) => { setGuruSeed(seedText); setTab("guru"); };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Vastu" onBack={back} />
      <FilterChips
        chips={[
          { id: "compass", label: "Compass" },
          { id: "lens", label: "Lens" },
          ...(PREMIUM
            ? [
                { id: "home", label: "My Home" },
                { id: "entrance", label: "Entrance" },
                { id: "guru", label: "Guru" },
              ]
            : []),
        ]}
        active={tab}
        onSelect={setTab}
      />
      <div className={cx("flex-1", tab === "guru" ? "overflow-hidden" : "overflow-y-auto no-scrollbar screen-bottom")}>
        {tab === "compass" && <CompassTab rashi={profile?.rashi} />}
        {tab === "lens" && <LensTab rashi={profile?.rashi} onAskGuru={PREMIUM ? askGuru : undefined} />}
        {PREMIUM && tab === "home" && <HomeTab rashi={profile?.rashi} />}
        {PREMIUM && tab === "entrance" && <EntranceTab />}
        {PREMIUM && tab === "guru" && <GuruTab seed={guruSeed} context={homeContext} />}
      </div>
    </div>
  );
}
