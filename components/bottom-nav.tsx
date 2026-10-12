"use client";

import { motion } from "framer-motion";
import { Iconify } from "./iconify";
import { useApp, ScreenName, navIntent } from "./app-context";
import { cx } from "./ui";

// On the white bar the mark is an outline by default and fills in when its tab
// is the current one — the selected state reads from the fill, not just colour.
const TABS: { id: ScreenName; label: string; line: string; fill: string; match: ScreenName[] }[] = [
  { id: "home", label: "Home", line: "solar:home-2-linear", fill: "solar:home-2-bold-duotone", match: ["home"] },
  { id: "ai", label: "Jyotishi", line: "solar:eye-scan-linear", fill: "solar:eye-scan-bold-duotone", match: ["ai"] },
  { id: "shop", label: "Store", line: "solar:cart-large-2-linear", fill: "solar:cart-large-2-bold-duotone", match: ["shop", "product", "cart", "checkout", "orders"] },
  { id: "account", label: "Account", line: "solar:user-circle-linear", fill: "solar:user-circle-bold-duotone", match: ["account", "menu", "profile", "category", "vastu", "naamkaran", "library", "festivals", "puja", "temple", "panchang", "mala", "mandir", "sandesh", "consult", "consultChat", "kundli"] },
];

export function BottomNav() {
  const { screen, go, haptic } = useApp();
  return (
    // Pinned to the viewport, not the scroll container — the bar stays put the
    // way a native tab bar does, and never rides up with content.
    <div
      className="bottom-nav-bar fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around px-2 pt-2 lg:hidden"
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
        return (
          <button
            key={t.id}
            onClick={() => { haptic(8); if (!active) navIntent.viaTab = true; go(t.id); }}
            className="relative flex flex-1 flex-col items-center gap-1 py-1"
          >
            <motion.span
              key={active ? "on" : "off"}
              className="relative mt-[4px]"
              initial={active ? { scale: 0.5, rotate: -18, y: 6 } : false}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 14 }}
            >
              <Iconify
                icon={active ? t.fill : t.line}
                width={22}
                height={22}
                className={cx("transition-colors", active ? "text-[var(--bhagwa)]" : "text-muted")}
              />
            </motion.span>
            <span className={cx("relative text-[9.5px] transition-colors", active ? "font-semibold text-ink" : "text-muted")}>
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
