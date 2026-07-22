"use client";

import { CaretRight, SidebarSimple, SignOut, UserCircle } from "@phosphor-icons/react";
import {
  IconHome, IconEye, IconChat, IconStar, IconDiya, IconAarti, IconCompass, IconComponent,
} from "./icons";
import { useApp, ScreenName } from "./app-context";
import { Avatar, Logomark, Wordmark, cx } from "./ui";
import { rashiLabel } from "@/lib/astro";

type NavItem = {
  id: string;
  label: string;
  icon: IconComponent;
  to: ScreenName;
  params?: Record<string, unknown>;
  match: ScreenName[];
  /** Category pages all share one screen name, so they are told apart by id. */
  cat?: string;
};

/**
 * Main tabs only. Nothing here expands in place — the three that hold more than
 * one thing (Astrology, Devotion, Guides) open a page listing what is inside,
 * so the sidebar stays one flat list at every width instead of growing a tree.
 *
 * It used to list eleven entries across three groups, which made it a second
 * copy of the homepage: two places to maintain and no answer to which one you
 * were meant to use. The tools themselves live in CATEGORIES, read by both this
 * and the category screen, so neither can drift from the other.
 */
const ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: IconHome, to: "home", match: ["home"] },
  { id: "kundli", label: "My Kundli", icon: IconStar, to: "kundli", match: ["kundli"] },
  { id: "astro", label: "Astrology", icon: IconEye, to: "category", params: { id: "astro" }, match: [], cat: "astro" },
  { id: "devotion", label: "Devotion", icon: IconDiya, to: "category", params: { id: "devotion" }, match: [], cat: "devotion" },
  { id: "festival", label: "Festivals", icon: IconAarti, to: "festivals", match: ["festivals"] },
  { id: "tools", label: "Guides", icon: IconCompass, to: "category", params: { id: "tools" }, match: [], cat: "tools" },
  { id: "consult", label: "Consult", icon: IconChat, to: "consult", match: ["consult", "consultChat"] },
  { id: "menu", label: "Account", icon: UserCircle as unknown as IconComponent, to: "menu", match: ["menu"] },
];

export function SideNav({ open = true, onToggle }: { open?: boolean; onToggle?: () => void }) {
  const { screen, go, haptic, profile, logout } = useApp();
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

  if (!open) return null;

  return (
    <aside
      className="hidden h-full w-[248px] shrink-0 flex-col border-r px-3 pb-6 pt-5 lg:flex"
      style={{ borderColor: "var(--line)", background: "var(--bg-0)" }}
    >
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <button onClick={() => go("home")} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <Logomark size={28} className="shrink-0 text-[var(--bhagwa)]" />
          <span className="min-w-0">
            <Wordmark size={16} />
            <span className="block font-deva text-[9px] leading-tight text-[var(--muted-2)]">आध्यात्मिक यात्रा</span>
          </span>
        </button>
        {onToggle && (
          <button
            onClick={onToggle}
            aria-label="Hide sidebar"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[5px] text-[var(--muted-2)] transition-colors hover:bg-[var(--surface-2)] hover:text-ink"
          >
            <SidebarSimple size={15} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = it.cat
            ? screen.name === "category" && screen.params?.id === it.cat
            : it.match.includes(screen.name);
          return (
            <button
              key={it.id}
              onClick={() => { haptic(6); go(it.to, it.params); }}
              className={cx(
                "group flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left transition-colors",
                !active && "hover:bg-[var(--surface-2)]",
              )}
              style={active
                ? { background: "var(--surface-2)", border: "1px solid var(--line-card)" }
                : { border: "1px solid transparent" }}
            >
              {/* Rank comes from the mark and the weight. Inactive rows used to
                  be --muted, which since text went near-black is a shade off
                  --ink — so the only thing separating current from not was the
                  fill, and at a glance every row looked selected. */}
              <Icon
                size={16}
                strokeWidth={1.7}
                className={cx("shrink-0 transition-colors",
                  active ? "text-[var(--bhagwa)]" : "text-[var(--muted-2)] group-hover:text-[var(--bhagwa)]")}
              />
              <span className={cx("text-[12.5px] text-ink", active && "font-medium")}>{it.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Account and the way out, in one bordered group — the same shape the
          Account screen uses. Sign out was a bare text link hanging below the
          card, flush against the bottom edge. */}
      <div className="mt-4 overflow-hidden rounded-[8px]" style={{ border: "1px solid var(--line)" }}>
        <button
          onClick={() => go("menu")}
          className="flex w-full items-center gap-2.5 p-2.5 text-left transition-colors hover:bg-[var(--surface-2)]"
        >
          <Avatar name={name} size={30} tint="#C88131" />
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-[12px] leading-tight text-ink">{name}</div>
            <div className="truncate text-[10px] leading-tight text-[var(--muted-2)]">{rashi}</div>
          </div>
          <CaretRight size={13} className="shrink-0 text-[var(--muted-2)]" />
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-2)]"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <SignOut size={15} weight="light" className="shrink-0 text-[var(--avoid)]" />
          <span className="text-[11.5px] text-[var(--avoid)]">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
