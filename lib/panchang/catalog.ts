// ============================================================================
//  DIVASYA · Panchang — catalog loader (ENGINES.md §3, zero-hardcoding)
//  Maps engine indices → names/attributes from the Supabase reference tables
//  (grahas, rashis, nakshatras, tithis, panchang_yogas, karanas, vaaras,
//  hindu_months, samvatsaras). Cached in-process; falls back to romanized
//  names embedded in the engine so a cold DB never breaks the panchang.
// ============================================================================

import { supabaseAdmin } from "../supabase";
import {
  RASHIS_SA, NAKSHATRAS,
} from "../astro/constants";

export interface PanchangCatalog {
  tithi: { name: string; paksha: string; category: string }[];   // index 0 → tithi 1
  nakshatra: { name: string; name_sa: string; lord: string }[];  // 0..26
  yoga: { name: string; nature: string }[];                      // 0..26
  karana: { name: string; is_vishti: boolean }[];                // 0..10
  vaara: { name_en: string; name_sa: string; name_hi: string }[];// 0..6
  masa: { amanta: string; sa: string }[];                        // 1..12 (index 0 unused)
  samvatsara: string[];                                          // 1..60 (index 0 unused)
  rashi: { name: string; sa: string }[];                         // 0..11
}

let cache: PanchangCatalog | null = null;
let cacheAt = 0;
const TTL = 10 * 60 * 1000; // 10 min

/** Load (and cache) the panchang name catalog from Supabase. Never throws. */
export async function getCatalog(): Promise<PanchangCatalog> {
  if (cache && Date.now() - cacheAt < TTL) return cache;
  try {
    const sb = supabaseAdmin();
    const [tithis, naks, yogas, karanas, vaaras, months, samv, rashis] = await Promise.all([
      sb.from("tithis").select("id,name_en,paksha,category").order("id"),
      sb.from("nakshatras").select("id,name_en,name_sa,lord_graha_id").order("id"),
      sb.from("panchang_yogas").select("id,name_sa,nature").order("id"),
      sb.from("karanas").select("id,name_sa,is_vishti").order("id"),
      sb.from("vaaras").select("id,name_en,name_sa,name_hi").order("id"),
      sb.from("hindu_months").select("id,name_amanta,name_sa").order("id"),
      sb.from("samvatsaras").select("id,name_sa").order("id"),
      sb.from("rashis").select("id,name_en,name_sa").order("id"),
    ]);
    if (!tithis.data?.length || !naks.data?.length) throw new Error("empty catalog");
    const masa = [{ amanta: "", sa: "" }];
    (months.data || []).forEach((m) => (masa[m.id] = { amanta: m.name_amanta, sa: m.name_sa }));
    const samvatsara = [""];
    (samv.data || []).forEach((s) => (samvatsara[s.id] = s.name_sa));
    cache = {
      tithi: (tithis.data || []).map((t) => ({ name: t.name_en, paksha: t.paksha, category: t.category })),
      nakshatra: (naks.data || []).map((n) => ({ name: n.name_en, name_sa: n.name_sa, lord: n.lord_graha_id })),
      yoga: (yogas.data || []).map((y) => ({ name: y.name_sa, nature: y.nature })),
      karana: (karanas.data || []).map((k) => ({ name: k.name_sa, is_vishti: k.is_vishti })),
      vaara: (vaaras.data || []).map((v) => ({ name_en: v.name_en, name_sa: v.name_sa, name_hi: v.name_hi })),
      masa, samvatsara,
      rashi: (rashis.data || []).map((r) => ({ name: r.name_en, sa: r.name_sa })),
    };
    cacheAt = Date.now();
    return cache;
  } catch {
    return fallbackCatalog();
  }
}

/** Embedded fallback so the panchang renders even if Supabase is unreachable. */
function fallbackCatalog(): PanchangCatalog {
  const TN = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima"];
  const YN = ["Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"];
  const KN = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"];
  // Weekday names in all three, not the English one copied across all three
  // fields — the Panchang screen shows the vaara in Sanskrit next to the
  // English date, and it was printing "Wednesday" twice.
  const VN: [string, string, string][] = [
    ["Sunday", "Ravivara", "रविवार"],
    ["Monday", "Somavara", "सोमवार"],
    ["Tuesday", "Mangalavara", "मंगलवार"],
    ["Wednesday", "Budhavara", "बुधवार"],
    ["Thursday", "Guruvara", "गुरुवार"],
    ["Friday", "Shukravara", "शुक्रवार"],
    ["Saturday", "Shanivara", "शनिवार"],
  ];
  const MN = ["", "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada", "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"];
  return {
    tithi: Array.from({ length: 30 }, (_, i) => ({ name: i === 29 ? "Amavasya" : TN[i % 15], paksha: i < 15 ? "shukla" : "krishna", category: "" })),
    nakshatra: NAKSHATRAS.map((n) => ({ name: n, name_sa: n, lord: "" })),
    yoga: YN.map((y) => ({ name: y, nature: "" })),
    karana: KN.map((k, i) => ({ name: k, is_vishti: i === 6 })),
    vaara: VN.map(([en, sa, hi]) => ({ name_en: en, name_sa: sa, name_hi: hi })),
    masa: MN.map((m) => ({ amanta: m, sa: m })),
    samvatsara: [""],
    rashi: RASHIS_SA.map((r) => ({ name: r, sa: r })),
  };
}
