"use client";

// ============================================================================
//  DIVASYA icon set — drawn for this app, not borrowed.
//
//  Construction rules, so the family reads as one hand:
//   · 24×24 grid, 1.5 stroke, round caps and joins.
//   · Duotone: a filled base at low opacity carries the silhouette, fine
//     linework carries the detail. Pure hairlines go weightless at 20px, which
//     is what made the earlier set look thin and generic.
//   · Every mark is a real object from this tradition — a kundli diamond, a
//     vastu mandala, a pothi, a marigold, a shankh — never a stock glyph
//     standing in for the idea. No scattered sparkles.
// ============================================================================

import { ReactNode } from "react";

export type IconProps = { size?: number; className?: string; strokeWidth?: number };
export type IconComponent = React.ComponentType<IconProps>;

function Svg({ size = 24, className, strokeWidth = 1.5, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** Solid base under the linework — gives the mark weight at small sizes. */
const F = ({ d, o = 0.14 }: { d: string; o?: number }) => (
  <path d={d} fill="currentColor" stroke="none" opacity={o} />
);
const Dot = ({ x, y, r = 0.8, o = 1 }: { x: number; y: number; r?: number; o?: number }) => (
  <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" opacity={o} />
);

/* ─────────────────────────── guidance ─────────────────────────── */

/** Janma kundli — the North Indian chart: square, both diagonals, inner rhombus. */
export function IconStar(p: IconProps) {
  return (
    <Svg {...p}>
      <F d="M12 3.9 20.1 12 12 20.1 3.9 12Z" o={0.15} />
      <path d="M3.9 3.9h16.2v16.2H3.9Z" />
      <path d="M3.9 3.9 20.1 20.1M20.1 3.9 3.9 20.1" strokeWidth={1.1} />
      <path d="M12 3.9 20.1 12 12 20.1 3.9 12Z" />
    </Svg>
  );
}

/** The seeing eye — almond, iris, and three rays of insight above. */
export function IconEye(p: IconProps) {
  const almond = "M3.5 13.1c2.9-3.9 5.7-5.9 8.5-5.9s5.6 2 8.5 5.9c-2.9 3.9-5.7 5.9-8.5 5.9S6.4 17 3.5 13.1Z";
  return (
    <Svg {...p}>
      <F d={almond} o={0.13} />
      <path d={almond} />
      <circle cx="12" cy="13.1" r="2.7" />
      <Dot x={12} y={13.1} r={1.15} />
      <path d="M12 4.9V3.1M6.6 6.1 5.5 4.6M17.4 6.1l1.1-1.5" strokeWidth={1.2} />
    </Svg>
  );
}

/** Diya — flame, oil bowl with a lip, and a footed base. */
export function IconDiya(p: IconProps) {
  const flame = "M12 9.6c-1.6-1.2-2.1-2.4-1.5-3.8.4-.85 1-1.4 1.5-2.6.5 1.2 1.1 1.75 1.5 2.6.6 1.4.1 2.6-1.5 3.8Z";
  const bowl = "M4.5 13.9h15c-.5 3-3.5 5-7.5 5s-7-2-7.5-5Z";
  return (
    <Svg {...p}>
      <F d={bowl} o={0.13} />
      <F d={flame} o={0.22} />
      <path d={bowl} />
      <path d={flame} />
      <path d="M12 13.9v-3.9" strokeWidth={1.1} />
      <path d="M8.4 18.7h7.2M9.8 20.7h4.4" />
    </Svg>
  );
}

/** Steady flame — outer body with an inner blue-cone. */
export function IconFlame(p: IconProps) {
  const inner = "M12 20.4c-1.4-.85-2.1-2-2.1-3.2 0-1.1.5-2.1 1.4-2.85.4.95 1.15 1.55 2.1 1.8.7 1.6.2 3.1-1.4 4.25Z";
  return (
    <Svg {...p}>
      <F d="M12 20.4c-3.3-1.5-5-3.9-5-6.7 0-2 1-3.9 2.4-5.4.3 1.1 1 2 1.9 2.6-.3-2.4.6-4.9 2.7-6.8.2 2.3 1.2 3.9 2.5 5.6 1 1.4 1.5 2.7 1.5 4 0 2.8-1.8 5.2-5 6.7Z" o={0.12} />
      <path d="M12 20.4c-3.3-1.5-5-3.9-5-6.7 0-2 1-3.9 2.4-5.4.3 1.1 1 2 1.9 2.6-.3-2.4.6-4.9 2.7-6.8.2 2.3 1.2 3.9 2.5 5.6 1 1.4 1.5 2.7 1.5 4 0 2.8-1.8 5.2-5 6.7Z" />
      <F d={inner} o={0.22} />
      <path d={inner} strokeWidth={1.2} />
    </Svg>
  );
}

/** Japa mala — bead ring, meru bead at the crown, tassel below. */
export function IconMala(p: IconProps) {
  const R = 5.9, CY = 11.9;
  const beads = Array.from({ length: 16 }, (_, i) => {
    const a = ((i + 0.5) / 16) * Math.PI * 2 + Math.PI / 2;
    return { x: 12 + R * Math.cos(a), y: CY + R * Math.sin(a), r: i % 2 ? 0.62 : 0.82 };
  });
  return (
    <Svg {...p}>
      <circle cx="12" cy={CY} r={R} strokeWidth={0.7} opacity={0.35} />
      {beads.map((b, i) => (
        <Dot key={i} x={b.x} y={b.y} r={b.r} o={0.9} />
      ))}
      <F d="M12 3.05a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2Z" o={0.22} />
      <circle cx="12" cy="4.65" r="1.6" />
      <path d="M12 17.9v2.1" strokeWidth={1.2} />
      <path d="M10.5 22.1 12 20l1.5 2.1" strokeWidth={1.2} />
    </Svg>
  );
}

/* ─────────────────────────── devotion ─────────────────────────── */

/** Mandir — curved shikhara, kalash finial, banded tower, arched doorway. */
export function IconMandir(p: IconProps) {
  const shikhara = "M8.5 11.3c0-3.7 1.4-6.2 3.5-8.2 2.1 2 3.5 4.5 3.5 8.2Z";
  return (
    <Svg {...p}>
      <F d={shikhara} o={0.14} />
      <F d="M7.1 11.3h9.8v7.2H7.1Z" o={0.08} />
      <Dot x={12} y={2.2} r={0.75} />
      <path d={shikhara} />
      <path d="M9.3 8.4h5.4" strokeWidth={1} opacity={0.7} />
      <path d="M6.3 11.3h11.4M7.4 11.3v7.2M16.6 11.3v7.2" />
      <path d="M10.3 18.5v-2.9a1.7 1.7 0 0 1 3.4 0v2.9" />
      <path d="M5.1 18.5h13.8M6.2 20.7h11.6" />
    </Svg>
  );
}

/** Gopuram arch with the lamp burning inside — live darshan. */
export function IconDarshan(p: IconProps) {
  const arch = "M6.5 19.4v-6.6a5.5 5.5 0 0 1 11 0v6.6Z";
  const flame = "M12 16.6c-1.15-.85-1.55-1.8-1.05-2.85.3-.63.75-1.05 1.05-2 .3.95.75 1.37 1.05 2 .5 1.05.1 2-1.05 2.85Z";
  return (
    <Svg {...p}>
      <F d={arch} o={0.12} />
      <path d={arch} />
      <Dot x={12} y={4.2} r={0.75} />
      <path d="M12 4.95v1.4" strokeWidth={1.1} />
      <F d={flame} o={0.25} />
      <path d={flame} strokeWidth={1.2} />
      <path d="M4.7 19.4h14.6" />
    </Svg>
  );
}

/** Lotus — layered petals resting on water. */
export function IconLotus(p: IconProps) {
  const mid = "M12 4.9c1.6 2.1 2.4 4 2.4 5.8 0 2.2-.9 3.9-2.4 4.8-1.5-.9-2.4-2.6-2.4-4.8 0-1.8.8-3.7 2.4-5.8Z";
  const l1 = "M6.2 8.4c2.2.6 3.9 1.9 4.8 3.7.5 1 .8 2.1.7 3.1-2.5-.3-4.4-1.6-5.3-3.5-.4-1-.5-2.2-.2-3.3Z";
  const r1 = "M17.8 8.4c-2.2.6-3.9 1.9-4.8 3.7-.5 1-.8 2.1-.7 3.1 2.5-.3 4.4-1.6 5.3-3.5.4-1 .5-2.2.2-3.3Z";
  return (
    <Svg {...p}>
      <F d={mid} o={0.18} />
      <F d={l1} o={0.1} />
      <F d={r1} o={0.1} />
      <path d={l1} />
      <path d={r1} />
      <path d={mid} />
      <path d="M4.3 16.4c2.1 2 4.8 3.1 7.7 3.1s5.6-1.1 7.7-3.1" strokeWidth={1.2} />
    </Svg>
  );
}

/** Marigold — the offering flower: two rings of round petals round a core. */
export function IconFlower(p: IconProps) {
  const petals = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 12 + 4.6 * Math.cos(a), y: 12 + 4.6 * Math.sin(a) };
  });
  return (
    <Svg {...p}>
      {petals.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="2.5" strokeWidth={1.15} opacity={i % 2 ? 0.6 : 1} />
      ))}
      <F d="M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z" o={0.2} />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  );
}

