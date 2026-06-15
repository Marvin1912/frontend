import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, switchMap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {MealTemplate} from '../../models/nutrition.model';
import {MealTemplateEditDialogComponent} from '../../dialogs/meal-template-edit-dialog/meal-template-edit-dialog.component';
import {MealTemplateDeleteDialogComponent} from '../../dialogs/meal-template-delete-dialog/meal-template-delete-dialog.component';

@Component({
  selector: 'app-nutrition-meals',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip
  ],
  templateUrl: './nutrition-meals.component.html',
  styleUrl: './nutrition-meals.component.css'
})
export class NutritionMealsComponent implements OnInit {

  templates: MealTemplate[] = [];
  columnsToDisplay = ['name', 'items', 'kcal', 'actions'];

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.reload();
  }

  totalKcal(template: MealTemplate): number {
    return template.items.reduce((s, i) => s + i.kcal, 0);
  }

  private reload(): void {
    this.nutritionService.getMealTemplates().subscribe(templates => {
      this.templates = templates;
      this.cdr.markForCheck();
    });
  }

  openAddDialog(): void {
    this.openEditDialog(null);
  }

  openEditDialog(template: MealTemplate | null): void {
    const ref = this.dialog.open(MealTemplateEditDialogComponent, {data: {template}});
    ref.afterClosed().pipe(
      switchMap(result => {
        if (!result) return EMPTY;
        return template
          ? this.nutritionService.updateMealTemplate(template.id, result)
          : this.nutritionService.createMealTemplate(result);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        if (template) {
          this.templates = this.templates.map(t => t.id === updated.id ? updated : t);
          this.snackBar.open('Mahlzeit aktualisiert', 'OK', {duration: 3000});
        } else {
          this.templates = [...this.templates, updated];
          this.snackBar.open('Mahlzeit gespeichert', 'OK', {duration: 3000});
        }
        this.cdr.markForCheck();
      },
      error: () => {
        const msg = template ? 'Mahlzeit konnte nicht aktualisiert werden' : 'Mahlzeit konnte nicht gespeichert werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }

  openDeleteDialog(template: MealTemplate): void {
    const ref = this.dialog.open(MealTemplateDeleteDialogComponent, {data: {name: template.name}});
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteMealTemplate(template.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.templates = this.templates.filter(t => t.id !== template.id);
        this.cdr.markForCheck();
        this.snackBar.open('Mahlzeit gelöscht', 'OK', {duration: 3000});
      },
      error: () => {
        this.snackBar.open('Mahlzeit konnte nicht gelöscht werden', 'Schließen', {duration: 5000});
      }
    });
  }
}
