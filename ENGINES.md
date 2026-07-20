# Divasya Engine Master Spec

**Status:** Chief-Architect single source of truth · **Version:** 2.1.0 (critique-merged) · **Supersedes:** `lib/astro-core.ts`, `lib/panchang.ts`, `lib/kundli.ts` (all C/D-grade approximations) and the retired Django engine in `/tmp/divasya-build/`.

**Mandate:** jyotish-grade accuracy that matches or beats AstroSage / Drik Panchang / Jagannatha Hora, that **never fails** on Vercel serverless, with **zero hardcoding** — every *derivable* datum computed, every *catalog* datum a Supabase row. Stack of record: Next.js 16.2.9 (App Router) · React 19.2.4 · TypeScript 5 · Tailwind 4 · Supabase Postgres · `@anthropic-ai/sdk` 0.105 (Claude) for the AI Jyotishi.

**Non-negotiable conventions (decided here, once, for the whole platform):**

| Knob | Decision | Configurable? | Why |
|---|---|---|---|
| Ayanamsa | **Lahiri / Chitrapaksha** — pin the exact SE enum (§2.1), default `SE_SIDM_LAHIRI` verified against Drik-published values | yes (`engine_config`) | Matches Drik Panchang, AstroSage, Govt of India panchang |
| Lunar node | **Mean node** default | yes (`mean`\|`true`) | Drik Panchang **and** AstroSage both default to **mean**; classical/traditional Rahu is the mean (always-retrograde) node. `true` exposed as an option; **JHora-parity harness runs use `true`** |
| House system | **Whole Sign** (`'W'`) primary; **Sripati** (`'S'`) for Chalit; **Placidus** (`'P'`) for KP | yes | Classical Parashari default; can never fail mathematically |
| Dasha year | **365.25 days = 31,557,600,000 ms** | yes (`yearLengthDays`) | Interoperability standard (AstroSage/Drik/Parashara Light) |
| Sunrise | **Sun upper limb + refraction, h₀ = −0.8333°**, elevation OFF | yes (Hindu disc-center variant, elevation toggle) | Numerically verified against Drik Panchang 2026-07-21 |
| Time base | **UT Julian Day → `swe_calc_ut`**; ΔT applied by the engine, never by hand | no | Removes a whole class of Drik mismatches |
| Nakshatra span | 360/27 = **13°20′ = 800′** exact | no | Universal |
| Ayanamsa application | **Tier-independent:** a single Lahiri polynomial in `astro_constants` is subtracted uniformly across all four ephemeris tiers | no | Guarantees Tier 1↔4 sidereal longitudes agree to the CI ±1″ assertion even when the underlying tropical engines differ |

> **Node-default reversal (critique A):** an earlier draft defaulted to True node. That is wrong for our own oracles — of AstroSage / Drik / JHora, only JHora ships true-by-default. Because the mandate is to match Drik + AstroSage + Govt panchang, **the default is `mean`**. Every Rahu/Ketu longitude, Kala-Sarpa determination, Vimshottari balance-at-birth, and any nakshatra/pada landing on a node would otherwise disagree with Drik/AstroSage by up to ~1.5°.

Everything below flows from this table. The single switchboard is the `engine_config` Supabase table (§3.1) plus an `engine_version` string that stamps every cache row so a config change invalidates without deletes.

---

## 1. Architecture Overview

### 1.1 The ephemeris foundation — one interface, four tiers, never throws

All astronomy sits behind a single provider interface (`lib/astro/engine.ts → EphemerisProvider`). A resolver walks a fallback chain **once per cold start** and caches the winning provider. Each tier degrades *accuracy*, never *availability* — the last tier is pure TypeScript already in the repo, so the app can physically never fail to return a chart.

| Tier | Package (exact) | Version | Mode | Accuracy | Timing-grade? | Data payload | License |
|---|---|---|---|---|---|---|---|
| **1 (primary)** | **`sweph`** | **2.10.3-7** | `SEFLG_SWIEPH` + bundled `.se1` | Moon/planets **< 0.001″** vs JPL DE431 | ✅ full | `sepl_18.se1` (~484 KB) + `semo_18.se1` (~1.3 MB) + `seas_18.se1` (~220 KB) ≈ **2 MB**, covers 1800–2400 CE | AGPL-3.0 **or** paid LGPL |
| **2 (free fallback)** | `sweph` | 2.10.3-7 | `SEFLG_MOSEPH` | planets < 1″, Moon a few ″ | ✅ full | **none** — SE auto-falls to Moshier if a file is missing | same |
| **3 (edge/ABI escape)** | `swisseph-wasm` | 0.0.5 | Moshier | ~1″ | ✅ full (**pending API verification, below**) | 544 KB wasm, no `.se1` needed | GPL/AGPL |
| **4 (MIT last resort)** | `astronomy-engine` + existing `lib/astro-core.ts` (nodes/lagna) | 2.1.19 | VSOP87/NOVAS | **±1′** planets; Moon ~1–3′ | ❌ **chart-only** | 135 KB min, zero deps | MIT |

**Tier-vs-precision honesty (critique A/B — load-bearing):** §2.2 rejects the ±0.05° Meeus Moon because it drifts ~6 min on tithi end-times. By the same logic, **Tier 4 cannot meet the ±60 s anga / dasha-balance targets** — 1′ of Moon error is minutes of nakshatra travel (worst case ~1.85 h). Therefore:

- **Timing-grade features — panchang anga end-times, muhurta windows, and Vimshottari balance-at-birth — require Tier 1–3.** Moshier (Tier 2/3) is fine (~few arcsec).
- **Tier 4 degrades to chart-only:** it may still place grahas in signs/houses and produce a whole-sign chart, but it **must disable precise anga/muhurta timing and the dasha balance-at-birth precision**, mark those outputs `confidence:"degraded"`, and the AI layer must disclose it. Never present Tier-4 timing at day-level precision.

**`astronomy-engine` (Tier 4) drop-in caveats (critique A):** it returns **tropical** longitudes and has **no lunar-node function** and no ayanamsa. Tier 4 therefore (a) subtracts the shared Lahiri polynomial from `astro_constants` (the tier-independent ayanamsa above), and (b) computes the **mean node** itself via `astro-core.ts`. Because ayanamsa is applied uniformly across tiers, Tier 1↔4 sidereal longitudes still satisfy the ±1″ CI assertion whenever the underlying tropical positions agree.

