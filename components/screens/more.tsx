"use client";

import { CaretLeft, CaretRight, GearSix, Question, ShareNetwork, SignOut } from "@phosphor-icons/react";
import {
  IconEye, IconDiya, IconChat, IconWheel, IconLotus, IconDarshan, IconMandir,
  IconMala, IconStar, IconCompass, IconBaby, IconJournal, IconSandesh, IconComponent,
} from "../icons";
import { useApp, ScreenName } from "../app-context";
import { Avatar, Logomark } from "../ui";
import { rashiLabel } from "@/lib/astro";

type Item = { label: string; icon: IconComponent; to?: ScreenName; params?: Record<string, unknown>; live?: boolean };

const SECTIONS: { title: string; items: Item[] }[] = [
  {
    title: "Astrology & Guidance",
    items: [
      { label: "My Kundli", icon: IconStar, to: "kundli", live: true },
      { label: "AI Astrology", icon: IconEye, to: "ai", params: { mode: "jyotishi" }, live: true },
      { label: "Talk to your Devta", icon: IconDiya, to: "ai", params: { mode: "deity" }, live: true },
      { label: "Consult Astrologers", icon: IconChat, to: "consult", live: true },
      { label: "Panchang & Muhurat", icon: IconWheel, to: "panchang" },
    ],
  },
  {
    title: "Devotion",
    items: [
      { label: "Online Puja & Chadhava", icon: IconLotus, to: "puja", live: true },
      { label: "Live Temple Darshan", icon: IconDarshan, to: "temple", live: true },
      { label: "My Mandir", icon: IconMandir, to: "mandir" },
      { label: "Mala Jaap", icon: IconMala, to: "mala" },
      { label: "Festivals & Pooja Guide", icon: IconStar, to: "festivals" },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Vastu Compass", icon: IconCompass, to: "vastu", live: true },
      { label: "Naamkaran", icon: IconBaby, to: "naamkaran", live: true },
      { label: "Spiritual Library", icon: IconJournal, to: "library" },
      { label: "Daily Sandesh", icon: IconSandesh, to: "sandesh" },
    ],
  },
];

const UTILITY: Item[] = [
  { label: "GearSix", icon: GearSix },
  { label: "Help & Support", icon: Question },
  { label: "Share App", icon: ShareNetwork },
  { label: "Logout", icon: SignOut },
];

export function MoreScreen() {
  const { back, go, haptic, profile, logout } = useApp();
  const name = profile?.name || "Devotee";
  const rashi = rashiLabel(profile || { rashi: null, dob: null });
  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom screen-top">
      <div className="flex items-center gap-3 gutter py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><CaretLeft size={16} /></button>
        <span className="font-display text-lg text-ink">Menu</span>
      </div>

      {/* profile */}
      <button className="gutter-m flex gutter-w items-center gap-3 rounded-2xl card-temple p-4 text-left">
        <Avatar name={name} size={47} tint="#C88131" />
        <div className="flex-1">
          <div className="font-display text-[15.5px] text-ink">{name}</div>
          <div className="text-[11px] text-muted">{rashi}</div>
        </div>
        <CaretRight size={16} className="text-muted" />
      </button>

      {SECTIONS.map((sec) => (
        <div key={sec.title} className="gutter pt-6">
          <h3 className="mb-2 eyebrow text-muted">{sec.title}</h3>
          <div className="overflow-hidden rounded-2xl surface">
            {sec.items.map((it, i) => {
              const Icon = it.icon;
              return (
                <button key={it.label}
                  onClick={() => it.to && go(it.to, it.params)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                  <Icon size={16} className="text-[var(--amber)]" strokeWidth={1.7} />
                  <span className="flex-1 text-[12.5px] text-ink">{it.label}</span>
                  {it.live && (
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-medium tracking-wide"
                      style={{ background: "rgba(95,134,87,0.14)", color: "var(--good)" }}>Live</span>
                  )}
                  <CaretRight size={14} className="text-muted" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="gutter pt-6">
        <div className="overflow-hidden rounded-2xl surface">
          {UTILITY.map((it, i) => {
            const Icon = it.icon;
            const danger = it.label === "Logout";
            return (
              <button key={it.label} onClick={() => { haptic(8); if (danger) logout(); }}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderTop: i ? "1px solid var(--line)" : undefined }}>
                <Icon size={16} className={danger ? "text-[var(--avoid)]" : "text-muted"} strokeWidth={1.8} />
                <span className={danger ? "flex-1 text-[12.5px] text-[var(--avoid)]" : "flex-1 text-[12.5px] text-ink"}>{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 gutter pb-2 pt-7 text-[10px] text-muted tracking-widest">
        <Logomark size={13} className="text-[var(--amber)]" /> Divasya · Spiritual Journey
      </div>
    </div>
  );
}
