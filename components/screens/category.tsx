"use client";

import { useApp } from "../app-context";
import { ScreenHeader } from "../ui";
import { NAV } from "../nav-map";

/**
 * The categories behind the main tabs, and the single source of truth for what
 * each one contains. The sidebar and this screen both read from here, so a tool
 * cannot appear in one and be missing from the other.
 */
/** Kept for the sidebar's import; the map itself lives in nav-map. */
export const CATEGORIES = NAV;

export function CategoryScreen() {
  const { screen, back, go, haptic } = useApp();
  const id = (screen.params?.id as string) || "astro";
  const cat = CATEGORIES[id] ?? CATEGORIES.astro;

  // Every category page is the same bare list now: one row per entry, a bhagwa
  // mark and the title, nothing else. No note at the top, no one-line
  // descriptions, no rules between rows — the label carries it.
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={cat.title} onBack={back} />
      <div className="flex flex-col gutter pt-2">
        {cat.entries.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              onClick={() => { haptic(6); go(t.to, t.params); }}
              className="flex w-full items-center gap-3 py-3 text-left transition-opacity hover:opacity-70"
            >
              <Icon size={20} strokeWidth={1.6} className="shrink-0 text-[var(--bhagwa)]" />
              <span className="flex-1 text-[13px] font-medium leading-tight text-ink">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
