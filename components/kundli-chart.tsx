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

// True centroids of the twelve regions a North-Indian chart makes, for a
// 320 box inset to 10..310 with its centre at 160. The corner triangles are
// the average of their three vertices, not an eyeballed offset — text drifting
// out of its house is the first thing that makes a chart look drawn rather
// than cast.
const HOUSE_POS: [number, number][] = [
  [160, 85],   // 1  top diamond          (lagna)
  [85, 35],    // 2  top-left triangle
  [35, 85],    // 3  left-upper triangle
  [85, 160],   // 4  left diamond
  [35, 235],   // 5  left-lower triangle
  [85, 285],   // 6  bottom-left triangle
  [160, 235],  // 7  bottom diamond
  [235, 285],  // 8  bottom-right triangle
  [285, 235],  // 9  right-lower triangle
  [235, 160],  // 10 right diamond
  [285, 85],   // 11 right-upper triangle
  [235, 35],   // 12 top-right triangle
];

export function KundliChart({
  lagnaIndex, placements, title, size = 300,
}: { lagnaIndex: number; placements: Placement[]; title?: string; size?: number }) {
  const S = 320;
  const inset = 10, span = S - inset * 2; // 10..310
  const mid = inset + span / 2;

  return (
    <div className="flex flex-col items-center">
      {title && <div className="mb-1.5 eyebrow text-gold">{title}</div>}
      {/* A cast chart is a hard square ruled in ink: no rounded corners, no
          gradient field, no gold. Those three were what made this read as a
          decorative graphic rather than a kundli. */}
      <svg viewBox={`0 0 ${S} ${S}`} width={size} height={size} className="select-none">
        <rect x={inset} y={inset} width={span} height={span}
          fill="#FFFFFF" stroke="var(--ink)" strokeWidth="1.6" />
        <g stroke="var(--ink)" strokeWidth="1" fill="none">
          <line x1={inset} y1={inset} x2={S - inset} y2={S - inset} />
          <line x1={S - inset} y1={inset} x2={inset} y2={S - inset} />
          <polygon points={`${mid},${inset} ${S - inset},${mid} ${mid},${S - inset} ${inset},${mid}`} />
        </g>

        {HOUSE_POS.map(([cx, cy], i) => {
          const house = i + 1;
          const signIndex = (lagnaIndex + house - 1) % 12;
          const here = placements.filter((p) => p.sign === signIndex);
          const rowH = 14;
          // Planets sit centred in the house; the rashi number is tucked above
          // the stack, which is where it is written on a paper chart.
          const startY = cy - ((here.length - 1) * rowH) / 2 + 4;
          return (
            <g key={house}>
              <text
                x={cx}
                y={startY - rowH * 0.5 - 6}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
                fontFamily="var(--font-body), sans-serif"
              >
                {signIndex + 1}
                {house === 1 ? " · La" : ""}
              </text>
              {here.map((p, j) => (
                <text
                  key={p.abbr}
                  x={cx}
                  y={startY + j * rowH}
                  textAnchor="middle"
                  fontSize="12.5"
                  fontFamily="var(--font-body), sans-serif"
                  fontWeight={500}
                  fill={p.combust ? "var(--muted)" : "var(--ink)"}
                >
                  {p.abbr}
                  {p.retro ? <tspan fontSize="9" dy="-3" fill="var(--avoid)"> ℞</tspan> : null}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
