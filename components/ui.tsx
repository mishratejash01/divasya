"use client";

import { ReactNode } from "react";

export function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

// Restrained avatar: dark disc, hairline ring, gold monogram, optional status dot.
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
            ? `linear-gradient(160deg, ${tint}22, var(--surface-2))`
            : "var(--surface-2)",
          border: "1px solid var(--line-strong)",
          color: "var(--gold-soft, #cda86a)",
          fontSize: size * 0.34,
        }}
      >
        {initials}
      </div>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
          style={{
            background: status === "online" ? "var(--good)" : "#b89150",
            border: "2px solid var(--bg-0)",
          }}
        />
      )}
    </div>
  );
}

// Deity medallion — an antique-gold ॐ on a faintly deity-tinted disc.
// Replaces emoji deity symbols everywhere for a refined, consistent look.
export function DeityGlyph({
  deity,
  size = 44,
}: {
  deity: { color?: string };
  size?: number;
}) {
  const tint = deity.color || "#c4a868";
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-display text-[var(--gold-soft)]"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 30%, ${tint}26, var(--surface-2) 72%)`,
        border: "1px solid var(--line-gold)",
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
      <h3 className="text-[13px] uppercase tracking-[0.18em] text-muted">{children}</h3>
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
      style={{ background: "rgba(236,230,219,0.04)", border: "1px solid var(--line)" }}
    >
      {children}
    </span>
  );
}

// thin top progress for streaming etc.
export function Typing() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
      <span className="dot h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
    </span>
  );
}
