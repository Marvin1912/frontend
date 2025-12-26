# Plants Directory Restructure Plan

## Current Issues
1. **Naming confusion**: `plant-details` is read-only, `plant-edit` is editable with toggle
2. **No clear structure**: All components at root level
3. **Inconsistent naming**: `plant-main` is just a nav hub, `plant-list` uses tables
4. **Selector mismatch**: `PlantEditComponent` selector is `app-plant-detail` (not `app-plant-edit`)

## Proposed Directory Structure

```
plants/
├── components/
│   ├── layout/
│   │   └── plant-layout/          # Was: plant-root (layout wrapper with header + menu)
│   ├── home/
│   │   └── plant-home/            # Was: plant-main (navigation landing page)
│   ├── management/
│   │   └── plant-table/           # Was: plant-list (table view with edit/delete/image)
│   ├── gallery/
│   │   └── plant-gallery/         # Was: plant-overview (card grid + watering)
│   ├── create/
│   │   └── plant-create/          # Was: plant-form (multi-step create form)
│   ├── view/
│   │   └── plant-view/            # Was: plant-details (read-only detail view)
│   └── edit/
│       └── plant-edit/            # Was: plant-edit (editable with toggle view/edit mode)
├── dialogs/
│   ├── image-upload-dialog/       # Was: create-image-dialog
│   ├── image-view-dialog/         # Was: show-image-dialog
│   ├── delete-confirmation-dialog/ # Was: delete-plant-dialog
│   └── plant-preview/             # Was: show-plant-dialog (hover preview popup)
├── services/
│   ├── plant.service.ts           # Move from plant-service/plant.service.ts
│   └── image.service.ts           # Move from image-service/image.service.ts
├── models/
│   ├── plant.model.ts             # Was: model/plant.ts
│   └── plant-location.enum.ts     # Was: model/plantLocation.ts
└── tokens/
    └── plant-overlay.token.ts     # Was: tokens/plant-overlay-token.ts
```

## Component Mapping

