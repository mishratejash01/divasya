"use client";

import { ReactNode } from "react";

export function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

/**
 * Divasya logomark — celestial mandala inspired by the brand's symbol:
 * concentric rings, moon phases and the intuitive eye with radiating light.
 * Drawn in currentColor; use with text-[var(--amber)].
 */
export function Logomark({ size = 48, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-label="Divasya"
    >
      {/* outer ring + dotted ring */}
      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="48" cy="48" r="39" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 3.4" />
      {/* cardinal markers */}
      {[[48, 4], [92, 48], [48, 92], [4, 48]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.4" fill="var(--bg-0, #FCF9E8)" stroke="currentColor" strokeWidth="1.2" />
      ))}
      {/* inner ring with moon phases */}
      <circle cx="48" cy="48" r="29" stroke="currentColor" strokeWidth="1" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x = 48 + 29 * Math.cos(a);
        const y = 48 + 29 * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r={i % 2 ? 1.6 : 2.6} fill="currentColor" opacity={0.55 + 0.45 * ((i % 4) / 3)} />;
      })}
      {/* rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const inner = 13, outer = i % 3 === 0 ? 23 : 19;
        return (
          <line
            key={i}
            x1={48 + inner * Math.cos(a)} y1={48 + inner * Math.sin(a)}
            x2={48 + outer * Math.cos(a)} y2={48 + outer * Math.sin(a)}
            stroke="currentColor" strokeWidth="0.9" opacity="0.7"
          />
        );
      })}
      {/* the intuitive eye */}
      <path d="M34 48c4.8-6.2 9.5-9.3 14-9.3S57.2 41.8 62 48c-4.8 6.2-9.5 9.3-14 9.3S38.8 54.2 34 48Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="48" cy="48" r="4.6" fill="currentColor" />
      <circle cx="49.6" cy="46.4" r="1.3" fill="var(--bg-0, #FCF9E8)" />
    </svg>
  );
}

/** "Divasya" wordmark — lapidary serif, amber, gently tracked. */
export function Wordmark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <span
      className={cx("font-display text-[var(--amber)]", className)}
      style={{ fontSize: size, letterSpacing: "0.08em" }}
    >
      Divasya
    </span>
  );
}

// Warm avatar: cream disc, gold hairline, amber monogram, optional status dot.
export function Avatar({
  name,
  size = 44,
  tint,
  status,
}: {
  name: string;
  size?: number;
  tint?: string;
  status?: "online" | "busy";
}) {
  const initials = name
    .replace(/\b(ji|dr\.?|maa|guru|acharya|pandit|jyotishi)\b/gi, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center rounded-full font-display"
        style={{
          background: tint
            ? `linear-gradient(160deg, ${tint}26, var(--surface-2))`
            : "var(--surface-2)",
          border: "1px solid var(--line-gold)",
          color: "var(--amber-deep)",
          fontSize: size * 0.34,
        }}
      >
        {initials}
      </div>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
          style={{
            background: status === "online" ? "var(--good)" : "var(--ochre-deep)",
            border: "2px solid var(--surface)",
          }}
        />
      )}
    </div>
  );
}

// Deity medallion — warm blush radial, amber ॐ. Refined, consistent, no emoji.
export function DeityGlyph({
  deity,
  size = 44,
}: {
  deity: { color?: string };
  size?: number;
}) {
  const tint = deity.color || "#C88131";
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 30%, ${tint}2b, var(--surface-2) 74%)`,
        border: "1px solid var(--line-gold)",
        color: "var(--amber-deep)",
        fontSize: Math.round(size * 0.46),
        lineHeight: 1,
      }}
    >
      ॐ
    </span>
  );
}

export function SectionLabel({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <h3 className="text-[12.5px] uppercase tracking-[0.2em] text-muted">{children}</h3>
      {action}
    </div>
  );
}

export function Pill({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "good" | "avoid" | "gold";
}) {
  const map = {
    default: "text-muted",
    good: "text-[var(--good)]",
    avoid: "text-[var(--avoid)]",
    gold: "text-gold",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]",
        map[tone]
      )}
      style={{ background: "rgba(206,185,118,0.14)", border: "1px solid var(--line)" }}
    >
      {children}
    </span>
  );
}

export function Typing() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
    </span>
  );
}
