# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 20 frontend application with two main modules:
1. **Banking/Accounting Module** - Processes camt files to display monthly booking entries and identify cost outliers
2. **Plant Management System** - Complete CRUD application for managing plants with images and watering schedules

## Development Commands

```bash
npm start            # Start development server
npm run build        # Build for production
npm run watch        # Build in watch mode for development
npm test             # Run tests
```

## Architecture

### Technology Stack
- **Angular 20** with standalone components (no NgModule)
- **Angular Material 20** with Azure Blue theme
- **Bootstrap 5.3.6** + SASS for styling
- **TypeScript** strict mode with ES2022 target
- **Docker** + Nginx for deployment

### Project Structure
```
src/app/
├── backend/          # Banking/accounting module
│   ├── model/       # DTOs for camt file processing (BookingsDTO, MonthlyBookingEntriesDTO)
│   ├── bookings/    # Booking entries component
│   └── table/       # Table display component
├── plants/          # Plant management system
│   ├── model/       # Plant data models (Plant, PlantLocation)
│   ├── plant-*/     # Various plant components
│   ├── dialogs/     # Dialog components
│   ├── plant-service/ # Plant CRUD API service
│   └── image-service/ # Image handling service
└── home/            # Home component
```

### Key Patterns
- **Standalone Components**: All components use standalone architecture with direct imports
- **Service Layer**: HTTP services use Observable pattern with RxJS
- **Strong TypeScript Typing**: Interface-based models throughout
- **Nested Routing**: Parent/child route relationships with navigation context

### API Integration
- **Development API**: `http://localhost:9001`
- **Banking endpoints**: `/camt-entries`, `/export/costs`
- **Plant endpoints**: `/plants`, `/images`

## Configuration

### Environment
- German locale configured (`de-DE`)
- Date format: `DD.MM.YYYY` using Moment.js adapter
- Production bundle size limits: 4.5MB warning, 5MB error

### Deployment
- Multi-stage Docker build (Node.js build + Nginx serving)
- Pushes to private registry: `192.168.178.29:5000`
- Nginx configured for SPA routing with asset caching

## Workflow & Development Process

### 🔄 Git Workflow
1. **Start New Work**: Always begin on the `master` branch
2. **Update Master**: Pull latest changes with `git pull --rebase`
3. **Create Feature Branch**: Create a new branch for your work
4. **Complete Task**: Implement your changes thoroughly
5. **Create Pull Request**: **ALWAYS** create a PR after finishing work

### 📋 Pull Request Requirements
- **Create a PR after EVERY completed task or feature**
- **Include clear description** of changes made
- **Reference any related issues** if applicable
- **Ensure code is tested** and builds successfully
- **Wait for review** before merging

### ✅ Completion Checklist
Before creating a pull request, ensure:
- [ ] Code compiles without errors (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] Feature is fully implemented
- [ ] Code follows project patterns
- [ ] Documentation is updated if needed

### 🚨 CRITICAL REMINDER - PULL REQUESTS ARE MANDATORY
**ALWAYS CREATE A PULL REQUEST AFTER COMPLETING ANY WORK**
- **NO EXCEPTIONS** - Every task, fix, or feature requires a PR
- **NO EXCUSES** - "I forgot" is not acceptable
- **IMMEDIATE ACTION** - Create PR immediately after committing changes
- **REVIEW FIRST** - Wait for review before considering work "done"

**This is the most important rule in this project. Pull requests are not optional.**

## Key Files
- `src/app/app.config.ts` - Main application configuration
- `src/app/app.routes.ts` - Routing structure
- `src/environments/environment.ts` - API endpoints
- `angular.json` - Build configuration and styles