import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {debounceTime, distinctUntilChanged, startWith, switchMap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, FoodEntryInput, MealType} from '../../models/nutrition.model';

/** Optional defaults for the add-entry dialog (e.g. the meal type tapped). */
export interface AddDayEntryDialogData {
  mealType?: MealType;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  {value: 'BREAKFAST', label: 'Frühstück'},
  {value: 'LUNCH', label: 'Mittagessen'},
  {value: 'DINNER', label: 'Abendessen'},
  {value: 'SNACK', label: 'Snack'}
];

@Component({
  selector: 'app-add-day-entry-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './add-day-entry-dialog.component.html',
  styleUrl: './add-day-entry-dialog.component.css'
})
export class AddDayEntryDialogComponent implements OnInit {

  private nutritionService = inject(NutritionService);
  private dialogRef = inject(MatDialogRef<AddDayEntryDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  private data = inject<AddDayEntryDialogData>(MAT_DIALOG_DATA, {optional: true});

  readonly mealTypes = MEAL_TYPES;

  mealType = new FormControl<MealType>(this.data?.mealType ?? 'LUNCH', {nonNullable: true});
  foodSearch = new FormControl<string | Food>('', {nonNullable: true});
  quantityG = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  form = new FormGroup({mealType: this.mealType, foodSearch: this.foodSearch, quantityG: this.quantityG});

  results: Food[] = [];
  selected: Food | null = null;

  ngOnInit(): void {
    this.foodSearch.valueChanges.pipe(
      startWith(this.foodSearch.value),
      // Once a food is picked the control holds a Food object; skip searching then.
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this.nutritionService.searchFoods(typeof value === 'string' ? value.trim() : ''))
    ).subscribe(foods => {
      this.results = foods;
      this.cdr.markForCheck();
    });
  }

  displayFood(food: Food | string | null): string {
    return food && typeof food !== 'string' ? food.name : (food ?? '');
  }

  onFoodSelected(event: MatAutocompleteSelectedEvent): void {
    this.selected = event.option.value as Food;
    if (this.quantityG.value == null && this.selected.defaultServingG != null) {
      this.quantityG.setValue(this.selected.defaultServingG);
    }
    this.cdr.markForCheck();
  }

  /** Macro value for the current portion, scaled from the per-100 g figure. */
  scaled(per100: number): number {
    const qty = Number(this.quantityG.value);
    if (!this.selected || !qty) return 0;
    return per100 * qty / 100;
  }

  get canSave(): boolean {
    return !!this.selected && this.quantityG.valid && Number(this.quantityG.value) > 0;
  }

  save(): void {
    if (!this.canSave || !this.selected) return;
    const result: FoodEntryInput = {
      mealType: this.mealType.value,
      foodId: this.selected.id,
      quantityG: Number(this.quantityG.value)
    };
    this.dialogRef.close(result);
  }
}
