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
**Inter, at two weights only.** 400 carries the entire interface; 500 is spent
on titles and the few labels that must outrank their neighbours. Only 400 and
500 are loaded in `app/layout.tsx`, so the rule is structural — there is no
600/700 available to drift back into.

- Body: Inter 400, `letter-spacing: -0.006em` — set globally on `body`.
- Titles (`font-display`): Inter 500, `letter-spacing: -0.021em`. Inter needs
  tightening as it grows; without it, headings read as a browser default.
- Eyebrows (`eyebrow`): 10.5px / 500 / uppercase / `0.15em`. Uppercase is the
  one place Inter wants opening up. Use this class — never hand-roll a
  `text-[11px] uppercase tracking-[0.2em]` triplet.
- Devanagari (`font-deva`): Noto Sans Devanagari, never tracked. Sans, so it
  sits on the same axis as Inter rather than clashing serif against sans.
- Numerals in any table, timing or chart: add `tnum` so digits don't shift.
- Running prose: add `measure` (66ch) so sentences don't span a 1200px card.
- Hierarchy via SIZE + SPACING + COLOUR, never weight. Max weight 500.

## Density
One token drives every screen edge: `--gutter` (14px → 16px ≥640 → 18px ≥1024).

- `gutter` / `gutter-m` / `gutter-w` — screen padding, margin, and the width
  calc for full-bleed cards. Never hardcode `px-5` on a screen edge again.
- `screen-top` / `screen-bottom` — safe-area-aware insets. `screen-bottom`
  clears the tab bar on mobile and collapses to 28px on desktop, where the bar
  is hidden.
- `app-shell` adds **no** horizontal padding; it only caps the column at
  1200px. Padding lives with the screen, in exactly one place.

## Components / classes (defined in globals.css & components/ui.tsx)
- `surface`, `surface-2` — white warm cards, hairline border, soft shadow.
- `card-temple` — hero card: blush/ochre tinted gradient on cream, gold hairline.
- `btn-saffron` — solid Amber Earth button, cream text.
- `btn-ghost` — outlined warm button. `btn-gold` — ochre outline.
- `text-gold` — ochre-deep. `ring-gold` — gold border.
- `<Logomark size={n}/>` (from `components/ui`) — celestial mandala SVG (rings, eye, moon phases) in currentColor. Use amber.
- `<Wordmark/>` — "Divasya" in Inter 500, amber, tracked in to -0.018em.
- `<Ornament/>` (from `components/icons`) — granth rule: hairline, diamond,
  two dots. Divides a verse from its reading. Use sparingly.
- `<DeityGlyph deity={d} size={n}/>` — light medallion (blush→cream radial, amber ॐ).
- `<Avatar/>` — warm tint disc + amber monogram.

## Rules
1. **NO dark hexes** (`#0c0b09`, `#1a1714`, `#160f0a`, `rgba(236,230,219,…)` etc.) anywhere — replace all with tokens above.
2. Whitespace is the luxury: generous padding, hairlines over boxes.
3. **Icons — two families, one system.**
   - **Domain concepts get the hand-drawn set** in `components/icons.tsx`:
     diya, mala, mandir, lotus, panchang wheel, conch, sunrise/sunset, granth,
     compass. These are the brand; they are why the app doesn't look generic.
     Stroked at 1.4, `strokeWidth` prop available.
   - **Generic UI chrome gets Phosphor** (`@phosphor-icons/react`): carets,
     close, send, play/pause, share, gear. Weight is set once via
     `IconContext.Provider value={{ weight: "light" }}` in `app-shell.tsx` to
     match the 1.4 stroke — do **not** pass `strokeWidth` to a Phosphor icon
     (it has no such prop; use `weight`).
   - If a concept is central to jyotish and Phosphor's glyph is a poor stand-in,
     draw it instead of settling. That is how IconSunrise/IconSunset exist.
   - Amber (`text-[var(--amber)]`) or muted; never coloured circles behind icons
     except soft `--blush`/`rgba(200,129,49,.10)` tints.
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
