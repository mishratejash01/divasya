"use client";

import {
  ChevronLeft, ChevronRight, Sparkles, Flame, MessagesSquare, Flower2, Tv,
  CircleDot, Landmark, CalendarDays, BookOpen, Compass, Baby, Share2,
  Settings, HelpCircle, LogOut, ChevronRightCircle,
} from "lucide-react";
import { useApp, ScreenName } from "../app-context";
import { Avatar } from "../ui";
import { rashiLabel } from "@/lib/astro";

type Item = { label: string; icon: typeof Sparkles; to?: ScreenName; params?: Record<string, unknown>; live?: boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Astrology & Guidance",
    items: [
      { label: "AI Astrology", icon: Sparkles, to: "ai", params: { mode: "jyotishi" }, live: true },
      { label: "Talk to your Devta", icon: Flame, to: "ai", params: { mode: "deity" }, live: true },
      { label: "Consult Astrologers", icon: MessagesSquare, to: "consult", live: true },
      { label: "Panchang & Muhurat", icon: CalendarDays, to: "panchang" },
    ],
  },
  {
    title: "Devotion",
    items: [
      { label: "Online Puja & Chadhava", icon: Flower2, to: "puja", live: true },
      { label: "Live Temple Darshan", icon: Tv, to: "temple", live: true },
      { label: "My Mandir", icon: Landmark, to: "mandir" },
      { label: "Mala Jaap", icon: CircleDot, to: "mala" },
      { label: "Festivals & Pooja Guide", icon: CalendarDays, to: "festivals" },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Vastu Compass", icon: Compass, to: "vastu", live: true },
      { label: "Naamkaran", icon: Baby, to: "naamkaran", live: true },
      { label: "Spiritual Library", icon: BookOpen, to: "library" },
      { label: "Daily Sandesh", icon: Share2, to: "sandesh" },
    ],
  },
];

const UTILITY: Item[] = [
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: HelpCircle },
  { label: "Share App", icon: Share2 },
  { label: "Logout", icon: LogOut },
];

export function MoreScreen() {
  const { back, go, haptic, profile, logout } = useApp();
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });
  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-10 pt-12">
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <span className="font-display text-lg text-ink">Menu</span>
      </div>

      {/* profile */}
      <button className="mx-5 flex w-[calc(100%-2.5rem)] items-center gap-3 rounded-2xl card-temple p-4 text-left">
        <Avatar name={name} size={52} tint="#c8772e" />
        <div className="flex-1">
          <div className="font-display text-[17px] text-ink">{name}</div>
          <div className="text-[12px] text-muted">{rashi}</div>
        </div>
        <ChevronRight size={18} className="text-muted" />
      </button>

      {SECTIONS.map((sec) => (
        <div key={sec.title} className="px-5 pt-6">
          <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">{sec.title}</h3>
          <div className="overflow-hidden rounded-2xl surface">
            {sec.items.map((it, i) => {
              const Icon = it.icon;
              return (
                <button key={it.label}
                  onClick={() => it.to && go(it.to, it.params)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                  <Icon size={18} className="text-[var(--saffron-soft)]" strokeWidth={1.8} />
                  <span className="flex-1 text-[14px] text-ink">{it.label}</span>
                  {it.live && (
                    <span className="rounded-full px-2 py-0.5 text-[9.5px] font-semibold tracking-wide"
                      style={{ background: "rgba(110,158,118,0.16)", color: "var(--good)" }}>LIVE</span>
                  )}
                  <ChevronRight size={16} className="text-muted" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="px-5 pt-6">
        <div className="overflow-hidden rounded-2xl surface">
          {UTILITY.map((it, i) => {
            const Icon = it.icon;
            const danger = it.label === "Logout";
            return (
              <button key={it.label} onClick={() => { haptic(8); if (danger) logout(); }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                <Icon size={18} className={danger ? "text-[var(--avoid)]" : "text-muted"} strokeWidth={1.8} />
                <span className={danger ? "flex-1 text-[14px] text-[var(--avoid)]" : "flex-1 text-[14px] text-ink"}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 px-5 pb-2 pt-7 text-[11px] text-muted">
        <ChevronRightCircle size={12} /> Divasya · Spiritual Journey · v2.0
      </div>
    </div>
  );
}
