// Compute Hindu festival dates from our own panchang engine.
// Festivals are defined in the common (purnimanta) naming; krishna-paksha
// festivals are converted to the engine's amanta month (amanta = purnimanta-1).
// The script prints every occurrence in range so the 2026 results can be checked
// against the already-seeded dates before any 2027 date is trusted.
import { computePanchang } from "../lib/panchang/index";

const TZ = "Asia/Kolkata", LAT = 25.3176, LON = 82.9739; // Varanasi

type Paksha = "shukla" | "krishna";
type Kaal = "sunrise" | "madhyahna" | "aparahna" | "pradosh";
type Def = { id: string; pmonth: number; paksha: Paksha; tithi: number; kaal?: Kaal };

// Sample hour (IST) for each observance rule.
const KAAL_HOUR: Record<Kaal, number> = { sunrise: 6.5, madhyahna: 12, aparahna: 15.5, pradosh: 18.5 };

// pmonth: 1=Chaitra .. 12=Phalguna. tithi: 1..15 (15 krishna = amavasya, 15 shukla = purnima)
// kaal defaults to sunrise; the pradosh/madhyahna/aparahna festivals are marked.
const DEFS: Def[] = [
  { id: "vasant-panchami", pmonth: 11, paksha: "shukla", tithi: 5 },
  { id: "maha-shivaratri", pmonth: 12, paksha: "krishna", tithi: 14, kaal: "pradosh" },
  { id: "holika-dahan", pmonth: 12, paksha: "shukla", tithi: 15, kaal: "pradosh" },
  { id: "holi", pmonth: 1, paksha: "krishna", tithi: 1 },
  { id: "ram-navami", pmonth: 1, paksha: "shukla", tithi: 9, kaal: "madhyahna" },
  { id: "hanuman-jayanti", pmonth: 1, paksha: "shukla", tithi: 15 },
  { id: "akshaya-tritiya", pmonth: 2, paksha: "shukla", tithi: 3 },
  { id: "buddha-purnima", pmonth: 2, paksha: "shukla", tithi: 15 },
  { id: "ganga-dussehra", pmonth: 3, paksha: "shukla", tithi: 10 },
  { id: "rath-yatra", pmonth: 4, paksha: "shukla", tithi: 2 },
  { id: "guru-purnima", pmonth: 4, paksha: "shukla", tithi: 15 },
  { id: "hariyali-teej", pmonth: 5, paksha: "shukla", tithi: 3 },
  { id: "nag-panchami", pmonth: 5, paksha: "shukla", tithi: 5 },
  { id: "raksha-bandhan", pmonth: 5, paksha: "shukla", tithi: 15 },
  { id: "janmashtami", pmonth: 6, paksha: "krishna", tithi: 8 },
  { id: "hartalika-teej", pmonth: 6, paksha: "shukla", tithi: 3 },
  { id: "ganesh-chaturthi", pmonth: 6, paksha: "shukla", tithi: 4, kaal: "madhyahna" },
  { id: "anant-chaturdashi", pmonth: 6, paksha: "shukla", tithi: 14 },
  { id: "sharad-navratri", pmonth: 7, paksha: "shukla", tithi: 1 },
  { id: "durga-ashtami", pmonth: 7, paksha: "shukla", tithi: 8 },
  { id: "dussehra", pmonth: 7, paksha: "shukla", tithi: 10, kaal: "aparahna" },
  { id: "sharad-purnima", pmonth: 7, paksha: "shukla", tithi: 15 },
  { id: "karwa-chauth", pmonth: 8, paksha: "krishna", tithi: 4, kaal: "pradosh" },
  { id: "dhanteras", pmonth: 8, paksha: "krishna", tithi: 13, kaal: "pradosh" },
  { id: "diwali", pmonth: 8, paksha: "krishna", tithi: 15, kaal: "pradosh" },
  { id: "govardhan", pmonth: 8, paksha: "shukla", tithi: 1 },
  { id: "bhai-dooj", pmonth: 8, paksha: "shukla", tithi: 2 },
  { id: "chhath", pmonth: 8, paksha: "shukla", tithi: 6 },
  { id: "kartik-purnima", pmonth: 8, paksha: "shukla", tithi: 15 },
  { id: "vivah-panchami", pmonth: 9, paksha: "shukla", tithi: 5 },
  { id: "gita-jayanti", pmonth: 9, paksha: "shukla", tithi: 11 },
];

