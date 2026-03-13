# Plan: Restyle Plants Application to Match New Dark Theme

## Context
The home and bookings components have been redesigned with a premium dark UI using Outfit + JetBrains Mono fonts, deep navy backgrounds, and vibrant accent glows. The plants application still uses the old Bootstrap/Material default styling with light backgrounds, `#ccc` borders, and generic hover shadows. This plan brings the entire `/plants/` app into visual parity with the new aesthetic.

---

## Design Tokens (Shared Across All Components)

Same token set as `home.component.css` / `bookings.component.css`:

```css
--bg:          #06080e;
--surface:     #0c1018;
--raised:      #111826;
--border:      rgba(255,255,255,0.07);
--border-mid:  rgba(255,255,255,0.13);
--text:        #c8d4e8;
--text-muted:  #7a93b0;
--text-dim:    #3d5470;
--c-a: #4da6ff;  --cg-a: rgba(77,166,255,0.18);   /* blue   */
--c-p: #22d35e;  --cg-p: rgba(34,211,94,0.18);    /* green  */
--c-v: #fbbf24;  --cg-v: rgba(251,191,36,0.18);   /* yellow */
--c-m: #a78bfa;  --cg-m: rgba(167,139,250,0.18);  /* purple */
--c-e: #fb7185;  --cg-e: rgba(251,113,133,0.18);  /* pink   */
```

Fonts: `'Outfit'` (body) + `'JetBrains Mono'` (data/labels/monospace).
Background: deep `#06080e` with radial gradients + 28px dot-grid.
Animations: `fadeUp` keyframe, staggered `animation-delay`.
Cards: `border-radius: 12px`, 1px `var(--border)` border, no shadow by default.

Plant-specific accent: **green (`--c-p`)** as the primary plant color (life/nature). Secondary accent for watering-due: **pink (`--c-e`)**. Fertilizing-due: **yellow (`--c-v`)**.

---

## Steps

### [x] Step 1 — `plant-layout.component` (HTML + CSS)

**Goal:** Replace Bootstrap header row with a styled topbar matching `home.component`.

**HTML changes:**
- Remove Bootstrap grid (`container`, `row`, `col-*`) structure
- New structure: `<div class="plant-layout">` wrapping `<header class="topbar">` + `<main class="content">`
- Topbar: left side has home FAB + menu FAB; center has brand title "PLANTS" with `⬡` hex; right side has env-style breadcrumb or empty
- Keep `matMenuTriggerFor` and `mat-menu` buttons; style them as flat icon buttons (not FABs)
- `<router-outlet>` goes inside `<main class="content">`

**CSS changes:**
- Remove all Bootstrap-dependent classes
- Topbar: sticky, `backdrop-filter: blur(20px)`, `background: rgba(6,8,14,0.88)`, border-bottom
- Host: dark bg + radial gradient + dot-grid pattern (same as home)
- Nav buttons: transparent icon buttons with `--border` outline, green glow on hover
- Menu panel: dark `--surface` background, `--border` border, `--text` items
- Content area: flex-grow, overflow managed

**Files:**
- `src/app/plants/components/plant-layout/plant-layout.component.html`
- `src/app/plants/components/plant-layout/plant-layout.component.css`

---

### [x] Step 2 — `plant-home.component` (HTML + CSS)

**Goal:** Transform 3 navigation cards to match `navcard` style from `home.component.html`.

**HTML changes:**
- Replace `<div class="plant-card">` with `<a class="navcard navcard--X" routerLink="...">` links
- Add `navcard__mark` (single letter: S/E/C), `navcard__title`, `navcard__sub`, `navcard__arrow`
- Card accents: Show → `navcard--p` (green), Edit → `navcard--v` (yellow), Create → `navcard--a` (blue)

**CSS changes:**
- Copy navcard CSS pattern from `home.component.css` exactly
- Use `--c-p`, `--c-v`, `--c-a` for card variants
- fadeUp staggered animations (delays: 0.05s, 0.12s, 0.19s)
- Remove old `.plant-card` styles

