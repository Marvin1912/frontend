# Vocabulary Module Dark-Theme Restyle

## Context

The `plants/`, `home/`, and `backend/bookings/` modules have been restyled to a new dark-theme design system. This plan applies the same design system to the `vocabulary/` module. The vocabulary accent color in the design system is **golden yellow (`#fbbf24`)**, matching what was already anticipated in the home component's nav card for vocabulary.

---

## Design Tokens (vocabulary module)

| Token | Value |
|---|---|
| `--bg` | `#06080e` |
| `--surface` | `#0c1018` |
| `--raised` | `#111826` |
| `--border` | `rgba(255,255,255,0.07)` |
| `--border-mid` | `rgba(255,255,255,0.13)` |
| `--text` | `#c8d4e8` |
| `--text-muted` | `#7a93b0` |
| `--text-dim` | `#3d5470` |
| `--c-v` | `#fbbf24` (yellow accent) |
| `--cg-v` | `rgba(251,191,36,0.18)` (glow) |

Background recipe: `#06080e` base + two radial corner gradients with yellow `rgba(251,191,36,0.06)` + 28px dot grid `rgba(255,255,255,0.025)`.

---

## Step 1 — `vocabulary-home` (HTML + CSS)

**Goal:** Replace the simple flex-div nav with the navcard pattern from `home.component.html`.

**HTML changes:**
- Remove `.vocabulary-header`, `.home-button-section`, `.selection-section` wrappers.
- Add `<main class="navgrid">` containing three navcards:
  - `<a class="navcard" routerLink="/vocabulary/add">` — mark `+`, title "Add Word", sub "Look up and save new vocabulary"
  - `<a class="navcard" routerLink="/vocabulary/list">` — mark `L`, title "List", sub "Browse all flashcards"
  - `<div class="navcard" (click)="openDialog()">` — mark `D`, title "Manage Decks", sub "Rename and organise decks" (dialog trigger, so not an `<a>`)
- Move the `mat-fab` home button into a `<div class="page-header">` above the navgrid, styled as a compact back-link.
- Keep `<router-outlet>` in a `.content-area` below the navgrid.

**CSS changes:**
- Define `:host` token block + background recipe.
- Add `@import` for Outfit + JetBrains Mono fonts.
- Copy `.navcard`, `.navcard::before/::after`, hover states, mark/title/sub/arrow styles, `@keyframes fadeUp`, staggered delays (0.05s, 0.12s, 0.19s) from `plant-home.component.css`.
- `.navgrid`: `grid-template-columns: repeat(2, 1fr); gap: 0.75rem; padding: 1rem; max-width: 640px; margin: 0 auto;`
- Manage-decks div navcard: add `cursor: pointer; user-select: none`.
- Remove all old rules.

**Material:** Override `mat-fab` via `::ng-deep .mat-mdc-fab` → surface bg, yellow text, no elevation.

---

## Step 2 — `vocabulary-list` (HTML + CSS)

**Goal:** Port the plant-table style with vocabulary yellow substituted for plant green.

**HTML changes:**
- Strip all Bootstrap utility classes (`d-flex`, `col-*`, `alert`, `border`, `p-2`, etc.).
- Wrap in `<div class="vocab-list">`.
- Add header row: `<header class="table-header"><span class="dot"></span><span class="label">VOCABULARY</span></header>`
- Filters → `<div class="filter-panel">` containing filter controls and a `.stats-badge` span (replaces the Bootstrap alert).
- Table wrapper → `<div class="table-container">`.
- Add `class="col-header"` to each `<th mat-header-cell>`.
- Ensure `<tr mat-row>` has `class="clickable-row"`.

