import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton, MatIconButton} from '@angular/material/button';
import {catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, switchMap, tap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, FoodEntryInput, Macros, MealType} from '../../models/nutrition.model';

/** Optional defaults for the add-entry dialog (e.g. the meal type tapped). */
export interface AddDayEntryDialogData {
  mealType?: MealType;
}

/** A food + portion staged for the batch result, before the dialog is confirmed. */
interface StagedItem {
  food: Food;
  quantityG: number;
  mealType: MealType;
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
    MatIconButton,
    MatButton
  ],
  templateUrl: './add-day-entry-dialog.component.html',
  styleUrl: './add-day-entry-dialog.component.css'
})
export class AddDayEntryDialogComponent implements OnInit {

  private nutritionService = inject(NutritionService);
  private dialogRef = inject(MatDialogRef<AddDayEntryDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private data = inject<AddDayEntryDialogData>(MAT_DIALOG_DATA, {optional: true});

  @ViewChild('quantityInput') quantityInput?: ElementRef<HTMLInputElement>;

  readonly mealTypes = MEAL_TYPES;

  mealType = new FormControl<MealType>(this.data?.mealType ?? 'LUNCH', {nonNullable: true});
  foodSearch = new FormControl<string | Food>('', {nonNullable: true});
  quantityG = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  form = new FormGroup({mealType: this.mealType, foodSearch: this.foodSearch, quantityG: this.quantityG});

  results: Food[] = [];
  selected: Food | null = null;
  searchFailed = false;
  searching = false;

  /** Foods staged in this dialog session, returned together as one batch on confirm. */
  staged: StagedItem[] = [];

  ngOnInit(): void {
    this.foodSearch.valueChanges.pipe(
      startWith(this.foodSearch.value),
      // Once a food is picked the control holds a Food object; skip searching then.
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.searchFailed = false;
        this.searching = true;
        this.cdr.markForCheck();
      }),
      switchMap(value => {
        return this.nutritionService.searchFoods(typeof value === 'string' ? value.trim() : '').pipe(
          catchError(() => {
            this.searchFailed = true;
            return of<Food[]>([]);
          }),
          finalize(() => {
            this.searching = false;
            this.cdr.markForCheck();
          })
        );
      }),
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
    this.selected = event.option.value as Food;
    if (this.quantityG.value == null && this.selected.defaultServingG != null) {
      this.quantityG.setValue(this.selected.defaultServingG);
    }
    this.cdr.markForCheck();
    // Move focus to the quantity field after the value is patched and the input is rendered/enabled.
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

  /** Macro value for a staged item's portion, scaled from the per-100 g figure. */
  scaledFor(item: StagedItem, per100: number): number {
    return per100 * item.quantityG / 100;
  }

  /** Human-readable label for a staged item's meal type. */
  mealTypeLabel(mealType: MealType): string {
    return this.mealTypes.find(m => m.value === mealType)?.label ?? mealType;
  }

  /** Running macro totals across all staged items. */
  get totals(): Macros {
    return this.staged.reduce((acc, item) => ({
      kcal: acc.kcal + this.scaledFor(item, item.food.kcalPer100),
      proteinG: acc.proteinG + this.scaledFor(item, item.food.proteinPer100),
      carbsG: acc.carbsG + this.scaledFor(item, item.food.carbsPer100),
      fatG: acc.fatG + this.scaledFor(item, item.food.fatPer100)
    }), {kcal: 0, proteinG: 0, carbsG: 0, fatG: 0});
  }

  get canAdd(): boolean {
    return !!this.selected && this.quantityG.valid && Number(this.quantityG.value) > 0;
  }

  get canSave(): boolean {
    return this.staged.length > 0 || this.canAdd;
  }

  /** Append the currently selected food + quantity to the staged list and reset the inputs. */
  addToStaged(): void {
    if (!this.canAdd || !this.selected) return;
    this.staged.push({food: this.selected, quantityG: Number(this.quantityG.value), mealType: this.mealType.value});
    this.selected = null;
    this.foodSearch.setValue('');
    this.quantityG.setValue(null);
    this.cdr.markForCheck();
  }

  removeStaged(index: number): void {
    this.staged.splice(index, 1);
    this.cdr.markForCheck();
  }

  save(): void {
    const items = [...this.staged];
    if (this.canAdd && this.selected) {
      items.push({food: this.selected, quantityG: Number(this.quantityG.value), mealType: this.mealType.value});
    }
    if (items.length === 0) return;
    const result: FoodEntryInput[] = items.map(item => ({
      mealType: item.mealType,
      foodId: item.food.id,
      quantityG: item.quantityG
    }));
    this.dialogRef.close(result);
  }
}
