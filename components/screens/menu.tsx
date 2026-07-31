"use client";

import { CaretRight } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { Logomark, ScreenHeader, cx } from "../ui";
import { Iconify } from "../iconify";
import { NAV, NAV_ORDER } from "../nav-map";

/**
 * The map of the app.
 *
 * Home is a scroll: today's panchang, a verse, a few shortcuts. This is the
 * directory — every screen, grouped, each with a line saying what it does. The
 * two are not duplicates; one is what today looks like, the other is where
 * things are. Both read from the same nav map, so neither can drift.
 */
export function MenuScreen() {
  const { back, go, haptic, lang, setLang } = useApp();

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Menu" onBack={back} />

      {/* No boxed section cards — each tab name is just a heading and its
          sub-topics run under it, straight on the ground with a hairline
          between rows. Grouped, but not one common list and not walled cards. */}
      {NAV_ORDER.map((id) => {
        const group = NAV[id];
        return (
          <div key={id} className="gutter pt-4">
            <h3 className="section-title mb-1">{group.title}</h3>
            <div>
              {group.entries.map((e, i) => (
                <button
                  key={`${e.label}-${i}`}
                  onClick={() => { haptic(6); go(e.to, e.params); }}
                  className="flex w-full items-center gap-3 border-t border-[var(--line)] px-1 py-2.5 text-left transition-colors first:border-t-0 hover:bg-[var(--surface-2)]"
                >
                  <Iconify icon={e.icon} width={19} height={19} className="shrink-0 text-[var(--icon-ink)]" />
                  <span className="flex-1 text-[12.5px] font-medium leading-tight text-ink">{e.label}</span>
                  <CaretRight size={13} className="shrink-0 text-ink" />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* language — every content screen reads this preference */}
      <div className="gutter pt-4">
        <h3 className="section-title mb-1">Language · भाषा</h3>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl p-1.5" style={{ background: "var(--surface-2)" }}>
          {(["en", "hi"] as const).map((code) => (
            <button
              key={code}
              onClick={() => { haptic(6); setLang(code); }}
              className={cx("rounded-xl py-2.5 text-[13.5px] font-medium transition-colors", lang === code ? "btn-saffron" : "text-ink")}
            >
              {code === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 gutter pb-2 pt-5 text-[10px] text-[var(--muted-2)]">
        <Logomark size={13} className="text-[var(--bhagwa)]" /> Divasya · Spiritual Journey
      </div>
    </div>
  );
}
