# Angular Control Flow Migration Plan
## Migrate from `*ngIf`, `*ngFor`, `*ngSwitch` to `@if`, `@for`, `@switch`

This document provides a step-by-step migration plan for converting Angular's old structural directives to the new block control flow syntax.

---

## Files to Migrate (9 files total)

| # | File | *ngIf | *ngFor | Total |
|---|------|-------|--------|-------|
| 1 | `src/app/influxdb-buckets/influxdb-buckets.html` | 15 | 1 | 16 |
| 2 | `src/app/plants/dialogs/plant-preview/plant-preview.component.html` | 2 | 0 | 2 |
| 3 | `src/app/plants/components/plant-view/plant-view.component.html` | 1 | 0 | 1 |
| 4 | `src/app/mental-arithmetic/components/arithmetic-session/arithmetic-session.component.ts` | 1 | 0 | 1 |
| 5 | `src/app/mental-arithmetic/components/arithmetic-session/arithmetic-session.component.html` | 20 | 0 | 20 |
| 6 | `src/app/mental-arithmetic/components/arithmetic-settings/arithmetic-settings.component.html` | 5 | 0 | 5 |
| 7 | `src/app/plants/components/plant-create/plant-create.component.html` | 5 | 1 | 6 |
| 8 | `src/app/plants/components/plant-edit/plant-edit.component.html` | 23 | 1 | 24 |
| 9 | `src/app/plants/components/plant-gallery/plant-gallery.component.html` | 0 | 1 | 1 |

---

## Migration Rules

### `*ngIf` → `@if`

**Before:**
```html
<div *ngIf="condition">Content</div>
```

**After:**
```html
@if (condition) {
  <div>Content</div>
}
```

### `*ngIf` with `else` → `@if` / `@else`

**Before:**
```html
<span *ngIf="file.size; else noSize">{{ formatFileSize(file.size) }}</span>
<ng-template #noSize>No size info</ng-template>
```

**After:**
```html
@if (file.size) {
  <span>{{ formatFileSize(file.size) }}</span>
} @else {
  <span>No size info</span>
}
```

### `*ngFor` → `@for`

**Before:**
```html
<tr *ngFor="let bucket of buckets">
```

**After:**
```html
@for (bucket of buckets; track bucket) {
  <tr>
```

**Note:** The new `@for` syntax requires a `track` expression. Use `track $index` if items are primitives, or track by a unique identifier like `track bucket.id` or just `track bucket` if the object reference is sufficient.

### `*ngIf` with `; else` and `; then` → `@if` / `@else`

**Before:**
```html
<ng-container *ngIf="condition; then thenBlock; else elseBlock"></ng-container>
<ng-template #thenBlock>Then content</ng-template>
<ng-template #elseBlock>Else content</ng-template>
```

**After:**
```html
@if (condition) {
  Then content
} @else {
  Else content
}
```

---

## Step-by-Step Migration

### Step 1: `src/app/influxdb-buckets/influxdb-buckets.html` (16 usages)

**Line 4:**
```html
<!-- Before -->
<div *ngIf="isLoading" class="text-center mt-4">

<!-- After -->
@if (isLoading) {
  <div class="text-center mt-4">
```

**Line 11:**
```html
<!-- Before -->
<div *ngIf="error" class="alert alert-danger mt-4">

<!-- After -->
@if (error) {
  <div class="alert alert-danger mt-4">
```

**Line 15:**
```html
<!-- Before -->
<div *ngIf="!isLoading && !error && buckets.length === 0" class="alert alert-info mt-4">

<!-- After -->
@if (!isLoading && !error && buckets.length === 0) {
  <div class="alert alert-info mt-4">
```

**Line 19:**
```html
<!-- Before -->
<div *ngIf="!isLoading && !error && buckets.length > 0" class="row mt-4">

<!-- After -->
@if (!isLoading && !error && buckets.length > 0) {
  <div class="row mt-4">
```

**Line 37:**
```html
<!-- Before -->
<tr *ngFor="let bucket of buckets">

<!-- After -->
@for (bucket of buckets; track bucket) {
  <tr>
```

**Line 65:**
```html
<!-- Before -->
<div *ngIf="isLoadingFiles" class="text-center mt-4">

<!-- After -->
@if (isLoadingFiles) {
  <div class="text-center mt-4">
```

