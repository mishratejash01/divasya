"use client";

import { useApp } from "../app-context";
import { ScreenHeader } from "../ui";
import { Iconify } from "../iconify";
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

  // The store is a plain one-per-row list; every other category shows its
  // entries as blocks, two to a row — a bhagwa mark over the label on a soft
  // ground, the same block the home shelves use.
  const grid = cat.layout !== "list";

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={cat.title} onBack={back} />

      {grid ? (
        <div className="grid grid-cols-2 gap-2 gutter pt-3">
          {cat.entries.map((t) => (
            <button
              key={t.label}
              onClick={() => { haptic(6); go(t.to, t.params); }}
              className="flex items-center gap-2 rounded-[10px] border border-[var(--tile-line)] px-2.5 py-2.5 text-left transition-colors hover:bg-[var(--surface-2)] lg:gap-3.5 lg:px-4 lg:py-4"
            >
              {/* On the wide desktop rows the mark scales up so the tile does not
                  read as a small icon marooned in a long bar. */}
              <Iconify icon={t.icon} className="shrink-0 text-[var(--icon-ink)] text-[19px] lg:text-[30px]" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-tight text-ink lg:text-[14.5px]">{t.label}</span>
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
              <Iconify icon={t.icon} width={22} height={22} className="shrink-0 text-[var(--icon-ink)]" />
              <span className="flex-1 text-[13px] font-medium leading-tight text-ink">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
