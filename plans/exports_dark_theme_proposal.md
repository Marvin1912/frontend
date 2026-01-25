# Exports: modern dark fluid theme (component-scoped proposal)

Scope: only the exports feature under [`src/app/exports/`](src/app/exports/) (both landing + Influx buckets + modal). No global styles.

## 1) What exists today (styling surface inventory)

### Landing page

- Page shell: Bootstrap container and spacing in [`src/app/exports/exports.component.html`](src/app/exports/exports.component.html)
  - Title row + home icon button (Angular Material) lines around [`src/app/exports/exports.component.html:1`](src/app/exports/exports.component.html:1)
- “Export Options” cards: Angular Material cards + icons + OPEN button, plus one placeholder card lines around [`src/app/exports/exports.component.html:10`](src/app/exports/exports.component.html:10)
- “Quick Exports”: 2 raised Material buttons + inline spinner lines around [`src/app/exports/exports.component.html:41`](src/app/exports/exports.component.html:41)
- “Exported Files”: loading/empty/error states + Bootstrap card wrapper + Angular Material table lines around [`src/app/exports/exports.component.html:59`](src/app/exports/exports.component.html:59)
- Current styling is light, card-hover lift, basic quick-actions background in [`src/app/exports/exports.component.css:1`](src/app/exports/exports.component.css:1)

### InfluxDB buckets page + modal

- Page shell: Bootstrap container, header row, alert states in [`src/app/exports/influxdb-buckets.component.html:1`](src/app/exports/influxdb-buckets.component.html:1)
- Data view: Bootstrap card + table-striped in [`src/app/exports/influxdb-buckets.component.html:30`](src/app/exports/influxdb-buckets.component.html:30)
- Modal: Bootstrap-like modal markup with backdrop in [`src/app/exports/influxdb-buckets.component.html:77`](src/app/exports/influxdb-buckets.component.html:77)
- Current CSS is light with a subtle card shadow in [`src/app/exports/influxdb-buckets.component.css:1`](src/app/exports/influxdb-buckets.component.css:1)

## 2) Visual direction

Modern dark + fluid means:

- **Layered surfaces**: deep background + elevated panels (cards, tables, modal) with subtle borders (not heavy shadows).
- **Soft gradients**: very gentle radial glow in the background to avoid flat black.
- **High-clarity typography**: strong heading contrast, muted secondary text.
- **Tactile interactions**: hover lift + border brightening + crisp focus ring.
- **Accessible contrast**: keep text/background contrast safe; avoid low-contrast gray-on-gray.

### Inspiration references (patterns to emulate, not copy)

- Linear (dark, soft gradient, precise type): screenshot saved at [`plans/assets/linear-dark-ui.png`](plans/assets/linear-dark-ui.png)
- GitHub dark mode (table legibility, muted borders, clear focus states)
- Vercel dashboard dark (flat, premium surfaces, subtle separators)
- Stripe dashboard patterns (dense data tables with clear hierarchy)

## 3) Component-scoped design tokens

Because we cannot touch global styles, define tokens inside each component stylesheet using component host scoping.

Recommended token set (same values used in both component CSS files):

```css
/* Component-scoped theme tokens */
:host {
  /* Backgrounds */
  --ex-bg: #0b0f17;
  --ex-bg-2: #0a1221;
  --ex-surface: rgba(255, 255, 255, 0.06);
  --ex-surface-2: rgba(255, 255, 255, 0.08);
  --ex-surface-3: rgba(255, 255, 255, 0.10);

  /* Borders & shadows */
  --ex-border: rgba(255, 255, 255, 0.10);
  --ex-border-strong: rgba(255, 255, 255, 0.16);
  --ex-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  --ex-shadow-soft: 0 8px 24px rgba(0, 0, 0, 0.35);

  /* Text */
  --ex-text: rgba(255, 255, 255, 0.92);
  --ex-text-muted: rgba(255, 255, 255, 0.68);
  --ex-text-faint: rgba(255, 255, 255, 0.52);

  /* Accent */
  --ex-accent: #7c5cff;      /* violet */
  --ex-accent-2: #22d3ee;    /* cyan */
  --ex-focus: rgba(124, 92, 255, 0.55);

  /* Status */
  --ex-danger: #ff4d4d;
  --ex-warning: #ffb020;
  --ex-success: #3ddc97;

  /* Shape & spacing */
  --ex-radius-lg: 16px;
  --ex-radius-md: 12px;
  --ex-radius-sm: 10px;
  --ex-gap: 16px;
}
```