**Files:**
- `src/app/plants/components/plant-home/plant-home.component.html`
- `src/app/plants/components/plant-home/plant-home.component.css`

---

### [x] Step 3 — `plant-create.component` (HTML + CSS)

**Goal:** Style multi-step stepper form with dark theme.

**HTML changes:**
- Wrap entire stepper in `<div class="plant-create">` host container
- No major structural changes, keep stepper logic intact
- Add CSS class `create-form` to each `<form>` element
- Style navigation buttons: replace `mat-button` with styled buttons using design tokens

**CSS changes:**
- Host: dark bg, radial gradient, dot-grid (same pattern)
- Stepper override: `--surface` background, `--border` borders on step headers
- Step indicator circles: use `--c-p` (green) for active step
- Form fields (`mat-form-field`): dark surface background, `--border` outline, `--text` input color; on focus use `--c-a` blue border
- `mat-label` text: `--text-muted` color
- `textarea`, `input`: `--surface` background, `--text` color, `--border` border
- Navigation buttons: flat style with `--border` border, green (`--c-p`) for primary action, hover glow

**Files:**
- `src/app/plants/components/plant-create/plant-create.component.html`
- `src/app/plants/components/plant-create/plant-create.component.css`

---

### [x] Step 4 — `plant-table.component` (HTML + CSS)

**Goal:** Style management table matching bookings/table aesthetic.

**HTML changes:**
- Wrap in `<div class="plant-table">` host
- Add `<header class="table-header">` with "MANAGEMENT" label + blinking dot
- Table structure stays, add `panel__header`-style header row
- Column headers: add `class="col-header"` — uppercase monospace
- Image button / delete button: style as mini icon buttons with token colors
- Preview container: keep as-is but restyle

**CSS changes:**
- Host: dark bg + radial gradient + dot-grid
- `.plant-table`: flex column, full height, overflow hidden
- Table container: `--surface` background, `--border` border, `border-radius: 12px`, overflow
- Header cells: `--raised` background, uppercase, `JetBrains Mono`, `--text-dim` color, `--border-mid` bottom border, 28px height
- Data cells: 0.8rem, `--text` color, transparent background
- Row hover: `--raised` background tinted with `--c-p` (green, 8%), no scale transform
- Image button: `--c-a` (blue) icon color, 10% blue background on hover
- Delete button: `--c-e` (pink) icon color, 10% pink background on hover
- Preview container: dark glassmorphism (see Step 9)
- `@keyframes fadeInScale` kept

**Files:**
- `src/app/plants/components/plant-table/plant-table.component.html`
- `src/app/plants/components/plant-table/plant-table.component.css`

---

### [x] Step 5 — `plant-view.component` (HTML + CSS)

**Goal:** Replace light mat-card with dark detail panel.

**HTML changes:**
- Remove Bootstrap container/row/col classes
- New structure: `<div class="plant-view">` with `<div class="view-card">` (replaces mat-card)
- Header: plant name centered, monospace style
- Two-column layout: image left, details right (CSS grid, no Bootstrap)
- Info badges (species, location, last watered): replace `shadow p-1 rounded` with `info-badge` elements styled with dark tokens
- Tab group: keep `mat-tab-group`, override colors

**CSS changes:**
- Host: dark bg + radial gradient + dot-grid
- `.view-card`: `--surface` bg, `--border` border, `border-radius: 12px`, full height
- Image: `object-fit: cover`, `border-radius: 8px`, constrained height
- Info badges: `--raised` bg, `--border-mid` border, `border-radius: 6px`, `JetBrains Mono` for values
- Tabs: override Material tab indicator to `--c-p` (green), text `--text-muted`
- Description/care: `--raised` panel with `--text` color, `white-space: pre-wrap`
- fadeUp entrance animation

**Files:**
- `src/app/plants/components/plant-view/plant-view.component.html`
- `src/app/plants/components/plant-view/plant-view.component.css`

---

### [x] Step 6 — `plant-edit.component` (HTML + CSS)

**Goal:** Dark theme for edit/view toggle layout.

