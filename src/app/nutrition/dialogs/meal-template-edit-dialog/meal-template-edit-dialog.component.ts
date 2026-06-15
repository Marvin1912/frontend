import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatOption} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButton, MatIconButton} from '@angular/material/button';
import {catchError, debounceTime, distinctUntilChanged, finalize, of, startWith, switchMap, tap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, MealTemplate, MealTemplateInput} from '../../models/nutrition.model';

export interface MealTemplateEditDialogData {
  template: MealTemplate | null;
}

/** A food + portion staged for the template, with per-100 g macros snapshot for display. */
interface StagedItem {
  foodId: string;
  foodName: string;
  quantityG: number;
  kcalPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
}

@Component({
  selector: 'app-meal-template-edit-dialog',
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
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatIcon,
    MatProgressSpinner,
    MatIconButton,
    MatButton
  ],
  templateUrl: './meal-template-edit-dialog.component.html',
  styleUrl: './meal-template-edit-dialog.component.css'
})
export class MealTemplateEditDialogComponent implements OnInit {

  private nutritionService = inject(NutritionService);
  private dialogRef = inject(MatDialogRef<MealTemplateEditDialogComponent>);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private data = inject<MealTemplateEditDialogData>(MAT_DIALOG_DATA);

  @ViewChild('quantityInput') quantityInput?: ElementRef<HTMLInputElement>;

  title = this.data.template ? 'Mahlzeit bearbeiten' : 'Mahlzeit hinzufügen';

  name = new FormControl(this.data.template?.name ?? '', {nonNullable: true, validators: Validators.required});
  foodSearch = new FormControl<string | Food>('', {nonNullable: true});
  quantityG = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  form = new FormGroup({name: this.name, foodSearch: this.foodSearch, quantityG: this.quantityG});

  results: Food[] = [];
  selected: Food | null = null;
  searchFailed = false;
  searching = false;

  staged: StagedItem[] = (this.data.template?.items ?? []).map(item => ({
    foodId: item.foodId,
    foodName: item.foodName,
    quantityG: item.quantityG,
    kcalPer100: item.kcal / item.quantityG * 100,
    proteinPer100: item.proteinG / item.quantityG * 100,
    carbsPer100: item.carbsG / item.quantityG * 100,
    fatPer100: item.fatG / item.quantityG * 100
  }));

  ngOnInit(): void {
    this.foodSearch.valueChanges.pipe(
      startWith(this.foodSearch.value),
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

  get canAdd(): boolean {
    return !!this.selected && this.quantityG.valid && Number(this.quantityG.value) > 0;
  }

  addToStaged(): void {
    if (!this.canAdd || !this.selected) return;
    this.staged.push({
      foodId: this.selected.id,
      foodName: this.selected.name,
      quantityG: Number(this.quantityG.value),
      kcalPer100: this.selected.kcalPer100,
      proteinPer100: this.selected.proteinPer100,
      carbsPer100: this.selected.carbsPer100,
      fatPer100: this.selected.fatPer100
    });
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
    if (this.name.invalid) return;
    const result: MealTemplateInput = {
      name: this.name.value.trim(),
      items: this.staged.map(item => ({foodId: item.foodId, quantityG: item.quantityG}))
    };
    this.dialogRef.close(result);
  }
}
