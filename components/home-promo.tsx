"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "./app-context";
import { cx } from "./ui";

export type Promo = { img: string; to: () => void };

const ADVANCE_MS = 4500;

/**
 * The promo row on home. One banner fills the row at a time — no half-cut
 * neighbour peeking in at the edge. The others sit in the same row: swipe to
 * them, or let the row slide on by itself; the dots show where you are.
 */
export function HomePromo({ banners }: { banners: Promo[] }) {
  const { haptic } = useApp();
  const row = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // a finger on the row pauses the auto-advance until it has been still a while
  const touchedAt = useRef(0);

  const step = () => {
    const el = row.current;
    const first = el?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + 12 : 1;
  };

  const goTo = (i: number) => {
    row.current?.scrollTo({ left: i * step(), behavior: "smooth" });
  };

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Date.now() - touchedAt.current < ADVANCE_MS * 1.5) return;
      const el = row.current;
      if (!el || el.getBoundingClientRect().bottom < 0) return;
      const next = (Math.round(el.scrollLeft / step()) + 1) % banners.length;
      goTo(next);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [banners.length]);

  return (
    <div>
      <div
        ref={row}
        onScroll={(e) => setActive(Math.round(e.currentTarget.scrollLeft / step()))}
        onPointerDown={() => { touchedAt.current = Date.now(); }}
        onTouchStart={() => { touchedAt.current = Date.now(); }}
        className="flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-3 overflow-x-auto px-[var(--gutter)] no-scrollbar"
      >
        {banners.map((banner, i) => (
          <button
            key={banner.img}
            onClick={() => { haptic(6); banner.to(); }}
            className="aspect-[2/1] w-full shrink-0 snap-start overflow-hidden rounded-2xl active:scale-[0.99]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading={i === 0 ? "eager" : "lazy"} decoding="async" src={banner.img} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="mt-2.5 flex justify-center gap-1.5">
        {banners.map((b, i) => (
          <button
            key={b.img}
            aria-label={`Banner ${i + 1}`}
            onClick={() => { touchedAt.current = Date.now(); goTo(i); }}
            className={cx(
              "h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-4 bg-[var(--bhagwa)]" : "w-1.5 bg-black/15"
            )}
          />
        ))}
      </div>
    </div>
  );
}
