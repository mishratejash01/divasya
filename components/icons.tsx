"use client";

// ============================================================================
//  DIVASYA icon set — hand-drawn celestial/devotional line icons matching the
//  brand book's iconography (radiant eye, diya, mala, lotus, panchang wheel,
//  temple, conch…). Fine 1.4 strokes, tiny star sparkles, warm and ornate —
//  replaces generic icon-library glyphs on all primary actions.
// ============================================================================

import { ReactNode } from "react";

export type IconProps = { size?: number; className?: string; strokeWidth?: number };
export type IconComponent = React.ComponentType<IconProps>;

function Svg({ size = 24, className, strokeWidth = 1.4, children }: IconProps & { children: ReactNode }) {
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
    >
      {children}
    </svg>
  );
}

/** tiny 4-point sparkle, filled */
const Spark = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    d={`M${x} ${y - 1.6 * s}l${0.45 * s} ${1.15 * s} ${1.15 * s} ${0.45 * s} -${1.15 * s} ${0.45 * s} -${0.45 * s} ${1.15 * s} -${0.45 * s} -${1.15 * s} -${1.15 * s} -${0.45 * s} ${1.15 * s} -${0.45 * s}Z`}
    fill="currentColor"
    stroke="none"
  />
);

/** The intuitive eye with radiating light — AI Jyotishi. */
export function IconEye(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 12.6c2.5-3.1 5.2-4.7 8-4.7s5.5 1.6 8 4.7c-2.5 3.1-5.2 4.7-8 4.7s-5.5-1.6-8-4.7Z" />
      <circle cx="12" cy="12.6" r="2.3" />
      <circle cx="12" cy="12.6" r="0.7" fill="currentColor" stroke="none" />
      <path d="M12 5v-1.8M7.2 6.3 6.2 4.9M16.8 6.3l1-1.4M4.4 9.1l-1.6-.8M19.6 9.1l1.6-.8" />
      <Spark x={20.4} y={17.6} s={0.9} />
    </Svg>
  );
}

/** Lit diya — Talk to Devta / light the lamp. */
export function IconDiya(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5.6 15.2h12.8c-.5 2.5-3.2 4.3-6.4 4.3s-5.9-1.8-6.4-4.3Z" />
      <path d="M8.6 19.5h6.8" />
      <path d="M12 13.2c-1.6-1.2-2.2-2.5-1.5-3.9.4-.9 1-1.4 1.5-2.7.5 1.3 1.1 1.8 1.5 2.7.7 1.4.1 2.7-1.5 3.9Z" />
      <path d="M6.8 10.2 5.6 9M17.2 10.2 18.4 9" />
      <Spark x={19.6} y={4.8} s={0.9} />
    </Svg>
  );
}

/** Flame alone — streaks / energy. */
export function IconFlame(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 20.2c-3.2-1.5-4.9-3.8-4.9-6.5 0-1.9.9-3.7 2.3-5.2.3 1.1 1 2 1.9 2.5-.3-2.3.6-4.7 2.6-6.5.2 2.2 1.2 3.8 2.4 5.4 1 1.3 1.5 2.6 1.5 3.8 0 2.7-1.7 5-4.9 6.5" />
      <path d="M12 20.2c-1.3-.8-2-1.9-2-3.1 0-1 .5-2 1.3-2.7.4.9 1.1 1.5 2 1.7.7 1.5.2 3-1.3 4.1" />
    </Svg>
  );
}

/** Japa mala — ring of beads with meru and tassel. */
export function IconMala(p: IconProps) {
  const beads = Array.from({ length: 11 }, (_, i) => {
    const a = ((i + 0.5) / 12) * Math.PI * 2 + Math.PI / 2;
    return { x: 12 + 5.6 * Math.cos(a), y: 10.6 + 5.6 * Math.sin(a) };
  });
  return (
    <Svg {...p}>
      {beads.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="0.85" fill="currentColor" stroke="none" />
      ))}
      <circle cx="12" cy="4.6" r="1.3" />
      <path d="M12 16.2v3M10.5 21.4l1.5-1.7 1.5 1.7" />
    </Svg>
  );
}