/** Shankh — fluted body with the inner whorl. */
export function IconShankh(p: IconProps) {
  const body = "M14.9 4.5a5.3 5.3 0 0 1 4.4 5.5c-.3 4.8-4.4 8.4-9.7 8.8l-4.4.35c-.8.06-1.3-.72-1-1.4l1.9-4.25c1.2-2.6 3-4.8 5.2-6.5 1.2-.9 2.4-1.5 3.6-2Z";
  return (
    <Svg {...p}>
      <F d={body} o={0.13} />
      <path d={body} />
      <path d="M14.6 8.1a2.5 2.5 0 0 1 2.3 2.6c-.15 2.5-2.2 4.5-4.9 4.9" strokeWidth={1.2} />
      <path d="M7.3 14.3 5.8 17.7M10.2 15.6l-1 2.4" strokeWidth={1} opacity={0.65} />
    </Svg>
  );
}

/** Aarti — the thali circling, lamp lit above it. */
export function IconAarti(p: IconProps) {
  const flame = "M12 12.4c-1.1-.8-1.5-1.7-1-2.7.3-.6.7-1 1-1.9.3.9.7 1.3 1 1.9.5 1 .1 1.9-1 2.7Z";
  const thali = "M7.5 15.6a4.5 1.95 0 0 0 9 0Z";
  return (
    <Svg {...p}>
      <circle cx="12" cy="12.4" r="8" strokeDasharray="2.2 3" strokeWidth={1} opacity={0.6} />
      <F d={flame} o={0.25} />
      <path d={flame} strokeWidth={1.2} />
      <F d={thali} o={0.16} />
      <path d="M7.5 15.6h9" />
      <path d={thali} />
    </Svg>
  );
}

