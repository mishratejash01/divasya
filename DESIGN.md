# Divasya Design System — Brand Implementation

Source of truth: the official **Divasya Brand Guidelines** (Sanatani Vibes).
The app is **light, warm, luminous** — never dark, never neon. Grounded. Luminous. Reassuring.

## Palette (CSS variables — ALWAYS use tokens, never raw dark hexes)

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#FCF9E8` | Warm Light — page background |
| `--bg-1` | `#F7F1DC` | deeper wash / section bands |
| `--surface` | `#FFFEF7` | cards (class `surface`) |
| `--surface-2` | `#FBF5E2` | raised / nested cards |
| `--ink` | `#33291A` | primary text (class `text-ink`) |
| `--ink-dim` | `#5C5140` | secondary text |
| `--muted` | `#8A7D64` | tertiary text (class `text-muted`) |
| `--amber` / `--saffron` | `#C88131` | Amber Earth — THE accent. Primary buttons, active states, icons |
| `--amber-deep` | `#A5661F` | hover / pressed |
| `--ochre` | `#CEB976` | Soft Ochre — decorative fills, rings |
| `--ochre-deep` | `#9C8544` | ochre text that must be legible (class `text-gold`) |
| `--blush` | `#FFD9CC` | Blush Sand — soft tint surfaces, highlights |
| `--line` | `rgba(51,41,26,.10)` | hairlines |
| `--line-strong` | `rgba(51,41,26,.16)` | stronger borders |
| `--line-gold` | `rgba(156,133,68,.38)` | gold hairline (class `ring-gold`) |
| `--good` | `#5F8657` | shubh (muted sage) |
| `--avoid` | `#B4564B` | avoid (muted clay) |

## Type
- Display (`font-display`): Marcellus — headings, numerals, wordmark.
- Body: Noto Serif (the brand's UI/body voice) — set globally on `body`.
- Devanagari (`font-deva`): Noto Serif Devanagari (brand-mandated).
- Hierarchy via SIZE + SPACING, not weight. Max weight 600. No underlines/italic-decorations.

## Components / classes (defined in globals.css & components/ui.tsx)
- `surface`, `surface-2` — white warm cards, hairline border, soft shadow.
- `card-temple` — hero card: blush/ochre tinted gradient on cream, gold hairline.
- `btn-saffron` — solid Amber Earth button, cream text.
- `btn-ghost` — outlined warm button. `btn-gold` — ochre outline.
- `text-gold` — ochre-deep. `ring-gold` — gold border.
- `<Logomark size={n}/>` (from `components/ui`) — celestial mandala SVG (rings, eye, moon phases) in currentColor. Use amber.
- `<Wordmark/>` — "Divasya" in Marcellus, amber, tracked.
- `<DeityGlyph deity={d} size={n}/>` — light medallion (blush→cream radial, amber ॐ).
- `<Avatar/>` — warm tint disc + amber monogram.

## Rules
1. **NO dark hexes** (`#0c0b09`, `#1a1714`, `#160f0a`, `rgba(236,230,219,…)` etc.) anywhere — replace all with tokens above.
2. Whitespace is the luxury: generous padding, hairlines over boxes.
3. Icons: lucide, `strokeWidth 1.6–1.8`, amber (`text-[var(--amber)]`) or muted; never colored circles behind icons except soft `--blush`/`rgba(200,129,49,.10)` tints.
4. Overlays/sheets: `rgba(51,41,26,0.28)` scrim + `surface` panel.
5. LIVE badges: `--good` tint, not neon. Ratings: `--ochre-deep`.
6. NO emoji in UI. No em dashes in copy.
7. Voice: calm, reassuring, no urgency ("Begin", "Notice", "Offer" — not "Hurry!").
8. Every screen must remain fully functional — visual + data-wiring changes only.

## Data (NOTHING hardcoded)
- Panchang/choghadiya/tithi/vrat: `computePanchang()`, `activeChoghadiya()`, `fmtTime()` from `@/lib/panchang`.
- Catalog: `getDeities/getMantras/getAstrologers/getTemples/getPujas/getChadhava/getFestivals/getUpcomingFestivals/getLibrary/getShlokaOfDay/getVastuZones/getNakshatraSyllables/getBabyNames/getDailyHoroscope` + `useCatalog(loader, fallback)` hook from `@/lib/catalog`.
- Kundli: `computeKundli(dob, tob)`, `kundliSummary()` from `@/lib/kundli`.
- Dates: always real (`new Date()` / panchang engine). Never a literal weekday/date/muhurat string.
