"use client";

import { CaretRight } from "@phosphor-icons/react";
import { Iconify } from "./iconify";


export type BandTool = { label: string; icon?: string; img?: string; onClick: () => void };
export type Band = {
  title: string;
  subtitle: string;
  art: string;      // artifact shown in the coloured header
  grad: string;     // deep jewel-tone gradient for the header
  onOpen: () => void;
  tools: BandTool[];
};

/**
 * Grouped category "bands" — a deep jewel-tone header (title + line + artwork)
 * over a warm tray of tool shortcuts. Divasya's own take on the grouped-card
 * pattern: richer colour, our artefacts, our tools.
 */
export function HomeBands({ bands }: { bands: Band[] }) {
  return (
    <div className="flex flex-col gap-3">
      {bands.map((b) => (
        <section key={b.title} className="cat-band">
          <button className="cat-band-top" style={{ background: b.grad }} onClick={b.onOpen}>
            <span className="min-w-0">
              <span className="cat-band-title font-display">{b.title}</span>
              <span className="cat-band-sub">{b.subtitle}</span>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.art} alt="" className="cat-band-art" />
          </button>
          <div className="cat-band-tools">
            {/* shikhara toran divider — a repeated temple-spire motif in white */}
            <div className="cat-band-scallop" aria-hidden />
            {b.tools.map((t) => (
              <button key={t.label} className="cat-tool" onClick={t.onClick}>
                {t.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.img} alt="" className="cat-tool-art" />
                ) : (
                  <span className="cat-tool-ph" aria-hidden>
                    <Iconify icon="solar:gallery-wide-linear" width={20} height={20} />
                  </span>
                )}
                <span className="cat-tool-label">{t.label}</span>
              </button>
            ))}
            <button className="cat-tool cat-more" onClick={b.onOpen}>
              <span className="cat-more-arrow">
                <CaretRight size={22} weight="bold" />
              </span>
              <span className="cat-tool-label">More</span>
            </button>
          </div>
        </section>
      ))}
    </div>
  );
}