/** Temple bell — crown, flared body, clapper, sound carrying out. */
export function IconBell(p: IconProps) {
  const body = "M12 5.2a5.4 5.4 0 0 1 5.4 5.4c0 2.6.6 4.1 1.5 5.2H5.1c.9-1.1 1.5-2.6 1.5-5.2A5.4 5.4 0 0 1 12 5.2Z";
  return (
    <Svg {...p}>
      <F d={body} o={0.13} />
      <circle cx="12" cy="3.5" r="1.05" />
      <path d="M12 4.55v.65" strokeWidth={1.1} />
      <path d={body} />
      <Dot x={12} y={17.7} r={1} />
      <path d="M20.5 8.1c.5 1 .8 2.1.9 3.2M3.5 8.1c-.5 1-.8 2.1-.9 3.2" strokeWidth={1.1} opacity={0.7} />
    </Svg>
  );
}

/* ─────────────────────────── daily & tools ─────────────────────────── */

/** Dwelling with a kalash finial — home. */
export function IconHome(p: IconProps) {
  return (
    <Svg {...p}>
      <F d="M6.4 11.2h11.2v8.3H6.4Z" o={0.12} />
      <Dot x={12} y={3} r={0.7} />
      <path d="M12 3.7v1.1" strokeWidth={1.1} />
      <path d="M3.6 11.9 12 4.9l8.4 7" />
      <path d="M6.4 10.6v8.9h11.2v-8.9" />
      <path d="M10.2 19.5v-3.1a1.8 1.8 0 0 1 3.6 0v3.1" />
    </Svg>
  );
}

