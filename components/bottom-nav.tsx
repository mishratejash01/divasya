"use client";

import { IconHome, IconEye, IconChat, IconMore, IconComponent } from "./icons";
import { useApp, ScreenName } from "./app-context";
import { cx } from "./ui";

const TABS: { id: ScreenName; label: string; icon: IconComponent; match: ScreenName[] }[] = [
  { id: "home", label: "Home", icon: IconHome, match: ["home"] },
  { id: "ai", label: "Jyotishi", icon: IconEye, match: ["ai"] },
  { id: "consult", label: "Consult", icon: IconChat, match: ["consult", "consultChat"] },
  { id: "menu", label: "More", icon: IconMore, match: ["menu", "vastu", "naamkaran", "library", "festivals", "puja", "temple", "panchang", "mala", "mandir", "sandesh"] },
];

export function BottomNav() {
  const { screen, go, haptic } = useApp();
  return (
    // Pinned to the viewport, not the scroll container — the bar stays put the
    // way a native tab bar does, and never rides up with content.
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around px-2 pt-2 lg:hidden"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "rgba(255,255,255,0.90)",
        borderTop: "1px solid var(--line)",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
      }}
    >
      {TABS.map((t) => {
        const active = t.match.includes(screen.name);
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            onClick={() => { haptic(8); go(t.id); }}
            className="flex flex-1 flex-col items-center gap-1 py-1"
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.3 : 1.8}
              className={cx("transition-colors", active ? "text-[var(--bhagwa)]" : "text-muted")}
            />
            <span
              className={cx(
                "text-[9.5px] transition-colors",
                active ? "text-ink" : "text-muted"
              )}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
