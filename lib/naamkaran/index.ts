// ============================================================================
//  DIVASYA · Naamkaran (ENGINES.md §2.8)
//  Birth Moon → nakshatra + pada → auspicious starting syllables (Avakahada
//  Chakra), read from the nakshatra_padas Supabase seed. Padas cross rashi
//  borders, so pada uses the absolute sidereal longitude.
// ============================================================================

import { computeChart } from "../astro/engine";
import { birthToUTC, zoneForCoords } from "../astro/time";
import { supabaseAdmin } from "../supabase";
import { NAK, PADA, norm360, NAKSHATRAS } from "../astro/constants";

export interface NaamkaranResult {
  nakshatra: number;
  nakshatraName: string;
  pada: number;
  syllables: { latin: string; devanagari: string };
  precision: string;
}

export async function naamkaran(
  dob: string, tob: string | null, lat: number, lon: number, tz?: string
): Promise<NaamkaranResult> {
  const zone = tz || zoneForCoords(lat, lon);
  const birthUTC = birthToUTC(dob, tob, zone);
  const eph = await computeChart(birthUTC, lat, lon);
  const L = norm360(eph.positions.moon.lon);
  const nak = Math.floor(L / NAK) % 27;
  const pada = (Math.floor(L / PADA) % 4) + 1;

  let latin = "", dev = "";
  try {
    const { data } = await supabaseAdmin()
      .from("nakshatra_padas")
      .select("syllable_latin,syllable_dev")
      .eq("nakshatra_id", nak).eq("pada", pada).maybeSingle();
    if (data) { latin = data.syllable_latin; dev = data.syllable_dev; }
  } catch { /* fallback below */ }

  return {
    nakshatra: nak, nakshatraName: NAKSHATRAS[nak], pada,
    syllables: { latin, devanagari: dev },
    precision: eph.precision,
  };
}