Notes:

- Use the violet/cyan combo for a “modern” feel (Linear-ish), but keep actual UI accents predominantly violet to avoid a neon mess.
- Prefer borders + mild shadow over heavy drop shadows.

## 4) Layout and styling proposal (landing page)

Target file: [`src/app/exports/exports.component.css`](src/app/exports/exports.component.css)

### Shell

- Turn the page into a “panel layout” without touching the rest of the app:
  - background: radial gradient glow + deep base
  - increase vertical rhythm; keep it fluid with max width

Proposed rules (illustrative snippet):

```css
/* Applies only inside this component due to view encapsulation */
.container {
  max-width: 1200px;
}

.container {
  color: var(--ex-text);
}

/* optional: if we add a wrapper class in the template, use that instead of .container */
```

### Export cards

- Make cards feel premium:
  - glassy surface, subtle border
  - hover: translateY( -2px ) + border brighten + shadow increase
  - icon becomes gradient-tinted (using `mask` is optional; simplest is coloring the icon)

### Quick actions

- Replace the current light gray panel with a dark “toolbar” surface:
  - `background: var(--ex-surface)`
  - border and radius consistent with cards
  - allow wrapping on small screens; remove hardcoded left margin patterns where possible

### Files table (Bootstrap card + Material table)

- Use a single consistent data panel:
  - card: surface + border
  - table header: slightly stronger surface
  - row hover: surface bump; keep separators visible
- Ensure icons and the delete action have clear affordance:
  - delete icon uses `--ex-danger`
  - add hover background to icon buttons

### Empty/loading/error states

- Replace bootstrap alert colors with dark equivalents:
  - info: surface with cyan border highlight (low saturation)
  - danger: surface with red border highlight

## 5) Layout and styling proposal (Influx buckets + modal)

Target file: [`src/app/exports/influxdb-buckets.component.css`](src/app/exports/influxdb-buckets.component.css)

### Buckets table

- Move away from `table-striped` feel to “dark data grid”:
  - header: `--ex-surface-2`
  - rows: transparent with bottom borders
  - hover: `--ex-surface`
  - code pill: dark chip w/ border

### Buttons

- Bootstrap buttons should appear cohesive with Material buttons on the landing page:
  - primary: violet background
  - secondary/outline: transparent with border
  - hover/focus: brightened border + focus ring

### Modal

- Modal backdrop: deeper + slightly blurred look (blur is optional; some browsers only)
- Modal surface: highest elevation, stronger border, subtle top highlight
- Form controls: dark inputs with clear focus states

## 6) Minimal template hooks (recommended)

Component-scoped CSS can target existing classes, but a few **safe class hooks** make the CSS more robust and reduce reliance on framework internals.

### Landing page hooks

Add these classes in [`src/app/exports/exports.component.html:1`](src/app/exports/exports.component.html:1):

- On the root wrapper: `exports-shell`
- On the title row: `exports-header`
- On the quick actions wrapper: `exports-quick`
- On the files card wrapper: `exports-files`

### Influx buckets hooks

Add these classes in [`src/app/exports/influxdb-buckets.component.html:1`](src/app/exports/influxdb-buckets.component.html:1):

- Root wrapper: `exports-shell`
- Modal root: `exports-modal`

These hooks are additive only; no layout/logic changes.

## 7) Accessibility and motion

- Focus ring: visible on dark (`box-shadow: 0 0 0 3px var(--ex-focus)`)
- Contrast:
  - body text uses `--ex-text`
  - muted text stays above ~0.65 alpha (avoid too faint)
- Motion:
  - keep hover transitions 160–220ms
  - respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
```

## 8) Acceptance criteria (what “done” looks like)

- Both pages feel like one cohesive dark theme.
- Cards, tables, and the modal share the same surface language (radius, border, elevation).
- Hover/focus states are consistent and accessible.
- No changes outside the exports components.

---

Implementation targets (later, in Code mode):

- [`src/app/exports/exports.component.css`](src/app/exports/exports.component.css)
- [`src/app/exports/influxdb-buckets.component.css`](src/app/exports/influxdb-buckets.component.css)
- Optional minimal class additions in:
  - [`src/app/exports/exports.component.html`](src/app/exports/exports.component.html)
  - [`src/app/exports/influxdb-buckets.component.html`](src/app/exports/influxdb-buckets.component.html)