/** Temple with kalash — My Mandir. */
export function IconMandir(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="3" r="0.7" fill="currentColor" stroke="none" />
      <path d="M12 3.7v1" />
      <path d="M8.7 9.6 12 4.7l3.3 4.9" />
      <path d="M9.5 7.8h5" />
      <path d="M6.8 9.6h10.4M7.6 9.6v7.6M16.4 9.6v7.6" />
      <path d="M10.4 17.2v-2a1.6 1.6 0 0 1 3.2 0v2" />
      <path d="M5.4 17.2h13.2M6.4 19.8h11.2" />
    </Svg>
  );
}

/** Conversation with a spark — Consult. */
export function IconChat(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4.6 7A2.6 2.6 0 0 1 7.2 4.4h9.6A2.6 2.6 0 0 1 19.4 7v5.6a2.6 2.6 0 0 1-2.6 2.6h-6l-3.6 3.2v-3.2h-.1a2.6 2.6 0 0 1-2.5-2.6V7Z" />
      <Spark x={12} y={10} s={1.15} />
      <circle cx="7.9" cy="9.8" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="16.1" cy="9.8" r="0.65" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Lotus — Online Puja / offerings. */
export function IconLotus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 5.2c1.5 1.9 2.3 3.7 2.3 5.4 0 2.1-.9 3.7-2.3 4.5-1.4-.8-2.3-2.4-2.3-4.5 0-1.7.8-3.5 2.3-5.4Z" />
      <path d="M6.3 8.6c2.1.6 3.7 1.8 4.6 3.5.5 1 .8 2 .7 3-2.4-.3-4.3-1.5-5.2-3.3-.4-1-.5-2.1-.1-3.2Z" />
      <path d="M17.7 8.6c-2.1.6-3.7 1.8-4.6 3.5-.5 1-.8 2-.7 3 2.4-.3 4.3-1.5 5.2-3.3.4-1 .5-2.1.1-3.2Z" />
      <path d="M4.6 15.4c2 1.9 4.6 2.9 7.4 2.9s5.4-1 7.4-2.9" />
    </Svg>
  );
}

/** Panchang wheel — cosmic chart. */
export function IconWheel(p: IconProps) {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return {
      x1: 12 + 3.1 * Math.cos(a), y1: 12 + 3.1 * Math.sin(a),
      x2: 12 + 8.2 * Math.cos(a), y2: 12 + 8.2 * Math.sin(a),
    };
  });
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="3.1" />
      {spokes.map((s, i) => (
        <path key={i} d={`M${s.x1} ${s.y1}L${s.x2} ${s.y2}`} strokeWidth={0.9} />
      ))}
      <circle cx="12" cy="12" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="3.8" r="0.7" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Compass rose — Vastu. */
export function IconCompass(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 6.2l1.5 4.3 4.3 1.5-4.3 1.5-1.5 4.3-1.5-4.3-4.3-1.5 4.3-1.5L12 6.2Z" />
      <circle cx="12" cy="12" r="0.7" fill="currentColor" stroke="none" />
      <path d="M12 3.8v-1M12 21.2v-1M3.8 12h-1M21.2 12h-1" strokeWidth={1.1} />
    </Svg>
  );
}

/** Home with finial — grounded dwelling. */
export function IconHome(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="3.2" r="0.65" fill="currentColor" stroke="none" />
      <path d="M4.6 11.6 12 5l7.4 6.6" />
      <path d="M6.6 10.2v9.3h10.8v-9.3" />
      <path d="M10.3 19.5v-3a1.7 1.7 0 0 1 3.4 0v3" />
    </Svg>
  );
}

/** Four diamonds — More. */
export function IconMore(p: IconProps) {
  const d = (cx: number, cy: number) => `M${cx} ${cy - 2.6}l2.6 2.6-2.6 2.6-2.6-2.6 2.6-2.6Z`;
  return (
    <Svg {...p}>
      <path d={d(7.2, 7.2)} />
      <path d={d(16.8, 7.2)} />
      <path d={d(7.2, 16.8)} />
      <path d={d(16.8, 16.8)} />
    </Svg>
  );
}

