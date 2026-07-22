"use client";

import { ReactNode, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";

export function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

/**
 * Divasya logomark — celestial mandala inspired by the brand's symbol:
 * concentric rings, moon phases and the intuitive eye with radiating light.
 * Drawn in currentColor; use with text-[var(--bhagwa)].
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
        <circle key={i} cx={x} cy={y} r="3.4" fill="var(--surface, #FFFFFF)" stroke="currentColor" strokeWidth="1.2" />
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
      <circle cx="49.6" cy="46.4" r="1.3" fill="var(--surface, #FFFFFF)" />
    </svg>
  );
}

/**
 * "Divasya" wordmark. The mandala logomark carries the brand; the word beside
 * it stays quiet — Inter Medium, drawn in tight so it reads as one set object
 * rather than letters that happen to sit together.
 */
export function Wordmark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <span
      className={cx("font-display text-[var(--bhagwa)]", className)}
      style={{ fontSize: size, letterSpacing: "-0.018em", lineHeight: 1 }}
    >
      Divasya
    </span>
  );
}

/**
 * Monogram for a name. Strips honorifics, then anything that isn't a letter —
 * otherwise the full stop left behind by "Dr." becomes an initial and the mark
 * reads ".A".
 */
export function initialsOf(name: string): string {
  return name
    .replace(/\b(ji|dr|maa|guru|acharya|pandit|jyotishi)\b\.?/gi, "")
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Avatar: tinted disc, hairline, bhagwa monogram, optional status dot.
export function Avatar({
  name,
  size = 44,
  tint,
  status,
  photo,
}: {
  name: string;
  size?: number;
  tint?: string;
  status?: "online" | "busy";
  /** Headshot URL. Falls back to the monogram when absent or broken. */
  photo?: string;
}) {
  const initials = initialsOf(name);
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = !!photo && !photoFailed;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid h-full w-full place-items-center overflow-hidden rounded-full font-display"
        style={{
          background: tint
            ? `linear-gradient(160deg, ${tint}26, var(--surface-2))`
            : "var(--surface-2)",
          border: "1px solid var(--line-gold)",
          color: "var(--bhagwa-deep)",
          fontSize: size * 0.34,
        }}
      >
        {showPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          initials
        )}
      </div>
      {status && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
          style={{
            background: status === "online" ? "var(--good)" : "var(--bhagwa)",
            border: "2px solid var(--surface)",
          }}
        />
      )}
    </div>
  );
}

/**
 * Deity medallion.
 *
 * Shows the deity's own portrait from /public/deity/<id>.jpg, falling back to
 * the ॐ on a soft tint when there is no artwork for that id — so a deity added
 * without a picture still renders, it just renders quietly. Every image in that
 * folder is public domain with its source recorded in public/deity/SOURCES.md.
 */
export function DeityGlyph({
  deity,
  size = 44,
}: {
  deity: { id?: string; color?: string };
  size?: number;
}) {
  const tint = deity.color || "#C88131";
  const [failed, setFailed] = useState(false);
  const showPhoto = !!deity.id && !failed;
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full font-deva"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 38% 30%, ${tint}2b, var(--surface-2) 74%)`,
        border: "1px solid var(--line-gold)",
        color: "var(--bhagwa-deep)",
        fontSize: Math.round(size * 0.46),
        lineHeight: 1,
      }}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/deity/${deity.id}.jpg`}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        "ॐ"
      )}
    </span>
  );
}

/**
 * Framed deity portrait.
 *
 * The frame takes its proportions from the artwork rather than the other way
 * round: height comes from the block it sits in, and the width follows the
 * image's own aspect ratio once it loads. A fixed-width frame had to crop the
 * picture to fill itself, which cut the top off a portrait painting.
 *
 * Shows a real image from /public when one is present, and falls back to the
 * drawn mark if it is missing or fails to load — so the frame is never empty
 * and never a broken-image icon. Drop artwork at the path below (.png / .jpg /
 * .webp, any aspect) and it appears with no code change. Record its licence in
 * public/deity/SOURCES.md, and use artwork you hold the rights to.
 */
export function DeityPortrait({
  src = "/deity/ganesha.jpg",
  alt = "Ganesh ji",
  width = 56,
  height = 68,
  fallback,
}: {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  // The frame is the limit; the artwork scales to fill it and is cropped to
  // fit. Letting the image set the frame's size instead meant a large file
  // sized the layout — a 508x727 painting rendered a 508px-wide frame.
  const style = { width, height, background: "var(--surface-2)" };
  // The padding is the mount: the tinted frame shows as a mat around the
  // picture rather than the image running to the edge.
  const frame = "grid shrink-0 place-items-center overflow-hidden rounded-xl p-1";

  if (failed) return <div className={frame} style={style}>{fallback}</div>;

  return (
    <div className={frame} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full rounded-[5px] object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * The header every sub-screen wears: haldi ground, bare caret, title, and an
 * optional slot on the right.
 *
 * It owns the safe-area inset, so screens using it must not also apply
 * screen-top — the bar is the top of the screen. Extracted because thirteen
 * screens were each carrying their own copy, which is how they drifted apart
 * in the first place.
 */
export function ScreenHeader({
  title,
  sub,
  onBack,
  right,
}: {
  title: string;
  sub?: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-2.5 gutter"
      style={{
        background: "var(--bar-yellow)",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 11px)",
        paddingBottom: 11,
      }}
    >
      <button onClick={onBack} aria-label="Back" className="shrink-0">
        <CaretLeft size={20} weight="regular" className="text-ink" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[17px] leading-tight text-ink">{title}</div>
        {sub && <div className="truncate text-[10.5px] leading-tight text-ink/65">{sub}</div>}
      </div>
      {right}
    </div>
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
    <div className="mb-2.5 flex items-end justify-between">
      <h3 className="section-title">{children}</h3>
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
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]",
        map[tone]
      )}
      style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}
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
