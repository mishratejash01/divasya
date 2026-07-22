"use client";

import { useEffect, useState } from "react";
import { CaretLeft } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { KundliChart, Placement } from "../kundli-chart";

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
const GRAHA_NAME: Record<string, string> = { sun: "Sun", moon: "Moon", mars: "Mars", mercury: "Mercury", jupiter: "Jupiter", venus: "Venus", saturn: "Saturn", rahu: "Rahu", ketu: "Ketu" };
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

      {err && <div className="gutter-m mt-2 rounded-2xl surface p-3 text-center text-[11.5px] text-muted">{err}</div>}
      {!k && !err && <div className="mt-24 text-center text-muted">Casting your chart…</div>}

      {k && (
        <>
          {/* summary strip */}
          <div className="gutter pt-2">
            <section className="rounded-2xl surface p-2.5">
              <div className="grid grid-cols-3 gap-2">
                {[["Lagna", k.lagna.sign], ["Rashi", k.moon.sign], ["Nakshatra", k.moon.nakshatra]].map(([a, b]) => (
                  <div key={a} className="min-w-0 rounded-[6px] px-2 py-2" style={{ background: "var(--surface-2)" }}>
                    <div className="eyebrow text-muted">{a}</div>
                    <div className="mt-0.5 truncate text-[12px] text-ink">{b}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          {(k.approximate) && (
            <div className="gutter-m mt-2 text-center text-[10px] text-muted">Birth time unknown : houses & lagna are approximate (noon assumed).</div>
          )}

          {/* the two charts */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-2">Birth chart</h3>
              <div className="flex flex-col items-center gap-4 lg:flex-row lg:justify-center">
                <KundliChart lagnaIndex={k.chart.lagnaIndex} placements={d1} title="Rasi · D1" size={262} />
                <KundliChart lagnaIndex={k.chart.navamsaLagnaIndex} placements={d9} title="Navamsa · D9" size={262} />
              </div>
            </section>
          </div>

          {/* current dasha */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title">Current Mahadasha</h3>
              <div className="mt-1 text-[13px] text-ink">{k.currentDasha}</div>
            </section>
          </div>

          {/* planet table */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-1.5">Grahas</h3>
              <div className="overflow-hidden rounded-[6px]" style={{ background: "var(--surface-2)" }}>
              {GRAHA_ORDER.map((id, i) => {
                const g = k.grahas[id];
                if (!g) return null;
                return (
                  <div key={id} className="flex items-center gap-2 px-4 py-2.5 text-[11px]"
                    style={{ borderTop: i === 0 ? undefined : "1px solid var(--line)" }}>
                    <span className="w-16 text-ink">{GRAHA_NAME[id]}</span>
                    <span className="w-24 text-muted">{g.sign} {g.deg}°</span>
                    <span className="w-10 text-muted">H{g.house}</span>
                    <span className="flex-1 text-[10px] text-gold">{cap(g.dignity.replace("_", " "))}</span>
                    {g.retrograde && <span className="text-[9px] text-[var(--maroon)]">℞</span>}
                    {g.vargottama && <span className="text-[9px] text-[var(--good)]">Varg</span>}
                    {g.combust && <span className="text-[9px] text-muted">Comb</span>}
                  </div>
                );
              })}
              </div>
            </section>
          </div>

          {/* yogas */}
          {k.yogas.length > 0 && (
            <div className="gutter pt-1.5">
              <section className="rounded-2xl surface p-2.5">
                <h3 className="section-title mb-2">Yogas in your chart</h3>
                <div className="flex flex-wrap gap-1.5">
                  {k.yogas.map((y) => (
                    <span key={y} className="rounded-[5px] px-2.5 py-1.5 text-[11px] text-ink" style={{ background: "var(--surface-2)" }}>{y}</span>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* chara karakas + arudha */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-1.5">Jaimini Karakas</h3>
              <div className="rounded-[6px] p-2.5 text-[11px] text-muted" style={{ background: "var(--surface-2)" }}>
              <div>Atmakaraka (soul): <span className="text-ink">{cap(k.charaKarakas.AK || "")}</span></div>
              <div className="mt-1">Amatyakaraka (career): <span className="text-ink">{cap(k.charaKarakas.AmK || "")}</span></div>
              <div className="mt-1">Darakaraka (spouse): <span className="text-ink">{cap(k.charaKarakas.DK || "")}</span></div>
              <div className="mt-1">Arudha Lagna (image): <span className="text-ink">{k.arudhaLagna}</span></div>
              </div>
            </section>
          </div>

          {/* dasha timeline */}
          <div className="gutter pt-1.5">
            <section className="rounded-2xl surface p-2.5">
              <h3 className="section-title mb-1.5">Vimshottari Mahadasha</h3>
              <div className="overflow-hidden rounded-[6px]" style={{ background: "var(--surface-2)" }}>
              {k.mahadashas.slice(0, 9).map((m, i) => {
                const now = new Date().toISOString().slice(0, 10);
                const active = m.from <= now && now < m.to;
                return (
                  <div key={i} className={cx("flex items-center gap-3 px-4 py-2.5 text-[11px]")}
                    style={{ borderTop: i === 0 ? undefined : "1px solid var(--line)", background: active ? "var(--surface-2)" : undefined }}>
                    <span className={cx("w-20", active ? "text-ink font-medium" : "text-ink")}>{cap(m.lord)}</span>
                    <span className="flex-1 text-muted">{m.from.slice(0, 4)} – {m.to.slice(0, 4)}</span>
                    {active && <span className="rounded-full px-2 py-0.5 text-[9px] btn-saffron">Now</span>}
                  </div>
                );
              })}
              </div>
            </section>
          </div>

          <div className="gutter pt-5 text-center text-[9px] text-muted">
            Computed with Swiss Ephemeris : Lahiri ayanamsa {k.ayanamsa}° : {k.precision}
          </div>
        </>
      )}
    </div>
  );
}
