"use client";

import { useApp } from "../app-context";
import { DevotionalIllustration } from "../ui";
import { PageHeader } from "../page-header";
import { Iconify } from "../iconify";
import { NAV } from "../nav-map";

/**
 * The categories behind the main tabs, and the single source of truth for what
 * each one contains. The sidebar and this screen both read from here, so a tool
 * cannot appear in one and be missing from the other.
 */
/** Kept for the sidebar's import; the map itself lives in nav-map. */
export const CATEGORIES = NAV;

// Per-category deep theming — header + dark block fill, one colour per category.
type Theme = { grad: string; shadow: string; art?: string; block: string };
const THEME: Record<string, Theme> = {
  astro:    { grad: "linear-gradient(135deg,#153C6B,#0A1F3B)", shadow: "rgba(10,31,59,0.30)",  art: "/home/tools/ai-jyotishi.png", block: "linear-gradient(150deg,#183B63,#0C2140)" },
  devotion: { grad: "linear-gradient(135deg,#5B2160,#2E0F32)", shadow: "rgba(46,15,50,0.30)",  art: "/home/tools/my-mandir.png",   block: "linear-gradient(150deg,#4A1A50,#2A0E30)" },
  tools:    { grad: "linear-gradient(135deg,#8A3B08,#4E1F03)", shadow: "rgba(78,31,3,0.30)",   art: "/home/trust/tradition.png",  block: "linear-gradient(150deg,#7A3408,#421903)" },
};
const FALLBACK: Theme = { grad: "linear-gradient(155deg,#C0440E,#6E1D2E)", shadow: "rgba(110,29,46,0.28)", block: "linear-gradient(150deg,#8A2B22,#4E140F)" };

export function CategoryScreen() {
  const { screen, back, go, haptic } = useApp();
  const id = (screen.params?.id as string) || "astro";
  const cat = CATEGORIES[id] ?? CATEGORIES.astro;
  const theme = THEME[id] ?? FALLBACK;

  // The store is a plain one-per-row list; every other category shows its
  // entries as dark blocks, two to a row, tinted to the category's colour.
  const grid = cat.layout !== "list";

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <PageHeader title={cat.title} onBack={back} art={theme.art} gradient={theme.grad} shadow={theme.shadow} />

      {grid ? (
        <div className="grid grid-cols-2 gap-2.5 gutter pt-4">
          {cat.entries.map((t) => (
            <button
              key={t.label}
              onClick={() => { haptic(6); go(t.to, t.params); }}
              className="flex items-center gap-2.5 rounded-2xl px-3 py-3 text-left transition-transform active:scale-[0.98] lg:gap-3.5 lg:px-4 lg:py-4"
              style={{ background: theme.block, border: "1px solid rgba(255,255,255,0.10)" }}
            >
              {t.art ? (
                <DevotionalIllustration name={t.art} alt="" className="h-11 w-11 shrink-0 lg:h-16 lg:w-16" />
              ) : (
                <Iconify icon={t.icon} className="shrink-0 text-[#F1D9A8] text-[19px] lg:text-[30px]" />
              )}
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium leading-tight text-white lg:text-[14.5px]">{t.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gutter pt-2">
          {cat.entries.map((t) => (
            <button
              key={t.label}
              onClick={() => { haptic(6); go(t.to, t.params); }}
              className="flex w-full items-center gap-3 py-3 text-left transition-opacity hover:opacity-70"
            >
              {t.art ? (
                <DevotionalIllustration name={t.art} alt="" className="h-9 w-9 shrink-0" />
              ) : (
                <Iconify icon={t.icon} width={22} height={22} className="shrink-0 text-[var(--icon-ink)]" />
              )}
              <span className="flex-1 text-[13px] font-medium leading-tight text-ink">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
