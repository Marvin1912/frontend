import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {NutritionService} from '../../services/nutrition.service';
import {MealTemplate, MealType} from '../../models/nutrition.model';

export interface MealTemplatePickerDialogData {
  mealType: MealType;
}

export interface MealTemplatePickerDialogResult {
  templateId: string;
  mealType: MealType;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  {value: 'BREAKFAST', label: 'Frühstück'},
  {value: 'LUNCH', label: 'Mittagessen'},
  {value: 'DINNER', label: 'Abendessen'},
  {value: 'SNACK', label: 'Snack'}
];

@Component({
  selector: 'app-meal-template-picker-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatProgressSpinner,
    MatButton
  ],
  templateUrl: './meal-template-picker-dialog.component.html',
  styleUrl: './meal-template-picker-dialog.component.css'
})
export class MealTemplatePickerDialogComponent implements OnInit {

  private nutritionService = inject(NutritionService);
  private dialogRef = inject(MatDialogRef<MealTemplatePickerDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private data = inject<MealTemplatePickerDialogData>(MAT_DIALOG_DATA);

  readonly mealTypes = MEAL_TYPES;

  mealType = new FormControl<MealType>(this.data.mealType, {nonNullable: true});

  templates: MealTemplate[] = [];
  selected: MealTemplate | null = null;
  loading = true;
  loadFailed = false;

  ngOnInit(): void {
    this.nutritionService.getMealTemplates().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: templates => {
        this.templates = templates;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadFailed = true;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  totalKcal(template: MealTemplate): number {
    return template.items.reduce((sum, item) => sum + item.kcal, 0);
  }

  select(template: MealTemplate): void {
    this.selected = template;
    this.cdr.markForCheck();
  }

  get canConfirm(): boolean {
    return !!this.selected;
  }

  confirm(): void {
    if (!this.selected) return;
    const result: MealTemplatePickerDialogResult = {templateId: this.selected.id, mealType: this.mealType.value};
    this.dialogRef.close(result);
  }
}