**HTML changes:**
- Remove Bootstrap grid classes (`container-fluid`, `row`, `col-*`)
- New structure: `<div class="plant-edit">` → `<header class="edit-header">` + `<div class="edit-body">`
- Header: plant name left-aligned (not absolute positioned), action buttons right
- Edit/save buttons: replace mat-mini-fab with styled icon buttons matching the theme
- Edit mode indicator: when `isEditMode`, add a green `--c-p` left border on the edit panel
- Info fields: replace `<mat-label>` + borders with dark `field-label` / `field-value` pattern
- Remove `[ngClass]="{'bg-info': isEditMode}"` — use CSS class toggle instead

**CSS changes:**
- Host: dark bg + radial gradient + dot-grid
- Header: flexbox, `--surface` bg, `--border` bottom border, monospace plant name
- Toggle button: `--border` border, `--text-muted` color; in edit mode: `--c-p` green glow
- Save button: `--c-p` green, with glow on hover
- Edit body: two-column CSS grid (image | details)
- Image container: `--surface` bg, `--border` border, rounded, overflow hidden
- Details panel: `--surface` bg, `--border` border, rounded; edit mode: left 2px `--c-p` stripe
- Field labels: `JetBrains Mono`, 0.6rem, uppercase, `--text-dim`
- Field values (view): `--raised` bg, `--border` border, `border-radius: 6px`, `--text` color
- Inputs/textareas (edit): `--raised` bg, `--c-a` focus border, `--text` color
- Scrollable description areas with constrained height

**Files:**
- `src/app/plants/components/plant-edit/plant-edit.component.html`
- `src/app/plants/components/plant-edit/plant-edit.component.css`

---

### [x] Step 7 — `plant-gallery.component` (HTML + CSS)

**Goal:** Dark plant cards with status coloring using design tokens (not Bootstrap `bg-danger`/`bg-success`).

**HTML changes:**
- Remove Bootstrap outer container/row/col classes
- New: `<div class="gallery">` → `<div class="gallery__grid">` → `<div class="gallery__item">`
- Plant card: replace mat-card structure with custom dark card `<div class="plant-card">` containing:
  - `.plant-card__header`: name link + species subtitle
  - `.plant-card__image`: img
  - `.plant-card__info`: 2×2 grid of info tiles (last/next watered/fertilized, location)
  - `.plant-card__actions`: Watered + Fertilized buttons
- Replace `[ngClass]="{'bg-danger': ..., 'bg-success': ...}"` with `[class.plant-card--water]` and `[class.plant-card--fertilize]`
- Info tiles: replace nested mat-cards with simple `<div class="info-tile">` elements

**CSS changes:**
- Host: dark bg + radial gradient + dot-grid
- Gallery: `display: grid`, responsive columns (1 col → 2 col → 3 col), gap, overflow-y auto
- Plant card: `--surface` bg, `--border` border, `border-radius: 12px`, flexbox column, overflow hidden
- `plant-card--water`: left 3px `--c-e` (pink) border + very subtle pink bg tint
- `plant-card--fertilize`: left 3px `--c-v` (yellow) border + subtle yellow bg tint
- Card name link: `--text` color, font-weight 600; hover: `--c-p` green color, no underline
- Image: `height: 35%`, `object-fit: cover`, no border-radius (flush with card)
- Info tiles: `--raised` bg, `--border` border, `border-radius: 6px`, label in `JetBrains Mono` 0.55rem uppercase `--text-dim`, value in `JetBrains Mono` 0.68rem `--text`
- Action buttons: flat, `--border` border, `--text-muted` text; Watered → hover `--c-a` (blue); Fertilized → hover `--c-v` (yellow)
- fadeUp staggered animation for cards

**Files:**
- `src/app/plants/components/plant-gallery/plant-gallery.component.html`
- `src/app/plants/components/plant-gallery/plant-gallery.component.css`

---

### [x] Step 8 — `plant-preview.component` (HTML + CSS)

**Goal:** Restyle hover preview popup to dark glassmorphism matching the overall theme.