// Known-correct 2026 dates (from the already-seeded festivals) for self-validation.
const TRUTH_2026: Record<string, string> = {
  "guru-purnima": "2026-07-29", "nag-panchami": "2026-08-17", "raksha-bandhan": "2026-08-28",
  "janmashtami": "2026-09-04", "ganesh-chaturthi": "2026-09-14", "sharad-navratri": "2026-10-11",
  "dussehra": "2026-10-20", "karwa-chauth": "2026-10-29", "dhanteras": "2026-11-06",
  "diwali": "2026-11-08", "bhai-dooj": "2026-11-11", "kartik-purnima": "2026-11-24",
};

const amantaMonth = (pmonth: number, paksha: Paksha) =>
  paksha === "krishna" ? (pmonth === 1 ? 12 : pmonth - 1) : pmonth;

const iso = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

async function run() {
  // For each day, record the (amantaId,paksha,tithiInPaksha) present at each kaal hour.
  const days: { iso: string; at: Record<number, string> }[] = [];
  const start = new Date("2026-07-25T00:00:00+05:30");
  const end = new Date("2027-12-31T00:00:00+05:30");
  const hours = [...new Set(Object.values(KAAL_HOUR))];
  for (let d = new Date(start); d <= end; d = new Date(d.getTime() + 86400000)) {
    const at: Record<number, string> = {};
    for (const h of hours) {
      const dt = new Date(d.getTime() + h * 3600000);
      const p = await computePanchang(dt, LAT, LON, TZ);
      const t = p.tithi.current;
      const paksha: Paksha = t <= 15 ? "shukla" : "krishna";
      at[h] = `${p.masa.amantaId}-${paksha}-${((t - 1) % 15) + 1}`;
    }
    days.push({ iso: iso(d), at });
  }

  const resolve = (def: Def, year: string): string | null => {
    const am = amantaMonth(def.pmonth, def.paksha);
    const key = `${am}-${def.paksha}-${def.tithi}`;
    const h = KAAL_HOUR[def.kaal ?? "sunrise"];
    for (const day of days) if (day.iso.startsWith(year) && day.at[h] === key) return day.iso;
    // Fallback for a kshaya tithi (never present at the kaal on any sunrise):
    // the festival is observed on the day the target tithi ends, i.e. the day
    // just before the sunrise that first shows a later tithi in the same month.
    let prev: string | null = null;
    for (const day of days) {
      if (!day.iso.startsWith(year)) { prev = day.iso; continue; }
      const [m, pk, tp] = day.at[6.5].split("-");
      if (Number(m) === am && pk === def.paksha) {
        if (Number(tp) === def.tithi) return day.iso;
        if (Number(tp) > def.tithi && prev) return prev;
      }
      prev = day.iso;
    }
    return null;
  };

  let pass = 0, fail = 0;
  console.log("=== VALIDATION vs seeded 2026 ===");
  for (const def of DEFS) {
    const truth = TRUTH_2026[def.id];
    if (!truth) continue;
    const got = resolve(def, "2026");
    const ok = got === truth;
    ok ? pass++ : fail++;
    console.log(`  ${ok ? "OK " : "XX "} ${def.id.padEnd(20)} got ${got}  truth ${truth}`);
  }
  console.log(`  ${pass}/${pass + fail} matched\n`);

  console.log("=== 2027 dates ===");
  for (const def of DEFS) console.log(`  ${def.id.padEnd(20)} ${resolve(def, "2027") ?? "NOT FOUND"}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
