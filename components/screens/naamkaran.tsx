"use client";

import { useState } from "react";
import { GenderFemale, GenderMale } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { useCatalog, getNakshatraSyllables, getBabyNames } from "@/lib/catalog";
import { NAKSHATRA_SYLLABLES, BABY_NAMES } from "@/lib/demo";

type G = "m" | "f";

/** Chaldean-style reduction to a single digit — the number a pandit reads out
 *  alongside the name. Kept because it is real information, not filler. */
function luckyNo(name: string) {
  const map = "abcdefghijklmnopqrstuvwxyz";
  let s = 0;
  for (const c of name.toLowerCase()) { const i = map.indexOf(c); if (i >= 0) s += (i % 9) + 1; }
  while (s > 9) s = String(s).split("").reduce((a, b) => a + +b, 0);
  return s || 1;
}

export function NaamkaranScreen() {
  const { back, haptic, profile } = useApp();
  const nakshatras = useCatalog(getNakshatraSyllables, NAKSHATRA_SYLLABLES);
  const names = useCatalog(getBabyNames, BABY_NAMES);
  const [nakName, setNakName] = useState<string | null>(null);
  const [gender, setGender] = useState<G | "all">("all");
  const [pada, setPada] = useState<number | null>(null);   // null = all four

  // profile.nakshatra is stored as "Rohini (pada 2)" — the janma nakshatra
  // computed from the birth chart. Opening on it beats opening on Ashwini,
  // and it is labelled so nobody mistakes it for the child's.
  const mine = profile?.nakshatra?.split(" (")[0] ?? null;
  const nak =
    nakshatras.find((n) => n.name === nakName) ??
    nakshatras.find((n) => n.name === mine) ??
    nakshatras[0];
  const syl = nak?.syl ?? [];
  const syld = nak?.syld ?? [];

  const byGender = names.filter((x) => gender === "all" || x.g === gender);
  // Grouped by the sound each name answers to. Four sounds are prescribed and
  // names are found for each, so the page is built the way the practice runs
  // rather than as one flat alphabetical run.
  const groups = syl
    .map((s, i) => ({ i, s, d: syld[i] ?? s, items: byGender.filter((x) => x.syl === s) }))
    .filter((g, i, all) => all.findIndex((o) => o.d === g.d) === i); // guard: identity is the akshara
  const shown = pada === null ? groups : groups.filter((g) => g.i === pada);
  const total = shown.reduce((a, g) => a + g.items.length, 0);

  function pick(name: string) {
    setNakName(name);
    setPada(null);
    haptic(8);
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Naamkaran" onBack={back} />

      {/* Numbered, because the 27 genuinely are a fixed sequence along the
          moon's path — the number is the nakshatra's address, not decoration.
          Set as text with a rule under the active one; twenty-seven identical
          filled chips read as wallpaper and hide which one is chosen. */}
      <div
        className="-mx-1 flex gap-4 overflow-x-auto gutter no-scrollbar"
        style={{ borderBottom: "1px solid var(--line)" }}
      >
        {nakshatras.map((n, i) => {
          const on = n.name === nak?.name;
          return (
            <button
              key={n.name}
              onClick={() => pick(n.name)}
              className="shrink-0 whitespace-nowrap py-2.5 text-[12px]"
              style={{ borderBottom: on ? "2px solid var(--bhagwa)" : "2px solid transparent" }}
            >
              <span className={cx("tnum mr-1.5 text-[10px]", on ? "text-[var(--bhagwa-deep)]" : "text-[var(--muted-2)]")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={on ? "font-medium text-ink" : "text-muted"}>{n.name}</span>
            </button>
          );
        })}
      </div>

      {nak && (
        <>
          {/* The naming leaf. One warm ground, full bleed, holding the whole
              prescription; everything below it is white. */}
          <div className="gutter pb-5 pt-4" style={{ background: "var(--surface-2)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-deva text-[13px] leading-none text-[var(--bhagwa-deep)]">{nak.deva}</div>
                <h2 className="mt-1.5 font-display text-[26px] leading-none tracking-[-0.028em] text-ink">
                  {nak.name}
                </h2>
                {nak.name === mine && (
                  <div className="mt-1.5 text-[10px] text-muted">Your janma nakshatra</div>
                )}
              </div>
              <div className="shrink-0 pt-0.5 text-right text-[10.5px] leading-[1.5] text-muted">
                <div>{nak.deity}</div>
                <div>{nak.planet}</div>
              </div>
            </div>

            {/* The four aksharas, set as large as the column allows. This is the
                whole subject of the screen — a letter a child is named from —
                so it is the image on the page, not a caption. Tap one to keep
                only its names. */}
            <div className="mt-4 flex" style={{ borderTop: "1px solid var(--line-strong)", borderBottom: "1px solid var(--line-strong)" }}>
              {syl.map((s, i) => {
                const n = groups.find((g) => g.s === s)?.items.length ?? 0;
                const on = pada === i;
                return (
                  <button
                    key={`${s}-${i}`}
                    onClick={() => { setPada(on ? null : i); haptic(6); }}
                    disabled={!n}
                    className="flex-1 py-3 text-center disabled:opacity-100"
                    style={{ borderLeft: i ? "1px solid var(--line)" : undefined }}
                  >
                    <div
                      className={cx("font-deva text-[38px] leading-[1.05]", !n && "opacity-30")}
                      style={{ color: on ? "var(--bhagwa-deep)" : "var(--ink)" }}
                    >
                      {syld[i] ?? s}
                    </div>
                    <div className={cx("mt-1 text-[10px] leading-none", on ? "text-[var(--bhagwa-deep)]" : "text-muted")}>{s}</div>
                    <div className="mt-1 text-[9.5px] tnum leading-none text-[var(--muted-2)]">{n || "—"}</div>
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[10.5px] leading-relaxed text-muted">
              A child born under {nak.name} is named from one of these four sounds.
              {pada !== null && <> Showing {syl[pada]} only — tap it again for all four.</>}
            </p>
          </div>

          {/* Filter and count share the line the list starts on. */}
          <div className="flex items-center gap-4 gutter py-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
            {([["all", "All", null], ["m", "Boy", "m"], ["f", "Girl", "f"]] as const).map(([g, l, mark]) => {
              const on = gender === g;
              return (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cx("flex items-center gap-1 text-[12px] transition-colors", on ? "font-medium text-ink" : "text-muted")}
                >
                  {mark === "m" && <GenderMale size={12} weight="bold" />}
                  {mark === "f" && <GenderFemale size={12} weight="bold" />}
                  {l}
                </button>
              );
            })}
            <span className="ml-auto text-[10.5px] tnum text-muted">
              {total} {total === 1 ? "name" : "names"}
            </span>
          </div>

          {/* The index. The akshara hangs in its own column with a rule beside
              it, so the sound stays visible the whole way down its run — the
              structure carries the grouping instead of a repeated header. */}
          <div className="gutter">
            {shown.filter((g) => g.items.length).map((g) => (
              <div key={`${g.s}-${g.i}`} className="flex gap-3 pt-4">
                <div className="w-9 shrink-0 text-right">
                  <div className="sticky top-2">
                    <div className="font-deva text-[19px] leading-none text-[var(--bhagwa-deep)]">{g.d}</div>
                    <div className="mt-1 text-[9.5px] leading-none text-[var(--muted-2)]">{g.s}</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 pl-3" style={{ borderLeft: "1px solid var(--line)" }}>
                  {g.items.map((x, i) => (
                    <div key={x.n} className={cx("flex items-baseline gap-3", i > 0 && "mt-3.5")}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="truncate font-display text-[16.5px] leading-tight text-ink">{x.n}</span>
                          {x.deva && <span className="shrink-0 font-deva text-[13px] text-muted">{x.deva}</span>}
                        </div>
                        <div className="mt-0.5 truncate text-[11px] text-muted">{x.m}</div>
                      </div>
                      <span className="flex shrink-0 items-center gap-2 text-[10.5px] tnum text-[var(--muted-2)]">
                        {luckyNo(x.n)}
                        {x.g === "m"
                          ? <GenderMale size={12} weight="bold" />
                          : <GenderFemale size={12} weight="bold" />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Said plainly rather than padded with invented names. */}
            {shown.some((g) => !g.items.length) && (
              <p className="mt-5 border-t pt-3 text-[10.5px] leading-relaxed text-[var(--muted-2)]"
                style={{ borderColor: "var(--line)" }}>
                Nothing recorded yet for {shown.filter((g) => !g.items.length).map((g) => g.s).join(", ")}.
                A few padas have almost no names in use, and a pandit will offer a
                neighbouring sound.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
