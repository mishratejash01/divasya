"use client";

import { CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Avatar, Logomark, ScreenHeader } from "../ui";
import { NAV, NAV_ORDER } from "../nav-map";
import { rashiLabel } from "@/lib/astro";

/**
 * The map of the app.
 *
 * Home is a scroll: today's panchang, a verse, a few shortcuts. This is the
 * directory — every screen, grouped, each with a line saying what it does. The
 * two are not duplicates; one is what today looks like, the other is where
 * things are. Both read from the same nav map, so neither can drift.
 */
export function MenuScreen() {
  const { back, go, haptic, profile } = useApp();
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Menu" onBack={back} />

      {/* Each group is a title and its rows — icon and label only, like the
          store shelf. No hint under the label, no rule between rows, and the
          chevron is black. The account row shares the first section's card, so
          "you" and the first shelf read as one panel rather than a lone card
          floating above the list. */}
      {NAV_ORDER.map((id) => {
        const group = NAV[id];
        const first = id === NAV_ORDER[0];
        return (
          <div key={group.id} className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              {first && (
                <button
                  onClick={() => { haptic(6); go("account"); }}
                  className="mb-2 flex w-full items-center gap-3 rounded-[6px] p-1 text-left transition-opacity hover:opacity-70"
                >
                  <Avatar name={name} size={40} tint="#C88131" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-[14px] text-ink">{name}</div>
                    <div className="truncate text-[11px] text-muted">
                      {profile?.nakshatra ? `${rashi} · ${profile.nakshatra}` : rashi}
                    </div>
                  </div>
                  <CaretRight size={15} className="shrink-0 text-ink" />
                </button>
              )}
              <h3 className="section-title mb-1.5">{group.title}</h3>
              <div className="overflow-hidden rounded-[6px]" style={{ background: "var(--surface-2)" }}>
                {group.entries.map((e) => {
                  const Icon = e.icon;
                  return (
                    <button
                      key={e.label}
                      onClick={() => { haptic(6); go(e.to, e.params); }}
                      className="flex w-full items-center gap-3 px-2.5 py-2.5 text-left transition-colors hover:bg-[rgba(222,107,31,0.09)]"
                    >
                      <Icon size={18} strokeWidth={1.5} className="shrink-0 text-[var(--bhagwa)]" />
                      <span className="flex-1 text-[12.5px] font-medium leading-tight text-ink">{e.label}</span>
                      <CaretRight size={13} className="shrink-0 text-ink" />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        );
      })}

      <div className="flex items-center justify-center gap-1.5 gutter pb-2 pt-5 text-[10px] text-[var(--muted-2)]">
        <Logomark size={13} className="text-[var(--bhagwa)]" /> Divasya · Spiritual Journey
      </div>
    </div>
  );
}
