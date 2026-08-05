// Vastu engine validation — the classical cases a real pandit would check
// first. Every assertion is a shastra-known verdict; if any fails, the
// engine's rules (not the test) are wrong.
import {
  ZONES16, ZONE_CYCLE, zone16, entrancePada, padaInfo, bridgeElement,
  roomVerdict, analyzeHome, personalDirections, smoothHeading,
} from "../lib/vastu/index";

let pass = 0, fail = 0;
const ok = (cond: boolean, label: string, detail = "") => {
  if (cond) { pass++; console.log(`  OK  ${label}`); }
  else { fail++; console.log(`  XX  ${label}  ${detail}`); }
};

console.log("=== geometry ===");
ok(zone16(0) === 0 && ZONES16[zone16(0)].code === "N", "0° is N");
ok(ZONES16[zone16(45)].code === "NE", "45° is NE");
ok(ZONES16[zone16(348.75)].code === "N", "348.75° wraps into N");
ok(ZONES16[zone16(337)].code === "NNW", "337° is NNW");
const e = entrancePada(45); // heading-based helper still sane
ok(e.side === "E" && e.num === 1, "45° pada = E1", JSON.stringify(e));

console.log("=== padas (Vastu Purusha Mandala) ===");
ok(padaInfo("E", 4).devta === "Indra" && padaInfo("E", 4).quality === "auspicious", "E4 is Indra, auspicious");
ok(padaInfo("N", 3).devta === "Mukhya" && padaInfo("N", 3).quality === "auspicious", "N3 is Mukhya, auspicious");
ok(padaInfo("W", 8).devta === "Papayakshma" && padaInfo("W", 8).quality === "inauspicious", "W8 is Papayakshma, avoided");
ok(padaInfo("S", 5).devta === "Yama" && padaInfo("S", 5).quality === "inauspicious", "S5 is Yama, avoided");

console.log("=== element cycle ===");
ok(bridgeElement("water", "fire") === "wood", "water controls fire, bridged by wood");
ok(bridgeElement("fire", "metal") === "earth", "fire controls metal, bridged by earth");
ok(bridgeElement("water", "wood") === null, "productive pair needs no bridge");
ok(ZONE_CYCLE[2] === "water" && ZONE_CYCLE[6] === "fire" && ZONE_CYCLE[10] === "earth", "zone wheel anchors (NE water, SE fire, SW earth)");

console.log("=== classical verdicts ===");
const NE = 2, SE = 6, SW = 10, N = 0, WNW = 13;
ok(roomVerdict("toilet", NE).grade === "severe", "toilet in NE = severe dosha", roomVerdict("toilet", NE).grade);
ok(roomVerdict("kitchen", NE).grade === "severe", "kitchen in NE = severe dosha", roomVerdict("kitchen", NE).grade);
ok(roomVerdict("kitchen", SE).grade === "ideal", "kitchen in SE (Agneya) = ideal", roomVerdict("kitchen", SE).grade);
ok(roomVerdict("master_bedroom", SW).grade === "ideal", "master bedroom in SW = ideal", roomVerdict("master_bedroom", SW).grade);
ok(roomVerdict("pooja", NE).grade === "ideal", "pooja in NE (Ishanya) = ideal", roomVerdict("pooja", NE).grade);
ok(roomVerdict("toilet", WNW).grade === "ideal", "toilet in WNW = prescribed", roomVerdict("toilet", WNW).grade);
ok(roomVerdict("safe", N).grade === "ideal", "cash locker in N (Kubera) = ideal", roomVerdict("safe", N).grade);
const sevRemedy = roomVerdict("toilet", NE).remedy ?? "";
ok(sevRemedy.includes("salt"), "toilet dosha remedy includes the salt bowl", sevRemedy);
ok((roomVerdict("kitchen", NE).remedy ?? "").includes("wood"), "kitchen-in-NE remedy bridges with wood");

console.log("=== home score ===");
const good = analyzeHome([
  { room: "entrance", zone: 4 }, { room: "pooja", zone: NE }, { room: "kitchen", zone: SE },
  { room: "master_bedroom", zone: SW }, { room: "toilet", zone: WNW }, { room: "safe", zone: N },
]);
const bad = analyzeHome([
  { room: "entrance", zone: 8 }, { room: "pooja", zone: SE }, { room: "kitchen", zone: NE },
  { room: "master_bedroom", zone: 14 }, { room: "toilet", zone: NE },
]);
ok(good.score >= 90, `textbook home scores high (${good.score})`);
ok(bad.score <= 30, `dosha-ridden home scores low (${bad.score})`);
ok(good.grade === "Excellent" && bad.grade === "Needs attention", `grades: ${good.grade} / ${bad.grade}`);
ok(bad.doshas[0].verdict.grade === "severe", "worst dosha sorts first");

console.log("=== personal disha ===");
const sim = personalDirections("Simha (Leo)");
ok(sim?.lord === "Sun" && sim?.code === "E", "Simha → Sun → East", JSON.stringify(sim));
const mak = personalDirections("Makara");
ok(mak?.lord === "Saturn" && mak?.code === "W", "Makara → Saturn → West");
ok(personalDirections("nonsense") === null && personalDirections(null) === null, "unknown rashi returns null, never throws");

console.log("=== compass smoothing ===");
const s = smoothHeading(359, 1);
ok(s < 2 || s > 358, `359°→1° smooths across north (${s.toFixed(2)}°)`, String(s));
ok(Math.abs(smoothHeading(90, 90) - 90) < 0.001, "steady heading stays put");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
