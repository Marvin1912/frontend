# CLAUDE.md

## Project Overview
Angular 20 frontend with two modules:
1. **Banking** - camt file processing, monthly bookings, cost outliers
2. **Plant Management** - CRUD for plants with images & watering schedules

## Commands
```bash
npm start            # Dev server
npm run build        # Production build
npm run watch        # Watch build
npm test             # Run tests
```

## Architecture
- **Stack**: Angular 20 standalone, Angular Material 20, Bootstrap 5.3.6, TypeScript ES2022
- **API**: `http://localhost:9001` - `/camt-entries`, `/export/costs`, `/plants`, `/images`
- **Locale**: German (`de-DE`), date format `DD.MM.YYYY`

## Workflow Process

### 📝 TODO Lists - ALWAYS CREATE BEFORE ANY TASK
Use TodoWrite tool for:
- Multi-step implementation work
- Breaking down user requests into items
- Feature development planning
- Bug fix investigation & implementation
- Code refactoring tracking

**Best Practices:**
- Specific, actionable items
- Mark `in_progress` when starting, `completed` when finished
- Only ONE task `in_progress` at a time
- Add new tasks discovered during implementation

### 🔄 Git Workflow
1. Start on `master` branch
2. `git pull --rebase` for latest changes
3. Create feature branch
4. Implement thoroughly
5. **ALWAYS** create PR after finishing

### ✅ Pre-PR Checklist
- [ ] Code compiles (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Feature fully implemented
- [ ] Code follows patterns
- [ ] Documentation updated

### 🚨 PULL REQUESTS ARE MANDATORY
**ALWAYS CREATE A PR AFTER COMPLETING ANY WORK**
- NO EXCEPTIONS - Every task/fix/feature requires a PR
- NO EXCUSES - "I forgot" is not acceptable
- IMMEDIATE ACTION - Create PR immediately after committing
- REVIEW FIRST - Wait for review before considering work "done"

**This is the most important rule. Pull requests are not optional.**

## Key Files
- `src/app/app.config.ts` - Main configuration
- `src/app/app.routes.ts` - Routing
- `src/environments/environment.ts` - API endpoints
- `angular.json` - Build configuration