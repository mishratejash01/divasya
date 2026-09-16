"use client";

import { useEffect, useState } from "react";

/**
 * Which shell is the site running inside? The App Store forbids selling
 * digital goods through outside payment rails (rule 3.1.1), so the iOS app
 * hides digital products and wallet top-ups. This is permanent iOS policy,
 * not review-week dressing: every iPhone user sees the same catalog. Web and
 * Android are untouched.
 */
export function isIosApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  return cap?.getPlatform?.() === "ios";
}

/** Hydration-safe hook: false on the server and first paint, real after mount. */
export function useIsIosApp(): boolean {
  const [ios, setIos] = useState(false);
  useEffect(() => { setIos(isIosApp()); }, []);
  return ios;
}