/** Temple arch with inner flame — Live Darshan. */
export function IconDarshan(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.6 19.6v-7a5.4 5.4 0 0 1 10.8 0v7" />
      <path d="M4.8 19.6h14.4" />
      <circle cx="12" cy="4.4" r="0.65" fill="currentColor" stroke="none" />
      <path d="M12 16.4c-1.1-.8-1.5-1.7-1-2.7.3-.6.7-1 1-1.9.3.9.7 1.3 1 1.9.5 1 .1 1.9-1 2.7Z" />
    </Svg>
  );
}

/** Ornate bell with sound arcs. */
export function IconBell(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="3.6" r="0.9" />
      <path d="M12 4.5a5.3 5.3 0 0 1 5.3 5.3c0 2.7.7 4.2 1.6 5.2H5.1c.9-1 1.6-2.5 1.6-5.2A5.3 5.3 0 0 1 12 4.5Z" />
      <circle cx="12" cy="17.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M20.6 7.6c.4.9.7 1.9.8 2.9M3.4 7.6c-.4.9-.7 1.9-.8 2.9" strokeWidth={1.1} />
    </Svg>
  );
}

/** Five-petal pushpa — offer flower. */
export function IconFlower(p: IconProps) {
  return (
    <Svg {...p}>
      {Array.from({ length: 5 }).map((_, i) => (
        <path
          key={i}
          d="M12 10.3c-1.4-1.6-1.4-3.4 0-4.9 1.4 1.5 1.4 3.3 0 4.9Z"
          transform={`rotate(${i * 72} 12 12)`}
        />
      ))}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Shankh — blow the conch. */
export function IconShankh(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14.2 5.2a4.9 4.9 0 0 1 4.5 5.1c-.2 4.6-4 8-8.9 8.4l-4.6.4c-.7.1-1.2-.6-1-1.2l1.6-4.1c1-2.7 2.7-5 5-6.8 1.1-.8 2.2-1.4 3.4-1.8Z" />
      <path d="M14.1 8.1a2.4 2.4 0 0 1 2.2 2.5c-.1 2.4-2.1 4.4-4.7 4.8" />
      <path d="M7.2 14.4l-1.6 3.4" strokeWidth={1.1} />
      <Spark x={20.2} y={4.4} s={0.9} />
    </Svg>
  );
}

/** Circling diya — aarti. */
export function IconAarti(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="13" r="7" strokeDasharray="2.4 3.2" />
      <path d="M12 8.4c-1.1-.8-1.5-1.7-1-2.7.3-.6.7-1 1-1.9.3.9.7 1.3 1 1.9.5 1 .1 1.9-1 2.7Z" />
      <circle cx="12" cy="13" r="0.75" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Radiant star cluster — blessings, festivals. */
export function IconStar(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.6l1.6 4.9 4.9 1.6-4.9 1.6-1.6 4.9-1.6-4.9-4.9-1.6 4.9-1.6L12 4.6Z" />
      <Spark x={19.4} y={5} s={1} />
      <Spark x={5.4} y={18.6} s={0.85} />
    </Svg>
  );
}

/** Open granth with crescent — Spiritual Library. */
export function IconJournal(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 7c-1.8-1.4-4-2-6.4-1.8v12.6c2.4-.2 4.6.4 6.4 1.8 1.8-1.4 4-2 6.4-1.8V5.2C16 5 13.8 5.6 12 7Z" />
      <path d="M12 7v12.4" />
      <path d="M17.9 2.4a2 2 0 1 0 2 3.3 2.5 2.5 0 0 1-2-3.3Z" strokeWidth={1.1} />
    </Svg>
  );
}

/** Naamkaran — swaddled little one. */
export function IconBaby(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="8.2" r="3.6" />
      <path d="M10.6 7.9h.01M13.4 7.9h.01" strokeWidth={1.8} />
      <path d="M10.8 9.6c.7.5 1.7.5 2.4 0" />
      <path d="M6.9 17.9a5.4 5.4 0 0 1 10.2 0c-1.5 1-3.3 1.5-5.1 1.5s-3.6-.5-5.1-1.5Z" />
      <Spark x={19.6} y={4.6} s={0.9} />
    </Svg>
  );
}

/** Sandesh card — share the day's message. */
export function IconSandesh(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4.6" y="5.4" width="14.8" height="13.2" rx="2.2" />
      <path d="M4.6 8.4 12 13l7.4-4.6" />
      <Spark x={12} y={4} s={0.85} />
    </Svg>
  );
}
