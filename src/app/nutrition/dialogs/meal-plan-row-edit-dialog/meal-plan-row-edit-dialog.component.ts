import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatSelect} from '@angular/material/select';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatOption} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton} from '@angular/material/button';
import {catchError, debounceTime, distinctUntilChanged, EMPTY, finalize, of, startWith, switchMap, tap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, MealPlanRow, MealPlanRowInput, MealType} from '../../models/nutrition.model';
import {FoodEditDialogComponent} from '../food-edit-dialog/food-edit-dialog.component';

export interface MealPlanRowEditDialogData {
  sectionId: string;
  row: MealPlanRow | null;
}

/** The currently chosen food for this row, with per-100 g macros for the live preview. */
interface SelectedFood {
  foodId: string;
  foodName: string;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  defaultServingG: number | null;
}

const MEAL_TYPES: { value: MealType; label: string }[] = [
  {value: 'BREAKFAST', label: 'Frühstück'},
  {value: 'LUNCH', label: 'Mittagessen'},
  {value: 'DINNER', label: 'Abendessen'},
  {value: 'SNACK', label: 'Snack'}
];

@Component({
  selector: 'app-meal-plan-row-edit-dialog',
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
    MatError,
    MatSuffix,
    MatInput,
    NoWheelDirective,
    MatSelect,
    MatOption,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatIcon,
    MatProgressSpinner,
    MatButton
  ],
  templateUrl: './meal-plan-row-edit-dialog.component.html',
  styleUrl: './meal-plan-row-edit-dialog.component.css'
})
export class MealPlanRowEditDialogComponent implements OnInit {

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<MealPlanRowEditDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private data = inject<MealPlanRowEditDialogData>(MAT_DIALOG_DATA);

  @ViewChild('quantityInput') quantityInput?: ElementRef<HTMLInputElement>;

  readonly mealTypes = MEAL_TYPES;
  title = this.data.row ? 'Eintrag bearbeiten' : 'Eintrag hinzufügen';

  mealType = new FormControl<MealType>(this.data.row?.mealType ?? 'BREAKFAST', {nonNullable: true});
  foodSearch = new FormControl<string | Food>(this.data.row?.foodName ?? '', {nonNullable: true});
  quantityG = new FormControl<number | null>(this.data.row?.quantityG ?? null, [Validators.required, Validators.min(0)]);
  form = new FormGroup({mealType: this.mealType, foodSearch: this.foodSearch, quantityG: this.quantityG});

  results: Food[] = [];
  selected: SelectedFood | null = this.data.row ? {
    foodId: this.data.row.foodId,
    foodName: this.data.row.foodName,
    kcalPer100: this.data.row.kcal / this.data.row.quantityG * 100,
    proteinPer100: this.data.row.proteinG / this.data.row.quantityG * 100,
    carbsPer100: this.data.row.carbsG / this.data.row.quantityG * 100,
    fatPer100: this.data.row.fatG / this.data.row.quantityG * 100,
    defaultServingG: null
  } : null;
  searchFailed = false;
  searching = false;
  private lastQuery = '';

  ngOnInit(): void {
    this.foodSearch.valueChanges.pipe(
      startWith(this.foodSearch.value),
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => {
        this.lastQuery = typeof value === 'string' ? value.trim() : '';
        this.searchFailed = false;
        this.searching = true;
        this.cdr.markForCheck();
      }),
      switchMap(value => this.nutritionService.searchFoods(typeof value === 'string' ? value.trim() : '').pipe(
        catchError(() => {
          this.searchFailed = true;
          return of<Food[]>([]);
        }),
        finalize(() => {
          this.searching = false;
          this.cdr.markForCheck();
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(foods => {
      this.results = foods;
      this.cdr.markForCheck();
    });
  }

  displayFood(food: Food | string | null): string {
    return food && typeof food !== 'string' ? food.name : (food ?? '');
  }

  onFoodSelected(event: MatAutocompleteSelectedEvent): void {
    const food = event.option.value as Food;
    this.applySelection(food);
  }

  private applySelection(food: Food): void {
    this.selected = {
      foodId: food.id,
      foodName: food.name,
      kcalPer100: food.kcalPer100,
      proteinPer100: food.proteinPer100,
      carbsPer100: food.carbsPer100,
      fatPer100: food.fatPer100,
      defaultServingG: food.defaultServingG
    };
    if (this.quantityG.value == null && food.defaultServingG != null) {
      this.quantityG.setValue(food.defaultServingG);
    }
    this.cdr.markForCheck();
    setTimeout(() => {
      const input = this.quantityInput?.nativeElement;
      input?.focus();
      input?.select();
    });
  }

  /** Macro value for the current portion, scaled from the per-100 g figure. */
  scaled(per100: number): number {
    const qty = Number(this.quantityG.value);
    if (!this.selected || !qty) return 0;
    return per100 * qty / 100;
  }

  /** No food matched the search — offer the "create new food" escape hatch. */
  get noResults(): boolean {
    return !this.searching && !this.searchFailed && this.results.length === 0 && this.lastQuery.length > 0;
  }

  get canSave(): boolean {
    return !!this.selected && this.quantityG.valid && Number(this.quantityG.value) > 0;
  }

  openCreateFoodDialog(): void {
    const ref = this.dialog.open(FoodEditDialogComponent, {data: {food: null, source: 'MANUAL'}});
    ref.afterClosed().pipe(
      switchMap(result => result ? this.nutritionService.createFood(result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(food => {
      this.foodSearch.setValue(food, {emitEvent: false});
      this.applySelection(food);
    });
  }

  save(): void {
    if (!this.canSave || !this.selected) return;
    const result: MealPlanRowInput = {
      mealType: this.mealType.value,
      foodId: this.selected.foodId,
      quantityG: Number(this.quantityG.value)
    };
    this.dialogRef.close(result);
  }
}
