import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, switchMap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Macros, MealPlan, MealPlanRow, MealPlanRowInput, MealPlanShoppingItem, MealType} from '../../models/nutrition.model';
import {
  MealPlanRowEditDialogComponent,
  MealPlanRowEditDialogData
} from '../../dialogs/meal-plan-row-edit-dialog/meal-plan-row-edit-dialog.component';
import {EntryDeleteDialogComponent} from '../../dialogs/entry-delete-dialog/entry-delete-dialog.component';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Frühstück',
  LUNCH: 'Mittagessen',
  DINNER: 'Abendessen',
  SNACK: 'Snack'
};

@Component({
  selector: 'app-nutrition-meal-plan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinner, MatButton, MatIconButton, MatIcon, DecimalPipe],
  templateUrl: './nutrition-meal-plan.component.html',
  styleUrl: './nutrition-meal-plan.component.css'
})
export class NutritionMealPlanComponent implements OnInit {

  plan: MealPlan | null = null;
  loading = true;
  unavailable = false;

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.unavailable = false;
    this.cdr.markForCheck();

    this.nutritionService.getMealPlan().subscribe({
      next: plan => {
        this.plan = plan;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.plan = null;
        this.loading = false;
        this.unavailable = true;
        this.cdr.markForCheck();
      }
    });
  }

  mealTypeLabel(mealType: MealType): string {
    return MEAL_TYPE_LABELS[mealType];
  }

  rowLabel(row: MealPlanRow): string {
    return `${row.foodName} (${row.quantityG} g)`;
  }

  /** Macro totals across a section's rows, computed client-side (the backend no longer sends totals). */
  sectionTotals(rows: MealPlanRow[]): Macros {
    return rows.reduce((acc, row) => ({
      kcal: acc.kcal + row.kcal,
      proteinG: acc.proteinG + row.proteinG,
      carbsG: acc.carbsG + row.carbsG,
      fatG: acc.fatG + row.fatG
    }), {kcal: 0, proteinG: 0, carbsG: 0, fatG: 0});
  }

  /** Shopping list derived client-side: quantityG summed by foodId across all sections, flat + alphabetical. */
  shoppingList(plan: MealPlan): MealPlanShoppingItem[] {
    const byFood = new Map<string, MealPlanShoppingItem>();
    for (const section of plan.sections) {
      for (const row of section.rows) {
        const existing = byFood.get(row.foodId);
        if (existing) {
          existing.totalQuantityG += row.quantityG;
        } else {
          byFood.set(row.foodId, {foodId: row.foodId, foodName: row.foodName, brand: null, totalQuantityG: row.quantityG});
        }
      }
    }
    return [...byFood.values()].sort((a, b) => a.foodName.localeCompare(b.foodName, 'de'));
  }

  openAddRowDialog(sectionId: string): void {
    const data: MealPlanRowEditDialogData = {sectionId, row: null};
    const ref = this.dialog.open(MealPlanRowEditDialogComponent, {data});
    ref.afterClosed().pipe(
      switchMap((result: MealPlanRowInput | undefined) => result ? this.nutritionService.addMealPlanRow(sectionId, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag hinzugefügt', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Eintrag konnte nicht gespeichert werden', 'Schließen', {duration: 5000})
    });
  }

  openEditRowDialog(sectionId: string, row: MealPlanRow): void {
    const data: MealPlanRowEditDialogData = {sectionId, row};
    const ref = this.dialog.open(MealPlanRowEditDialogComponent, {data});
    ref.afterClosed().pipe(
      switchMap((result: MealPlanRowInput | undefined) => result ? this.nutritionService.updateMealPlanRow(row.id, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag aktualisiert', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Eintrag nicht gefunden' : 'Eintrag konnte nicht aktualisiert werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }

  openDeleteRowDialog(row: MealPlanRow): void {
    const ref = this.dialog.open(EntryDeleteDialogComponent, {data: {label: this.rowLabel(row)}});
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteMealPlanRow(row.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Eintrag nicht gefunden' : 'Eintrag konnte nicht gelöscht werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }
}