**Line 70:**
```html
<!-- Before -->
<div *ngIf="filesError" class="alert alert-danger mt-4">

<!-- After -->
@if (filesError) {
  <div class="alert alert-danger mt-4">
```

**Line 74:**
```html
<!-- Before -->
<div *ngIf="!isLoadingFiles && !filesError && files.length === 0" class="alert alert-info mt-4">

<!-- After -->
@if (!isLoadingFiles && !filesError && files.length === 0) {
  <div class="alert alert-info mt-4">
```

**Line 78:**
```html
<!-- Before -->
<div *ngIf="!isLoadingFiles && !filesError && files.length > 0" class="mt-4">

<!-- After -->
@if (!isLoadingFiles && !filesError && files.length > 0) {
  <div class="mt-4">
```

**Lines 98-101 (with else block):**
```html
<!-- Before -->
<span *ngIf="file.size; else noSize">{{ formatFileSize(file.size) }}</span>
<ng-template #noSize>-</ng-template>

<!-- After -->
@if (file.size) {
  <span>{{ formatFileSize(file.size) }}</span>
} @else {
  <span>-</span>
}
```

**Lines 107-110 (with else block):**
```html
<!-- Before -->
<span *ngIf="file.modifiedTime; else noTime">{{ formatDate(file.modifiedTime) }}</span>
<ng-template #noTime>-</ng-template>

<!-- After -->
@if (file.modifiedTime) {
  <span>{{ formatDate(file.modifiedTime) }}</span>
} @else {
  <span>-</span>
}
```

**Line 163:**
```html
<!-- Before -->
<div *ngIf="exportError" class="alert alert-danger">

<!-- After -->
@if (exportError) {
  <div class="alert alert-danger">
```

**Line 170:**
```html
<!-- Before -->
<span *ngIf="isExporting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

<!-- After -->
@if (isExporting) {
  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
}
```

**Line 177:**
```html
<!-- Before -->
<div *ngIf="showExportModal" class="modal-backdrop fade show" (click)="closeExportModal()"></div>

<!-- After -->
@if (showExportModal) {
  <div class="modal-backdrop fade show" (click)="closeExportModal()"></div>
}
```

---

### Step 2: `src/app/plants/dialogs/plant-preview/plant-preview.component.html` (2 usages)

**Line 1:**
```html
<!-- Before -->
<div class="plant-box" *ngIf="plant">

<!-- After -->
@if (plant) {
  <div class="plant-box">
```

**Line 17:**
```html
<!-- Before -->
<div class="col plant-box-image" *ngIf="imageUrl">

<!-- After -->
@if (imageUrl) {
  <div class="col plant-box-image">
```

---

### Step 3: `src/app/plants/components/plant-view/plant-view.component.html` (1 usage)

**Line 2:**
```html
<!-- Before -->
<mat-card appearance="raised" *ngIf="plant"

<!-- After -->
@if (plant) {
  <mat-card appearance="raised"
```

---

### Step 4: `src/app/mental-arithmetic/components/arithmetic-session/arithmetic-session.component.ts` (1 usage)

**Line 511:**
```html
<!-- Before -->
        <div class="session-stats" *ngIf="data">

<!-- After -->
        @if (data) {
          <div class="session-stats">
```

---

### Step 5: `src/app/mental-arithmetic/components/arithmetic-session/arithmetic-session.component.html` (20 usages)

**Line 3:**
```html
<!-- Before -->
  <div *ngIf="isLoading" class="loading-container">

<!-- After -->
  @if (isLoading) {
    <div class="loading-container">
```

**Line 9:**
```html
<!-- Before -->
  <div *ngIf="!isLoading && currentSession" class="session-content">

<!-- After -->
  @if (!isLoading && currentSession) {
    <div class="session-content">
```

**Line 25:**
```html
<!-- Before -->
      <div class="timer-section" [class.time-warning]="isTimeRunningOut" *ngIf="sessionTimeLimit">

<!-- After -->
      @if (sessionTimeLimit) {
        <div class="timer-section" [class.time-warning]="isTimeRunningOut">
```

**Line 43:**
```html
<!-- Before -->
    <div *ngIf="isSessionStarted && !isSessionCompleted" class="training-area">

<!-- After -->
    @if (isSessionStarted && !isSessionCompleted) {
      <div class="training-area">
```

**Line 52:**
```html
<!-- Before -->
            <div *ngIf="showFeedback" class="feedback-message">

<!-- After -->
            @if (showFeedback) {
              <div class="feedback-message">
```

