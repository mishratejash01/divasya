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

      {/* who you are — opens the account page */}
      <div className="gutter pt-2">
        <button
          onClick={() => { haptic(6); go("account"); }}
          className="flex w-full items-center gap-3 rounded-2xl surface p-3 text-left transition-colors hover:bg-[var(--surface-2)]"
        >
          <Avatar name={name} size={42} tint="#C88131" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[14.5px] text-ink">{name}</div>
            <div className="truncate text-[11px] text-muted">
              {profile?.nakshatra ? `${rashi} · ${profile.nakshatra}` : rashi}
            </div>
          </div>
          <CaretRight size={15} className="shrink-0 text-[var(--muted-2)]" />
        </button>
      </div>

      {NAV_ORDER.map((id) => {
        const group = NAV[id];
        return (
          <div key={group.id} className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-1.5">{group.title}</h3>
              <div className="overflow-hidden rounded-[6px]" style={{ background: "var(--surface-2)" }}>
                {group.entries.map((e, i) => {
                  const Icon = e.icon;
                  return (
                    <button
                      key={e.label}
                      onClick={() => { haptic(6); go(e.to, e.params); }}
                      className="flex w-full items-center gap-3 px-2.5 py-2.5 text-left transition-colors hover:bg-[rgba(222,107,31,0.09)]"
                      style={{ borderTop: i ? "1px solid var(--line)" : undefined }}
                    >
                      <Icon size={18} strokeWidth={1.5} className="shrink-0 text-[var(--bhagwa)]" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] leading-tight text-ink">{e.label}</div>
                        <div className="mt-0.5 truncate text-[10.5px] leading-tight text-[var(--muted-2)]">{e.hint}</div>
                      </div>
                      <CaretRight size={13} className="shrink-0 text-[var(--muted-2)]" />
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
