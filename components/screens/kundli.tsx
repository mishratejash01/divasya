"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useApp } from "../app-context";
import { cx } from "../ui";
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
    fetch(`/api/kundli?${q}`).then((r) => r.json()).then((d) => d.error ? setErr(d.error) : setK(d)).catch(() => setErr("Could not compute the chart."));
  }, [profile?.dob, profile?.tob]);

  const d1: Placement[] = k?.chart.placements.map((p) => ({ abbr: p.abbr, sign: p.rasiSign, retro: p.retro, combust: p.combust })) ?? [];
  const d9: Placement[] = k?.chart.placements.map((p) => ({ abbr: p.abbr, sign: p.navamsaSign, retro: p.retro, combust: p.combust })) ?? [];

  return (
    <div className="h-full overflow-y-auto no-scrollbar pb-28 pt-12">
      <div className="flex items-center gap-3 px-5 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-full surface"><ChevronLeft size={18} /></button>
        <div>
          <div className="font-display text-lg leading-tight text-ink">Janma Kundli</div>
          <div className="text-[11px] text-muted">{profile?.name ? `${profile.name}'s birth chart` : "Your birth chart"}</div>
        </div>
      </div>

      {err && <div className="mx-5 mt-6 rounded-2xl surface p-5 text-center text-[13px] text-muted">{err}</div>}
      {!k && !err && <div className="mt-24 text-center text-muted">Casting your chart…</div>}

      {k && (
        <>
          {/* summary strip */}
          <div className="mx-5 mt-1 grid grid-cols-3 gap-2.5">
            {[["Lagna", k.lagna.sign], ["Rashi", k.moon.sign], ["Nakshatra", k.moon.nakshatra]].map(([a, b]) => (
              <div key={a} className="rounded-2xl surface p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted">{a}</div>
                <div className="mt-0.5 text-[14px] text-ink">{b}</div>
              </div>
            ))}
          </div>
          {(k.approximate) && (
            <div className="mx-5 mt-2 text-center text-[11px] text-muted">Birth time unknown : houses & lagna are approximate (noon assumed).</div>
          )}

          {/* the two charts */}
          <div className="mt-5 flex flex-col items-center gap-6 px-3 lg:flex-row lg:justify-center">
            <div className="rounded-3xl card-temple p-4">
              <KundliChart lagnaIndex={k.chart.lagnaIndex} placements={d1} title="Rasi · D1" size={300} />
            </div>
            <div className="rounded-3xl card-temple p-4">
              <KundliChart lagnaIndex={k.chart.navamsaLagnaIndex} placements={d9} title="Navamsa · D9" size={300} />
            </div>
          </div>

          {/* current dasha */}
          <div className="mx-5 mt-5 rounded-2xl card-temple p-4">
            <div className="text-[11px] uppercase tracking-[0.2em] text-gold">Current Mahadasha</div>
            <div className="mt-1 font-display text-[17px] text-ink">{k.currentDasha}</div>
          </div>

          {/* planet table */}
          <div className="px-5 pt-6">
            <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Grahas</h3>
            <div className="overflow-hidden rounded-2xl surface">
              {GRAHA_ORDER.map((id, i) => {
                const g = k.grahas[id];
                if (!g) return null;
                return (
                  <div key={id} className="flex items-center gap-2 px-4 py-2.5 text-[12.5px]"
                    style={{ borderTop: i === 0 ? undefined : "1px solid var(--line)" }}>
                    <span className="w-16 text-ink">{GRAHA_NAME[id]}</span>
                    <span className="w-24 text-muted">{g.sign} {g.deg}°</span>
                    <span className="w-10 text-muted">H{g.house}</span>
                    <span className="flex-1 text-[11px] text-gold">{cap(g.dignity.replace("_", " "))}</span>
                    {g.retrograde && <span className="text-[10px] text-[var(--maroon)]">℞</span>}
                    {g.vargottama && <span className="text-[9px] uppercase tracking-wider text-[var(--good)]">varg</span>}
                    {g.combust && <span className="text-[9px] uppercase tracking-wider text-muted">comb</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* yogas */}
          {k.yogas.length > 0 && (
            <div className="px-5 pt-6">
              <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Yogas in your chart</h3>
              <div className="flex flex-wrap gap-2">
                {k.yogas.map((y) => (
                  <span key={y} className="rounded-full px-3 py-1.5 text-[12px] ring-gold text-ink" style={{ background: "rgba(206,185,118,0.14)" }}>{y}</span>
                ))}
              </div>
            </div>
          )}

          {/* chara karakas + arudha */}
          <div className="px-5 pt-6">
            <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Jaimini Karakas</h3>
            <div className="rounded-2xl surface p-4 text-[12.5px] text-muted">
              <div>Atmakaraka (soul): <span className="text-ink">{cap(k.charaKarakas.AK || "")}</span></div>
              <div className="mt-1">Amatyakaraka (career): <span className="text-ink">{cap(k.charaKarakas.AmK || "")}</span></div>
              <div className="mt-1">Darakaraka (spouse): <span className="text-ink">{cap(k.charaKarakas.DK || "")}</span></div>
              <div className="mt-1">Arudha Lagna (image): <span className="text-ink">{k.arudhaLagna}</span></div>
            </div>
          </div>

          {/* dasha timeline */}
          <div className="px-5 pt-6">
            <h3 className="mb-2 text-[12px] uppercase tracking-[0.18em] text-muted">Vimshottari Mahadasha</h3>
            <div className="overflow-hidden rounded-2xl surface">
              {k.mahadashas.slice(0, 9).map((m, i) => {
                const now = new Date().toISOString().slice(0, 10);
                const active = m.from <= now && now < m.to;
                return (
                  <div key={i} className={cx("flex items-center gap-3 px-4 py-2.5 text-[12.5px]")}
                    style={{ borderTop: i === 0 ? undefined : "1px solid var(--line)", background: active ? "rgba(200,129,49,0.08)" : undefined }}>
                    <span className={cx("w-20", active ? "text-ink font-semibold" : "text-ink")}>{cap(m.lord)}</span>
                    <span className="flex-1 text-muted">{m.from.slice(0, 4)} – {m.to.slice(0, 4)}</span>
                    {active && <span className="rounded-full px-2 py-0.5 text-[10px] btn-saffron">NOW</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-5 pt-5 text-center text-[10px] text-muted">
            Computed with Swiss Ephemeris : Lahiri ayanamsa {k.ayanamsa}° : {k.precision}
          </div>
        </>
      )}
    </div>
  );
}
