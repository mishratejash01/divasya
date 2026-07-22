"use client";

import { CaretRight } from "@phosphor-icons/react";
import {
  IconStar, IconEye, IconDiya, IconWheel, IconChat, IconBaby,
  IconMala, IconMandir, IconLotus, IconDarshan, IconFlower, IconAarti,
  IconCompass, IconJournal, IconSandesh, IconComponent,
} from "../icons";
import { useApp, ScreenName } from "../app-context";
import { ScreenHeader } from "../ui";

export type CategoryTool = {
  label: string;
  hint: string;
  icon: IconComponent;
  to: ScreenName;
  params?: Record<string, unknown>;
};

/**
 * The categories behind the main tabs, and the single source of truth for what
 * each one contains. The sidebar and this screen both read from here, so a tool
 * cannot appear in one and be missing from the other.
 *
 * Each tool carries a line saying what it does. A grid of icons and one-word
 * labels asks the reader to already know what "Chadhava" or "Naamkaran" is;
 * this page has the room to say it.
 */
export const CATEGORIES: Record<string, { title: string; note: string; tools: CategoryTool[] }> = {
  astro: {
    title: "Astrology",
    note: "Your chart, the day's reckoning, and someone to ask.",
    tools: [
      { label: "My Kundli", hint: "Your birth chart, cast and read", icon: IconStar, to: "kundli" },
      { label: "AI Jyotishi", hint: "Ask anything about your chart", icon: IconEye, to: "ai", params: { mode: "jyotishi" } },
      { label: "Talk to Devta", hint: "Sit with your ishta devta", icon: IconDiya, to: "ai", params: { mode: "deity" } },
      { label: "Panchang", hint: "Tithi, nakshatra and the day's muhurat", icon: IconWheel, to: "panchang" },
      { label: "Consult", hint: "Speak to a real astrologer", icon: IconChat, to: "consult" },
      { label: "Naamkaran", hint: "Name a child by its birth nakshatra", icon: IconBaby, to: "naamkaran" },
    ],
  },
  devotion: {
    title: "Devotion",
    note: "Daily practice, and darshan wherever you are.",
    tools: [
      { label: "Mala Jaap", hint: "Count your rounds, hands-free if you like", icon: IconMala, to: "mala" },
      { label: "My Mandir", hint: "Your own shrine, aarti and all", icon: IconMandir, to: "mandir" },
      { label: "Online Puja", hint: "Book a puja at a temple", icon: IconLotus, to: "puja" },
      { label: "Live Darshan", hint: "Watch the aarti as it happens", icon: IconDarshan, to: "temple" },
      { label: "Chadhava", hint: "Send an offering", icon: IconFlower, to: "puja", params: { tab: "chadhava" } },
      { label: "Festivals", hint: "What is coming, and how it is kept", icon: IconAarti, to: "festivals" },
    ],
  },
  tools: {
    title: "Guides",
    note: "The reference shelf.",
    tools: [
      { label: "Vastu", hint: "Which direction each room wants", icon: IconCompass, to: "vastu" },
      { label: "Spiritual Library", hint: "Readings on practice and belief", icon: IconJournal, to: "library" },
      { label: "Daily Sandesh", hint: "One verse, every morning", icon: IconSandesh, to: "sandesh" },
    ],
  },
};

export function CategoryScreen() {
  const { screen, back, go, haptic } = useApp();
  const id = (screen.params?.id as string) || "astro";
  const cat = CATEGORIES[id] ?? CATEGORIES.astro;

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title={cat.title} onBack={back} />

      <p className="gutter pt-3 text-[11.5px] leading-relaxed text-ink">{cat.note}</p>

      <div className="gutter pt-2.5">
        <div className="overflow-hidden rounded-2xl surface">
          {cat.tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                onClick={() => { haptic(6); go(t.to, t.params); }}
                className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[var(--surface-2)]"
                style={{ borderTop: i ? "1px solid var(--line)" : undefined }}
              >
                <Icon size={19} strokeWidth={1.6} className="shrink-0 text-[var(--bhagwa)]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] leading-tight text-ink">{t.label}</div>
                  <div className="mt-0.5 truncate text-[10.5px] leading-tight text-[var(--muted-2)]">{t.hint}</div>
                </div>
                <CaretRight size={14} className="shrink-0 text-[var(--muted-2)]" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
