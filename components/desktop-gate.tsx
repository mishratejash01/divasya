"use client";

import { useEffect, useState } from "react";

/**
 * Divasya is a phone app. On a desktop browser (a wide screen driven by a
 * mouse) the app is not shown at all — this screen asks the visitor to open
 * the link on their phone instead. Visibility is pure CSS (.desktop-gate), so a
 * desktop never sees a flash of the app first; phones, tablets in hand and the
 * native apps never match the query.
 */
export const DESKTOP_QUERY = "(min-width: 900px) and (hover: hover) and (pointer: fine)";

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

export function DesktopGate() {
  const [host, setHost] = useState("");
  useEffect(() => { setHost(window.location.host); }, []);

  return (
    <div className="desktop-gate fixed inset-0 z-[300] items-center justify-center overflow-hidden" style={{ background: "#070A1C" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cosmic/sky-min.webp" alt="" className="absolute inset-0 h-full w-full object-cover object-bottom" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 50% 42%, rgba(7,10,28,0.15) 0%, rgba(7,10,28,0.7) 100%)" }} />

      <div className="relative flex max-w-[460px] flex-col items-center px-8 text-center" style={{ fontFamily: "var(--font-lexend)" }}>
        <span
          role="img"
          aria-label="Divasya"
          className="block"
          style={{
            height: 72,
            aspectRatio: "985 / 355",
            background: "linear-gradient(100deg, #E9B44C 0%, #FFF1C9 45%, #F2C462 60%, #C98A2B 100%)",
            WebkitMask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
            mask: "url(/brand/divasya-wordmark-ink.png) center / contain no-repeat",
          }}
        />

        {/* a thin gold rule with a diya flame at its heart */}
        <div className="mt-7 flex w-[150px] items-center gap-2.5" aria-hidden>
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(233,180,76,0), #E9B44C)" }} />
          <svg width="12" height="16" viewBox="0 0 12 16" className="hz-flame">
            <path d="M6 0.5C8.4 4 10.5 6.4 10.5 9.6A4.5 4.5 0 0 1 1.5 9.6C1.5 6.4 3.6 4 6 0.5Z" fill="#E08A2E" />
            <path d="M6 6C7.2 7.7 8 8.8 8 10.2A2 2 0 0 1 4 10.2C4 8.8 4.8 7.7 6 6Z" fill="#FFD27A" />
          </svg>
          <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, #E9B44C, rgba(233,180,76,0))" }} />
        </div>

        <h1 className="mt-6 text-[26px] font-light leading-snug" style={{ color: "#FFF4E2" }}>
          Divasya is made for your phone
        </h1>
        <p className="mt-3 text-[14.5px] font-light leading-relaxed" style={{ color: "rgba(255,240,220,0.72)" }}>
          This is an app experience, not a desktop website. Open this link on your mobile to begin your daily practice.
        </p>

        {host && (
          <div
            className="mt-7 rounded-full px-5 py-2.5 text-[14px] tracking-wide"
            style={{ color: "#FFE2A8", border: "1px solid rgba(233,180,76,0.45)", background: "rgba(255,255,255,0.04)" }}
          >
            {host}
          </div>
        )}
      </div>
    </div>
  );
}
