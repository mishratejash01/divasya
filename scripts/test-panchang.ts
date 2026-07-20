import { computePanchang } from "../lib/panchang/index";
import { computeMasa } from "../lib/panchang/calendar";
import { getEphemeris } from "../lib/astro/engine";
import { NAKSHATRAS, RASHIS_SA } from "../lib/astro/constants";
import { dateToJd } from "../lib/astro/riseset";

const TZ = "Asia/Kolkata", LAT = 17.385, LON = 78.4867; // Hyderabad
const YOGAS = ["Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"];
const KARANA = ["Bava","Balava","Kaulava","Taitila","Garaja","Vanija","Vishti","Shakuni","Chatushpada","Naga","Kimstughna"];
const MASA = ["","Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada","Ashwina","Kartika","Margashirsha","Pausha","Magha","Phalguna"];
const WD = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const fmt = (d: Date | null) => d ? d.toLocaleString("en-US",{timeZone:TZ,hour:"numeric",minute:"2-digit",hour12:true}) : "—";
const fmtd = (d: Date | null) => d ? d.toLocaleString("en-US",{timeZone:TZ,month:"short",day:"numeric",hour:"numeric",minute:"2-digit",hour12:true}) : "—";
const kIdx = (slot:number)=>{const M=[0,1,2,3,4,5,6];if(slot===0)return 10;if(slot<=56)return M[(slot-1)%7];return slot-50;};

async function run() {
  // TODAY: 2026-07-21, Hyderabad
  const p = await computePanchang(new Date("2026-07-21T06:00:00+05:30"), LAT, LON, TZ);
  console.log(`=== PANCHANG · 2026-07-21 Hyderabad · precision=${p.precision} timingGrade=${p.timingGrade} ===`);
  console.log(`Vaara: ${WD[p.weekday]}  |  Sunrise ${fmt(p.sunrise)}  Sunset ${fmt(p.sunset)}  (day ${p.dayLengthHours.toFixed(2)}h)`);
  console.log(`Moonrise ${fmt(p.moonrise)}  Moonset ${fmt(p.moonset)}`);
  console.log(`Tithi #${p.tithi.current} (${p.tithi.current<=15?"Shukla":"Krishna"} ${((p.tithi.current-1)%15)+1})  ends ${fmtd(p.tithi.segments[0].end)}`);
  console.log(`Nakshatra ${NAKSHATRAS[p.nakshatra.current]}  ends ${fmtd(p.nakshatra.segments[0].end)}`);
  console.log(`Yoga ${YOGAS[p.yoga.current]}  ends ${fmtd(p.yoga.segments[0].end)}`);
  console.log(`Karana ${KARANA[kIdx(p.karana.current)]}  ends ${fmtd(p.karana.segments[0].end)}`);
  console.log(`Masa: ${MASA[p.masa.amantaId]} (amanta)${p.masa.isAdhika?" ADHIKA":""} · ${p.masa.paksha} · Ritu ${p.masa.ritu} · Ayana ${p.masa.ayana}`);
  console.log(`Samvat: Vikram ${p.masa.vikramSamvat}, Shaka ${p.masa.shakaSamvat}, Samvatsara #${p.masa.samvatsaraId}`);
  const rk = p.kaals.find(k=>k.code==="rahu_kaal")!;
  console.log(`Rahu Kaal: ${fmt(rk.start)} – ${fmt(rk.end)}`);
  const ab = p.muhurtas.find(m=>m.code==="abhijit");
  console.log(`Abhijit: ${ab?fmt(ab.start)+" – "+fmt(ab.end):"(none, Wed)"}`);
  console.log(`Choghadiya[0..2]: ${p.choghadiya.slice(0,3).map(c=>`${c.name}(${c.good?"+":"-"}) ${fmt(c.start)}`).join(", ")}`);

  // ADHIKA JYESHTHA 2026 test (Drik: 2026-05-17 → 2026-06-15)
  console.log(`\n=== Adhika Jyeshtha 2026 detection ===`);
  const provider = await getEphemeris();
  const lum = (jd:number)=>provider.luminaries(jd);
  for (const dstr of ["2026-05-20","2026-06-10","2026-06-20"]) {
    const jd = dateToJd(new Date(dstr+"T06:00:00+05:30"));
    const m = computeMasa(lum, jd);
    console.log(`  ${dstr}: ${MASA[m.amantaId]}${m.isAdhika?" ADHIKA":""} ${m.paksha}`);
  }
}
run().catch(e=>{console.error(e);process.exit(1);});