**Line 53:**
```html
<!-- Before -->
              <ng-container *ngIf="lastAnswerCorrect">

<!-- After -->
              @if (lastAnswerCorrect) {
                <ng-container>
```

**Line 57:**
```html
<!-- Before -->
              <ng-container *ngIf="!lastAnswerCorrect">

<!-- After -->
              } @else {
                <ng-container>
```

**Line 67:**
```html
<!-- Before -->
      <div class="answer-input-area" *ngIf="!showFeedback">

<!-- After -->
      @if (!showFeedback) {
        <div class="answer-input-area">
```

**Line 75:**
```html
<!-- Before -->
                <mat-error *ngIf="answerForm.get('userAnswer')?.hasError('required')">

<!-- After -->
                @if (answerForm.get('userAnswer')?.hasError('required')) {
                  <mat-error>
```

**Line 78:**
```html
<!-- Before -->
                <mat-error *ngIf="answerForm.get('userAnswer')?.hasError('pattern')">

<!-- After -->
                @if (answerForm.get('userAnswer')?.hasError('pattern')) {
                  <mat-error>
```

**Line 106:**
```html
<!-- Before -->
      <div class="number-pad" *ngIf="!showFeedback">

<!-- After -->
      @if (!showFeedback) {
        <div class="number-pad">
```

**Line 149:**
```html
<!-- Before -->
                *ngIf="!isPaused"

<!-- After -->
                @if (!isPaused) {
```

**Line 157:**
```html
<!-- Before -->
                *ngIf="isPaused"

<!-- After -->
                } @else {
```

**Line 168:**
```html
<!-- Before -->
    <div *ngIf="isSessionCompleted" class="session-completed">

<!-- After -->
    @if (isSessionCompleted) {
      <div class="session-completed">
```

**Line 212:**
```html
<!-- Before -->
    <div *ngIf="isPaused" class="paused-overlay">

<!-- After -->
    @if (isPaused) {
      <div class="paused-overlay">
```

---

### Step 6: `src/app/mental-arithmetic/components/arithmetic-settings/arithmetic-settings.component.html` (5 usages)

**Line 32:**
```html
<!-- Before -->
              <mat-error *ngIf="getErrorMessage()" class="error-message">

<!-- After -->
              @if (getErrorMessage()) {
                <mat-error class="error-message">
```

**Line 86:**
```html
<!-- Before -->
                <mat-error *ngIf="settingsForm.get('timeLimit')?.invalid && settingsForm.get('timeLimit')?.touched">

<!-- After -->
                @if (settingsForm.get('timeLimit')?.invalid && settingsForm.get('timeLimit')?.touched) {
                  <mat-error>
```

**Line 106:**
```html
<!-- Before -->
                <mat-error *ngIf="settingsForm.get('problemCount')?.invalid && settingsForm.get('problemCount')?.touched">

<!-- After -->
                @if (settingsForm.get('problemCount')?.invalid && settingsForm.get('problemCount')?.touched) {
                  <mat-error>
```

**Line 113:**
```html
<!-- Before -->
            <div *ngIf="settingsForm.invalid && settingsForm.touched" class="validation-summary">

<!-- After -->
            @if (settingsForm.invalid && settingsForm.touched) {
              <div class="validation-summary">
```

---

### Step 7: `src/app/plants/components/plant-create/plant-create.component.html` (6 usages)

**Line 6:**
```html
<!-- Before -->
        <ng-container *ngIf="!isSmallScreen">Basic Info</ng-container>

<!-- After -->
        @if (!isSmallScreen) {
          <ng-container>Basic Info</ng-container>
        }
```

**Line 37:**
```html
<!-- Before -->
        <ng-container *ngIf="!isSmallScreen">Location</ng-container>

<!-- After -->
        @if (!isSmallScreen) {
          <ng-container>Location</ng-container>
        }
```

**Line 43:**
```html
<!-- Before -->
          <mat-option *ngFor="let loc of plantLocationOptions" [value]="loc">

<!-- After -->
          @for (loc of plantLocationOptions; track loc) {
            <mat-option [value]="loc">
```

**Line 59:**
```html
<!-- Before -->
        <ng-container *ngIf="!isSmallScreen">Care Details</ng-container>

<!-- After -->
        @if (!isSmallScreen) {
          <ng-container>Care Details</ng-container>
        }
```

