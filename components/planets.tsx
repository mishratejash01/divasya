"use client";

/**
 * Planet marks for the nine grahas.
 *
 * No icon library carries a real, consistent icon for every graha — the four
 * inner/outer planets only exist as the astrological symbols, and Rahu/Ketu are
 * the lunar nodes, not bodies at all. So these are drawn here: small planet
 * discs with a true feature each (Saturn's ring, Jupiter's bands and red spot,
 * the Moon's craters, Mars' ice cap, Rahu as an eclipse, Ketu as a comet tail).
 * Flat fills, no gradients — they read cleanly at 20–24px and render identically
 * on every device, unlike the symbol glyphs.
 */

export function Planet({ id, size = 22, className }: { id: string; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", className, "aria-hidden": true } as const;
  switch (id) {
    case "sun":
      return (
        <svg {...common}>
          <g stroke="#F2A020" strokeWidth="1.6" strokeLinecap="round">
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x = 12 + Math.cos(a), y = 12 + Math.sin(a);
              const x2 = 12 + Math.cos(a) * 4.2, y2 = 12 + Math.sin(a) * 4.2;
              // draw from just outside the disc outward
              const ix = 12 + Math.cos(a) * 8.6, iy = 12 + Math.sin(a) * 8.6;
              const ox = 12 + Math.cos(a) * 11, oy = 12 + Math.sin(a) * 11;
              void x; void y; void x2; void y2;
              return <line key={i} x1={ix} y1={iy} x2={ox} y2={oy} />;
            })}
          </g>
          <circle cx="12" cy="12" r="7.2" fill="#F6A623" />
          <circle cx="9.6" cy="9.6" r="2.4" fill="#FFCB5B" opacity="0.7" />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#CBD0DA" />
          <circle cx="9" cy="9.5" r="1.8" fill="#A7ADBB" />
          <circle cx="14.5" cy="13.5" r="2.3" fill="#A7ADBB" />
          <circle cx="10" cy="15" r="1.2" fill="#A7ADBB" />
        </svg>
      );
    case "mars":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#C1440E" />
          <ellipse cx="12" cy="4.6" rx="3.4" ry="1.5" fill="#EAD8CE" />
          <circle cx="9" cy="13" r="1.6" fill="#9A3308" />
          <circle cx="15" cy="11" r="1.1" fill="#9A3308" />
        </svg>
      );
    case "mercury":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#9B9FA8" />
          <circle cx="9.5" cy="9.5" r="2" fill="#7C828B" />
          <circle cx="14.5" cy="14" r="1.5" fill="#7C828B" />
          <circle cx="12.5" cy="17" r="1" fill="#7C828B" />
        </svg>
      );
    case "jupiter":
      return (
        <svg {...common}>
          <defs>
            <clipPath id="jupClip"><circle cx="12" cy="12" r="9" /></clipPath>
          </defs>
          <circle cx="12" cy="12" r="9" fill="#D9B483" />
          <g clipPath="url(#jupClip)">
            <rect x="0" y="7" width="24" height="1.8" fill="#B98E52" opacity="0.8" />
            <rect x="0" y="11" width="24" height="2.2" fill="#C79E64" opacity="0.7" />
            <rect x="0" y="15" width="24" height="1.6" fill="#B98E52" opacity="0.8" />
            <ellipse cx="15" cy="14" rx="1.9" ry="1.3" fill="#B5563E" />
          </g>
        </svg>
      );
    case "venus":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#E8D3A8" />
          <path d="M4 10 q8 -3 16 0" stroke="#CDA968" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M5 14 q7 3 14 0" stroke="#CDA968" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "saturn":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="12" rx="11" ry="4" fill="none" stroke="#B98E2E" strokeWidth="1.4" transform="rotate(-20 12 12)" />
          <circle cx="12" cy="12" r="6.6" fill="#E4C36B" />
          <ellipse cx="12" cy="12" rx="11" ry="4" fill="none" stroke="#B98E2E" strokeWidth="1.4" transform="rotate(-20 12 12)" strokeDasharray="0 15 12 40" />
        </svg>
      );
    case "rahu":
      // eclipse — a dark disc with a bright crescent breaking off it
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#4B3E6E" />
          <path d="M12 3 a9 9 0 0 1 0 18 a6.5 6.5 0 0 0 0 -18" fill="#8577B4" />
        </svg>
      );
    case "ketu":
      // the tail — a dark disc trailing a comet tail
      return (
        <svg {...common}>
          <path d="M6 18 L2 22" stroke="#B98E52" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M9 19 L4 22" stroke="#D9B483" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
          <circle cx="13" cy="11" r="7.5" fill="#6E4B2E" />
          <circle cx="11" cy="9" r="2" fill="#8A5F38" opacity="0.7" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" fill="#C99A2E" />
        </svg>
      );
  }
}
