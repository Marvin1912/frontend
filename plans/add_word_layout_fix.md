# Add-Word Layout Fix: Three Independent Columns

## Problem

The current layout nests `.translation-section` inside `.dictionary-section` (a column flex container).
Because `.entries-container` has `flex: 1`, it expands to consume **all** remaining height in
`.dictionary-section`, leaving zero room for `.translation-section` — which is visually clipped and
never reachable without a second scrollbar on the outer page.

```
.add-word-main  (row flex)
├── .dictionary-section  (column flex, flex: 1.5)
│   ├── .panel-header           flex-shrink: 0  ✓ visible
│   ├── .entries-container      flex: 1         ← swallows entire height
│   └── .translation-section    flex-shrink: 0  ✗ pushed out of view
└── .save-word-section  (column flex, flex: 1)
```

---

## Proposed Layout

Promote `.translation-section` out of `.dictionary-section` and make it its own peer column.
Result: three independent, side-by-side panels — each self-contained and independently scrollable.

```
.add-word-main  (row flex, gap: 1rem)
├── .dictionary-section   (flex: 1.4, column)
│   ├── .panel-header
│   └── .entries-container  (flex: 1, overflow-y: auto)
├── .translation-section  (flex: 0.8, column)   ← moved here
│   ├── .panel-header
│   ├── form
│   └── .translation-result
└── .save-word-section    (flex: 1, column, overflow-y: auto)
    ├── .panel-header
    ├── .part-of-speech-toggle-group
    └── form
```

### Column widths (flex ratios)

| Column | Flex | Approx % | Rationale |
|---|---|---|---|
| Dictionary | `1.4` | ~43 % | Most content; entries list is primary interaction area |
| Translation | `0.8` | ~25 % | Compact form + single result line |
| Save Word | `1` | ~31 % | Form with 4 fields + toggle group |

---

## HTML Changes (`add-word.component.html`)

Move the entire `.translation-section` block out of `.dictionary-section` and place it as a direct
child of `.add-word-main`, between `.dictionary-section` and `.save-word-section`.

**Before (abbreviated):**
```html
<div class="add-word-main">
  <div class="dictionary-section">
    ...entries...
    <!-- Translation Section -->
    <div class="translation-section">...</div>   ← inside dictionary column
  </div>
  <div class="save-word-section">...</div>
</div>
```

**After:**
```html
<div class="add-word-main">
  <div class="dictionary-section">
    ...entries only...
  </div>

  <!-- Translation Section — now a peer column -->
  <div class="translation-section">...</div>

  <div class="save-word-section">...</div>
</div>
```

No other HTML changes are needed.

---

## CSS Changes (`add-word.component.css`)

### 1 — Remove `flex: 1.5` from `.dictionary-section`, assign new ratios

```css
.dictionary-section {
  display: flex;
  flex-direction: column;
  flex: 1.4;
  min-height: 0;
}
```

### 2 — `.translation-section` becomes a column flex peer

```css
.translation-section {
  display: flex;
  flex-direction: column;
  flex: 0.8;
  min-height: 0;
  /* keep existing styles: margin-top removed (no longer needed) */
}

.translation-section form {
  display: flex;
  flex-direction: column;
}
```

Remove `margin-top: 1rem` from `.translation-section` (was a hack to push it below entries).

### 3 — `.save-word-section` — no ratio change needed

```css
.save-word-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
```

### 4 — Mobile breakpoint — update stacking order

On mobile (`max-width: 820px`), all three columns stack vertically. The translation section needs
`flex: none` and `min-height: auto` just like the other two:

```css
@media (max-width: 820px) {
  .add-word-main {
    flex-direction: column;
    overflow-y: auto;
  }

  .dictionary-section,
  .translation-section,       /* ← add this */
  .save-word-section {
    flex: none;
    min-height: auto;
    overflow: visible;
  }

  .entries-container {
    max-height: 50vh;
  }
}
```

---

## What Does NOT Change

- All design tokens, colours, fonts, animations — untouched.
- `.entries-container` scroll behaviour — still `flex: 1; overflow-y: auto` within its own column.
- All `::ng-deep` Material overrides — untouched (selectors already include `.translation-section`).
- Component TypeScript — no changes.

---

## Files to Modify

| File | Change |
|---|---|
| `src/app/vocabulary/components/add-word/add-word.component.html` | Move `.translation-section` out of `.dictionary-section` |
| `src/app/vocabulary/components/add-word/add-word.component.css` | Adjust flex ratios + mobile breakpoint |

---

## Verification

1. `npm run build` passes.
2. At desktop (≥ 820 px): three columns visible side by side; entries list scrolls independently; translation form fully visible; save-word form fully visible.
3. At mobile (< 820 px): all three sections stack vertically in order — dictionary → translation → save word.
4. `npm run lint` passes.
