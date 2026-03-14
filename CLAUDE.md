# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- `npm start` — dev server (localhost:4200)
- `npm run build` — production build
- `npm test` — Karma + Jasmine
- `npm run lint` / `npm run lint:fix`

## Stack
Angular 20 standalone components, RxJS (no NgRx), Angular Material 20 (Azure Blue) + Bootstrap 5.3.6 + SASS. Backend API at `http://localhost:9001`.

## Modules (`src/app/`)
- `backend/` → `/account` — CAMT bank statement upload & analysis
- `plants/` → `/plant-root` — plant CRUD with images
- `vocabulary/` → `/vocabulary` — flashcard language learning
- `mental-arithmetic/` → `/mental-arithmetic` — timed math sessions
- `exports/` → `/exports` — Anki sync & data export
- `home/` → `/` — landing page

## Patterns
- State via service-based RxJS (`providedIn: 'root'`), no store library
- File uploads: `FormData` + `{observe: 'response'}` to read `Location` header for resource UUID
- Domain error classes for API errors (see `vocabulary/` for pattern)
- Dates: Moment.js, `de-DE` locale, `DD.MM.YYYY` format
- `ChangeDetectionStrategy.OnPush` in data-heavy components
- Layout components wrap child routes; `data: {home: '/path'}` passes nav context

## Development
These steps apply to **every change** (features, fixes, refactors, style tweaks — no exceptions):
1. Branch off latest master: `git checkout master && git pull origin master && git checkout -b <type>/<short-description>`
   - Branch prefixes: `feature/`, `fix/`, `style/`, `refactor/`
2. Implement the change.
3. Run `npm run build` — must succeed before continuing.
4. Commit and push the branch.
5. Open a Pull Request on GitHub targeting `master`.
