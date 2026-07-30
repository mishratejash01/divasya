"use client";

import { useEffect, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { KundliChart, Placement } from "../kundli-chart";
import { Planet } from "../planets";

interface KundliData {
  precision: string; timingGrade: boolean; approximate: boolean; ayanamsa: number;
  lagna: { sign: string; signIndex: number; deg: number };
  moon: { sign: string; nakshatra: string; pada: number };
  grahas: Record<string, { sign: string; house: number; deg: number; nakshatra: string; pada: number; dignity: string; retrograde: boolean; combust: boolean; navamsa: string; vargottama: boolean }>;
  chart: { lagnaIndex: number; navamsaLagnaIndex: number; placements: { id: string; abbr: string; deg: number; rasiSign: number; navamsaSign: number; retro: boolean; combust: boolean }[] };
  charaKarakas: Record<string, string>;
  arudhaLagna: string;
  yogas: string[];
  ashtakavarga: { savTotal: number; sav: number[]; bavTotals: Record<string, number> };
  currentDasha: string;
  mahadashas: { lord: string; from: string; to: string }[];
}

const GRAHA_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn", "rahu", "ketu"];
// Each graha with its classical astronomical glyph and a planet-true colour, so
// the table carries a mark for each rather than a bare name. The glyphs are the
// standard Miscellaneous-Symbols code points; the font stack falls through to a
// symbol face that carries them.
const GRAHA: Record<string, { name: string; sym: string; color: string }> = {
  sun:     { name: "Sun",     sym: "☉", color: "#E0761B" },
  moon:    { name: "Moon",    sym: "☽", color: "#6E7C99" },
  mars:    { name: "Mars",    sym: "♂", color: "#C0392B" },
  mercury: { name: "Mercury", sym: "☿", color: "#2E8B57" },
  jupiter: { name: "Jupiter", sym: "♃", color: "#C08A1E" },
  venus:   { name: "Venus",   sym: "♀", color: "#C46B9E" },
  saturn:  { name: "Saturn",  sym: "♄", color: "#3A4668" },
  rahu:    { name: "Rahu",    sym: "☊", color: "#5B4B8A" },
  ketu:    { name: "Ketu",    sym: "☋", color: "#8A5A2B" },
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function KundliScreen() {
  const { back, profile } = useApp();
  const [k, setK] = useState<KundliData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.dob) { setErr("Add your birth date in your profile to see your chart."); return; }
    const q = new URLSearchParams({ dob: profile.dob });
    if (profile.tob) q.set("tob", profile.tob);
    if (profile.birthplace) q.set("place", profile.birthplace);
    fetch(`/api/kundli?${q}`).then((r) => r.json()).then((d) => d.error ? setErr(d.error) : setK(d)).catch(() => setErr("Could not compute the chart."));
  }, [profile?.dob, profile?.tob, profile?.birthplace]);

  const d1: Placement[] = k?.chart.placements.map((p) => ({ abbr: p.abbr, sign: p.rasiSign, retro: p.retro, combust: p.combust })) ?? [];
  const d9: Placement[] = k?.chart.placements.map((p) => ({ abbr: p.abbr, sign: p.navamsaSign, retro: p.retro, combust: p.combust })) ?? [];

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader
        title="Janma Kundli"
        onBack={back}
      />

      {err && <div className="gutter-m mt-2 rounded-2xl border border-[var(--tile-line)] p-3 text-center text-[11.5px] text-muted">{err}</div>}
      {!k && !err && <div className="mt-24 text-center text-muted">Casting your chart…</div>}

      {k && (
        <>
          {/* summary strip — three outlined cells, no card, no peach fill */}
          <div className="gutter pt-3">
            <div className="grid grid-cols-3 gap-2">
              {[["Lagna", k.lagna.sign], ["Rashi", k.moon.sign], ["Nakshatra", k.moon.nakshatra]].map(([a, b]) => (
                <div key={a} className="min-w-0 rounded-[8px] border border-[var(--tile-line)] px-2.5 py-2">
                  <div className="eyebrow text-muted">{a}</div>
                  <div className="mt-0.5 truncate text-[12px] text-ink">{b}</div>
                </div>
              ))}
            </div>
          </div>
          {(k.approximate) && (
            <div className="gutter-m mt-2 text-center text-[10px] text-muted">Birth time unknown : houses & lagna are approximate (noon assumed).</div>
          )}

          {/* the two charts */}
          <div className="gutter pt-4">
            <h3 className="section-title mb-2">Birth chart</h3>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
              <KundliChart lagnaIndex={k.chart.lagnaIndex} placements={d1} title="Rasi · D1" size={262} />
              <KundliChart lagnaIndex={k.chart.navamsaLagnaIndex} placements={d9} title="Navamsa · D9" size={262} />
            </div>
          </div>

          {/* current dasha */}
          <div className="gutter pt-4">
            <h3 className="section-title">Current Mahadasha</h3>
            <div className="mt-1 text-[13px] text-ink">{k.currentDasha}</div>
          </div>

          {/* planet table — bordered card, tinted head, uniform rows, real
              dividers. Every table on the screen is built the same way. */}
          <div className="gutter pt-5">
            <h3 className="section-title mb-2.5 lg:text-[16px]">Grahas</h3>
            <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-[13px]">
                  <thead>
                    <tr className="text-[11.5px] font-semibold text-ink" style={{ background: "var(--surface-2)" }}>
                      <th className="whitespace-nowrap px-3.5 py-2.5">Graha</th>
                      <th className="whitespace-nowrap px-3.5 py-2.5">Sign</th>
                      <th className="whitespace-nowrap px-3.5 py-2.5">House</th>
                      <th className="whitespace-nowrap px-3.5 py-2.5">Nakshatra</th>
                      <th className="whitespace-nowrap px-3.5 py-2.5">Dignity</th>
                      <th className="whitespace-nowrap px-3.5 py-2.5">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRAHA_ORDER.map((id) => {
                      const g = k.grahas[id];
                      if (!g) return null;
                      return (
                        <tr key={id} className="border-t border-[var(--line)]">
                          <td className="whitespace-nowrap px-3.5 py-3">
                            <span className="flex items-center gap-2.5">
                              <Planet id={id} size={22} className="shrink-0" />
                              <span className="font-medium text-ink">{GRAHA[id].name}</span>
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3.5 py-3 tnum text-ink">{g.sign} {g.deg}°</td>
                          <td className="whitespace-nowrap px-3.5 py-3 tnum text-muted">H{g.house}</td>
                          <td className="whitespace-nowrap px-3.5 py-3 text-muted">{g.nakshatra} · {g.pada}</td>
                          <td className="whitespace-nowrap px-3.5 py-3 text-gold">{cap(g.dignity.replace("_", " "))}</td>
                          <td className="px-3.5 py-3">
                            <span className="flex flex-wrap gap-1.5 text-[11px]">
                              {g.retrograde && <span className="text-[var(--maroon)]">℞ Retro</span>}
                              {g.vargottama && <span className="text-[var(--good)]">Vargottama</span>}
                              {g.combust && <span className="text-muted">Combust</span>}
                              {!g.retrograde && !g.vargottama && !g.combust && <span className="text-[var(--muted-2)]">—</span>}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* yogas — same bordered table card, one per row */}
          {k.yogas.length > 0 && (
            <div className="gutter pt-5">
              <h3 className="section-title mb-2.5 lg:text-[16px]">Yogas in your chart</h3>
              <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
                <table className="w-full border-collapse text-left text-[13px]">
                  <tbody>
                    {k.yogas.map((y, i) => (
                      <tr key={y} className={i ? "border-t border-[var(--line)]" : ""}>
                        <td className="px-3.5 py-3 text-ink">{y}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* chara karakas + arudha — two spread columns in the same table card */}
          <div className="gutter pt-5">
            <h3 className="section-title mb-2.5 lg:text-[16px]">Jaimini Karakas</h3>
            <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
              <table className="w-full border-collapse text-left text-[13px]">
                <tbody>
                  {([
                    ["Atmakaraka", "soul", cap(k.charaKarakas.AK || "")],
                    ["Amatyakaraka", "career", cap(k.charaKarakas.AmK || "")],
                    ["Darakaraka", "spouse", cap(k.charaKarakas.DK || "")],
                    ["Arudha Lagna", "image", k.arudhaLagna],
                  ] as const).map(([label, gloss, val], i) => (
                    <tr key={label} className={i ? "border-t border-[var(--line)]" : ""}>
                      <td className="px-3.5 py-3 text-muted">
                        {label} <span className="text-[var(--muted-2)]">· {gloss}</span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-medium text-ink">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* dasha timeline — table, current period tinted and marked */}
          <div className="gutter pt-5">
            <h3 className="section-title mb-2.5 lg:text-[16px]">Vimshottari Mahadasha</h3>
            <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="text-[11.5px] font-semibold text-ink" style={{ background: "var(--surface-2)" }}>
                    <th className="px-3.5 py-2.5">Mahadasha</th>
                    <th className="px-3.5 py-2.5">Period</th>
                    <th className="px-3.5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {k.mahadashas.slice(0, 9).map((m, i) => {
                    const now = new Date().toISOString().slice(0, 10);
                    const active = m.from <= now && now < m.to;
                    return (
                      <tr
                        key={i}
                        className="border-t border-[var(--line)]"
                        style={{ background: active ? "rgba(242,107,15,0.10)" : undefined }}
                      >
                        <td className={cx("px-3.5 py-3", active ? "font-semibold text-ink" : "text-ink")}>{cap(m.lord)}</td>
                        <td className="px-3.5 py-3 tnum text-muted">{m.from.slice(0, 4)} – {m.to.slice(0, 4)}</td>
                        <td className="px-3.5 py-3 text-right">
                          {active && <span className="rounded-full px-2 py-0.5 text-[10px] btn-saffron">Now</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="gutter pt-5 text-center text-[9px] text-muted">
            Computed with Swiss Ephemeris : Lahiri ayanamsa {k.ayanamsa}° : {k.precision}
          </div>
        </>
      )}
    </div>
  );
}
