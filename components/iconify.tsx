"use client";

// Iconify gives on-demand access to ~200k icons across 150+ sets (Lucide, Solar,
// Phosphor, Material Symbols, Tabler…). Browse and copy names at
// https://icones.js.org — the name is "<set>:<icon>", e.g. "solar:home-bold".
//
//   import { Iconify } from "@/components/iconify";
//   <Iconify icon="solar:home-bold-duotone" width={22} />
//
// Icon data streams from Iconify's API on first use and caches after. When we
// settle on a fixed set for production, we can bundle just those sets offline
// with @iconify-json/<set> for zero-network, no-flash rendering.
export { Icon as Iconify } from "@iconify/react";
