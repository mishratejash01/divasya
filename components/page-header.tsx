"use client";

import { CaretLeft } from "@phosphor-icons/react";
import type { ReactNode } from "react";

/**
 * Shared deep-jewel page header for the revamped screens — a coloured band with
 * rounded lower corners, a back chevron, a serif title, an optional subtitle,
 * and an optional artifact on the right. One header, every page.
 */
export function PageHeader({
  title,
  subtitle,
  onBack,
  art,
  right,
  gradient = "linear-gradient(155deg, #C0440E 0%, #8A2B22 60%, #6E1D2E 100%)",
  shadow = "rgba(110,29,46,0.24)",
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  art?: string;
  right?: ReactNode;
  gradient?: string;
  shadow?: string;
}) {
  return (
    <div
      className="sticky top-0 z-30"
      style={{
        background: gradient,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
      }}
    >
      <div
        className="flex items-center gap-3 gutter"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: 18 }}
      >
        {onBack && (
          <button onClick={onBack} aria-label="Back" className="shrink-0 -ml-1">
            <CaretLeft size={24} weight="bold" className="text-[#FBE8C6]" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[21px] leading-tight text-[#FDEFD6]">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[12px] text-[#F3D6B0]">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0 text-[#FBE8C6]">{right}</div>}
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" className="h-12 w-12 shrink-0 object-contain" style={{ filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.3))" }} />
        )}
      </div>
    </div>
  );
}