**CSS changes:**
- `:host` token block + background.
- `.table-header` with blinking dot (`var(--c-v)`, `@keyframes blink`) + uppercase JetBrains Mono label.
- `.filter-panel`: surface bg, border, radius 12px, flex wrap, gap 1rem.
- `.stats-badge`: compact JetBrains Mono tile (raised bg, border, 6px radius).
- `.table-container`: port from `plant-table.component.css` (surface bg, border, radius 12px, max-height 75vh, custom scrollbar).
- `.col-header`: JetBrains Mono 0.6rem, uppercase, raised bg, border-bottom.
- `::ng-deep .mat-mdc-header-row`: `background: var(--raised) !important`.
- `::ng-deep .mat-mdc-cell`: text `var(--text)`, transparent bg, border-bottom `var(--border)`.
- `.clickable-row:hover`: `background-color: rgba(251,191,36,0.08) !important` (yellow instead of green).
- Material overrides for `mat-form-field` (outline), `mat-select`, `mat-checkbox` via MDC CSS custom properties + `::ng-deep`.

**Reference:** `src/app/plants/components/plant-table/plant-table.component.css`

---

## Step 3 — Dialog components (all three, one pass)

All dialog CSS files are currently empty. Dialogs render in CDK overlay outside component scope — use `::ng-deep` for surface overrides.

Common rule for all three:
```css
::ng-deep .mdc-dialog__surface {
  background: var(--surface) !important;
  border: 1px solid var(--border-mid) !important;
  border-radius: 12px !important;
}
::ng-deep .mdc-dialog__title {
  color: var(--text) !important;
  font-family: 'JetBrains Mono', monospace !important;
}
```

**`article-dialog` CSS + HTML:**
- HTML: replace Bootstrap flex wrapper with `<div class="article-btn-group">`, add `class="article-btn"` to mat buttons.
- CSS: `.article-btn-group` → flex, centered, gap 0.75rem. Buttons: raised bg, dim text, border. Hover: yellow text + border + glow.

**`deck-management-dialog` CSS + HTML:**
- HTML: replace Bootstrap deck row classes with `class="deck-row"`. Add `deck-row__id` and `deck-row__name` spans. Edit icon button → `class="icon-btn icon-btn--yellow"`.
- CSS: `.deck-row` → raised bg, border, radius 8px, flex. `.deck-row__id` → JetBrains Mono, dim. `.icon-btn--yellow` → yellow color, hover background `rgba(251,191,36,0.1)`.

**`deck-change-name-dialog` CSS + HTML:**
- HTML: remove Bootstrap wrapper classes, add `class="rename-dialog"`.
- CSS: Material form field dark override (same as Step 2). Dialog action button: dim text → yellow on hover.

---

## Step 4 — `add-word` (HTML + CSS)

**Goal:** Restyle the 3-panel layout (dictionary / translation / save word) to the dark theme.

**HTML changes:**
- Search bar wrapper: replace `search-input-wrapper` with `<div class="search-bar">`. Search icon button → add `class="icon-btn icon-btn--yellow"`.
- Dictionary panel: add section `<header class="panel-header">` with dot + "DICTIONARY" label inside `.dictionary-section`. Word entries container: add class `entries-container`.
- Part-of-speech badges: replace the `lightblue` pill styling via CSS only (no HTML change needed beyond class rename if required).
- Definition items: HTML structure stays; `.chosen` class already toggles via Angular.
- Translation panel: add `<header class="panel-header">` with dot + "TRANSLATION" label. Translation result `<div>`: remove inline background if any, style via CSS.
- Save word panel: replace `<h1>` header with `<header class="panel-header">` dot + "SAVE WORD" label pattern.