**HTML changes:**
- Replace Bootstrap grid/col structure with flat CSS
- Keep existing data: name, location icon, species, image

**CSS changes:**
- Remove light gradient (`#a1c4fd → #c2e9fb`)
- New: `--surface` bg, `--border-mid` border, `border-radius: 12px`, `backdrop-filter: blur(16px)`
- `box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--border)`
- Name: `JetBrains Mono`, `--text` color, font-weight 700
- Meta text: `--text-muted`, Outfit font
- Icon: `--c-p` (green) color (plant accent)
- Image: `border-radius: 8px`, constrained size

**Files:**
- `src/app/plants/dialogs/plant-preview/plant-preview.component.html`
- `src/app/plants/dialogs/plant-preview/plant-preview.component.css`

---

### [x] Step 9 — Dialog Components (HTML + CSS for all 3)

**Goal:** Style all three dialogs with dark theme overrides.

**Approach:** Add a `<style>` override or component CSS targeting `::ng-deep` Material dialog backdrop/panel, OR add a single shared dialog class to each.

**Changes per dialog:**

**delete-confirmation-dialog:**
- Title: `JetBrains Mono`, `--text` color
- Content text: `--text-muted`
- Confirm button: `--c-p` green icon, 10% green bg
- Cancel button: `--c-e` pink icon, 10% pink bg

**image-upload-dialog:**
- Title: monospace style
- File input: `--raised` bg, `--border` border, `--text` color
- Cancel button: flat dark style
- Upload button: `--c-a` (blue) filled style

**image-view-dialog:**
- Title: monospace style
- Image: constrained, `border-radius: 8px`
- Close button: flat dark style

**All dialogs need (via global styles or per-component CSS):**
```css
::ng-deep .mat-mdc-dialog-container {
  background: var(--surface) !important;
  border: 1px solid var(--border-mid) !important;
  border-radius: 12px !important;
  color: var(--text) !important;
}
```
> Note: Since CSS variables are on `:host`, dialogs need either a wrapper div with the variables defined, or the variables should be promoted to a global `:root` block in `styles.css`.

**Files:**
- `src/app/plants/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component.html`
- `src/app/plants/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component.css`
- `src/app/plants/dialogs/image-upload-dialog/image-upload-dialog.component.html`
- `src/app/plants/dialogs/image-upload-dialog/image-upload-dialog.component.css`
- `src/app/plants/dialogs/image-view-dialog/image-view-dialog.component.html`
- `src/app/plants/dialogs/image-view-dialog/image-view-dialog.component.css`

---

### [ ] Step 10 — Global CSS Tokens for Dialogs

**Goal:** Promote shared design tokens to `:root` in `styles.css` so they are accessible inside Material dialog overlays (which escape component scope).

**Changes to `src/styles.scss`:**
Add `:root` block with all shared design tokens (same values as `:host` in home/bookings).
This allows dialogs and any future CDK overlays to access `var(--bg)`, `var(--surface)`, etc.

**File:**
- `src/styles.scss`

---

## Execution Order

Steps should be executed in order 10 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9.
(Step 10 first to have tokens available for dialog CSS; then layout → home → inward.)

---

## Verification

After implementation:
1. Run `npm start` and navigate to `/plant-root`
2. Check `plant-home` — 3 navcard-style cards with green/yellow/blue accents and fadeUp animations
3. Navigate to `/plant-root/gallery` — dark cards with responsive grid; pink/yellow left borders for care-due plants
4. Navigate to `/plant-root/management` — dark table with monospace headers, green hover rows, preview popup
5. Click a row → `/plant-root/edit/:id` — dark edit layout, green edit mode indicator
6. Navigate to `/plant-root/view/:id` — dark detail panel with tabs
7. Navigate to `/plant-root/create` — dark stepper form
8. Open delete/upload/view dialogs — verify dark background and token colors
9. Hover a table row — verify dark glassmorphism preview popup
10. Confirm all components use Outfit + JetBrains Mono fonts (check DevTools)
