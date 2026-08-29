import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, Observable, of, switchMap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Macros, MealPlan, MealPlanRow, MealPlanRowInput, MealPlanSection, MealPlanShoppingItem, MealType} from '../../models/nutrition.model';
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

const MEAL_TYPE_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

const MEAL_TYPE_DOT: Record<MealType, string> = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack'
};

/** A section's rows split by meal type, so each meal renders as its own visually distinct group. */
interface MealRowGroup {
  type: MealType;
  label: string;
  dotClass: string;
  rows: MealPlanRow[];
}

/**
 * One row as rendered in a meal-group table, annotated with alternative-cluster info: whether it
 * belongs to an "oder" cluster, whether it's the one currently counted toward totals (highest
 * kcal in its cluster), and whether an "oder" divider should follow it (i.e. the next rendered
 * row is its cluster-mate).
 */
interface DisplayRow {
  row: MealPlanRow;
  isAlternative: boolean;
  isCounted: boolean;
  showDividerAfter: boolean;
}

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
        this.plan = {
          ...plan,
          sections: plan.sections
            .filter(section => !section.title.includes('Tagesstruktur'))
            .map(section => ({...section, rows: section.rows ?? []}))
        };
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

  /** Splits a section's rows into one group per meal type, in a fixed display order. */
  mealGroups(section: MealPlanSection): MealRowGroup[] {
    return MEAL_TYPE_ORDER.map(type => ({
      type,
      label: this.mealTypeLabel(type),
      dotClass: MEAL_TYPE_DOT[type],
      rows: section.rows.filter(row => row.mealType === type)
    }));
  }

  rowLabel(row: MealPlanRow): string {
    return `${row.foodName} (${row.quantityG} g)`;
  }

  /** Macro totals across a section's rows, computed client-side (the backend no longer sends totals). */
  sectionTotals(rows: MealPlanRow[]): Macros {
    return this.resolveCountedRows(rows).reduce((acc, row) => ({
      kcal: acc.kcal + row.kcal,
      proteinG: acc.proteinG + row.proteinG,
      carbsG: acc.carbsG + row.carbsG,
      fatG: acc.fatG + row.fatG
    }), {kcal: 0, proteinG: 0, carbsG: 0, fatG: 0});
  }

  /**
   * Collapses each alternative-option cluster (rows sharing a non-null `alternativeGroupId`) down
   * to a single "worst-case ceiling" row — the one with the highest kcal — so totals still hold if
   * the user always picks the more caloric alternative. Standalone rows (no group) pass through
   * unchanged. On a kcal tie within a cluster, the first row encountered wins, consistently with
   * `displayRows()`'s `isCounted` flag.
   */
  private resolveCountedRows(rows: MealPlanRow[]): MealPlanRow[] {
    const standalone: MealPlanRow[] = [];
    const clusters = new Map<string, MealPlanRow[]>();
    for (const row of rows) {
      if (row.alternativeGroupId) {
        const cluster = clusters.get(row.alternativeGroupId);
        if (cluster) {
          cluster.push(row);
        } else {
          clusters.set(row.alternativeGroupId, [row]);
        }
      } else {
        standalone.push(row);
      }
    }
    const counted = [...clusters.values()].map(cluster => cluster.reduce((max, row) => row.kcal > max.kcal ? row : max));
    return [...standalone, ...counted];
  }

  /**
   * Rows for one meal-group table, reordered so alternative-cluster rows sit next to each other
   * (preserving first-appearance order otherwise), and annotated for the template: whether a row
   * is part of an "oder" cluster, whether it's the one currently counted toward totals, and
   * whether a divider should render after it.
   */
  displayRows(rows: MealPlanRow[]): DisplayRow[] {
    const clusters = new Map<string, MealPlanRow[]>();
    for (const row of rows) {
      const groupId = row.alternativeGroupId;
      if (!groupId) continue;
      const cluster = clusters.get(groupId);
      if (cluster) {
        cluster.push(row);
      } else {
        clusters.set(groupId, [row]);
      }
    }

    const ordered: MealPlanRow[] = [];
    const seenGroups = new Set<string>();
    for (const row of rows) {
      const groupId = row.alternativeGroupId;
      if (!groupId) {
        ordered.push(row);
        continue;
      }
      if (seenGroups.has(groupId)) continue;
      seenGroups.add(groupId);
      ordered.push(...(clusters.get(groupId) ?? [row]));
    }

    return ordered.map((row, index) => {
      const groupId = row.alternativeGroupId;
      const cluster = groupId ? clusters.get(groupId) : undefined;
      const isAlternative = !!cluster;
      const isCounted = !cluster || cluster.reduce((max, r) => r.kcal > max.kcal ? r : max).id === row.id;
      const next = ordered[index + 1];
      const showDividerAfter = isAlternative && !!next && next.alternativeGroupId === groupId;
      return {row, isAlternative, isCounted, showDividerAfter};
    });
  }

  /**
   * Shopping list derived client-side: quantityG summed by foodId across all sections, flat + alphabetical.
   * Each row's quantity is scaled by its section's dayCount, since a section like "Wochentage
   * (Montag – Donnerstag)" represents multiple calendar days, not one.
   */
  shoppingList(plan: MealPlan): MealPlanShoppingItem[] {
    const byFood = new Map<string, MealPlanShoppingItem>();
    for (const section of plan.sections) {
      for (const row of section.rows) {
        const quantityG = row.quantityG * section.dayCount;
        const existing = byFood.get(row.foodId);
        if (existing) {
          existing.totalQuantityG += quantityG;
        } else {
          byFood.set(row.foodId, {foodId: row.foodId, foodName: row.foodName, brand: null, totalQuantityG: quantityG});
        }
      }
    }
    return [...byFood.values()].sort((a, b) => a.foodName.localeCompare(b.foodName, 'de'));
  }

  openAddRowDialog(sectionId: string, mealType?: MealType): void {
    const data: MealPlanRowEditDialogData = {sectionId, row: null, defaultMealType: mealType};
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

  /**
   * Opens the row dialog in "add" mode, preset to the origin row's meal type, and on save wires
   * the new row up as an alternative/OR option for that slot: if the origin row isn't in a group
   * yet, a group id is generated client-side and the origin row is tagged with it first; either
   * way the new row is created with that same `alternativeGroupId`.
   */
  openAddAlternativeDialog(sectionId: string, originRow: MealPlanRow): void {
    const data: MealPlanRowEditDialogData = {sectionId, row: null, defaultMealType: originRow.mealType};
    const ref = this.dialog.open(MealPlanRowEditDialogComponent, {data});
    ref.afterClosed().pipe(
      switchMap((result: MealPlanRowInput | undefined) => {
        if (!result) return EMPTY;
        const groupId = originRow.alternativeGroupId ?? window.crypto.randomUUID();
        const ensureGroup$: Observable<unknown> = originRow.alternativeGroupId ? of(null) : this.nutritionService.updateMealPlanRow(originRow.id, {
          mealType: originRow.mealType,
          foodId: originRow.foodId,
          quantityG: originRow.quantityG,
          alternativeGroupId: groupId
        });
        return ensureGroup$.pipe(
          switchMap(() => this.nutritionService.addMealPlanRow(sectionId, {...result, alternativeGroupId: groupId}))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Alternative hinzugefügt', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Alternative konnte nicht gespeichert werden', 'Schließen', {duration: 5000})
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
