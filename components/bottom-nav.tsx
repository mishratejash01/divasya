"use client";

import { Home, Sparkles, MessagesSquare, LayoutGrid } from "lucide-react";
import { useApp, ScreenName } from "./app-context";
import { cx } from "./ui";

const TABS: { id: ScreenName; label: string; icon: typeof Home; match: ScreenName[] }[] = [
  { id: "home", label: "Home", icon: Home, match: ["home"] },
  { id: "ai", label: "Jyotishi", icon: Sparkles, match: ["ai"] },
  { id: "consult", label: "Consult", icon: MessagesSquare, match: ["consult", "consultChat"] },
  { id: "menu", label: "More", icon: LayoutGrid, match: ["menu", "vastu", "naamkaran", "library", "festivals", "puja", "temple", "panchang", "mala", "mandir", "sandesh"] },
];

export function BottomNav() {
  const { screen, go, haptic } = useApp();
  return (
    <div
      className="absolute inset-x-0 bottom-0 z-30 flex items-stretch justify-around px-2 pb-5 pt-2 lg:hidden"
      style={{
        background: "linear-gradient(0deg, var(--bg-0) 78%, rgba(10,9,8,0.85) 92%, transparent)",
        borderTop: "1px solid var(--line)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
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
              size={22}
              strokeWidth={active ? 2.3 : 1.8}
              className={cx("transition-colors", active ? "text-[var(--saffron)]" : "text-muted")}
            />
            <span
              className={cx(
                "text-[10.5px] transition-colors",
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
