"use client";

import { useEffect } from "react";

// Registers the service worker so Divasya is installable (PWA / Play TWA).
export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
