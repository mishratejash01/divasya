"use client";

import { ScreenName } from "./app-context";
import type { DevotionalIllustrationName } from "./ui";

export type NavEntry = {
  label: string;
  hint: string;
  /** Iconify name (Solar bold-duotone + game-icons for Hindu-culture marks).
   *  Browse at icones.js.org. Rendered with <Iconify icon={...} />. */
  icon: string;
  /** Purpose-matched artwork from the supplied illustration sheets. */
  art?: DevotionalIllustrationName;
  to: ScreenName;
  params?: Record<string, unknown>;
};

export type NavGroup = {
  id: string;
  title: string;
  note: string;
  entries: NavEntry[];
  /** "list" (default) is icon + title + hint in a ruled card. "grid" is bare
   *  icon-and-title tiles with no note and no hints — the store shelf. */
  layout?: "list" | "grid";
};

/**
 * Every place the app can take you, written once.
 *
 * The menu, the sidebar, the home shelves and the category pages all read from
 * this map, so a screen cannot appear in one and be missing from another.
 */
export const NAV: Record<string, NavGroup> = {
  astro: {
    id: "astro",
    title: "Astrology",
    note: "Your chart, the day's reckoning, and someone to ask.",
    layout: "grid",
    entries: [
      { label: "My Kundli", hint: "Your birth chart, cast and read", icon: "solar:star-bold-duotone", art: "star", to: "kundli" },
      { label: "AI Jyotishi", hint: "Ask anything about your chart", icon: "solar:eye-scan-bold-duotone", art: "eye", to: "ai", params: { mode: "jyotishi" } },
      { label: "Talk to Devta", hint: "Sit with your ishta devta", icon: "mdi:temple-hindu", art: "om", to: "ai", params: { mode: "deity" } },
      { label: "Panchang", hint: "Tithi, nakshatra and the day's muhurat", icon: "solar:calendar-bold-duotone", art: "panchang", to: "panchang" },
      { label: "Consult", hint: "Speak to a real astrologer", icon: "solar:chat-round-dots-bold-duotone", art: "sun", to: "consult" },
      { label: "Naamkaran", hint: "Name a child by its birth nakshatra", icon: "solar:smile-circle-bold-duotone", art: "time", to: "naamkaran" },
    ],
  },
  devotion: {
    id: "devotion",
    title: "Devotion",
    note: "Daily practice, and darshan wherever you are.",
    layout: "grid",
    entries: [
      { label: "Mala Jaap", hint: "Count your rounds, hands-free if you like", icon: "game-icons:prayer-beads", art: "rudraksha", to: "mala" },
      { label: "My Mandir", hint: "Your own shrine, aarti and all", icon: "material-symbols:temple-hindu-rounded", art: "trishul", to: "mandir" },
      { label: "Online Puja", hint: "Book a puja at a temple", icon: "game-icons:lotus", art: "lotus", to: "puja" },
      { label: "Live Darshan", hint: "Watch the aarti as it happens", icon: "solar:eye-bold-duotone", art: "sun", to: "temple" },
      { label: "Chadhava", hint: "Send an offering", icon: "game-icons:flowers", art: "hibiscus", to: "puja", params: { tab: "chadhava" } },
      { label: "Festivals", hint: "What is coming, and how it is kept", icon: "solar:fire-bold-duotone", art: "diya", to: "festivals" },
      { label: "Journeys", hint: "21, 28 & 40-day guided sadhana", icon: "solar:flag-2-bold-duotone", art: "swastik", to: "journeys" },
      { label: "Divine Paths", hint: "A deity-led path to walk", icon: "solar:map-point-wave-bold-duotone", art: "feather", to: "paths" },
    ],
  },
  store: {
    id: "store",
    title: "The Store",
    note: "",
    layout: "list",
    entries: [
      { label: "My Orders", hint: "", icon: "solar:box-bold-duotone", art: "conch", to: "orders" },
      { label: "Everything", hint: "", icon: "solar:shop-2-bold-duotone", art: "sitara", to: "shop" },
      { label: "Rudraksha", hint: "", icon: "game-icons:prayer-beads", art: "rudraksha", to: "shop", params: { cat: "rudraksha" } },
      { label: "Rashi Bands", hint: "", icon: "solar:star-circle-bold-duotone", art: "chakra", to: "shop", params: { cat: "rashi" } },
      { label: "Mulank Bands", hint: "", icon: "solar:calculator-bold-duotone", art: "time", to: "shop", params: { cat: "mulank" } },
      { label: "Bracelets", hint: "", icon: "game-icons:linked-rings", art: "namamVaishnav", to: "shop", params: { cat: "bracelets" } },
      { label: "Malas", hint: "", icon: "game-icons:prayer-beads", art: "tulsi", to: "shop", params: { cat: "malas" } },
      { label: "Anklets", hint: "", icon: "game-icons:gem-pendant", art: "namamVishnu", to: "shop", params: { cat: "anklets" } },
      { label: "Studio", hint: "", icon: "solar:pallete-2-bold-duotone", art: "journal", to: "shop", params: { cat: "studio" } },
    ],
  },
  tools: {
    id: "tools",
    title: "Guides",
    note: "The reference shelf.",
    layout: "grid",
    entries: [
      { label: "Vastu", hint: "Which direction each room wants", icon: "solar:compass-bold-duotone", art: "wellness", to: "vastu" },
      { label: "Gita Wisdom", hint: "Every verse, in six layers", icon: "solar:book-bookmark-bold-duotone", art: "flute", to: "gita" },
      { label: "Spiritual Library", hint: "Readings on practice and belief", icon: "solar:book-2-bold-duotone", art: "journal", to: "library" },
      { label: "Soul Journal", hint: "A quiet page, always waiting", icon: "solar:pen-new-square-bold-duotone", art: "damru", to: "journal" },
      { label: "Daily Sandesh", hint: "One verse, every morning", icon: "solar:letter-bold-duotone", art: "palash", to: "sandesh" },
      { label: "Reminders", hint: "Gentle temple-bell nudges", icon: "solar:bell-bold-duotone", art: "diya", to: "reminders" },
    ],
  },
};

export const NAV_ORDER = ["astro", "devotion", "store", "tools"] as const;