| Old Name | New Name | New Path |
|----------|----------|----------|
| plant-root | plant-layout | components/layout/plant-layout |
| plant-main | plant-home | components/home/plant-home |
| plant-list | plant-table | components/management/plant-table |
| plant-overview | plant-gallery | components/gallery/plant-gallery |
| plant-form | plant-create | components/create/plant-create |
| plant-details | plant-view | components/view/plant-view |
| plant-edit | plant-edit | components/edit/plant-edit |
| dialogs/create-image-dialog | image-upload-dialog | dialogs/image-upload-dialog |
| dialogs/show-image-dialog | image-view-dialog | dialogs/image-view-dialog |
| dialogs/delete-plant-dialog | delete-confirmation-dialog | dialogs/delete-confirmation-dialog |
| dialogs/show-plant-dialog | plant-preview | dialogs/plant-preview |
| model/plant.ts | plant.model.ts | models/plant.model.ts |
| model/plantLocation.ts | plant-location.enum.ts | models/plant-location.enum.ts |
| tokens/plant-overlay-token.ts | plant-overlay.token.ts | tokens/plant-overlay.token.ts |
| plant-service/* | (move up) | services/plant.service.ts |
| image-service/* | (move up) | services/image.service.ts |

## Steps to Implement

### Step 1: Create new directory structure ✅ COMPLETED
```bash
mkdir -p src/app/plants/components/{layout,home,management,gallery,create,view,edit}
mkdir -p src/app/plants/dialogs/{image-upload-dialog,image-view-dialog,delete-confirmation-dialog,plant-preview}
mkdir -p src/app/plants/services
mkdir -p src/app/plants/models
mkdir -p src/app/plants/tokens
```

### Step 2: Move and rename model files ✅ COMPLETED
- `model/plant.ts` → `models/plant.model.ts` (update export if needed)
- `model/plantLocation.ts` → `models/plant-location.enum.ts` (update export if needed)

### Step 3: Move and rename token files
- `tokens/plant-overlay-token.ts` → `tokens/plant-overlay.token.ts`

### Step 4: Move services
- `plant-service/plant.service.ts` → `services/plant.service.ts`
- `image-service/image.service.ts` → `services/image.service.ts`
- Delete empty `plant-service/` and `image-service/` directories

### Step 5: Move and rename layout component (plant-root)
- Move to `components/layout/plant-layout/`
- Rename files: `plant-root.component.*` → `plant-layout.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file, any components using it

### Step 6: Move and rename home component (plant-main)
- Move to `components/home/plant-home/`
- Rename files: `plant-main.component.*` → `plant-home.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file

### Step 7: Move and rename table component (plant-list)
- Move to `components/management/plant-table/`
- Rename files: `plant-list.component.*` → `plant-table.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file

### Step 8: Move and rename gallery component (plant-overview)
- Move to `components/gallery/plant-gallery/`
- Rename files: `plant-overview.component.*` → `plant-gallery.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file

### Step 9: Move and rename create component (plant-form)
- Move to `components/create/plant-create/`
- Rename files: `plant-form.component.*` → `plant-create.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file

### Step 10: Move and rename view component (plant-details)
- Move to `components/view/plant-view/`
- Rename files: `plant-details.component.*` → `plant-view.component.*`
- Update: selector, className, templateUrl, styleUrls
- Update imports in: routing file

### Step 11: Move and rename edit component (plant-edit)
- Move to `components/edit/plant-edit/`
- Keep selector as `app-plant-detail` (to maintain consistency with existing usage)
- Update: className to `PlantEditComponent` (for consistency with new name)
- Update: templateUrl, styleUrls
- Update imports in: routing file

### Step 12: Move and rename dialogs
- `dialogs/create-image-dialog/` → `dialogs/image-upload-dialog/`
  - Rename files, update selector, className
- `dialogs/show-image-dialog/` → `dialogs/image-view-dialog/`
  - Rename files, update selector, className
- `dialogs/delete-plant-dialog/` → `dialogs/delete-confirmation-dialog/`
  - Rename files, update selector, className
- `dialogs/show-plant-dialog/` → `dialogs/plant-preview/`
  - Rename files, update selector, className

### Step 13: Update routing configuration in src/app/app.routes.ts

Update the imports to point to new component paths:
```typescript
import {PlantLayoutComponent} from './plants/components/layout/plant-layout/plant-layout.component';
import {PlantHomeComponent} from './plants/components/home/plant-home/plant-home.component';
import {PlantTableComponent} from './plants/components/management/plant-table/plant-table.component';
import {PlantGalleryComponent} from './plants/components/gallery/plant-gallery/plant-gallery.component';
import {PlantCreateComponent} from './plants/components/create/plant-create/plant-create.component';
import {PlantViewComponent} from './plants/components/view/plant-view/plant-view.component';
import {PlantEditComponent} from './plants/components/edit/plant-edit/plant-edit.component';
```

Update the route configuration:
```typescript
{
  path: 'plant-root',
  component: PlantLayoutComponent,
  children: [
    {path: '', component: PlantHomeComponent, data: {home: '/'}},
    {path: 'create', component: PlantCreateComponent, data: {home: '/plant-root'}},
    {path: 'management', component: PlantTableComponent, data: {home: '/plant-root'}},
    {path: 'gallery', component: PlantGalleryComponent, data: {home: '/plant-root'}},
    {path: 'edit/:id', component: PlantEditComponent, data: {home: '/plant-root'}},
    {path: 'view/:id', component: PlantViewComponent, data: {home: '/plant-root'}}
  ]
}
```

**NOTE**: Route paths are also updated for clarity:
- `plant-form` → `create`
- `plant-list` → `management`
- `plant-overview` → `gallery`
- `plant/:id` → `view/:id`
- `plant-edit/:id` → `edit/:id`

### Step 14: Update menu links in plant-layout component
The `PlantLayoutComponent` (was `plant-root`) contains menu links that need updating:
```typescript
// Update routerLink values:
- 'plant-form' → 'create'
- 'plant-list' → 'management'
- 'plant-overview' → 'gallery'
```

### Step 15: Update navigation card links in plant-home component
The `PlantHomeComponent` (was `plant-main`) contains navigation cards with routerLink:
```typescript
// Update routerLink values:
- 'plant-overview' → 'gallery'
- 'plant-list' → 'management'
- 'plant-form' → 'create'
```

### Step 15b: Update navigation in plant-table component
The `PlantTableComponent` (was `plant-list`) navigates to the edit page:
```typescript
// Update router navigation:
- ['/plant-root/plant-edit', plant.id] → ['/plant-root/edit', plant.id]
```

Also update `PlantGalleryComponent` navigation:
```typescript
// Update router navigation:
- ['/plant-root/plant', plant.id] → ['/plant-root/view', plant.id]
```

### Step 16: Update all imports across all components
- Update model imports: `./model/plant` → `../models/plant.model`
- Update service imports: `./plant-service/plant.service` → `../../services/plant.service`
- Update dialog imports based on new relative paths
- Update token import: `./tokens/plant-overlay-token` → `../../tokens/plant-overlay.token`

### Step 17: Clean up empty directories
- Remove old empty directories after all moves:
  - `plant-root/`, `plant-main/`, `plant-list/`, `plant-overview/`
  - `plant-form/`, `plant-details/`, `plant-edit/`
  - `plant-service/`, `image-service/`, `model/`, `dialogs/`, `tokens/`

### Step 18: Verify build
```bash
npm run build
```

### Step 19: Commit changes
```bash
git add .
git commit -m "refactor(plants): restructure directory with better naming"
```

### Step 20: Push to current branch
```bash
git push origin plant_improvements
```

## Critical Files to Modify
- `src/app/app.routes.ts` - Routing configuration
- `src/app/plants/components/layout/plant-layout/plant-layout.component.ts` - Layout wrapper
- `src/app/plants/components/home/plant-home/plant-home.component.ts` - Home/landing
- `src/app/plants/components/management/plant-table/plant-table.component.ts` - Table view
- `src/app/plants/components/gallery/plant-gallery/plant-gallery.component.ts` - Card gallery
- `src/app/plants/components/create/plant-create/plant-create.component.ts` - Create form
- `src/app/plants/components/view/plant-view/plant-view.component.ts` - Read-only view
- `src/app/plants/components/edit/plant-edit/plant-edit.component.ts` - Editable view
- All dialog components in `dialogs/` subdirectories
- `src/app/plants/services/plant.service.ts`
- `src/app/plants/services/image.service.ts`
- `src/app/plants/models/plant.model.ts`
- `src/app/plants/models/plant-location.enum.ts`