**Primary rationale:** `sweph` is byte-for-byte the same C core (`pyswisseph 2.10.3.2`) the retired Django app used and that Drik/AstroSage/JHora sit on — the accuracy argument *ends* at Tier 1. It ships **prebuilt binaries** for `linux-x64` glibc (Vercel's runtime), so `node-gyp-build` picks the bundled prebuild with **no compile step** at build or runtime.

**Verify Tier 1 actually wins in production (critique B):** the "no compile / no degrade" claim must be *asserted*, not assumed —
1. Confirm the shipped prebuild targets the correct **Node ABI** for Next 16's Node runtime and the **glibc** (Amazon Linux) path — assert no **musl** path is ever hit.
2. Confirm the 2 MB `.se1` files survive `outputFileTracingIncludes` into the function bundle and the whole function stays under the **250 MB unzipped** limit.
3. Ship a **deploy smoke-test route** that computes one known position and asserts `precision === "swisseph"` — so we catch a silent degrade to Moshier caused by the `.se1` files not being traced.

**Tier 3 API verification (critique B):** several WASM SE ports expose only tropical `calc`. **Before Tier 3 is trusted as the edge/ABI escape, verify `swisseph-wasm@0.0.5` exposes `swe_set_sid_mode(SE_SIDM_LAHIRI)` and node computation.** If it does not, Tier 3 collapses into Tier 4's tropical-only / no-node limitations and must be treated as chart-only or dropped.

**The "never fails" chain in code:**

```
resolve():
  try  Tier1  require('sweph'); swe_set_ephe_path(epheDir)   → if .se1 present, SWIEPH
       Tier2  (same addon) if a file read fails, SE silently returns MOSEPH  ← free, automatic
  catch(addon won't load: exotic platform / ABI mismatch)
       Tier3  await import('swisseph-wasm'); init Moshier  (only if sidereal+node verified)
  catch Tier4  astronomy-engine (bodies, tropical) + astro-core.ts (mean node, lagna)
               + shared Lahiri polynomial → sidereal ; CHART-ONLY, timing disabled
  every result carries precision: "swisseph" | "moshier" | "wasm-moshier" | "astronomy-engine" | "meeus"
  and timingGrade: boolean   // false ⇒ suppress anga/muhurta/dasha-balance precision
```

**Vercel deployment specifics (Next.js 16):**

```ts
// next.config.ts  (extend the existing minimal config)
const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  serverExternalPackages: ['sweph'],                 // do NOT bundle the native addon
  outputFileTracingIncludes: { '/api/**': ['./ephe/**'] }, // ship the ~2 MB .se1 files
};
```
- Every route that touches the engine **must** pin `export const runtime = "nodejs"` — `sweph` will not run on the Edge runtime.
- **Fluid Compute global-state safety — stateless path is the DEFAULT (critique B):** the C library is single-threaded with process-wide state (`swe_set_ephe_path`, `swe_set_sid_mode`), and Fluid Compute runs multiple concurrent requests per instance. A per-request promise-mutex would serialize *every* ephemeris call and become the throughput ceiling. Therefore the default is: **set ephe path + `SE_SIDM_LAHIRI` once at module init; for any request, compute tropical and subtract `swe_get_ayanamsa_ex_ut()` per request** — no global flipping, no lock. Reserve a tiny promise-mutex (set mode → compute → restore) **only** for `swe_houses_ex` sidereal calls that genuinely need the global sidereal mode.

**Licensing — decide before Stage 1 ships (critique F):** SE ≥ 2.10.1 is AGPL-3.0; a closed-source Divasya backend triggers the network clause. Buy the **Swiss Ephemeris Professional Edition (≈CHF 800 one-time, 99-year, closed-source commercial)** — this flips the native `sweph` to LGPL terms. **Confirm the professional grant also covers `swisseph-wasm` (Tier 3), which is a third-party repackage** — if it does not, drop Tier 3 rather than ship an AGPL WASM blob under a closed backend. For Sanatani Vibes Pvt Ltd the fee is a rounding error; do it. If the fee is refused, the only clean *primary* is MIT `astronomy-engine` (accept ±1′, chart-only timing) — never ship the undeclared-license `swisseph-v2`.

### 1.2 How the engines layer on the ephemeris

```
                    ┌─────────────────────────── engine_config (Supabase) ──────────────────────────┐
                    │ ayanamsa · node_type · house_system · sunrise_def · year_days · engine_version │
                    │ vastu_north · config_ttl_sec (§3.1)                                            │
                    └───────────────────────────────────────────────────────────────────────────────┘
                                       │ read at cold start, re-checked on short in-process TTL
 ┌──────────────────────────────────────────────── L0 ────────────────────────────────────────────────┐
 │  EphemerisProvider  (sweph → moshier → wasm → astronomy-engine)  · carries precision + timingGrade    │
 │  positions(jd,bodies,cfg) · houses(jd,lat,lon,cfg) · ayanamsa(jd,kind) · riseSet(jd,body,lat,lon)     │
 └──────────────────────────────────────────────────────────────────────────────────────────────────────┘
        │ sidereal longitudes + speeds        │ lagna/cusps           │ rise/set/transit JD
        ▼                                      ▼                       ▼
 ┌──────────── L1 primitives ────────────────────────────────────────────────────────────────┐
 │ findCrossing() Newton root-finder · sunrise/sunset/moonrise · sankranti · new/full moon      │
 └──────────────────────────────────────────────────────────────────────────────────────────┘
        │                     │                    │                     │
        ▼                     ▼                    ▼                     ▼
   ┌─────────┐          ┌──────────┐         ┌──────────┐          ┌──────────┐
   │ Panchang│          │  Kundli  │         │  Dasha   │          │ Muhurta  │
   │  §2.2   │          │  §2.3    │         │  §2.4    │          │  §2.7    │
   └────┬────┘          └────┬─────┘         └────┬─────┘          └────┬─────┘
        │                    │ chart+vargas+AV    │ dated windows       │ + lagna-shuddhi pass
        │                    ▼                    ▼                     │
        │              ┌──────────┐   ┌──────────────┐  ┌──────────┐    │
        │              │ Matching │   │  Naamkaran   │  │  Vastu   │    │  (Vastu is
        │              │  §2.6    │   │   §2.8       │  │  §2.5    │    │   ephemeris-independent)
        │              └──────────┘   └──────────────┘  └──────────┘    │
        │                    │                                          │
        │                    ▼                                          │
        │              ┌──────────┐                                     │
        │              │  Gochar  │  daily rashifal §2.9                 │
        │              │  §2.9    │  (transit_days × natal Moon)         │
        │              └────┬─────┘                                     │
        └───────────────────┴──────────────────┬────────────────────────┘
                                                ▼
                     ┌───────────────────────────────┐
                     │  AI grounding layer  §4        │  chartSummaryForAI() + dashaContext + transits
                     │  → @anthropic-ai/sdk (Claude)  │
                     └───────────────────────────────┘
```

- **L0** is the only code that talks to Swiss Ephemeris. Every other engine consumes typed L0 results and never re-implements astronomy.
- **L1 primitives** are the shared root-finders (§2.2). Panchang, calendar (sankranti/masa), Muhurta, and Gochar all reuse them.
- Each engine is a **pure, deterministic function** of `(inputs, engine_config, catalog rows)`. Purity is what makes the golden-file CI harness (§5) possible.
- **Time discipline (do first, independent of ephemeris):** birthplace lat/lon → IANA zone via `geo-tz` (polygon-exact successor to the old `timezonefinder`); local civil time → UTC via Luxon/`@date-fns/tz` (historical offsets); only then → UT JD. This alone fixes the three catastrophic server-timezone bugs in the current TS engines (`kundli.ts` builds `new Date` in the server zone; `panchang.ts` uses `date.getDay()` and formats with no `timeZone`).

---

## 2. Engine Specs

Notation used throughout: sidereal ecliptic longitude `L` (0–360, Lahiri); `S(jd)`/`M(jd)` = sidereal Sun/Moon; elongation `E = norm360(M − S)`; `norm360(x) = ((x%360)+360)%360`; sign `s = floor(L/30)` (0 = Mesha); degree-in-sign `d = L mod 30`.

**Geocentric/topocentric discipline (critique B — restated because it is the single biggest silent-error risk):** all five **angas and the lagna use the apparent geocentric Moon/Sun** (what Drik does). **Topocentric (with lunar parallax up to ~1° ≈ ~1.85 h of nakshatra motion) is used only for rise/set/moonrise/moonset.** Do not "helpfully" pass the observer into the anga path.

### 2.1 Ephemeris engine

**Inputs:** `jdUT` (UT Julian Day), body list, `AstroConfig {ayanamsa, nodeType, houseSystem, topocentric?}`.

**Ayanamsa variant — pin exactly, test to the arcsecond (critique B):** `SE_SIDM_LAHIRI` is **not singular** — SE ships `SE_SIDM_LAHIRI`, `SE_SIDM_LAHIRI_1940`, `SE_SIDM_LAHIRI_VP285`, `SE_SIDM_LAHIRI_ICRC`, and sub-arcsec drift between the plain enum and the ICRC/Drik-aligned value has existed historically. **Decision:** pin the enum that reproduces Drik/JHora (Chitra-anchored, Spica at 180°00′; ICRC fixes J2000.0 = **23.853222°** ≈ 23°51′12″, which matches our sanity value; ~24°07′47″ on 2026-01-01). **Read it back via `swe_get_ayanamsa_ex_ut()`** and **add a CI assertion against a Drik-published ayanamsa value for ≥2 dates.** Practical Lahiri sanity: J2000 ≈ 23°51′11″ (23.8531°); mid-2026 ≈ 24°13′; rate ≈ 50.29″/yr. Never hardcode the value — always read it back.

**Computation set:**

| Point | SE body id | Notes |
|---|---|---|
| Sun…Saturn | 0–6 | apparent geocentric; Moon drives all panchang/dasha |
| Rahu | `SE_MEAN_NODE=10` (**default**) / `SE_TRUE_NODE=11` (option) | mean is always retrograde (classical); true briefly goes direct — report engine's sign. Tier 4 computes mean node itself |
| Ketu | computed | `norm360(Rahu + 180)` |
| Uranus/Neptune/Pluto | 7/8/9 | optional tier; excluded from panchang/dasha |
| Lagna + 12 cusps | `swe_houses_ex(jd, SEFLG_SIDEREAL, lat, lon, hsys)` | returns `cusps[1..12]` + `ascmc` (Asc, MC, ARMC, Vertex) |

**Setup:** `swe_set_sid_mode(<pinned Lahiri enum>,0,0)` once at init (see Fluid-Compute note §1.1); per-call flags `SEFLG_SWIEPH | SEFLG_SPEED | SEFLG_SIDEREAL` (or tropical + subtract ayanamsa on the stateless path).

**Derived phenomena (computed, orbs in `astro_constants` Supabase table, never per-chart hardcoded):**
- **Retrograde (vakri):** `lonSpeed < 0`. **Stationary:** `|lonSpeed|` < 10 % of mean daily motion (Me 1.383, Ve 1.2, Ma 0.524, Ju 0.083, Sa 0.033 °/day). Sun/Moon never retrograde.
- **Combustion (asta):** `Δ = wrap180(|L_planet − L_Sun|)` vs classical orbs — Mars 17°, Mercury 14° (12° retro), Jupiter 11°, Venus 10° (8° retro), Saturn 15°. `deeplyCombust` under ⅓ of the orb. **Nodes never combust.** **Moon "combustion" (12° orb) is `bala`-only** — it is the *amavasya-proximity / tithi-bala* factor, **not** the predictive "combust Moon" astrologers apply. Flag it `combust: false, balaProximityToSun: true` so the chart UI never labels a near-new-moon natal Moon "combust" (critique F).
- **Graha yuddha:** two tara grahas (Me,Ve,Ma,Ju,Sa) within **1°**; winner = more northerly apparent latitude. The **"Venus-always-wins" exception is a *named, toggleable* rule-enum**, not canon — the classical Surya-Siddhanta rule is purely northern-latitude-wins; store both `war_rule: 'latitude' | 'latitude_venus_exception'` in `astro_constants` and return both planets, separation, winner, and the rule-enum applied (critique F).

**Rise/set:** `swe_rise_trans` with the configured convention. Default = upper limb + refraction (`h₀ = −0.8333°`) to match Drik's default; `SE_BIT_HINDU_RISING` (= `DISC_CENTER | NO_REFRACTION | GEOCTR_NO_ECL_LAT`) exposed as the "Hindu middle-limb" option; elevation OFF by default. Moon needs topocentric parallax (up to ~1°) — always pass an observer **for rise/set only**.

**TS API:**
```ts
export interface EphemerisProvider {
  readonly precision: Precision;
  readonly timingGrade: boolean;                 // false ⇒ Tier 4 chart-only
  init(): Promise<void>;
  positions(jdUT: number, bodies: Body[], cfg: AstroConfig): Promise<Record<Body, BodyPosition>>;
  houses(jdUT: number, lat: number, lon: number, cfg: AstroConfig): Promise<Houses>;
  ayanamsa(jdUT: number, kind: Ayanamsa): Promise<number>;
  riseSet(jdUT: number, body: Body, lat: number, lon: number,
          opts: { event: "rise"|"set"|"upper_transit"; hindu?: boolean }): Promise<number|null>;
}
export async function getEphemeris(): Promise<EphemerisProvider>;            // resolves the chain once
export async function computePositions(dateUTC: Date, cfg?: Partial<AstroConfig>): Promise<EphemerisResult>;
export async function computeChart(birthUTC: Date, lat: number, lon: number,
                                   cfg?: Partial<AstroConfig>): Promise<EphemerisResult>;
```
`BodyPosition` carries `{lon, tropicalLon, lat, distanceAU, lonSpeed, retrograde, stationary, signIndex, degInSign, nakshatraIndex, pada, combust, balaProximityToSun, inWar}`. `EphemerisResult` carries `{jdUT, jdTT, ayanamsaValue, positions, houses|null, precision, timingGrade}`.

**Accuracy target:** Tier 1/2 planetary longitudes within **±1″** of published Drik/JHora values for golden dates (2000-01-01 12:00 IST + a 2026 date); Tier 3 within ±1″; Tier 4 within ±1′ (chart-only). CI asserts this **and** the pinned-ayanamsa value against Drik so an engine swap can never silently regress.

### 2.2 Panchang engine

**Error budget:** "Tithi till 3:42 PM" to ±1 min needs Moon good to ≈30″; to ±5 s needs ≈2″. Tier 1/2/3 clear both; **the Meeus Moon (±0.05°) drifts ~6 min and is rejected, and Tier 4 is likewise timing-disqualified — panchang requires Tier 1–3** (§1.1). **Angas use the apparent geocentric Moon/Sun (never topocentric).**

**The five angas** (all monotonic increasing → each boundary crossed exactly once):

| Anga | Angle | Divisor | Count | Index |
|---|---|---|---|---|
| Tithi | `E` | 12° | 30 | `floor(E/12)` (1–15 Shukla, 16–30 Krishna) |
| Nakshatra | `M` | 13°20′ | 27 | `floor(M/13.333)`; pada `floor(M/3.333) mod 4 + 1` |
| Yoga | `norm360(S+M)` | 13°20′ | 27 | `floor((S+M)/13.333)` |
| Karana | `E` | 6° | 60→11 names | slot `p=floor(E/6)`: p=0 Kimstughna; 1–56 `[Bava,Balava,Kaulava,Taitila,Garaja,Vanija,Vishti][(p−1)mod7]`; 57 Shakuni, 58 Chatushpada, 59 Naga |
| Vaara | — | — | 7 | weekday of the **sunrise** that opens the panchang day (sunrise→sunrise; if now < today's sunrise, it's the previous civil date's vaara) |

**Core primitive — Newton root-finder** (replaces the old 10-min scan + bisection; ~100× fewer ephemeris calls, sub-second):
```ts
function findCrossing(jdGuess:number, target:number,
                      angle:(jd:number)=>number, rate:(jd:number)=>number):number {
  let jd = jdGuess;
  for (let i=0;i<8;i++){ let diff = norm360(target - angle(jd));
    if (diff>350) diff -= 360;
    const step = diff / rate(jd); jd += step; if (Math.abs(step)<1e-7) break; }
  return jd;
}
// tithi end: target=(k+1)*12, angle=E, rate=vMoon−vSun   nakshatra: target=(n+1)*13.333, rate=vMoon
// yoga: angle=S+M, rate=vMoon+vSun   karana: target=(p+1)*6, rate=vMoon−vSun   (speeds are free via SEFLG_SPEED)
```
Keep a bracketed-bisection fallback if a Newton step ever exits `[jd0, jd0+2]`.

**Day-assignment (Drik-matching):** the day's element = the one prevailing at **local sunrise** (Udaya). Then list every subsequent element whose span intersects sunrise→next-sunrise, with end times. The renderer must handle **0, 1, or 2** transitions per day (kshaya = element starts *and* ends between two sunrises → 2 end-times shown; vriddhi = spans two sunrises → repeats).

**Polar / no-sunrise degradation (critique E):** every D/8, D/12, D/15 window below divides `(sunset−sunrise)`. Above the polar circle there are days with **no sunrise/sunset** → undefined day-length. Specify the graceful fallback: when `riseSet` returns null for the day, fall back to **civil-twilight bounds**, else a **clock-based 06:00→18:00 local** day, mark all derived kaal/muhurta/choghadiya windows `confidence:"low"`, and disclose. The "never fails" guarantee must hold on these real inputs.

**Sun-derived calendar:**
- **Amanta masa** from the Sun's sidereal rashi at the *opening new moon*: `R=floor(S(jd_newmoon)/30)`, `masa = MASA[(R+1) mod 12]`, `MASA[0]=Chaitra`. (The old `calendar.py` "Sun's rashi today" is wrong — drifts around sankranti.)
- **Adhika masa:** `floor(S/30)` identical at both bounding new moons (no sankranti inside) → month is Adhika, prefix + next nija name. **Kshaya masa:** two sankrantis inside one lunation (R jumps by 2) — only near perihelion (Kartika/Margashirsha/Pausha), once in 19–141 yrs. **Verified load-bearing test (critique F): mid-2026 contains Adhika (Purushottam) Jyeshtha — Drik: 2026-05-17 → 2026-06-15, Adhika Purnima 2026-05-31, Adhika Amavasya 2026-06-15.** The current engine mislabels this month; the amanta-masa-from-Sun's-rashi-at-opening-new-moon logic is what gets it right.
- **Purnimanta masa** (North): full-moon→full-moon; Shukla paksha = amanta name, Krishna paksha = *next* amanta name. Show both.
- **Ritu (two flavors):** Vedic = amanta-month pairs (Chaitra+Vaishakha=Vasanta…); Drik = tropical Sun in 60° pairs anchored at sayana Meena. **Ayana:** nirayana Sun in Makara→Mithuna = Uttarayana, else Dakshinayana (optional "drik ayana" flips at solstices).
- **Samvats** increment at computed **Chaitra Shukla Pratipada** (never fixed Gregorian cutoffs): Vikram = CE+57 (56 before), Shaka = CE−78 (79 before). **Samvatsara** (sequential, matches Drik): `southIndex=(shaka+11)%60`, `northIndex=(vikram+9)%60`, 1-indexed into Prabhava…Akshaya (verified Shaka 1948→Parabhava, Vikram 2083→Siddharthi). **Validate the offsets against Drik for ≥5 spread-out years including one near a known South-Indian "expunged"/skip year** before trusting them (critique F) — the 60-samvatsara cycle has a regional skip/reset controversy.

**Muhurtas / kaals — all scale with real day (D=sunset−sunrise) / night (N) length** (with the polar fallback above):
- **Octant kaals** (D/8, 1-indexed part per weekday, verified to the minute vs Drik 2026-07-21): Rahu {Sun 8,Mon 2,Tue 7,Wed 5,Thu 6,Fri 4,Sat 3}; Yamaganda {5,4,3,2,1,7,6}; Gulika {7,6,5,4,3,2,1}. `start = sunrise + (part−1)·D/8`.
- **Muhurta windows** (day muhurta = D/15, night = N/15): Abhijit = 8th day muhurta (omit Wednesday); Vijaya = 11th; Brahma = 14th night muhurta (`sunrise − 2N/15 → sunrise − N/15`); Nishita = solar-midnight ± N/30; Pratah Sandhya = `sunrise − 1.5N/15 → sunrise`; Sayahna = `sunset → sunset + 1.5N/15`; Godhuli ≈ `sunset → sunset + N/30`.
- **Durmuhurta** (per weekday, scaled by D/15 or N/15): Sun[14], Mon[9,12], Tue[4 day; 8 night], Wed[8], Thu[6,12], Fri[4,12], Sat[1,2]. (Old `muhurat.py` "always 1st muhurta" is wrong.)
- **Amrit Kalam & Varjyam — nakshatra-ghati based, NOT weekday** (old weekday version is fabricated, delete it): each nakshatra span = 60 ghatis; `varjyam_start = nak_start + dur·tyajyaGhati[n]/60`, `amrit_start = nak_start + dur·amritGhati[n]/60`, each lasts `dur/15`. Store `tyajya_ghati` + `amrit_ghati` 27-value columns in `nakshatras`. (Verified: Swati tyajya 14 → 02:56 AM; Chitra amrit back-solved to ghati 44.0.)
- **Choghadiya** (D/8, N/8) and **Hora** (D/12, N/12): fixed cyclic order from the weekday lord — the existing `panchang.ts` `CHOG_DAY_START`/`CHOG_NIGHT_START` tables are **verified correct, keep them**; only re-point the sunrise/sunset feed.

**Quality layers / doshas:** Panchak (sidereal Moon 300°–360°, type by vaara); Bhadra/Vishti (from karana engine, harm judged by Bhadravasa — Moon in Karka/Simha/Kumbha/Meena = Prithvi = inauspicious); nitya-yoga malefics (Vyatipata 17 & Vaidhriti 27 full-span, others opening ghatis via `panchang_yogas.malefic_ghatis`); combination yogas (Amrit/Sarvartha/Ravi Siddhi, Dwipushkar/Tripushkar, Ganda Mula) computed by intersecting nakshatra span with vaara from `siddhi_yoga_rules`.

**TS API:**
```ts
export function computePanchang(dateLocal: Date, lat: number, lon: number, tz: string,
                                cfg?: Partial<AstroConfig>): Panchang; // sunrise-anchored, all end-times
```
`Panchang` returns sunrise/sunset/moonrise/moonset, the 5 angas as `{id, start, end}[]` segment arrays, masa (amanta+purnimanta, adhika flag), samvats, samvatsara, ritu, ayana, all kaal/muhurta windows with `isActive`, choghadiya, hora, dosha layers, and a `polarFallback?` disclosure flag.

**Accuracy target:** anga end-times within **±60 s** (Tier 1: ±5 s), rise/set ±60 s, every muhurta window ±60 s vs Drik Panchang, across Delhi/Hyderabad/Chennai/NYC + southern hemisphere; **Adhika Jyeshtha 2026 labelled with the Drik dates above**; polar cases return low-confidence windows without throwing.

### 2.3 Kundli engine (Parashari) + 16 divisional charts

**Inputs:** `{date, time|null, lat, lon, altitude?}` + `ChartOptions {ayanamsa, nodeType, dashaYearDays, aspectsForNodes, houseSecondary}`. `time=null` → noon fallback, `approximate:true`, D-charts/lagna/dasha flagged.

**Houses:** Whole-sign primary — `lagnaSign = floor(Asc/30)`; house `n` = sign `(lagnaSign+n−1)mod12`; planet house `((floor(L/30)−lagnaSign+12)mod12)+1`. Sripati (Chalit, secondary) via Porphyry trisection of Asc→IC arc → bhava madhya, sandhi at circular midpoints; report both `house` (whole-sign, used for all yoga/AV/dignity logic) and `houseChalit`.

**Shodasavarga — the 16 divisional charts (exact BPHS/JHora formulas). Varga lagna = ascendant run through the same formula; varga houses whole-sign from it.** *(All D2–D60 sign formulas re-derived against BPHS and confirmed correct — no changes.)*

| Varga | Part | Index `p` | Resulting sign |
|---|---|---|---|
| D1 Rasi | 30° | — | `s` |
| D2 Hora | 15° | `floor(d/15)` | odd sign: p0→Leo(4), p1→Cancer(3); even: p0→Cancer, p1→Leo — **Parashari (default). Jaimini/alternate hora is a `calc_method` toggle in `varga_charts` (populate the intent; no code change to switch later)** |
| D3 Drekkana | 10° | `floor(d/10)` | `(s+4p)mod12` |
| D4 Chaturthamsa | 7°30′ | `floor(d/7.5)` | `(s+3p)mod12` |
| D7 Saptamsa | 30/7° | `floor(7d/30)` | odd `(s+p)`; even `(s+6+p)` mod12 |
| **D9 Navamsa** | 3°20′ | `floor(3d/10)` | `(9s+p)mod12` ≡ `floor(L/3.333)mod12` |
| D10 Dasamsa | 3° | `floor(d/3)` | odd `(s+p)`; even `(s+8+p)` mod12 |
| D12 Dwadasamsa | 2°30′ | `floor(d/2.5)` | `(s+p)mod12` |
| D16 Shodasamsa | 1°52′30″ | `floor(16d/30)` | start = movable 0/fixed 4/dual 8; `(start+p)mod12` |
| D20 Vimsamsa | 1°30′ | `floor(d/1.5)` | movable 0/fixed 8/dual 4 |
| D24 Siddhamsa | 1°15′ | `floor(4d/5)` | odd from Leo(4); even from Cancer(3) |
| D27 Bhamsa | 1°6′40″ | `floor(9d/10)` | `start=3·(s mod 4)` ≡ `floor(L/(30/27))mod12` |
| **D30 Trimsamsa** | *unequal* | — | odd: Ma 0–5°→Aries, Sa 5–10°→Aqu, Ju 10–18°→Sag, Me 18–25°→Gem, Ve 25–30°→Lib; even mirror: Ve→Tau, Me 5–12°→Vir, Ju 12–20°→Pis, Sa 20–25°→Cap, Ma 25–30°→Sco |
| D40 Khavedamsa | 0°45′ | `floor(4d/3)` | odd from Aries(0); even from Libra(6) |
| D45 Akshavedamsa | 0°40′ | `floor(3d/2)` | movable 0/fixed 4/dual 8 |
| **D60 Shashtiamsa** | 0°30′ | `floor(2d)` | sign `(s+(p mod12))mod12`; **1 min of TOB can shift D60 → emit precision warning when TOB rounded** |

**D60 deity/name mapping — odd/even reversal (critique C):** the *sign* formula above is correct, but the 60 shashtiamsa **deities/names** (`shashtiamsa_names`) are counted **forward in odd signs and in reverse for even signs** per BPHS. The mapping logic must apply the even-sign reversal (`nameIdx = oddSign ? p : 59 − p`) — otherwise every even-sign D60 deity is wrong, and D60 is the headline "1 min shifts this" chart. **Add a golden assertion on an even-sign case.**

Compute **Vargottama** (same sign D1 & D9) per graha and lagna. Varga groupings for Vimshopaka: Shadvarga {D1,D2,D3,D9,D12,D30}, Saptavarga {+D7}, Dashavarga {+D10,D16,D60}, Shodasavarga (all 16).

**Chara Karakas + Arudha Lagna (critique D — added; cheap, deterministic, ubiquitous in JHora):**
- **Chara Karakas (Jaimini 8-karaka scheme):** rank the 7 planets + Rahu by **descending degrees-in-sign** (`d`; Rahu uses `30 − d`) → Atmakaraka, Amatyakaraka, Bhratrikaraka, Matrikaraka, Putrakaraka, Gnatikaraka, Darakaraka (+ the 8th when Rahu is included). Emit `charaKarakas: Record<KarakaRole, GrahaId>`.
- **Arudha Lagna (AL) + the 12 bhava arudhas / graha padas:** for each bhava, count from the bhava to its lord, then the same count onward; standard 1st/7th exception. Emit `arudhas: { lagna: signIndex, bhavas: signIndex[12], grahaPadas: Record<GrahaId, signIndex> }`. AL sharpens the AI "image/wealth" grounding (§4).

**Upagrahas / sub-planets (critique D — added):**
- **Gulika & Mandi longitude** (not just the panchang kaal window): the sidereal longitude of the ascendant rising at the start of the Gulika/Mandi segment of the day-lord's D/8 division.
- **Five Sun-based upagrahas** (all derivable from the Sun's longitude): Dhuma `= S + 133°20′`, Vyatipata `= 360 − Dhuma`, Parivesha `= Vyatipata + 180°`, Indrachapa `= 360 − Parivesha`, Upaketu `= Indrachapa + 16°40′` (≡ `S + 30°`).
- **Note** the day-lord-division upagrahas (Kaala, Mrityu, Artha-Prahara, Yamaghantaka) as a Phase-2 extension. Emit `upagrahas: Record<UpagrahaId, {lon, signIndex, house}>`.

**Ashtakavarga.** BAV benefic-place tables (canon; keep as typed constant + auditable `ashtakavarga_tables` copy) with totals asserted in CI: Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39. `bav[p][sign] = Σ_contrib [((sign−contribSign+12)mod12)+1 ∈ places[p][contrib]]`. **SAV** `= Σ_p bav` per sign, grand total **must = 337**. Phase-2: Trikona/Ekadhipatya shodhana + Shodhya Pinda.

**Planetary states:** exaltation/debilitation/moolatrikona/own (degree table), combustion (§2.1 orbs; Moon proximity is bala-only), retrograde, **panchadha maitri** (naisargika + tatkalika → adhimitra…adhishatru), avasthas (Baladi 5, Jagradadi 3), graha drishti (all 7th; Mars +4/8, Jupiter +5/9, Saturn +3/10; nodes off by default), sputa drishti (fractional, for Drik Bala).

**Shadbala + Bhava Bala** (virupas):
- **Graha Shadbala (7 planets):** Sthana (Uccha+Saptavargaja+Ojayugma+Kendradi+Drekkana) · Dig · Kala (Natonnata+Paksha+Tribhaga+Abda+Masa+Vara+Hora+Ayana+Yuddha) · Cheshta · Naisargika (Sun 60…Saturn 8.57) · Drik. Report `ratio = total/requiredRupas` (Su 6.5, Mo 6.0, Ma 5.0, Me 7.0, Ju 6.5, Ve 5.5, Sa 5.0) as the headline; emit Ishta/Kashta phala. **Vimshopaka** /20 per grouping (weights in spec tables).
- **Bhava Bala (12 houses) — added (critique D):** Bhavadhipati Bala + Bhava Dig Bala + Bhava Drishti Bala, part of the classical Shadbala framework and reported by JHora. Emit `bhavaBala[12]`.
- **Special lagnas (Bhava Lagna, Hora Lagna, Ghati Lagna, Varnada) — noted Phase-2** (§5 Stage 10 / Kundli-extension), computed from sunrise + elapsed time; surface as an optional lens.

**Yoga detection** (`{id, detect(chart)→{present,factors,strength}}`, strength gated by shadbala+dignity so weak yogas are labelled honestly): Pancha Mahapurusha, Gaja Kesari, Raja (kendra-trikona sambandha, DK-adhipati flagged strongest), Dhana, Viparita Raja, Neecha Bhanga, Kemadruma (+bhanga), Chandra-Mangal, Sunapha/Anapha/Durudhura, Vesi/Vosi/Budhaditya, Parivartana, Sakata, Amala, Lakshmi/Saraswati, Kala Sarpa, Guru-Chandala/Grahan/Angarak.

**TS API:**
```ts
export function computeChart(input: ChartInput, opts?: ChartOptions): KundliChart; // pure, deterministic
export function chartSummaryForAI(chart: KundliChart): string;                     // §4 digest
```
`KundliChart` = `{meta{jdUt,tz,ayanamsaDeg,approximate,precision,timingGrade,warnings}, lagna, bhavas[12], grahas[9], upagrahas, charaKarakas, arudhas, ashtakavarga{bav,sav}, shadbala, bhavaBala, vimshopaka, yogas[], dashas, current, panchangaAtBirth}`; each `GrahaState` carries longitude/speed, sign, nakshatra+pada+lord, house, houseChalit, retro/stationary, combust, balaProximityToSun, dignity, vargottama, avastha, and `vargas: Record<VargaId, signIndex>`.

**Accuracy target:** golden-file agreement with JHora + AstroSage for ≥10 charts (1920–2025, both hemispheres, high latitude, a TOB on a varga boundary); assert BAV totals, SAV 337, D9/D30/D60 sign-by-sign, **even-sign D60 deity**, and Chara-Karaka/Arudha-Lagna against JHora.

### 2.4 Dasha engine (Vimshottari + Yogini + Ashtottari, dated-window math)

**Generic nakshatra-dasha core** — all three share one engine:
```
NAK=360/27; nakIndex=floor(moonLon/NAK); frac=(moonLon−nakIndex·NAK)/NAK
YEAR_MS=yearLengthDays·86_400_000              // 31_557_600_000 for 365.25
wheelStart = birthMs − elapsedYears·YEAR_MS     // the key idea: notional MD start BEFORE birth
// every boundary = wheelStart + (exact cumulative fraction)·YEAR_MS
// children of a period length D: for k=0..n−1, lord=lords[(parentIdx+subStartOffset+k)mod n],
//                                len = D·years(child)/totalYears
```
**Reference-calendar discipline (critique B):** all boundaries are computed as `birthInstant ± N×365.25 days` in **UT/TT milliseconds**, then **rendered in the birth IANA zone**, so DST at the *display* end never shifts the stored instant. Balance-at-birth requires a **Tier 1–3 Moon** (§1.1); Tier 4 disables dasha-balance precision. **Pre-1955 births carry ΔT uncertainty** into the Moon longitude → into balance-at-birth → widen the confidence band accordingly.

**Critical fix (bug in both `dasha.py` and `kundli.ts`):** anchor the first MD at `wheelStart`, subdivide the **full** span, then clip children ending before birth — otherwise antardashas near birth are wrong. Also fix `YEAR_MS` (was Gregorian 365.2425) → 365.25, and feed a Swiss-Ephemeris Moon (0.05° error ⇒ Venus-dasha boundary off ~55 days).

**Vimshottari (120y):** sequence `Ketu7→Venus20→Sun6→Moon10→Mars7→Rahu18→Jupiter16→Saturn19→Mercury17`; `lordIndex = nakIndex mod 9`; balance `=(1−frac)·years(L)`. Recurse 5 levels (maha→antar→pratyantar→sookshma→prana), `subStartOffset=0` (children start from parent lord). Exactness: each level length `=(∏ chain years)/120^(n−1)` — sum exact fractions, never `+= len`. Materialize eager to pratyantar (819 nodes); sookshma/prana on demand via `currentDasha()` arithmetic descent, O(depth·9). Carry **sandhi** flags (MD ±30 d, AD ±7 d, PD ±1 d).

**Yogini (36y):** 8 yoginis Mangala/Moon 1 · Pingala/Sun 2 · Dhanya/Jupiter 3 · Bhramari/Mars 4 · Bhadrika/Mercury 5 · Ulka/Saturn 6 · Siddha/Venus 7 · Sankata/Rahu 8. Start `startIdx=(N+2)mod8` (0=Mangala, N 1-based). `subStartOffset=0` default (config for lineages that start from next). Tile ~3 cycles for 100y.

**Ashtottari (108y, conditional):** `Sun6→Moon15→Mars8→Mercury17→Saturn10→Jupiter19→Rahu12→Venus21`; nakshatra→lord counted **from Ardra** in 4/3 groups over **28 nakshatras including Abhijit** (276°40′–280°53′20″); balance uses unequal spans around Abhijit; **`subStartOffset=1`** (antardasha starts from the lord *after* the MD lord). Ship `ashtottariApplicability(chart)→{applicable, reasons[]}` (Rahu in kendra/trikona from lagna-lord; paksha rule) and surface as a secondary lens, never silently applied. Chara + Kalachakra are Phase-2, behind toggles, built against JHora golden vectors.

**TS API:**
```ts
export function dashaTimeline(system: DashaSystem, moonSiderealLonDeg: number,
                              birthUTC: Date, opts?: DashaOptions): DashaPeriod[];
export function currentDasha(system: DashaSystem, moonSiderealLonDeg: number, birthUTC: Date,
                             at?: Date, depth?: 1|2|3|4|5): DashaChain; // {periods, sandhi, confidence}
export function dashaSearch(timeline: DashaPeriod[],
                            q:{lord?:string;level?:number;from?:Date;to?:Date}): DashaPeriod[];
```
`DashaPeriod = {system, level, lord, graha?, start:Date, end:Date, years, children?}` (ms precision — prana windows are ~20 min). Unknown-TOB: compute Moon at 00:00 and 24:00; differing nakshatra index → `confidence:"ambiguous"` (both candidate lords), else `"approx"` with a ± date band. Tier-4 or pre-1955 births widen the band.

**Accuracy target:** MD/AD boundaries within **±1 day** of Drik/AstroSage/JHora for ≥10 charts spanning hemispheres/DST/**a Moon-on-nakshatra-boundary birth and a high-ΔT historical (pre-1955) birth**; unit-invariants: children tile parent exactly, ΣMD years = totalYears, frac→0 gives full balance.

### 2.5 Vastu engine

**Inputs:** device compass heading (or plan + marked north), optional floor-plan polygon + room polygons, lat/lon/date.

**North-reference is an explicit config toggle (critique E):** classical Vastu (gnomon/shadow) is geographic-north based, so **true** is defensible — but **MahaVastu and most modern compass consultants read MAGNETIC north directly**, and the declination delta (India −0.5° to +2.5°) is enough to cross a 22.5° zone boundary near a cusp. Expose `vastu_north: 'true' | 'magnetic'` in `engine_config` (default `magnetic` to match MahaVastu, the seeded rule source); make the choice explicit, never silent.

**Compass → heading:** iOS `webkitCompassHeading` / Android `(360−alpha)%360` gives magnetic. When `vastu_north='true'`, `trueHeading = (mag + declination + 360) % 360`, declination from **NOAA WMM2025** via npm `geomagnetism` at lat/lon/date; when `'magnetic'`, use the raw reading. Quality gate: ~20 samples, circular mean; if σ > 5° prompt figure-8 calibration.

**Zone math (all derived, never stored):**
```ts
const norm=(d:number)=>((d%360)+360)%360;
const zone16=(b:number)=>Math.floor(norm(b+11.25)/22.5)%16;      // 0=N,1=NNE…15=NNW, 22.5° arcs
const entrancePada=(b:number)=>{const i=Math.floor(norm(b+45)/11.25); // 0=N1(Roga)…31=W8
  return {side:"NESW"[Math.floor(i/8)], num:(i%8)+1, index:i};};
```
Sanity: 0°→N5 (Soma, auspicious); 315°→N1 (Roga). **These sanity claims must be pinned to one named source (critique E):** seed `vastu_devatas.entrance_*` and the 32-entrance auspicious/inauspicious table from **one named source (MahaVastu, matching the default `vastu_north`)** — the North-cardinal padas and entrance verdicts differ between MahaVastu and Brihat-Samhita orderings — and add the two sanity checks (0°→N5, 315°→N1) as **CI assertions against that source's published table** so "reproduces MahaVastu exactly" is actually testable. **81-pada Vastu Purusha Mandala** (9×9 Paramasayika, 45 devatas summing to 81; §3 grid) for Brahmasthan check (r4–6×c4–6 must stay open — severity-4 dosha if built over) and devata readings.

**Floor-plan model:** Brahmasthan = polygon centroid (shoelace); a room spans several zones — rasterize (200×200), report per-room zone coverage %, fire a rule against every zone holding ≥20 % (severity weighted by coverage). Missing/extended corners: coverage `= area(plot∩sector)/area(sector)`, <0.66 = missing (SW/NE missing = sev 4).

**Rules engine:** `evaluate(home, rules)` runs placement rules (room_type × zone verdict), element conflicts (Fire↔Water, Earth↔Air escalate +1), entrance-pada lookup, Brahmasthan, shape, slope/water; score `= 100 − Σ(severity×domainWeight)`. **Remedies** are MahaVastu's 4-step ordered options (relocate → element correction → symbol/yantra → structural/consult), every one a Supabase row.

**Ayadi Shadvarga — deferred Phase-3 note (critique E):** classical Vastu dimensions carry the Aya/Vyaya/Yoni/Vara/Nakshatra/Amsha perimeter formulas. Not in current scope, but noted here as a deferred Phase-3 item so it is not "discovered missing" later.

**TS API:** `lib/vastu/{compass.ts, geometry.ts, zones.ts, rules.ts}` — pure functions: `evaluate(home:HomeModel, rules:RuleSet): VastuReport {score, doshas[], zoneMap, padaGrid, northReference}`.

**Accuracy target:** heading within compass hardware limits after the chosen north-reference correction; zone/pada boundaries reproduce the seeded (MahaVastu) tables exactly (deterministic), asserted by the pinned sanity checks.

### 2.6 Matching engine (Ashtakoota 36-guna + South-Indian Poruthams)

**Inputs:** groom + bride Moon `(rashi, nakshatra, pada, degInSign)` + (for Mangal) Lagna/Moon/Venus positions. All 8 kootas are table lookups; only Tara is arithmetic.

| # | Koota | Max | Rule (source table) |
|---|---|---|---|
| 1 | Varna | 1 | rashi→varna rank (Brahmin 4…Shudra 1); 1 if groom≥bride else 0 |
| 2 | Vashya | 2 | half-sign class (needs degree) → 5×5 matrix |
| 3 | Tara | 3 | `count(a→b)=((nak_b−nak_a)mod27)+1; tara=count mod9 (0→9)`; each direction 1.5 if tara∉{3,5,7} |
| 4 | Yoni | 4 | nakshatra→animal(+gender) → 14×14 matrix (7 sworn-enemy 0-pairs) |
| 5 | Graha Maitri | 5 | rashi lords → naisargika relation pair → {5,4,3,1,0.5,0} |
| 6 | Gana | 6 | nakshatra→gana → asymmetric 3×3 (Deva/Manushya/Rakshasa) |
| 7 | Bhakoot | 7 | `d=((rashi_b−rashi_g)mod12)+1`; 7 for {1/1,7/7,3/11,4/10}; 0 for {6/8,5/9,2/12} |
| 8 | Nadi | 8 | nakshatra→nadi; 8 if different, 0 if same (dosha) |

**Verdict bands:** <18 not recommended · 18–24 acceptable · 25–32 very good · 33–36 excellent — with **override flags** when Nadi=0 or Bhakoot=0 regardless of total.

**South-Indian Poruthams / Dasakoota (critique D — added; not part of the 36 gunas, and hard show-stoppers in South-Indian matching for a Hyderabad-based company):** run as a **supplementary porutham block** with its own veto/exception logic —
- **Rajju (hard veto):** nakshatra→Rajju limb (Pada/Kati/Nabhi/Kantha/Siro); **same Rajju = dosha**, severity by limb (Siro/Pada worst). This is a show-stopper independent of guna total.
- **Vedha (hard veto):** nakshatra→Vedha (piercing) pair; a Vedha pair is a strong dosha with named exceptions.
- **Mahendra:** count groom→bride nakshatra ∈ {4,7,10,13,16,19,22,25} → favourable (progeny/wellbeing).
- **Stree-Deergha:** bride→groom nakshatra count > 9 (some schools >13) → favourable.
- (Remaining Dinam/Gana/Mahendra/Stree-Deergha/Yoni/Rasi/Rasyadhipathi/Vasya/Rajju/Vedha comprise the 10 poruthams; seed all in `poruthams`.) Surface the porutham verdict **alongside** the guna total, with Rajju/Vedha able to veto a high-guna match.

**Doshas as ordered rule lists (evaluate in priority):**
- **Nadi dosha exceptions:** same rashi/different nakshatra; same nakshatra/different rashi (junction stars); same nakshatra/different pada; both lords same or Jupiter/Mercury/Venus.
- **Bhakoot cancellation:** same lord; lords mutual friends; Nadi clean & Graha Maitri ≥4.
- **Mangal/Kuja dosha:** Mars in house 1/2/4/7/8/12 from Lagna(40%)/Moon(35%)/Venus(25%), house weights 7&8=1.0, 1&12=0.7, 2&4=0.6 → none/partial/full. Cancellations: Mars own/exalted in dosha house; classical sign-house exceptions (Mesha-1, Vrischika-4, Makara-7, Karka-8, Dhanu-12); both manglik; counterbalance Saturn/Rahu/Sun in other chart; Mars conjunct/aspected by Jupiter or conjunct Moon; Karka/Simha lagna yogakaraka.

**TS API:** `guna_milan(a: MoonProfile, b: MoonProfile): MatchReport {kootas, total, poruthams, doshas[], verdict}` — 8 lookups + Tara arithmetic + porutham block. Every matrix is DB-seeded, so discrepancies vs AstroSage are data patches, not code changes.

**Accuracy target:** per-koota + total match AstroSage free matchmaking for ~30 birth-pairs; Mangal against Drik's calculator; **Rajju/Vedha poruthams against a South-Indian reference (e.g. ProKerala) for ~10 pairs.**

### 2.7 Muhurta finder

**Inputs:** `activity`, `date_range`, lat/lon/tz, optional user janma nakshatra/rashi.

**Two-pass algorithm — elimination then selection (critique D):**

*Pass 1 — panchanga elimination (as before):* for each civil day → sunrise/sunset → root-find exact start/end of every tithi/nakshatra/yoga/karana crossing (§2.2 primitives) → build **constant segments** (slices where all 5 limbs unchanged) → subtract hard-veto windows → score remaining → merge adjacent, clip to ≥48 min (1 muhurta).

**Hard-veto windows:** Rahu/Yamaganda/Gulika octants; Bhadra (Vishti, only when Moon in Mrityu-loka Karka/Simha/Kumbha/Meena) + four sthira karanas; Panchak (Moon 296°40′–360°; veto griha-pravesh/construction, −50 % others); inauspicious yogas (whole Vyatipata 17/Vaidhriti 27, first half Parigha 19, opening ghatis of others); personal Tara bala (tara ∉{3,5,7}) + Chandra bala (Moon-rashi from janma ∉{4,8,12}, 8th = Chandrashtama hardest).

**Bonus layers:** Abhijit (midday, not Wednesday); Sarvartha Siddhi & Amrit Siddhi (vaara+nakshatra, DB); good Choghadiya (Amrit/Shubh/Labh). Suggested weights (in `muhurta_weights` for calibration): nakshatra 30, tithi 20, yoga 15, vaara 10, karana 10, bonus +10, Abhijit +5. Rate factors best=1.0/good=0.7/neutral=0.4/avoid=0/forbidden=veto.

*Pass 2 — lagna shuddhi refinement (the selection half, added):* for the top-N surviving segments, **compute the ascendant chart at each candidate instant** (§2.3 machinery) and score **lagna-shuddhi**: malefics out of houses 1/7/8/10; benefics supporting kendra/trikona; avoid **Papakartari** (malefic hemming) on the lagna; **Ashtama-shuddhi** (8th clean); and for **vivah** the specific muhurta-doshas. Downgrade/veto panchanga-clean windows that fail lagna grounds — otherwise the finder returns windows a real astrologer rejects. Emit per-segment `lagnaShuddhi: {score, flags[]}`.

**Polar fallback:** inherits §2.2 (D/8, D/15 divisions) — mark low-confidence when the day has no sunrise/sunset.

**Activity suitability** (per-activity DB rows — marriage, griha pravesh, vehicle, business, mundan, naamkaran): each with best/good nakshatras, tithi groups (Rikta {4,9,14} barred), vaara, and extra avoid rules (Guru/Shukra asta, Kharmas, Adhika masa, Pitru paksha, Panchak-for-griha-pravesh, Pushya-barred-for-marriage).

**TS API:** `findMuhurta(activity: string, range: {from:Date,to:Date}, place: GeoTz, user?: JanmaProfile): MuhurtaSlot[]` (ranked, each with score + reasons[] + lagnaShuddhi).

**Accuracy target:** returned day lists match Drik's published shubh vivah/griha-pravesh/vehicle dates, **and the lagna-shuddhi pass does not surface windows Drik rejects on lagna grounds.**

### 2.8 Naamkaran engine

**Inputs:** birth date/time/place → sidereal Moon `L`.

**Algorithm:** `nakshatra = floor(L/13.333)+1`, **`pada = floor(L/3.333)%4+1` from absolute longitude** (padas cross rashi borders — e.g. Krittika P1 in Mesha, P2–4 in Vrishabha). Look up the 108-cell **Avakahada Chakra** (`nakshatra_padas.syllable_latin/dev`), then filter `baby_names` by syllable + transliteration variants + gender. Abhijit is never used — Moon nakshatra is always 1 of 27.

**TS API:** `naamkaran(birthUTC: Date, lat: number, lon: number, gender?: string): {nakshatra, pada, syllables: {latin, devanagari, alternates[]}, names: BabyName[]}`.

**Accuracy target:** syllable exactly matches the Avakahada Chakra grid; deterministic.

### 2.9 Gochar / Daily-Rashifal engine (added — critique D)

The app ships a "daily horoscope per rashi" feature, but it previously had **no computed backbone** — it would fall entirely to the AI layer. Spec it as a thin, deterministic layer over `transit_days` × natal (or Moon-sign) so the rashifal is grounded, not vibes.

**Inputs:** `rashi` (Moon sign) or full natal chart, `date`, lat/lon/tz. Reads the day's `transit_days` positions.

**Gochar-phala rule set (all derivable):**
- **Moon transit** house-from-natal-Moon (fast daily driver) → daily mood/theme.
- **Jupiter & Saturn** house-from-Moon (slow context) with the classic transit-phala.
- **Saturn transit specials:** **Sade Sati** (Saturn over 12th/1st/2nd from Moon, three phases), **Dhaiya / Kantaka (Ardhashtama) Shani** (Saturn in 4th/8th from Moon), and **Ashtama Shani** (Saturn in 8th) — all judged against the natal Moon (critique D/F).
- **Current-dasha overlay:** the running Vimshottari MD/AD lord (§2.4) colours the day.
- **Tara bala & Chandra bala of the day** (from janma nakshatra / Moon-rashi).
- **Vedha/argala** refinements optional Phase-2.

**TS API:** `computeGochar(profile: {rashi|chart}, date: Date, place: GeoTz): GocharReport { moonTransitHouse, jupiterHouse, saturnHouse, sadeSati?: {phase}, kantakaShani?: boolean, ashtamaShani?: boolean, dhaiya?: boolean, dashaOverlay, taraBala, chandraBala, factors[] }`. Backed by seeded `gochar_phala_rules` (planet × house-from-Moon → text/weight) and the Saturn/Jupiter transit tables; the AI layer (§4) narrates over it.

**Accuracy target:** Sade Sati / Kantaka / Ashtama / Dhaiya windows match Drik's transit calculator; house-from-Moon transit facts are deterministic.

---

## 3. Backend Data Model (zero-hardcoding)

Three data classes, three treatments: **seed/reference** (migration-written, RLS read-only), **derived-and-cacheable** (engine-computed, keyed by inputs + `engine_version`), **purely ephemeral** (computed per request, never stored). Every seed table carries `id, name_en, name_sa (Devanagari), name_hi, slug, sort_order, is_active, meta jsonb` (omitted below for brevity — only domain columns shown). Every cache row carries `engine_version text + computed_at timestamptz`.

### 3.1 What was hardcoded → now a table

| Hardcoded in… | Now a table |
|---|---|
| `TITHI_NAMES`/`TITHI_ADVICE` | `tithis` (30) |
| `NAKSHATRA_NAMES`/`_LORDS`/`_THEMES` + `nakshatra_syllables` | `nakshatras` (27) + `nakshatra_padas` (108, absorbs `nakshatra_syllables`) |
| `YOGA_NAMES` | `panchang_yogas` (27, +`malefic_ghatis`) |
| `KARANA_MOVABLE/FIXED` | `karanas` (11) |
| `LUNAR_MONTHS_*` | `hindu_months` (12) |
| `RASHIS`/`RASHI_NAMES` | `rashis` (12) |
| `DASHA_PERIODS`/`_SEQUENCE`/`DASHA_SEQ`/`DASHA_YEARS` | `dasha_systems` + `dasha_lords` |
| `DASHA_THEMES` | `dasha_lord_profiles` / `interpretations` |
| muhurat weekday dicts + fixed offsets | `vaaras` (octant parts) + `muhurta_periods` (formula-as-jsonb) |
| combustion orbs, aspect offsets, benefic/malefic, war-rule | `grahas` + `astro_constants` |
| D60 names, yoga descriptions, tyajya/amrit ghatis | `shashtiamsa_names` (+ odd/even reversal), `yoga_definitions`, `nakshatras` columns |
| Ashtakoota matrices | `koota_scores` (+ `yoni_animals`, `taras`) |
| South-Indian poruthams | `poruthams`, `porutham_matrices` |
| gochar / rashifal copy | `gochar_phala_rules` + `interpretations` |
| `HOUSE_THEMES`/`NAKSHATRA_THEMES`/all horoscope copy | `interpretations` |
| `vastu_zones` toy (5 cols) | `vastu_zones16` (16) + `vastu_devatas` (45) + rules/remedies |
| default observer = Hyderabad, en-IN locale | `user_state` / profile + explicit `timeZone` |
| Lahiri ayanamsa polynomial (tier-independent) | `astro_constants.ayanamsa_lahiri` |

**Engine settings — the only switchboard:**
```sql
create table engine_config (key text primary key, value jsonb, updated_at timestamptz default now());
-- ayanamsa='lahiri' (pinned enum), node_type='mean', house_system='W',
-- sunrise_def='upper_limb_refraction', year_days=365.25, engine_version='2.1.0',
-- vastu_north='magnetic', war_rule='latitude_venus_exception',
-- config_ttl_sec=60, panchang_cache_ttl_days=30
create table astro_constants (key text primary key, value jsonb); -- combustion orbs, war rule, aspect sets, ayanamsa_lahiri polynomial
create table geocode_cache (query_norm text primary key, lat numeric(9,6), lon numeric(9,6),
  tz text, display_name text, resolved_at timestamptz, source text);   -- replaces indian_cities.py
```
**Config invalidation (critique F):** "read once per cold start" leaves warm Fluid-Compute instances stale after an admin edits ayanamsa/node-type. Add a short **in-process TTL (`config_ttl_sec`, default 60 s)** or a version-ping, so config changes propagate deterministically across instances rather than "not taking" until recycle.

### 3.2 Seed / reference tables — key domain columns

```sql
grahas(id, swe_id, is_node bool, nature, gender, tattva, guna, karakas text[], own_rashis smallint[],
  exaltation_rashi, exaltation_deg, debilitation_rashi, debilitation_deg,
  moolatrikona_rashi, moolatrikona_from, moolatrikona_to, special_aspects smallint[],
  dasha_years, combustion_orb_deg, weekday, color, gemstone, metal, direction, deity_id)      -- 9
graha_relations(graha_id, other_id, relation)                                                 -- 72
rashis(id, lord_graha_id, tattva, modality, gender, varna, vashya_class, body_part, direction) -- 12
nakshatras(id, lord_graha_id, deity, symbol, gana, yoni_animal_id, yoni_gender, nadi, motivation,
  tattva, guna, is_gandamula bool, tyajya_ghati, amrit_ghati, rajju_limb, vedha_nakshatra_id,
  theme_keywords text[])                                                                       -- 27
nakshatra_padas(nakshatra_id, pada, syllable_latin, syllable_dev, alternates text[],
  translit_variants text[], navamsa_rashi_id, primary key(nakshatra_id,pada))                 -- 108
tithis(id, paksha, deity, category, is_shubha, fasting_tags text[], advice)                    -- 30
panchang_yogas(id, nature, deity, malefic_ghatis)                                              -- 27
karanas(id, kind, is_vishti bool, nature, deity)                                               -- 11
vaaras(id, lord_graha_id, rahu_kaal_part, gulika_part, yamaganda_part, hora_start_graha_id,
  durmuhurta_day smallint[], durmuhurta_night smallint[], chog_day_start, chog_night_start)    -- 7
hindu_months(id, name_amanta, name_purnimanta, solar_name, ritu_vedic)                         -- 12
samvatsaras(id, name_sa, name_hi)                                                              -- 60
dasha_systems(id, code, total_years) ; dasha_lords(system_id, seq_no, graha_id, years)         -- 3 / 25
upagraha_defs(code, method, formula jsonb)                                                      -- Sun-based + day-division upagrahas
astro_constants / astro_orbs                                                                    -- config (incl. ayanamsa_lahiri, war_rule)
-- Matching (Phase 2)
yoni_animals(id, enemy_animal_id) ; taras(id, is_favorable, points_each)                       -- 14 / 9
koota_scores(koota, boy_key, girl_key, points, is_dosha, primary key(koota,boy_key,girl_key))  -- ~272
poruthams(code, name, is_veto bool, favorable_rule jsonb, exceptions jsonb)                     -- 10 (South-Indian)
porutham_matrices(porutham_code, a_key, b_key, verdict, primary key(porutham_code,a_key,b_key))
dosha_rules(id, dosha, rule_type, priority, conditions jsonb, effect jsonb, source)
-- Divisional + natal yogas (Phase 2)
varga_charts(code, divisor, name_sa, signification, calc_method, mapping jsonb)                 -- 16 (Hora calc_method: parashari|jaimini)
shashtiamsa_names(idx, name, nature, reverse_in_even bool)                                      -- 60 (+ odd/even reversal flag)
ashtakavarga_tables(planet, contributor, places smallint[])                                     -- audit copy
yoga_definitions(id, code, category, detection_rule jsonb, strength_notes, cancellation_rule jsonb)
-- Gochar / rashifal (Phase 2)
gochar_phala_rules(planet_id, house_from_moon, phala, weight, special_yoga)                     -- incl. sade-sati/kantaka/ashtama/dhaiya rows
-- Muhurta (Phase 2)
muhurta_periods(code, polarity, calc jsonb)     -- {"type":"day_part","parts":8,"part_col":"rahu_kaal_part"}
choghadiya_sequences(vaara_id, slot, is_day, name, nature)
muhurta_activities(id, code, min_score) ; muhurta_rules(activity_id, element_type, element_id,
  effect, weight, pada_exceptions int[], source)
muhurta_special_yogas(name, weekday, nakshatra_id, kind, excluded_activities text[])
lagna_shuddhi_rules(activity_id, house_from_lagna, planet_class, verdict, weight)               -- Pass-2 selection
inauspicious_period_rules(name, weekday, segment, divisor) ; panchak_types(weekday, name, severity, prohibited text[])
muhurta_weights(activity_id, factor_type, weight)
-- Festivals as rules (Phase 2)
festival_rules(id, festival_key, rule_type, month_id, paksha, tithi_no, nakshatra_id, solar_event,
  anchor_type, observance_rule, is_geo_dependent bool, is_recurring_series bool, regions text[],
  deity_id, description)   -- anchor_type ∈ sunrise|sunset|pradosh_kaal|moonrise|amavasya_at_pradosh
festival_occurrences(festival_rule_id, year, geo_key, civil_date, computed_at, engine_version,
  primary key(festival_rule_id, year, geo_key))   -- geo-keyed for moon/sunset-anchored festivals
-- Vastu (Phase 3)
vastu_zones16(idx 0-15, code, sanskrit_name, dikpala, planet, element, cusp_element, life_area,
  ideal_colors text[], anti_colors text[], imbalance_effects text[], school)                   -- 16
vastu_devatas(id, ring, padas int2[][], pada_count, direction, governs, body_part,
  entrance_code, entrance_auspicious bool, entrance_effect, alt_names text[], source)           -- 45
vastu_placement_rules(id, room_type, zone_code, verdict, severity, reason, source, unique(room_type,zone_code))
vastu_remedies(id, rtype, zone_code, title, description, materials text[], display_order)
vastu_dosha_rules(code, detector jsonb, severity, title, effects text[], remedy_ids text[])
-- Interpretation + remedies (Phase 3)
interpretations(id, scope, subject_key, lang, body, tone, weight, source, version, is_active,
  unique(scope,subject_key,lang,version,weight))                                               -- ~700×2
dasha_lord_profiles(system, lord, themes jsonb, favorable_for text[], caution_for text[], remedies jsonb)
dasha_rules(lagna, graha, functional_role, primary key(lagna,graha))                            -- functional benefic/malefic
remedies(id, target_type, target_key, kind, title, details, mantra_id, gemstone, metal, finger, weekday, caution)
```

**The 81-pada / 45-devata grid** (seed for `vastu_devatas.padas`, North top / West left, r1–r9 = N→S, c1–c9 = W→E): center 3×3 Brahma (9); inner cardinals Bhudhara(N)/Aryaman(E)/Vivasvan(S)/Mitra(W) 6 each (24); inner diagonals Apah+Apavatsa(NE)/Savita+Savitra(SE)/Jaya+Indrajaya(SW)/Rudra+Rudrajaya(NW) 2 each (16); outer border 32 devatas (Brihat Samhita 53.42–44 clockwise from NE) 1 each (32) = 45 devatas, 81 padas. Corners store both names (Shikhi/Isha NE, Anila/Agni SE, Pitarah/Nairriti SW, Roga/Vayu NW). **Seed entrance verdicts from the one named source that matches `vastu_north` (MahaVastu) so the CI sanity checks are testable.**

### 3.3 Derived + cached (never seed, never hardcode)

```sql
user_charts(user_id pk, input_hash, birth_jd, lat, lon, tz, tob_known bool, precision, timing_grade bool,
  d1 jsonb, lagna jsonb, vargas jsonb, upagrahas jsonb, chara_karakas jsonb, arudhas jsonb,
  yogas jsonb, ashtakavarga jsonb, shadbala jsonb, bhava_bala jsonb,
  engine_version, computed_at)                        -- recompute on birth-edit or engine_version bump
user_dashas(user_id, system_id, timeline jsonb, engine_version, computed_at, primary key(user_id,system_id))
panchang_days(civil_date, geo_key, tz, sunrise, sunset, moonrise, moonset, polar_fallback bool,
  tithi_segments jsonb, nakshatra_segments jsonb, yoga_segments jsonb, karana_segments jsonb,
  masa_amanta, masa_purnimanta, is_adhika_masa bool, vikram_samvat, shaka_samvat, samvatsara_id,
  muhurta_windows jsonb, choghadiya jsonb, engine_version, computed_at, primary key(civil_date,geo_key))
transit_days(civil_date pk, positions jsonb, retro_flags jsonb, engine_version, computed_at) -- one global row/day
gochar_reports(user_id, civil_date, report jsonb, engine_version, computed_at, primary key(user_id,civil_date))
match_reports(id, created_by, boy jsonb, girl jsonb, koota_points jsonb, poruthams jsonb, total, doshas text[], verdict, ...)
vastu_assessments(id, user_id, north_reference text, facing_deg, declination_deg, plan jsonb, report jsonb, score, ...)
-- geo_key = lat/lon rounded to 0.25° + tz. Sade Sati = read-time join transit_days × user_charts (do not store).
```
**Refresh jobs (pg_cron / Vercel cron):** nightly compute tomorrow's `transit_days` + `panchang_days` for hot geo_keys; yearly materialize `festival_occurrences` **per geo_key for moon/sunset-anchored festivals** (critique D — Karva Chauth, Sankashti/Ganesh Chaturthi "don't-see-moon", Diwali/Lakshmi-puja Amavasya-at-pradosh with two-evening tie-break resolve to different civil dates in different cities); on `engine_version` bump, lazily recompute `user_charts` on next read (hash check).

### 3.4 RLS + build-priority

**RLS (three tiers):** seed tables → `select to anon,authenticated using(is_active)`, writes service-role only; global caches → select authenticated (anon if page public), writes service-role; user data (`user_charts`, `user_dashas`, `gochar_reports`, `match_reports`, `vastu_assessments`) → `using(auth.uid()=user_id)` all ops.

| Phase | Tables | Unblocks |
|---|---|---|
| **1** | `engine_config`, `astro_constants` (incl. `ayanamsa_lahiri`), `grahas`, `graha_relations`, `rashis`, `nakshatras`, `nakshatra_padas` (fold in `nakshatra_syllables`), `tithis`, `panchang_yogas`, `karanas`, `vaaras`, `hindu_months`, `samvatsaras`, `dasha_systems`+`dasha_lords`, `upagraha_defs`, `geocode_cache`, `user_charts`, `user_dashas`, `panchang_days`, `transit_days` | Panchang, Kundli, Dasha, Naamkaran, AI grounding |
| **2** | `yoni_animals`, `taras`, `koota_scores`, `poruthams`+`porutham_matrices`, `dosha_rules`, `varga_charts`, `shashtiamsa_names`, `ashtakavarga_tables`, `yoga_definitions`, `gochar_phala_rules`, `gochar_reports`, `muhurta_*`, `lagna_shuddhi_rules`, `choghadiya_sequences`, `festival_rules`+`festival_occurrences`, `match_reports` | Matching (+ poruthams), Muhurta (+ lagna shuddhi), divisional charts, gochar rashifal, rule-driven geo festivals |
| **3** | `interpretations`, `dasha_lord_profiles`, `dasha_rules`, `remedies`, `vastu_zones16`+`vastu_devatas`+`vastu_placement_rules`+`vastu_remedies`+`vastu_dosha_rules`+`vastu_assessments`; extend `daily_horoscopes`/`baby_names`/`deities` | Rich readings, remedies, Vastu |

**Migrations on existing 20 tables:** `nakshatra_syllables`→folded into `nakshatra_padas`; `festivals`→display cache regenerated from `festival_rules` (now geo-keyed); `daily_horoscopes`→add `rashi_id`, `sections jsonb`, `transit_context jsonb`, `lang`; `baby_names`→add `nakshatra_id`, `pada`, `rashi_id`, `gender`, `meaning`; `vastu_zones`→migrate then drop for `vastu_zones16`.

---

## 4. AI Grounding — feeding the AI Jyotishi

The Claude chat (`@anthropic-ai/sdk`, `lib/chat.ts`/`lib/prompts.ts`) becomes credible only when the prompt carries **computed facts, not vibes**. The engines emit structured judgment inputs; the model reasons over them.

**Prompt contract — `groundingContext(user, at=now)` assembles:**
1. **`chartSummaryForAI(chart)`** — a prompt-grade digest: lagna + Moon sign/nakshatra/pada, each graha's sign/house/nakshatra/dignity/retro/combust, key yogas (present + strength + cancellation), Ashtakavarga SAV per house, Vimshopaka headline strengths, **Chara Karakas (Atmakaraka…Darakaraka), Arudha Lagna + key bhava arudhas** (image/wealth reading keys off AL), and Gulika/Mandi + Sun-based upagraha placements.
2. **`dashaContext`** — current chain to pratyantar **with dates**, next 3 antardasha windows, each with an `interpretationContext` (all derivable, zero hardcoding):
```ts
{ lord, naturalKarakatvas /* catalog */, housesRuledFromLagna, housePlaced, functionalRole /* dasha_rules */,
  dignity, combust, retrograde, nodeDispositor?, sandhi,
  mdAdRelation:{ natural, mutualPosition, shashtashtaka /* 6/8 */, dwirdwadasha /* 2/12 */ } }
```
3. **Today's transits (gochar §2.9)** — `transit_days` positions joined to the natal chart: **Sade Sati phase, Kantaka (Ardhashtama) Shani, Ashtama Shani, Dhaiya** (Saturn vs natal Moon), Tara bala / Chandra bala for today, gochar house of each planet from natal Moon, current Ashtakavarga kakshya, running-dasha overlay. Panchang of the moment (tithi/nakshatra/yoga/vaara).
4. **Catalog text** — `interpretations`, `dasha_lord_profiles`, `gochar_phala_rules`, `remedies` rows so the model quotes classical themes and offers grounded remedies (mantras from `mantras`, deities from `deities`).

**Timing-answer primitives** the model calls through: `currentDasha()` (with sandhi hedging), `dashaSearch()` ("Venus MD/AD windows next 15y" → marriage timing; "Jupiter AD" → children; "Saturn / 6th-lord periods" → career grind). Answers become *"Saturn is transiting your 8th and you are in Rahu–Ketu until 14 Mar 2027…"* instead of generic blurbs — the differentiator over AstroSage's retrieval-based AI.

**Discipline:** every grounding block is stamped with `precision` (ephemeris tier), `timingGrade`, and `confidence` (TOB known/approx/ambiguous). **Degraded-mode results (Tier 4, unknown TOB, pre-1955 ΔT, polar-fallback panchang) must be disclosed by the model, never presented at day-level precision** — Tier 4 in particular must not offer anga/muhurta/dasha-balance timing. Cache the grounding block per `(user_id, date)` alongside `user_charts` so chat turns are instant.

---

## 5. Build Roadmap

Each stage ships behind the golden-file CI harness (scraped Drik/AstroSage/JHora values + PyJHora as a correctness oracle). "Done" = harness green + the stated acceptance.

| Stage | Scope | "Done" means |
|---|---|---|
| **0 — Time & config foundation** | `geo-tz` + Luxon time pipeline; `engine_config` (+ `config_ttl_sec` invalidation) + `astro_constants` (incl. Lahiri polynomial) tables; `next.config.ts` (`serverExternalPackages`, `outputFileTracingIncludes`); `runtime="nodejs"` on engine routes | Birth local→UTC→JD correct on UTC-server (Vercel); the three server-TZ bugs gone; config read once per cold start **and** refreshed on TTL |
| **1 — Ephemeris core** | `EphemerisProvider` + 4-tier resolver (`sweph`→Moshier→`swisseph-wasm`→`astronomy-engine`+`astro-core.ts`) with `precision`+`timingGrade`; **pinned** Lahiri via `swe_set_sid_mode` + read-back; **mean-node default**; tier-independent ayanamsa subtraction; whole-sign `swe_houses_ex`; combustion/retro/war (named war-rule enum, Moon bala-only); rise/set (Drik convention). **Verify Tier-3 sidereal+node API; verify `sweph` prebuild ABI/glibc + `.se1` tracing; deploy smoke-test asserts `precision==="swisseph"`.** Buy SE Professional (confirm WASM coverage) | Planetary longitudes ±1″ vs Drik/JHora **and pinned ayanamsa ±arcsec vs Drik (≥2 dates)** on Tier 1–3; app returns a chart even when the addon is force-failed (Tier 4 chart-only, timing disabled); `precision`/`timingGrade` surface; production smoke-test confirms Tier 1 wins |
| **2 — Panchang** | Seed Phase-1 catalog tables; `findCrossing` root-finder (**geocentric Moon**); 5 angas with all end-times + kshaya/vriddhi; sunrise/sunset/moonrise/moonset + **polar fallback**; masa (amanta+purnimanta, **adhika/kshaya**); samvats/samvatsara from real Chaitra S1; all kaals/muhurtas/choghadiya/hora; dosha layers; `panchang_days` cache | Anga end-times ±60 s (Tier 1 ±5 s), every muhurta window ±60 s vs Drik across Delhi/Hyderabad/Chennai/NYC + southern hemisphere; **Adhika Jyeshtha 2026 = 2026-05-17→06-15 labelled correctly**; **samvatsara validated ≥5 years incl. a skip year**; polar cases low-confidence, never throw |
| **3 — Kundli** | `computeChart` whole-sign + Sripati; all 16 vargas (§2.3 formulas) + vargottama + **D60 even-sign name reversal**; **Chara Karakas + Arudha Lagna + upagrahas (Gulika/Mandi + 5 Sun-based)**; states (dignity/avastha/aspects); Ashtakavarga (BAV/SAV, totals asserted); Shadbala + **Bhava Bala** + Vimshopaka; yoga detection; `user_charts` cache | BAV totals + SAV 337 + D9/D30/D60 sign-by-sign + **even-sign D60 deity** + **Chara Karakas + AL** match JHora for ≥10 charts (incl. boundary-TOB); TOB-rounded → D60 warning emitted |
| **4 — Dasha** | Generic nakshatra-dasha core (wheel-anchor + exact-fraction boundaries, **UT/TT-ms then IANA render**); Vimshottari 5-level (first-MD bug fixed, 365.25y); Yogini; Ashtottari + applicability; `currentDasha` descent + sandhi; `dashaSearch`; `user_dashas` cache | MD/AD boundaries ±1 day vs AstroSage/Drik/JHora across hemispheres/DST/**boundary-Moon + high-ΔT pre-1955 birth**; children tile parent exactly; Tier-4/pre-1955 widen confidence band |
| **5 — AI grounding** | `chartSummaryForAI` (+ Chara Karakas/AL/upagrahas) + `dashaContext` + transit/Sade-Sati/**Kantaka/Ashtama/Dhaiya**/Tara-bala join; wire into `lib/prompts.ts`; per-user grounding cache; precision/timingGrade/confidence disclosure | Chat cites specific dated windows + real chart facts; degraded modes (Tier 4/unknown-TOB/polar) disclosed; grounding block ≤ one Supabase read |
| **6 — Matching + Naamkaran** | Seed `koota_scores`/`yoni_animals`/`taras`/`dosha_rules`/`poruthams`; `guna_milan` 8-koota + overrides + **South-Indian poruthams (Rajju/Vedha veto, Mahendra, Stree-Deergha)**; Mangal 3-reference; `naamkaran` via `nakshatra_padas`; `match_reports` | Per-koota + total match AstroSage for ~30 pairs; **Rajju/Vedha match a South-Indian reference for ~10 pairs**; syllables match Avakahada Chakra exactly |
| **7 — Muhurta finder** | Seed `muhurta_*` + `lagna_shuddhi_rules`; constant-segment builder over root-found intervals; hard-vetoes + bonus layers + personal bala; **Pass-2 lagna-shuddhi refinement**; ranked slots with reasons | Returned shubh dates match Drik's published vivah/griha-pravesh/vehicle lists; **lagna-shuddhi pass suppresses windows Drik rejects on lagna grounds** |
| **8 — Gochar / daily rashifal** | Seed `gochar_phala_rules`; `computeGochar` over `transit_days` × natal Moon (Moon/Jupiter/Saturn house-from-Moon, Sade Sati/Kantaka/Ashtama/Dhaiya, dasha overlay, Tara/Chandra bala); `gochar_reports` cache | Sade Sati / Kantaka / Ashtama / Dhaiya windows match Drik; house-from-Moon transit facts deterministic |
| **9 — Vastu** | `vastu_zones16` + 45-devata grid + placement/remedy/dosha rules; compass (**`vastu_north` toggle**, WMM2025 declination on `'true'`) → zone/pada; floor-plan raster + Brahmasthan + missing-corner; scoring + remedies; `vastu_assessments` | Zone/pada boundaries reproduce the seeded (MahaVastu) tables exactly; sanity checks (0°→N5, 315°→N1) pass as CI assertions against that named source |
| **10 — Interpretation + festivals + remedies (Phase 3 content)** | Seed `interpretations`/`remedies`/`dasha_lord_profiles`/`dasha_rules`; `festival_rules`→`festival_occurrences` cron (**geo-keyed for moon/sunset-anchored festivals**, `anchor_type` incl. `pradosh_kaal`/`moonrise`); extend `daily_horoscopes` | Rule-generated festival dates match Drik **including city-varying Karva Chauth / Sankashti / Diwali**; every dosha/dasha screen ends in a grounded remedy; Ekadashi smarta/vaishnava split correct |
| **11 — Secondary systems (deferred)** | Chara + Kalachakra dasha against JHora vectors; KP (Placidus sub-lords); **special lagnas (Bhava/Hora/Ghati/Varnada)**; day-division upagrahas; **Vastu Ayadi Shadvarga**; Varshaphal/Tajaka; eclipse detection | Behind toggles; golden-vector parity with JHora |

**Cross-cutting invariants enforced in CI at every stage:** zero hardcoding (every catalog datum a row, every derivable computed); `engine_version` stamps every cache; the ephemeris resolver never throws (Tier 4 is pure TS in-repo) **and never presents Tier-4 timing at day-level precision**; all display uses explicit IANA `timeZone`; purity of engine functions (same inputs+config+rows → identical output) so golden files are stable; **geocentric Moon for angas/lagna, topocentric only for rise/set**.

**Validation-as-marketing (build the harness as a public page):** a live accuracy page comparing Divasya panchang/chart output to Drik/JHora for any date-city, powered by the same golden-file oracle — "jyotish-grade, verifiably."

---

# Appendix: Critique Notes

Verified enough to write. Here is my review — returned as the deliverable.

---

# Skeptical Principal-Engineer + Jyotish Review — Divasya Engine Master Spec v2.0.0

Overall: the spec is unusually strong (the L0 provider-chain, root-finder panchang, wheel-anchored dasha, and zero-hardcoding data model are all correct instincts). The divisional-chart formulas are **almost all correct** (I re-derived D2/D3/D4/D7/D9/D10/D12/D16/D20/D24/D27/D30/D40/D45/D60 against BPHS — see below). But there is one **factually wrong non-negotiable**, several under-specified precision traps that will silently miss the ±60 s / ±1″ targets, and a set of dropped classical features a "world-class / beats-JHora" product is expected to have. Concrete list:

## A. WRONG (fix before Stage 1 freezes the conventions)

- **True-node default is wrong for your own oracle.** The spec makes True node the platform default and justifies it as "Matches JHora + Drik Panchang." Drik Panchang **defaults to Mean node**, not true ([drikpanchang settings; mean-vs-true writeups](https://www.anahitarao.com/rahu-ketu-using-mean-node-vs-true-node/)). AstroSage also defaults to mean. The classical/traditional Rahu *is* the mean node (always retrograde, smooth). Of your three oracles only JHora ships true-by-default. Since the stated mandate is "match/beat AstroSage + Drik + JHora" and Indian govt panchang tradition, **the default must be `mean`**, with `true` exposed as the option — i.e. the exact inverse of what the table says. As written, every Rahu/Ketu, every Kala-Sarpa determination, every Vimshottari balance-at-birth, and every nakshatra/pada on a node will disagree with Drik and AstroSage by up to ~1.5° / a sub-boundary. The spec's own line "AstroSage parity runs use mean in the harness" is a tell that the default is backwards.

- **Tier-4 accuracy claim contradicts the panchang error budget.** §2.2 explicitly rejects the ±0.05° Meeus Moon (drifts ~6 min on tithi end-times), yet §1.1 lists Tier 4 (`astronomy-engine` + `astro-core.ts`) at "±1′" and the accuracy targets imply panchang works on all tiers. `astronomy-engine`'s Moon is ~1′ and your in-repo `astro-core.ts` Moon is ~3′ — **neither can meet the ±60 s anga target** (1′ of Moon ≈ ~1.85 h of nakshatra travel error is the worst case; even nominal is minutes). State plainly: **panchang/muhurta/dasha-balance require Tier 1–3 (Moshier is fine, ~few arcsec); Tier 4 degrades to chart-only and must disable precise timing and disclose it.** Right now the matrix reads as if Tier 4 is universally ±1′.

- **`astronomy-engine` cannot supply sidereal or the node.** Tier 4 is listed as if it drops in. `astronomy-engine` returns **tropical** ecliptic longitudes and has **no lunar-node function** and no ayanamsa. You must (a) subtract Lahiri from a single shared ayanamsa polynomial in `astro_constants`, and (b) compute the mean node yourself. Make ayanamsa a **tier-independent** computation applied uniformly, or Tier 1↔4 sidereal longitudes won't agree to the ±1″ CI assertion even when the underlying tropical positions do.

## B. UNDER-SPECIFIED precision traps (will silently miss targets)

- **Geocentric vs topocentric Moon is never pinned for the angas — this is the single biggest panchang risk.** Tithi/nakshatra/yoga/karana must use the **apparent geocentric** Moon (what Drik does). Lunar topocentric parallax is up to ~1° ≈ ~1.85 h of nakshatra motion. §2.1 correctly says "apparent geocentric" for bodies and "topocentric for rise/set," but §2.2 never restates it, and it's the kind of thing that gets "fixed" by someone passing the observer everywhere. **Explicitly: geocentric for all five angas and the lagna; topocentric (with parallax) only for rise/set/moonrise.**

- **Lahiri has multiple SE variants — pin one and test to the arcsecond.** `SE_SIDM_LAHIRI` is not singular: Swiss Ephemeris ships `SE_SIDM_LAHIRI`, `SE_SIDM_LAHIRI_1940`, `SE_SIDM_LAHIRI_VP285`, `SE_SIDM_LAHIRI_ICRC`. The ICRC standard fixes J2000.0 = **23.853222°** (≈23°51′12″; matches your sanity value) and Drik/JHora align with the Chitra-anchored value (Spica at 180°00′), ~24°07′47″ on 2026-01-01 ([SE sidereal docs](https://www.astro.com/swisseph/swisseph.htm); [JHora Lahiri 2026 reference](https://jagannathhora.com/lahiri-ayanamsa-value/)). Sub-arcsec drift between the plain `SE_SIDM_LAHIRI` and the ICRC/Drik value has existed historically. **Decide the exact enum, read it back via `swe_get_ayanamsa_ex_ut`, and add a CI assertion against a Drik-published ayanamsa value for ≥2 dates** — don't assume "Lahiri = Lahiri."

- **Fluid Compute concurrency: make the stateless path the default, not the fallback.** The spec floats "promise-mutex OR compute-tropical-and-subtract." Under Fluid Compute (multiple concurrent requests per instance sharing process-global `swe_set_sid_mode`), the mutex serializes *every* ephemeris call and becomes your throughput ceiling. **Default to: set Lahiri once at init, compute tropical + subtract `swe_get_ayanamsa_ex_ut()` per request for any non-default ayanamsa** — no global flipping, no lock. Reserve the mutex only for `swe_houses_ex` sidereal calls that truly need the global mode.

- **Verify the `sweph` prebuild actually matches Vercel's runtime.** The "no compile" claim hinges on a `linux-x64` **glibc** prebuild resolving via `node-gyp-build`. Vercel Node functions run Amazon Linux (glibc) — likely fine — but (1) confirm the shipped prebuild targets the right Node ABI for Next 16's runtime, (2) confirm no **musl** path is hit, and (3) confirm the 2 MB `.se1` files survive `outputFileTracingIncludes` into the function bundle and stay under the 250 MB unzipped limit. Add a deploy smoke-test route asserting `precision === "swisseph"` (not silently degraded to Moshier because the `.se1` files didn't get traced). The current spec asserts the *chain* works but not that **Tier 1 actually wins in production**.

- **`swisseph-wasm` (Tier 3) API must be verified to do sidereal + node.** Several WASM SE ports expose only tropical `calc`. Confirm 0.0.5 exposes `swe_set_sid_mode(SE_SIDM_LAHIRI)` and node computation before you count on it as the "edge/ABI escape." If it doesn't, Tier 3 collapses into Tier 4's problems.

- **Dasha date arithmetic is right in structure but needs the reference calendar nailed.** 365.25-day years + wheel-anchor + exact-fraction cumulative boundaries is correct and the "clip children before birth" fix is the real bug in `dasha.py`/`kundli.ts`. Two additions: (1) pre-1955 births carry ΔT uncertainty into the Moon longitude → into balance-at-birth — note it in the confidence band; (2) state that boundaries are computed as `birthInstant ± N×365.25 days` in **UT/TT ms then rendered in the birth IANA zone**, so DST at the *display* end never shifts the stored instant. Your ±1-day target is fine, but the golden harness must include a Moon-on-nakshatra-boundary birth (already listed) *and* a high-ΔT historical birth.

## C. Divisional-chart formulas — verified, with one real gap

- **D2–D60 sign formulas are correct.** I re-derived each against BPHS: D9 `(9s+p)`, D10 odd `(s+p)`/even `(s+8+p)`, D7 odd `(s+p)`/even `(s+6+p)`, D3 `(s+4p)`, D4 `(s+3p)`, D12 `(s+p)`, D30 unequal 5/5/8/7/5 with the even-sign mirror, D60 `(s+floor(2d))mod12`, and the movable/fixed/dual start-sign vargas (D16/D20/D24/D27/D40/D45) all check out. The `floor(L/3.333)` shortcut for D9 and `3·(s mod 4)` for D27 are both valid. **No correction needed here** — good work.

- **D60 name/deity mapping is missing the odd/even reversal.** The *sign* formula is right, but the 60 shashtiamsa **deities/names** (`shashtiamsa_names`) are counted **forward in odd signs and in reverse for even signs** per BPHS. The spec stores a flat `shashtiamsa_names(idx, name, nature)` with no even-sign reversal rule → every even-sign D60 deity will be wrong (and D60 is your headline "1 min of TOB shifts this" chart). Add the reversal to the mapping logic and a golden assertion on an even-sign case.

- **Hora (D2) — note the two schools.** You've implemented Parashari (Sun/Moon = Leo/Cancer). Fine as default, but JHora and many report the alternate/Jaimini hora too; flag it as `calc_method` in `varga_charts` so a future toggle doesn't require a code change (your data model already has the column — just populate the intent).

## D. MISSING classical features (a "beats-JHora" chart is expected to have these)

- **Chara Karakas + Arudha Lagna are absent from the Kundli engine.** Atmakaraka/Amatyakaraka/…/Darakaraka (8-karaka Jaimini scheme, by descending degrees-in-sign) and **Arudha Lagna (AL) + the 12 bhava arudhas / graha padas** are cheap, deterministic, and *ubiquitous* in JHora and modern practice. Their absence is conspicuous for a world-class chart. Add both to `KundliChart` (they also sharpen the AI grounding — AL is what a lot of "image/wealth" reading keys off).

- **Upagrahas / sub-planets are missing as chart points.** You compute Gulika *kaal* (a time window) for panchang but never Gulika/Mandi **longitude** for the natal chart, and none of the Sun-derived upagrahas (Dhuma, Vyatipata, Parivesha, Indrachapa, Upaketu) nor the day-lord-division upagrahas (Kaala, Mrityu, Artha-Prahara, Yamaghantaka). All are derivable (zero-hardcoding-clean) and heavily used in South-Indian and predictive work. Add at least Gulika/Mandi longitude + the five Sun-based upagrahas.

- **Special lagnas (Bhava/Hora/Ghati Lagna) and Bhava Bala are dropped.** JHora reports Bhava Lagna, Hora Lagna, Ghati Lagna, Varnada, and **Bhava Bala** (house strength) alongside the 7-planet Shadbala. You spec Shadbala for grahas only. At minimum add Bhava Bala (it's part of the classical Shadbala framework) and note the special lagnas as Phase-2.

- **South-Indian matching (10 Poruthams / Dasakoota) — Rajju, Vedha, Mahendra, Stree-Deergha are missing.** The spec does only the North-Indian 8-koota / 36-guna. **Rajju dosha and Vedha dosha are hard show-stoppers** in South-Indian matching and are *not* part of the 36 gunas. If the client serves South-Indian users (Hyderabad-based company), the matcher must add at least Rajju, Vedha, Mahendra, and Stree-Deergha as supplementary poruthams with their own veto/exception logic. This is a real feature gap, not a nicety.

- **A daily-rashifal / gochar engine is listed as a product feature but has no §2 spec.** "Daily horoscope per rashi" is in the app scope and `daily_horoscopes` gets columns, but there's no engine like the others — no gochar-phala rules (Moon transit, Jupiter/Saturn house-from-Moon, Sade Sati/Dhaiya/Kantaka-Shani, current-dasha overlay, Tara/Chandra bala of the day). Right now it would fall entirely to the AI layer with no computed backbone. Spec it as §2.x (it's mostly a thin layer over `transit_days` × Moon-sign, plus the Saturn/Jupiter transit tables), and add **Kantaka Shani / Ashtama Shani / Dhaiya** alongside the Sade-Sati you already have in §4.

- **Muhurta is panchanga-only — no lagna shuddhi.** §2.7 scores tithi/nakshatra/yoga/karana/vaara + Choghadiya + personal bala, which is the *elimination* half of muhurta. The *selection* half — computing the **ascendant chart at each candidate instant** and checking lagna-shuddhi (malefics out of 1/7/8/10, benefics supporting kendra/trikona, avoid Papakartari on lagna, Ashtama-shuddhi, and for vivah the specific muhurta-doshas) — is entirely absent. Drik's and any classical muhurta uses it. Without it you'll return panchang-clean windows that a real astrologer rejects on lagna grounds. Add a lagna-refinement pass over the top-N segments (you already build the transit chart machinery in §2.3).

- **Moonrise/moonset-anchored festivals need a geo dimension in the cache.** `festival_occurrences(rule, year → single civil_date)` breaks for Karva Chauth, Sankashti Chaturthi, Ganesh Chaturthi ("don't-see-moon"), and Diwali/Lakshmi-puja (Amavasya-at-pradosh-kaal, with the two-evening tie-break). These resolve to **different civil dates in different cities**. The festival cache must be keyed by `(rule, year, geo_key)` for the moon/sunset-anchored subset, and the rule engine needs an explicit `pradosh_kaal` / `moonrise` anchor type. Otherwise national single-date festivals will be wrong for a big chunk of users.

## E. Vastu

- **Magnetic-vs-true-north is a methodology decision the spec silently makes (and many practitioners disagree with).** You convert compass → **true** heading via WMM2025 declination. Classical Vastu (gnomon/shadow) is geographic-north based, so true is defensible — **but MahaVastu and most modern compass-based consultants read MAGNETIC north directly.** The declination delta (India −0.5° to +2.5°) is enough to shift a device reading across a 22.5° zone boundary near a cusp. Make north-reference an explicit **config toggle** (`vastu_north: 'true'|'magnetic'`), because whichever you pick, half your audience's existing readings will disagree, and you want that to be a data/config choice not a silent one.

- **Entrance-pada sanity claims should be pinned to a source.** The `entrancePada` math is clean (the `norm()` wrap saves the 315°/360° boundary — I checked, no off-by-one), but "0°→N5 (Soma, auspicious)" and "315°→N1 (Roga)" are asserted, not sourced. The 32-entrance auspicious/inauspicious table and the North-cardinal padas vary between MahaVastu and Brihat-Samhita orderings. Seed `vastu_devatas.entrance_*` from **one named source** and add the two sanity checks as CI assertions against *that* source's published table, so "reproduces MahaVastu exactly" is actually testable.

- **Optional but expected at "world-class": Ayadi Shadvarga.** Classical Vastu dimensions carry the Aya/Vyaya/Yoni/Vara/Nakshatra/Amsha perimeter formulas. Not in scope, but note it as a deferred Phase-3 item so it isn't "discovered missing" later.

- **High-latitude / polar degradation for all D/8 and D/15 windows.** Rahu-kaal, Choghadiya, muhurtas, and durmuhurta all divide `(sunset−sunrise)`. Above the polar circle (and your NYC + southern-hemisphere test set is fine, but the app is global) there are days with no sunrise/sunset → division by an undefined day-length. Specify the graceful fallback (civil-twilight or clock-based) and mark those outputs low-confidence, or the "never fails" guarantee breaks on a real input.

## F. Smaller corrections / confirmations

- **Adhika Jyeshtha 2026 acceptance test is CORRECT — keep it.** Verified against Drik: Adhika (Purushottam) Jyeshtha runs **2026-05-17 → 2026-06-15**, Adhika Purnima 2026-05-31, Adhika Amavasya 2026-06-15 ([Drik Adhika Purnima 31-05-2026](https://www.drikpanchang.com/purnima/adhika/adhika-purnima-data-time.html?date=31%2F05%2F2026); [Narayan Seva](https://www.narayanseva.org/jyeshtha-adhik-maas-2026/)). Good, load-bearing test case; the amanta-masa-from-Sun's-rashi-at-opening-new-moon logic is the right way to get it.

- **Samvatsara N/S mapping: validate across multiple years, not one.** The `(shaka+11)%60` / `(vikram+9)%60` offsets are plausible and your two spot-checks pass, but the 60-samvatsara cycle has a known regional **skip/reset controversy** (South "expunged" samvatsaras vs North sequential). Assert against Drik for ≥5 spread-out years (including one near a skip) before trusting the offset.

- **Graha Yuddha "Venus always wins" is one tradition, not canon.** The classical Surya-Siddhanta rule is purely northern-latitude-wins; the Venus exception is a later convention. Keep it, but as a *named rule-enum* the user/astrologer can turn off — don't bake it as the only path.

- **License scope must cover the WASM tier too.** Buying SE Professional (≈CHF 800 now, not 700) flips the native `sweph` to LGPL terms, but `swisseph-wasm` is a *third-party repackage* — confirm the professional grant covers that build, or drop Tier 3 rather than ship an AGPL WASM blob under a closed backend. (Your instinct to avoid `swisseph-v2`'s undeclared license is correct.)

- **Combustion for Ketu/Rahu, and Moon "combustion":** you correctly exempt nodes. But note the Moon-combust orb (12°) is really the *amavasya proximity* used for tithi-bala, not a predictive "combust Moon" most astrologers apply — flag it as bala-only so the chart UI doesn't label a near-new-moon natal Moon "combust" and confuse users.

- **`engine_config` "read once per cold start" needs an invalidation story.** An admin editing ayanamsa/node-type won't reach warm Fluid-Compute instances until they recycle. Add a short in-process TTL (e.g. 60 s) or a version-ping, otherwise config changes appear to "not take" nondeterministically across instances.

**Net:** flip the node default to mean (A), pin geocentric-Moon + the exact Lahiri variant + tier-vs-precision honesty (B), add the D60 even-sign name reversal (C), and add Chara Karakas/Arudha, upagrahas, Rajju/Vedha matching, a real gochar rashifal engine, lagna-shuddhi muhurta, and geo-keyed moonrise festivals (D) — then this is genuinely JHora-class rather than JHora-adjacent.

Sources: [Mean vs True node / Drik default](https://www.anahitarao.com/rahu-ketu-using-mean-node-vs-true-node/) · [Swiss Ephemeris sidereal docs](https://www.astro.com/swisseph/swisseph.htm) · [JHora Lahiri 2026 reference](https://jagannathhora.com/lahiri-ayanamsa-value/) · [Adhik Jyeshtha 2026 — Drik](https://www.drikpanchang.com/purnima/adhika/adhika-purnima-data-time.html?date=31%2F05%2F2026) · [native-addon prebuild/Vercel](https://www.pkgpulse.com/guides/node-gyp-vs-prebuild-vs-napi-rs-native-nodejs-addons-2026)