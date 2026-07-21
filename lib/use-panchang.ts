"use client";

// Client hook: fetches the jyotish-grade panchang from /api/panchang (the engine
// is server-only) with the user's location, refreshing periodically so the
// choghadiya/NOW stays current.

import { useEffect, useState } from "react";

export interface HomePanchang {
  tithiDisplay: string;
  weekday: string;
  weekdayShort: string;
  dateLabel: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string | null;
  masa: string;
  nakshatra: string;
  vrat: string | null;
  active: { name: string; good: boolean; to: string; toISO: string } | null;
  precision?: string;
}

const DEFAULT = { lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" };

export interface ChoghadiyaSlot { name: string; good: boolean; night: boolean; from: string; to: string; active: boolean }
export interface FullPanchang {
  precision: string;
  vaara: { name_en: string; name_sa: string; name_hi: string };
  sun: { rise: string; set: string };
  moon: { rise: string; set: string };
  tithi: { num: number; name: string; paksha: string; endsAt: string | null };
  nakshatra: { index: number; name: string; endsAt: string | null };
  yoga: { name: string; nature: string; endsAt: string | null };
  karana: { name: string; endsAt: string | null };
  masa: { amanta: string; purnimanta: string; isAdhika: boolean; paksha: string; ayana: string };
  samvat: { vikram: number; shaka: number; samvatsara: string };
  kaals: { code: string; from: string; to: string }[];
  choghadiya: ChoghadiyaSlot[];
  home: HomePanchang;
}

/** Full detail panchang for the Panchang screen. */
export function useFullPanchang(coords?: { lat: number; lon: number; tz: string }): { data: FullPanchang | null } {
  const [data, setData] = useState<FullPanchang | null>(null);
  const c = coords || DEFAULT;
  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/panchang?lat=${c.lat}&lon=${c.lon}&tz=${encodeURIComponent(c.tz)}`);
        const d = await r.json();
        if (on && d.tithi) setData(d);
      } catch { /* keep last */ }
    };
    load();
    const id = setInterval(load, 120000);
    return () => { on = false; clearInterval(id); };
  }, [c.lat, c.lon, c.tz]);
  return { data };
}

export function usePanchang(coords?: { lat: number; lon: number; tz: string }): {
  panchang: HomePanchang | null;
  loading: boolean;
} {
  const [panchang, setPanchang] = useState<HomePanchang | null>(null);
  const [loading, setLoading] = useState(true);
  const c = coords || DEFAULT;

  useEffect(() => {
    let on = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/panchang?lat=${c.lat}&lon=${c.lon}&tz=${encodeURIComponent(c.tz)}`);
        const d = await r.json();
        if (on && d.home) setPanchang({ ...d.home, precision: d.precision });
      } catch { /* keep last value */ }
      finally { if (on) setLoading(false); }
    };
    load();
    const id = setInterval(load, 120000); // refresh every 2 min
    return () => { on = false; clearInterval(id); };
  }, [c.lat, c.lon, c.tz]);

  return { panchang, loading };
}
