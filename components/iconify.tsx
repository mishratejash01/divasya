"use client";

// Iconify gives access to ~200k icons across 150+ sets (Lucide, Solar,
// Phosphor, Material Symbols, Tabler…). Browse and copy names at
// https://icones.js.org — the name is "<set>:<icon>", e.g. "solar:home-bold".
//
//   import { Iconify } from "@/components/iconify";
//   <Iconify icon="solar:home-bold-duotone" width={22} />
//
// Every icon the app uses is bundled in lib/icon-bundle.ts and registered
// here, so icons draw on first paint with no network fetch — no blank gaps
// or late pop-in. A new icon must be added to that bundle too; until it is,
// Iconify falls back to fetching it from its API.
import { addCollection } from "@iconify/react";
import { ICON_COLLECTIONS } from "@/lib/icon-bundle";

ICON_COLLECTIONS.forEach((c) => addCollection(c));

export { Icon as Iconify } from "@iconify/react";
