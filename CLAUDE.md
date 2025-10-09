# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 19 frontend application with two main modules:
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
- **Angular 19** with standalone components (no NgModule)
- **Angular Material 19** with Azure Blue theme
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

## Key Files
- `src/app/app.config.ts` - Main application configuration
- `src/app/app.routes.ts` - Routing structure
- `src/environments/environment.ts` - API endpoints
- `angular.json` - Build configuration and styles
- When a new feature request comes in, go to master and pull --rebase and create a new feature branch.
- Create a pull request after you've finished your work.