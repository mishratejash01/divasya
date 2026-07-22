"use client";

import { useState } from "react";
import { Ornament } from "../icons";
import { GenderFemale, GenderMale } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { useCatalog, getNakshatraSyllables, getBabyNames } from "@/lib/catalog";
import { NAKSHATRA_SYLLABLES, BABY_NAMES } from "@/lib/demo";

type G = "m" | "f";
function luckyNo(name: string) {
  const map = "abcdefghijklmnopqrstuvwxyz";
  let s = 0;
  for (const c of name.toLowerCase()) { const i = map.indexOf(c); if (i >= 0) s += (i % 9) + 1; }
  while (s > 9) s = String(s).split("").reduce((a, b) => a + +b, 0);
  return s || 1;
}

export function NaamkaranScreen() {
  const { back, haptic } = useApp();
  const nakshatras = useCatalog(getNakshatraSyllables, NAKSHATRA_SYLLABLES);
  const names = useCatalog(getBabyNames, BABY_NAMES);
  const [nakName, setNakName] = useState<string | null>(null);
  const [gender, setGender] = useState<G | "all">("all");

  const nak = nakshatras.find((n) => n.name === nakName) ?? nakshatras[0];
  const syllables = nak?.syl ?? [];

  const list = names.filter((x) => syllables.includes(x.syl) && (gender === "all" || x.g === gender));

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Naamkaran" onBack={back} />

      {/* Nakshatra picker sits bare on the page — a card around a row of chips
          is a box around a box. */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto gutter pt-2 no-scrollbar">
        {nakshatras.map((n) => (
          <button key={n.name} onClick={() => { setNakName(n.name); haptic(8); }}
            className={cx("shrink-0 rounded-[5px] px-2.5 py-1.5 text-[11px]", n.name === nak?.name ? "btn-saffron" : "text-ink")}
            style={n.name === nak?.name ? undefined : { background: "var(--surface-2)" }}>
            {n.name}
          </button>
        ))}
      </div>

      {/* Naamkaran is a prescription: the nakshatra is read and the syllables
          are given. So this is set as the inscription on that page — centred
          between two granth rules, in ink, with room around it — rather than
          as an accent-coloured hero card. Colour was doing the work that
          typography and space should do. */}
      {nak && (
        <div className="gutter pt-5">
          <div className="text-center">
            <div className="text-[11px] text-muted">Names begin with</div>
            <Ornament className="mx-auto mt-2.5 max-w-[260px] text-[var(--bhagwa)]" />
            <div className="flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1 py-3">
              {syllables.map((sy) => (
                <span key={sy} className="font-display text-[30px] leading-none tracking-[-0.02em] text-ink">
                  {sy}
                </span>
              ))}
            </div>
            <Ornament className="mx-auto max-w-[260px] text-[var(--bhagwa)]" />
            <div className="mt-2.5 text-[10.5px] text-muted">
              {nak.name} · {nak.deity} · {nak.planet}
            </div>
          </div>
        </div>
      )}

      {/* Text tabs with a rule under the active one, like the strip on home —
          a filled segmented control is one more coloured box on a page that
          does not need any. */}
      <div className="mt-5 flex gap-5 gutter" style={{ borderBottom: "1px solid var(--line)" }}>
        {([["all", "All", null], ["m", "Boy", "m"], ["f", "Girl", "f"]] as const).map(([g, l, mark]) => {
          const on = gender === g;
          return (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cx(
                "flex items-center gap-1.5 pb-2 text-[12.5px] transition-colors",
                on ? "font-medium text-ink" : "text-muted"
              )}
              style={{ borderBottom: `2px solid ${on ? "var(--ink)" : "transparent"}`, marginBottom: -1 }}
            >
              {mark === "m" && <GenderMale size={13} weight="bold" />}
              {mark === "f" && <GenderFemale size={13} weight="bold" />}
              {l}
            </button>
          );
        })}
        <span className="ml-auto pb-2 text-[10.5px] tnum text-muted">{list.length}</span>
      </div>

      {/* The names as an index, ruled not boxed. A card around each one made
          them read as twelve separate objects rather than one list to scan. */}
      <div className="gutter">
        {list.map((x, i) => (
          <div
            key={x.n}
            className="flex items-center gap-3 py-3"
            style={{ borderTop: i ? "1px solid var(--line)" : undefined }}
          >
            <span className="w-6 shrink-0 text-[10.5px] tnum text-[var(--muted-2)]">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate font-display text-[17px] leading-tight text-ink">{x.n}</span>
                {x.deva && <span className="shrink-0 font-deva text-[14px] text-[var(--bhagwa-deep)]">{x.deva}</span>}
              </div>
              <div className="mt-0.5 truncate text-[11px] text-muted">{x.m}</div>
            </div>
            <span className="flex shrink-0 items-center gap-2.5 text-[10.5px] tnum text-muted">
              {luckyNo(x.n)}
              {x.g === "m"
                ? <GenderMale size={13} weight="bold" />
                : <GenderFemale size={13} weight="bold" />}
            </span>
          </div>
        ))}
        {list.length === 0 && (
          <p className="py-10 text-center text-[11.5px] text-muted">
            No names recorded for these syllables yet.
          </p>
        )}
      </div>
    </div>
  );
}