**Line 100:**
```html
<!-- Before -->
        <ng-container *ngIf="!isSmallScreen">Image</ng-container>

<!-- After -->
        @if (!isSmallScreen) {
          <ng-container>Image</ng-container>
        }
```

---

### Step 8: `src/app/plants/components/plant-edit/plant-edit.component.html` (24 usages)

**Line 9:**
```html
<!-- Before -->
      <ng-container *ngIf="isEditMode">

<!-- After -->
      @if (isEditMode) {
        <ng-container>
```

**Line 15:**
```html
<!-- Before -->
        <mat-icon *ngIf="!isEditMode;else editIconButton">construction</mat-icon>
<ng-template #editIconButton>edit</ng-template>

<!-- After -->
        @if (!isEditMode) {
          <mat-icon>construction</mat-icon>
        } @else {
          <mat-icon>edit</mat-icon>
        }
```

**Line 29:**
```html
<!-- Before -->
        <ng-container *ngIf="!isEditMode; else editImage">

<!-- After -->
        @if (!isEditMode) {
          <ng-container>
```

**Line 30:**
```html
<!-- Before -->
          <img *ngIf="plant?.image && imageUrl" [src]="imageUrl" alt="Plant image" class="img-fluid img rounded-3"/>
<ng-template #editImage>...</ng-template>

<!-- After -->
          @if (plant?.image && imageUrl) {
            <img [src]="imageUrl" alt="Plant image" class="img-fluid img rounded-3"/>
          }
        } @else {
          <ng-container>
            ...edit image content...
          </ng-container>
        }
```

**Line 42:**
```html
<!-- Before -->
      *ngIf="plant"

<!-- After -->
      @if (plant) {
```

**Line 57:**
```html
<!-- Before -->
            <div *ngIf="!isEditMode; else editDescription" class="description">{{ plant.description }}</div>
<ng-template #editDescription>...</ng-template>

<!-- After -->
            @if (!isEditMode) {
              <div class="description">{{ plant.description }}</div>
            } @else {
              ...edit description...
            }
```

**Line 60:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
            @if (tempPlant) {
              <ng-container>
```

**Line 70:**
```html
<!-- Before -->
              *ngIf="!isEditMode; else editCareInstructions"

<!-- After -->
              @if (!isEditMode) {
```

**Line 75:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
            } @else {
              <ng-container>
```

**Line 86:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editSpecies">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 90:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

**Line 98:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editLocation">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 102:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

**Line 104:**
```html
<!-- Before -->
                <mat-option *ngFor="let loc of plantLocationOptions" [value]="loc">

<!-- After -->
                @for (loc of plantLocationOptions; track loc) {
                  <mat-option [value]="loc">
```

**Line 117:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editLastWatered">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 121:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

**Line 134:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editWateringFrequency">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 138:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

**Line 149:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editLastFertilized">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 153:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

**Line 166:**
```html
<!-- Before -->
          <ng-container *ngIf="!isEditMode; else editFertilizingFrequency">

<!-- After -->
          @if (!isEditMode) {
            <ng-container>
```

**Line 170:**
```html
<!-- Before -->
            <ng-container *ngIf="tempPlant">

<!-- After -->
          } @else {
            <ng-container>
```

---

### Step 9: `src/app/plants/components/plant-gallery/plant-gallery.component.html` (1 usage)

**Line 3:**
```html
<!-- Before -->
    <div *ngFor="let plant of plants()" class="col-sm-12 col-md-6 col-xl-4 h-100 p-2">

<!-- After -->
    @for (plant of plants(); track plant) {
      <div class="col-sm-12 col-md-6 col-xl-4 h-100 p-2">
```

---

## Verification Steps

After completing all migrations:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Run tests:**
   ```bash
   npm test
   ```

3. **Run lint:**
   ```bash
   npm run lint
   ```

4. **Verify no remaining old syntax:**
   ```bash
   grep -r "\*ngIf" src/app --include="*.html" --include="*.ts"
   grep -r "\*ngFor" src/app --include="*.html" --include="*.ts"
   grep -r "\*ngSwitch" src/app --include="*.html" --include="*.ts"
   ```

   All commands should return no results.

---

## Summary

- **Total files to migrate:** 9
- **Total *ngIf usages:** 72
- **Total *ngFor usages:** 4
- **Total *ngSwitch usages:** 0
- **Grand total:** 76 migrations
