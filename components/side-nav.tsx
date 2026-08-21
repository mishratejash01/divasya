"use client";

import { Iconify } from "./iconify";
import { useApp, ScreenName } from "./app-context";
import { Logomark, BrandWordmark, cx } from "./ui";

type NavItem = {
  id: string;
  label: string;
  /** Iconify name — Solar bold-duotone set. Browse at icones.js.org. */
  icon: string;
  to: ScreenName;
  params?: Record<string, unknown>;
  match: ScreenName[];
  cat?: string;
};

const ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: "solar:home-2-bold-duotone", to: "home", match: ["home"] },
  { id: "kundli", label: "My Kundli", icon: "solar:star-bold-duotone", to: "kundli", match: ["kundli"] },
  { id: "astro", label: "Astrology", icon: "game-icons:orbital", to: "category", params: { id: "astro" }, match: [], cat: "astro" },
  { id: "devotion", label: "Devotion", icon: "solar:hand-heart-bold-duotone", to: "category", params: { id: "devotion" }, match: [], cat: "devotion" },
  { id: "festival", label: "Festivals", icon: "solar:fire-bold-duotone", to: "festivals", match: ["festivals"] },
  { id: "tools", label: "Guides", icon: "solar:notebook-bold-duotone", to: "category", params: { id: "tools" }, match: [], cat: "tools" },
  { id: "shop", label: "Store", icon: "solar:cart-large-2-bold-duotone", to: "shop", match: ["shop", "product", "cart", "checkout"] },
  // Consult is hidden for now — restore this row to bring the rail entry back.
  { id: "menu", label: "Menu", icon: "solar:hamburger-menu-linear", to: "menu", match: ["menu"] },
];

/**
 * A rail, not a slab. It sits at 64px showing only the marks; hovering blooms it
 * open to 240px with the labels. It grows in the flow rather than floating, so
 * the top bar and the page shift right to make room — nothing is left hidden
 * under the open panel. Just the logomark rides here; the Divasya wordmark lives
 * in the top bar. Haldi yellow, kumkum marks. Desktop only.
 */
export function SideNav() {
  const { screen, go, haptic, logout } = useApp();
  // The rail items carry no background chip — the ground stays haldi throughout.
  // Selection reads from a kumkum accent bar and a solid mark instead, and the
  // unselected marks sit back at reduced strength. Only the footer rows take a
  // soft white wash on hover.
  const HOVER = "rgba(255,255,255,0.38)";

  return (
    <aside
      className="group relative z-40 hidden h-full w-16 shrink-0 flex-col overflow-hidden px-2 pb-4 pt-3 transition-[width] duration-200 ease-out hover:w-60 lg:flex"
      style={{ background: "var(--bar-yellow)", borderRight: "1px solid rgba(0,0,0,0.10)" }}
    >
      {/* brand — the mark always; the wordmark rides beside it only off home,
          where the top bar (which otherwise carries Divasya) is hidden. It fades
          in as the rail blooms open. */}
      <button onClick={() => go("home")} className="mb-3 flex h-10 shrink-0 items-center text-left">
        <span className="grid w-12 shrink-0 place-items-center">
          <Logomark size={26} className="text-ink" />
        </span>
        {screen.name !== "home" && (
          <BrandWordmark height={22} tone="ink" className="min-w-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
        )}
      </button>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden no-scrollbar">
        {ITEMS.map((it) => {
          const active = it.cat
            ? screen.name === "category" && screen.params?.id === it.cat
            : it.match.includes(screen.name);
          return (
            <button
              key={it.id}
              onClick={() => { haptic(6); go(it.to, it.params); }}
              title={it.label}
              className="group/item relative flex h-11 w-full items-center rounded-[9px] text-left"
            >
              {/* kumkum accent for the current screen — no filled background */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                  style={{ background: "var(--icon-ink)" }}
                />
              )}
              <span className="grid w-12 shrink-0 place-items-center">
                <Iconify
                  icon={it.icon}
                  width={22}
                  height={22}
                  className={cx(
                    "text-[var(--icon-ink)] transition-opacity",
                    active ? "opacity-100" : "opacity-50 group-hover/item:opacity-90",
                  )}
                />
              </span>
              <span className={cx(
                "whitespace-nowrap text-[12.5px] text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                active ? "font-medium" : "font-normal",
              )}>
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* the way out — the account itself lives under the Menu item above */}
      <div className="mt-2 shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.12)", paddingTop: 8 }}>
        <button
          onClick={logout}
          title="Sign out"
          onMouseEnter={(e) => (e.currentTarget.style.background = HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          className="flex h-10 w-full items-center rounded-[9px] text-left transition-colors"
        >
          <span className="grid w-12 shrink-0 place-items-center">
            <Iconify icon="solar:logout-2-bold-duotone" width={20} height={20} className="text-[var(--icon-ink)]" />
          </span>
          <span className="whitespace-nowrap text-[11.5px] text-ink opacity-0 transition-opacity duration-150 group-hover:opacity-100">
            Sign out
          </span>
        </button>
      </div>
    </aside>
  );
}