/** Dharma chakra — the panchang wheel. */
export function IconWheel(p: IconProps) {
  const spokes = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return {
      x1: 12 + 2.9 * Math.cos(a), y1: 12 + 2.9 * Math.sin(a),
      x2: 12 + 7.1 * Math.cos(a), y2: 12 + 7.1 * Math.sin(a),
    };
  });
  return (
    <Svg {...p}>
      <F d="M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Z" o={0.07} />
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="7.1" strokeWidth={0.8} opacity={0.55} />
      {spokes.map((s, i) => (
        <path key={i} d={`M${s.x1} ${s.y1}L${s.x2} ${s.y2}`} strokeWidth={0.95} />
      ))}
      <F d="M12 9.1a2.9 2.9 0 1 1 0 5.8 2.9 2.9 0 0 1 0-5.8Z" o={0.2} />
      <circle cx="12" cy="12" r="2.9" />
    </Svg>
  );
}

/** Vastu purusha mandala — the oriented square, not a compass rose. */
export function IconCompass(p: IconProps) {
  return (
    <Svg {...p}>
      <F d="M12 3.4 20.6 12 12 20.6 3.4 12Z" o={0.1} />
      <path d="M12 3.4 20.6 12 12 20.6 3.4 12Z" />
      <path d="M12 3.4v17.2M3.4 12h17.2" strokeWidth={0.85} opacity={0.6} />
      <path d="M12 7.6 16.4 12 12 16.4 7.6 12Z" strokeWidth={1.15} />
      <Dot x={12} y={12} r={0.85} />
      <path d="M10.8 5.5 12 3.4l1.2 2.1Z" fill="currentColor" strokeWidth={0.9} />
    </Svg>
  );
}

/** Pothi — palm-leaf manuscript bound through the centre. */
export function IconJournal(p: IconProps) {
  return (
    <Svg {...p}>
      <F d="M3.7 6.3h16.6v2.8H3.7ZM3.7 10.6h16.6v2.8H3.7ZM3.7 14.9h16.6v2.8H3.7Z" o={0.11} />
      <rect x="3.7" y="6.3" width="16.6" height="2.8" rx="1.4" />
      <rect x="3.7" y="10.6" width="16.6" height="2.8" rx="1.4" />
      <rect x="3.7" y="14.9" width="16.6" height="2.8" rx="1.4" />
      <path d="M12 4.4v15.2" strokeWidth={0.9} opacity={0.65} />
      <Dot x={12} y={4.1} r={0.85} o={0.85} />
    </Svg>
  );
}

/** Swaddled infant — naamkaran. */
export function IconBaby(p: IconProps) {
  const wrap = "M6.8 18.1a5.5 5.5 0 0 1 10.4 0c-1.5 1.05-3.35 1.55-5.2 1.55s-3.7-.5-5.2-1.55Z";
  return (
    <Svg {...p}>
      <F d="M12 4.5a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4Z" o={0.12} />
      <circle cx="12" cy="8.2" r="3.7" />
      <Dot x={10.7} y={7.8} r={0.5} />
      <Dot x={13.3} y={7.8} r={0.5} />
      <path d="M10.9 9.7c.7.55 1.5.55 2.2 0" strokeWidth={1.15} />
      <F d={wrap} o={0.12} />
      <path d={wrap} />
      <path d="M9.4 14.6c1.7.6 3.5.6 5.2 0" strokeWidth={1} opacity={0.6} />
    </Svg>
  );
}

