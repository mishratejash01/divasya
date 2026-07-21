"use client";

// Traditional North-Indian kundli (diamond) chart. Lagna is fixed at the top
// (House 1); signs rotate. Premium: cream field, fine ochre lines, ink glyphs.

export interface Placement {
  abbr: string;      // Su, Mo, Ma …
  sign: number;      // 0..11 (the sign in THIS chart — D1 or D9)
  deg?: number;
  retro?: boolean;
  combust?: boolean;
}

// House centroid positions for a 320-box (square inset 10..310, centre 160).
const HOUSE_POS: [number, number][] = [
  [160, 84],   // 1  top diamond
  [86, 42],    // 2  top-left triangle
  [42, 86],    // 3  left-upper triangle
  [86, 160],   // 4  left diamond
  [42, 234],   // 5  left-lower triangle
  [86, 278],   // 6  bottom-left triangle
  [160, 236],  // 7  bottom diamond
  [234, 278],  // 8  bottom-right triangle
  [278, 234],  // 9  right-lower triangle
  [234, 160],  // 10 right diamond
  [278, 86],   // 11 right-upper triangle
  [234, 42],   // 12 top-right triangle
];

export function KundliChart({
  lagnaIndex, placements, title, size = 300,
}: { lagnaIndex: number; placements: Placement[]; title?: string; size?: number }) {
  const S = 320;
  const inset = 10, span = S - inset * 2; // 10..310
  const mid = inset + span / 2;

  return (
    <div className="flex flex-col items-center">
      {title && <div className="mb-1.5 text-[11px] uppercase tracking-[0.2em] text-gold">{title}</div>}
      <svg viewBox={`0 0 ${S} ${S}`} width={size} height={size} className="select-none">
        <defs>
          <linearGradient id="kfield" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFEF7" />
            <stop offset="100%" stopColor="#FBF5E2" />
          </linearGradient>
        </defs>
        {/* field */}
        <rect x={inset} y={inset} width={span} height={span} rx="10"
          fill="url(#kfield)" stroke="var(--line-gold)" strokeWidth="1.5" />
        {/* diagonals + inner diamond */}
        <g stroke="var(--line-gold)" strokeWidth="1" fill="none" opacity="0.85">
          <line x1={inset} y1={inset} x2={S - inset} y2={S - inset} />
          <line x1={S - inset} y1={inset} x2={inset} y2={S - inset} />
          <polygon points={`${mid},${inset} ${S - inset},${mid} ${mid},${S - inset} ${inset},${mid}`} />
        </g>

        {/* houses */}
        {HOUSE_POS.map(([cx, cy], i) => {
          const house = i + 1;
          const signIndex = (lagnaIndex + house - 1) % 12;
          const here = placements.filter((p) => p.sign === signIndex);
          const isLagna = house === 1;
          return (
            <g key={house}>
              {/* sign number (small, toward centre) */}
              <text x={cx} y={cy - (here.length > 2 ? 22 : 16)} textAnchor="middle"
                fontSize="9.5" fill="var(--muted-2)" fontFamily="var(--font-body), serif">
                {signIndex + 1}
              </text>
              {/* lagna marker */}
              {isLagna && (
                <text x={cx} y={cy - 30} textAnchor="middle" fontSize="8" fill="var(--amber)"
                  fontFamily="var(--font-body), serif" letterSpacing="1">La</text>
              )}
              {/* planets — stacked */}
              {here.map((p, j) => {
                const rowH = 13;
                const startY = cy - ((here.length - 1) * rowH) / 2 + 3;
                return (
                  <text key={p.abbr} x={cx} y={startY + j * rowH} textAnchor="middle"
                    fontSize="12" fontFamily="var(--font-body), serif"
                    fill={p.combust ? "var(--muted)" : "var(--amber-deep)"}
                    fontWeight={600}>
                    {p.abbr}{p.retro ? <tspan fontSize="8" dy="-3" fill="var(--maroon)"> ℞</tspan> : null}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