**CSS changes:**
- `:host` token block + background (use `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(251,191,36,0.05) 0%, transparent 70%)`).
- `.search-bar`: surface bg, border-bottom, flex, gap.
- `.entries-container`: surface bg, border, radius 12px, overflow-y auto, max-height 60vh.
- `.part-of-speech` badge: JetBrains Mono, 0.6rem, uppercase, `var(--c-v)` text, `color-mix(in srgb, var(--c-v) 12%, transparent)` bg, border with 30% yellow.
- `.definition-item`: raised bg, `var(--border)` border, radius 8px, margin 0.375rem, padding 0.625rem. Remove `background-color: azure`.
- `.definition-item.chosen`: `border-color: var(--c-v); box-shadow: 0 0 10px var(--cg-v); background: color-mix(in srgb, var(--c-v) 8%, var(--raised));`
- `.definition-actions button`: surface bg, dim text, JetBrains Mono small, border. Hover: yellow text + border. `.selected`: yellow text + bg + border.
- `.translation-result`: `background: var(--raised); border-left: 3px solid var(--c-v); border-radius: 0 8px 8px 0; color: var(--text);` (replaces `background: lightgreen`).
- `::ng-deep .mat-mdc-form-field` overrides (MDC custom properties): outline color, focus color, label color, input text color, container bg `var(--raised)`.
- `::ng-deep .mat-button-toggle-group`: dark border, radius 8px.
- `::ng-deep .mat-button-toggle`: raised bg, muted text, JetBrains Mono uppercase.
- `::ng-deep .mat-button-toggle-checked`: yellow text, yellow bg `color-mix(in srgb, var(--c-v) 15%, var(--raised))`, yellow bottom border.
- `::ng-deep .mat-mdc-unelevated-button[color=primary]`: `background: var(--c-v); color: #06080e; font-family: JetBrains Mono; font-weight: 700`. Hover: `box-shadow: 0 4px 14px var(--cg-v)`. Disabled: raised bg, dim text.

---

## Execution Order

1. `vocabulary-home` (HTML + CSS) — establishes tokens, simplest rework
2. `vocabulary-list` (HTML + CSS) — direct port of plant-table pattern
3. All 3 dialogs (HTML + CSS) — parallel, all simple
4. `add-word` (HTML + CSS) — most complex, do last

After **each step**: run `npm run build` to catch CSS parsing errors before moving on.

---

## Files to Modify

| File | Change Type |
|---|---|
| `src/app/vocabulary/components/vocabulary-home/vocabulary-home.component.html` | Structural rework |
| `src/app/vocabulary/components/vocabulary-home/vocabulary-home.component.css` | Full rewrite |
| `src/app/vocabulary/components/vocabulary-list/vocabulary-list.component.html` | Class cleanup |
| `src/app/vocabulary/components/vocabulary-list/vocabulary-list.component.css` | Full rewrite |
| `src/app/vocabulary/components/article-dialog/article-dialog.component.html` | Minor class changes |
| `src/app/vocabulary/components/article-dialog/article-dialog.component.css` | New rules |
| `src/app/vocabulary/components/deck-management-dialog/deck-management-dialog.html` | Minor class changes |
| `src/app/vocabulary/components/deck-management-dialog/deck-management-dialog.css` | New rules |
| `src/app/vocabulary/components/deck-change-name-dialog/deck-change-name-dialog.html` | Minor class changes |
| `src/app/vocabulary/components/deck-change-name-dialog/deck-change-name-dialog.css` | New rules |
| `src/app/vocabulary/components/add-word/add-word.component.html` | Section header additions + class changes |
| `src/app/vocabulary/components/add-word/add-word.component.css` | Full rewrite |

**No TypeScript changes are needed.**

---

## Reference Files

- `src/app/home/home.component.{html,css}` — navcard pattern
- `src/app/plants/components/plant-home/plant-home.component.{html,css}` — navcard with accent
- `src/app/plants/components/plant-table/plant-table.component.css` — table + dot header + icon-btn pattern
- `src/app/plants/components/plant-edit/plant-edit.component.css` — panel layout + Material form field overrides

---

## Verification

1. `npm run build` passes after each step.
2. Visually verify in dev server (`npm start`):
   - `/vocabulary` — three yellow nav cards with hover glow + translateY
   - `/vocabulary/list` — dark table, yellow row hover, filter panel dark
   - `/vocabulary/add` — dark 3-panel layout, yellow definition selection, yellow button glow
   - Dialogs (article select, deck management, deck rename) — dark surface, yellow accents
3. Check responsiveness at mobile (< 640px) and desktop (> 1024px).
4. `npm run lint` passes.
