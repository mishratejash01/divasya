"use client";

import { SidebarSimple, SquaresFour } from "@phosphor-icons/react";
import {
  IconHome, IconEye, IconDiya, IconChat, IconMandir, IconMala,
  IconWheel, IconLotus, IconDarshan, IconCompass, IconStar, IconComponent,
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
};

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Daily",
    items: [
      { id: "home", label: "Home", icon: IconHome, to: "home", match: ["home"] },
      { id: "panchang", label: "Panchang", icon: IconWheel, to: "panchang", match: ["panchang", "festivals"] },
      { id: "mala", label: "Mala Jaap", icon: IconMala, to: "mala", match: ["mala"] },
    ],
  },
  {
    title: "Guidance",
    items: [
      { id: "kundli", label: "My Kundli", icon: IconStar, to: "kundli", match: ["kundli"] },
      { id: "ai", label: "AI Jyotishi", icon: IconEye, to: "ai", params: { mode: "jyotishi" }, match: ["ai"] },
      { id: "deity", label: "Talk to Devta", icon: IconDiya, to: "ai", params: { mode: "deity" }, match: [] },
      { id: "consult", label: "Consult", icon: IconChat, to: "consult", match: ["consult", "consultChat"] },
    ],
  },
  {
    title: "Devotion",
    items: [
      { id: "mandir", label: "My Mandir", icon: IconMandir, to: "mandir", match: ["mandir"] },
      { id: "puja", label: "Online Puja", icon: IconLotus, to: "puja", match: ["puja"] },
      { id: "temple", label: "Live Darshan", icon: IconDarshan, to: "temple", match: ["temple"] },
      { id: "vastu", label: "Vastu Compass", icon: IconCompass, to: "vastu", match: ["vastu", "naamkaran", "library", "sandesh"] },
    ],
  },
];

export function SideNav({ open = true, onToggle }: { open?: boolean; onToggle?: () => void }) {
  const { screen, go, haptic, profile, logout } = useApp();
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });

  if (!open) return null;

  return (
    <aside className="hidden h-full w-[256px] shrink-0 flex-col border-r border-[var(--line)] px-4 py-6 lg:flex"
      style={{ background: "linear-gradient(180deg, rgba(200,129,49,0.05), transparent 30%)" }}>
      {/* brand + collapse */}
      <div className="mb-7 flex items-center gap-3 px-2">
        <button onClick={() => go("home")} className="flex flex-1 items-center gap-3 text-left">
          <Logomark size={32} className="shrink-0 text-[var(--amber)]" />
          <span>
            <Wordmark size={17} />
            <span className="block font-deva text-[9.5px] tracking-wide text-gold">आध्यात्मिक यात्रा</span>
          </span>
        </button>
        {onToggle && (
          <button
            onClick={onToggle}
            aria-label="Hide sidebar"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-[rgba(200,129,49,0.08)] hover:text-[var(--amber-deep)]"
          >
            <SidebarSimple size={14} />
          </button>
        )}
      </div>

      {/* groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto no-scrollbar">
        {GROUPS.map((grp) => (
          <div key={grp.title}>
            <div className="mb-1.5 px-3 eyebrow text-[var(--muted-2)]">{grp.title}</div>
            <div className="space-y-0.5">
              {grp.items.map((it) => {
                const Icon = it.icon;
                const active = it.match.includes(screen.name);
                return (
                  <button
                    key={it.id}
                    onClick={() => { haptic(6); go(it.to, it.params); }}
                    className={cx(
                      "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      active ? "text-ink" : "text-muted hover:text-ink"
                    )}
                    style={active ? { background: "rgba(200,129,49,0.10)", border: "1px solid var(--line-gold)" } : { border: "1px solid transparent" }}
                  >
                    <Icon size={16} strokeWidth={active ? 2.1 : 1.7}
                      className={cx("shrink-0 transition-colors", active ? "text-[var(--amber)]" : "text-[var(--muted)] group-hover:text-[var(--amber)]")} />
                    <span className="text-[12px]">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* profile */}
      <button onClick={() => go("menu")}
        className="mt-4 flex items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-[rgba(200,129,49,0.06)]"
        style={{ border: "1px solid var(--line)" }}>
        <Avatar name={name} size={34} tint="#C88131" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[12.5px] text-ink">{name}</div>
          <div className="truncate text-[10px] text-muted">{rashi}</div>
        </div>
        <SquaresFour size={14} className="shrink-0 text-muted" />
      </button>
      <button onClick={logout} className="mt-1 px-3 py-1 text-left text-[10px] text-[var(--muted-2)] transition-colors hover:text-[var(--avoid)]">
        Sign out
      </button>
    </aside>
  );
}
