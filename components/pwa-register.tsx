"use client";

import { useEffect } from "react";

// Registers the service worker so Divasya is installable (PWA / Play TWA).
//
// Never in development. The worker caches the page shell, and the shell points
// at hashed /_next/static chunks that change on every dev restart. Serve a
// stale shell once and its chunks 404, React never boots, and you get a blank
// white page that survives ordinary reloads. In dev we do the opposite: tear
// down any worker and cache a previous session left behind, so a browser that
// is already stuck recovers by itself on the next load.
export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
