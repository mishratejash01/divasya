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
