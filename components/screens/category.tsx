"use client";

import { CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader } from "../ui";
import { NAV } from "../nav-map";


/**
 * The categories behind the main tabs, and the single source of truth for what
 * each one contains. The sidebar and this screen both read from here, so a tool
 * cannot appear in one and be missing from the other.
 *
 * Each tool carries a line saying what it does. A grid of icons and one-word
 * labels asks the reader to already know what "Chadhava" or "Naamkaran" is;
 * this page has the room to say it.
 */
/** Kept for the sidebar's import; the map itself lives in nav-map. */
export const CATEGORIES = NAV;

export function CategoryScreen() {
  const { screen, back, go, haptic } = useApp();
  const id = (screen.params?.id as string) || "astro";
  const cat = CATEGORIES[id] ?? CATEGORIES.astro;

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={cat.title} onBack={back} />

      <p className="gutter pt-3 text-[11.5px] leading-relaxed text-ink">{cat.note}</p>

      <div className="gutter pt-2.5">
        <div className="overflow-hidden rounded-2xl surface">
          {cat.entries.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                onClick={() => { haptic(6); go(t.to, t.params); }}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                style={{ borderTop: i ? "1px solid var(--line)" : undefined }}
              >
                <Icon size={19} strokeWidth={1.6} className="shrink-0 text-[var(--bhagwa)]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-tight text-ink">{t.label}</div>
                  <div className="mt-0.5 truncate text-[10.5px] leading-tight text-[var(--muted-2)]">{t.hint}</div>
                </div>
                <CaretRight size={14} className="shrink-0 text-[var(--muted-2)]" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
