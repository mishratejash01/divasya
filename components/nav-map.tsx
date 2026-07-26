"use client";

import {
  IconStar, IconEye, IconDiya, IconWheel, IconChat, IconBaby,
  IconMala, IconMandir, IconLotus, IconDarshan, IconFlower, IconAarti,
  IconCompass, IconJournal, IconSandesh, IconShop, IconComponent,
} from "./icons";
import { ScreenName } from "./app-context";

export type NavEntry = {
  label: string;
  hint: string;
  icon: IconComponent;
  to: ScreenName;
  params?: Record<string, unknown>;
};

export type NavGroup = {
  id: string;
  title: string;
  note: string;
  entries: NavEntry[];
};

/**
 * Every place the app can take you, written once.
 *
 * The menu, the sidebar, the home shelves and the category pages all read from
 * this map, so a screen cannot appear in one and be missing from another, and
 * adding one is a single edit rather than four.
 *
 * Each entry carries a line saying what it does. A grid of icons and one-word
 * labels asks the reader to already know what "Chadhava" or "Naamkaran" means.
 */
export const NAV: Record<string, NavGroup> = {
  astro: {
    id: "astro",
    title: "Astrology",
    note: "Your chart, the day's reckoning, and someone to ask.",
    entries: [
      { label: "My Kundli", hint: "Your birth chart, cast and read", icon: IconStar, to: "kundli" },
      { label: "AI Jyotishi", hint: "Ask anything about your chart", icon: IconEye, to: "ai", params: { mode: "jyotishi" } },
      { label: "Talk to Devta", hint: "Sit with your ishta devta", icon: IconDiya, to: "ai", params: { mode: "deity" } },
      { label: "Panchang", hint: "Tithi, nakshatra and the day's muhurat", icon: IconWheel, to: "panchang" },
      { label: "Consult", hint: "Speak to a real astrologer", icon: IconChat, to: "consult" },
      { label: "Naamkaran", hint: "Name a child by its birth nakshatra", icon: IconBaby, to: "naamkaran" },
    ],
  },
  devotion: {
    id: "devotion",
    title: "Devotion",
    note: "Daily practice, and darshan wherever you are.",
    entries: [
      { label: "Mala Jaap", hint: "Count your rounds, hands-free if you like", icon: IconMala, to: "mala" },
      { label: "My Mandir", hint: "Your own shrine, aarti and all", icon: IconMandir, to: "mandir" },
      { label: "Online Puja", hint: "Book a puja at a temple", icon: IconLotus, to: "puja" },
      { label: "Live Darshan", hint: "Watch the aarti as it happens", icon: IconDarshan, to: "temple" },
      { label: "Chadhava", hint: "Send an offering", icon: IconFlower, to: "puja", params: { tab: "chadhava" } },
      { label: "Festivals", hint: "What is coming, and how it is kept", icon: IconAarti, to: "festivals" },
    ],
  },
  store: {
    id: "store",
    title: "The Store",
    note: "Sacred objects, posted with care.",
    entries: [
      { label: "Everything", hint: "The whole shelf", icon: IconShop, to: "shop" },
      { label: "Rudraksha", hint: "Certified beads, 1 to 14 mukhi", icon: IconMala, to: "shop", params: { cat: "rudraksha" } },
      { label: "Rashi Bands", hint: "One for each of the twelve rashis", icon: IconStar, to: "shop", params: { cat: "rashi" } },
      { label: "Mulank Bands", hint: "Chosen by your birth number", icon: IconWheel, to: "shop", params: { cat: "mulank" } },
      { label: "Malas", hint: "For japa and for wearing", icon: IconFlower, to: "shop", params: { cat: "malas" } },
      { label: "My Orders", hint: "What you have bought, and where it is", icon: IconJournal, to: "orders" },
    ],
  },
  tools: {
    id: "tools",
    title: "Guides",
    note: "The reference shelf.",
    entries: [
      { label: "Vastu", hint: "Which direction each room wants", icon: IconCompass, to: "vastu" },
      { label: "Spiritual Library", hint: "Readings on practice and belief", icon: IconJournal, to: "library" },
      { label: "Daily Sandesh", hint: "One verse, every morning", icon: IconSandesh, to: "sandesh" },
    ],
  },
};

export const NAV_ORDER = ["astro", "devotion", "store", "tools"] as const;
