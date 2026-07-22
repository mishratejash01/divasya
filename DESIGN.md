# Divasya Design System — Brand Implementation

Source of truth: the official **Divasya Brand Guidelines** (Sanatani Vibes).
The app is **light, warm, luminous** — never dark, never neon. Grounded. Luminous. Reassuring.

## Palette (CSS variables — ALWAYS use tokens, never raw hexes)

Three tones carry the whole interface, one job each:
**page → white · section → white · block → bhagwa tint.** With shadows removed,
a warm bhagwa hairline is what separates a panel from the page.

| Token | Value | Use |
|---|---|---|
| `--bhagwa` | `#F26B0F` | Bhagwa — THE accent. Buttons, icons, active states |
| `--bhagwa-deep` | `#D65403` | hover / pressed |
| `--bhagwa-soft` | `#FF8A33` | light accent |
| `--bg-0` | `#FFFFFF` | page background |
| `--surface` | `#FFFFFF` | section panels (class `surface`) |
| `--surface-2` | `#FFF1E3` | blocks sitting inside a panel |
| `--surface-3` | `#FFE7D0` | deeper block tint |
| `--ink` | `#171613` | primary text (class `text-ink`) — near-black, not brown |
| `--ink-dim` | `#3A3833` | secondary text |
| `--muted` | `#6A6760` | tertiary text (class `text-muted`) |
| `--line-card` | `rgba(242,107,15,.30)` | **section outline** — warm hairline, never black |
| `--line` | `rgba(0,0,0,.11)` | internal dividers |
| `--line-strong` | `rgba(0,0,0,.20)` | inputs, stronger rules |
| `--good` | `#5F8657` | shubh (muted sage) |
| `--avoid` | `#B4564B` | avoid (muted clay) |
| `--amber`, `--ochre`, `--blush` | — | legacy warm tones, still used for data tints |

**No shadows anywhere.** `--shadow-card` and `--shadow-pop` are `none`.
Separation comes from the hairline and the tint, never from a drop shadow.

`.stage-warm` holds the old cream dawn wash and is used by the **login screen
only**. Every other screen is white.

`.card-sandesh` is the single inverted panel in the app: solid bhagwa ground,
white type, `.on-bhagwa` / `.on-bhagwa-mid` for the muted steps on it. Nothing
else inverts — that is what makes the day's verse read first.

## Type
**Inter, at two weights only.** 400 carries the entire interface; 500 is spent
on titles and the few labels that must outrank their neighbours. Only 400 and
500 are loaded in `app/layout.tsx`, so the rule is structural — there is no
600/700 available to drift back into.

- Body: Inter 400, `letter-spacing: -0.006em` — set globally on `body`.
- Titles (`font-display`): Inter 500, `letter-spacing: -0.021em`. Inter needs
  tightening as it grows; without it, headings read as a browser default.
- **Never set anything in capitals.** No `uppercase`, no all-caps string
  literals, no letter-spaced eyebrows. Rank comes from size, colour and weight.
- Section headings (`section-title`): 14px / 500 / black, sentence case.
- Small meta labels (`eyebrow`): 11px / 400, sentence case. Use this class —
  never hand-roll a `text-[11px] uppercase tracking-[0.2em]` triplet.
- Devanagari (`font-deva`): Noto Sans Devanagari, never tracked. Sans, so it
  sits on the same axis as Inter rather than clashing serif against sans.
- Numerals in any table, timing or chart: add `tnum` so digits don't shift.
- Running prose: add `measure` (66ch) so sentences don't span a 1200px card.
- Hierarchy via SIZE + SPACING + COLOUR, never weight. Max weight 500.

## Home structure
Home carries the whole app. Every group is **one white panel holding its own
title and its own blocks** — a heading floating above loose cards left it
ambiguous which tiles belonged to which heading.

- `layout: "stack"` — mark above the name, 3-up. The two big sections.
- `layout: "row"` — mark beside the name, 2-up. The short utility section.
- Not everything is a row and not everything is a stack; the mix is deliberate.
- Block counts are multiples of the column count, so no tile is ever stranded
  alone on a final row.

## Mobile shell
The fixed bottom tab bar is the navigation — **there is no top bar on mobile.**
The header in `home.tsx` is `hidden lg:flex`. The bar is `position: fixed` and
persists on every screen except the two full-screen rituals (`mala`, `mandir`),
which take over the viewport and carry their own exit. Screens under it use
`screen-bottom`; a composer above it uses `above-tabbar`.

## Density
One token drives every screen edge: `--gutter` (10px → 12px ≥640 → 14px ≥1024).

- `gutter` / `gutter-m` / `gutter-w` — screen padding, margin, and the width
  calc for full-bleed cards. Never hardcode `px-5` on a screen edge again.
- Radii are tight: cards 8px, sheets 10px (set on Tailwind's `--radius-*`).
  Circles keep `rounded-full`.
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
   - Bhagwa (`text-[var(--bhagwa)]`) or muted.
   - **No decorative icons.** A glyph centred in a coloured frame, standing in
     for an image that is never coming, reads as a stock placeholder. Use a
     flat faded field instead, or say what is missing in words. Icons earn
     their place by labelling an action, not by filling a box.
   - Don't put a tinted disc behind a mark just to contain it — set the mark
     larger and let it breathe.
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