/** Patra — a folded letter closed with a seal. */
export function IconSandesh(p: IconProps) {
  return (
    <Svg {...p}>
      <F d="M4 5.7h16v12.6H4Z" o={0.1} />
      <rect x="4" y="5.7" width="16" height="12.6" rx="1.7" />
      <path d="M4.4 8.5 12 13.3l7.6-4.8" />
      <F d="M17.1 14.9a1.7 1.7 0 1 1 0 3.4 1.7 1.7 0 0 1 0-3.4Z" o={0.3} />
      <circle cx="17.1" cy="16.6" r="1.7" strokeWidth={1.2} />
    </Svg>
  );
}

/** Conversation — one voice answering another. */
export function IconChat(p: IconProps) {
  const bubble = "M3.7 7.1A2.7 2.7 0 0 1 6.4 4.4h11.2a2.7 2.7 0 0 1 2.7 2.7v5.5a2.7 2.7 0 0 1-2.7 2.7H9.5l-3.8 3.3v-3.3h-.3a2.7 2.7 0 0 1-1.7-2.7Z";
  return (
    <Svg {...p}>
      <F d={bubble} o={0.12} />
      <path d={bubble} />
      <Dot x={8.4} y={9.9} r={0.78} />
      <Dot x={12} y={9.9} r={0.78} />
      <Dot x={15.6} y={9.9} r={0.78} />
    </Svg>
  );
}

/** Four rhombi, echoing the kundli grid — the menu. */
export function IconMore(p: IconProps) {
  const d = (cx: number, cy: number) => `M${cx} ${cy - 2.9}l2.9 2.9-2.9 2.9-2.9-2.9Z`;
  return (
    <Svg {...p}>
      <F d={d(7.1, 7.1)} o={0.16} />
      <F d={d(16.9, 16.9)} o={0.16} />
      <path d={d(7.1, 7.1)} />
      <path d={d(16.9, 7.1)} />
      <path d={d(7.1, 16.9)} />
      <path d={d(16.9, 16.9)} />
    </Svg>
  );
}

/* ─────────────────────────── sun ─────────────────────────── */

/** Suryodaya — the disc resting on the horizon, rays up, arrow rising. */
export function IconSunrise(p: IconProps) {
  const dome = "M7.5 17.3a4.5 4.5 0 0 1 9 0Z";
  return (
    <Svg {...p}>
      <F d={dome} o={0.2} />
      <path d={dome} />
      <path d="M2.6 17.3h18.8" />
      <path d="M12 6.3V4.5M6.3 9 5.1 7.8M17.7 9l1.2-1.2M3.3 13.8H5M19 13.8h1.7" strokeWidth={1.1} />
      <path d="m10.2 20.4 1.8-1.9 1.8 1.9" strokeWidth={1.2} />
    </Svg>
  );
}

/** Suryast — the disc cut by the horizon, arrow falling. */
export function IconSunset(p: IconProps) {
  const dome = "M7.5 17.3a4.5 4.5 0 0 1 9 0Z";
  return (
    <Svg {...p}>
      <F d={dome} o={0.12} />
      <path d={dome} />
      <path d="M8.9 17.3a3.1 3.1 0 0 0 6.2 0" strokeWidth={0.9} opacity={0.5} />
      <path d="M2.6 17.3h18.8" />
      <path d="M12 6.3V4.5M6.3 9 5.1 7.8M17.7 9l1.2-1.2M3.3 13.8H5M19 13.8h1.7" strokeWidth={1.1} />
      <path d="m10.2 18.6 1.8 1.9 1.8-1.9" strokeWidth={1.2} />
    </Svg>
  );
}

/**
 * Section ornament — a hairline broken by a rhombus and two dots, the rule
 * that separates verses in a printed granth.
 */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`} aria-hidden="true">
      <span className="h-px flex-1" style={{ background: "currentColor", opacity: 0.3 }} />
      <svg width="30" height="7" viewBox="0 0 30 7" fill="none" className="shrink-0">
        <circle cx="2" cy="3.5" r="0.9" fill="currentColor" opacity="0.55" />
        <path d="M15 0.6 17.9 3.5 15 6.4 12.1 3.5Z" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="28" cy="3.5" r="0.9" fill="currentColor" opacity="0.55" />
      </svg>
      <span className="h-px flex-1" style={{ background: "currentColor", opacity: 0.3 }} />
    </div>
  );
}
