import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {format} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {AdHocEntryInput, MealEstimate, MealType} from '../../models/nutrition.model';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  {value: 'BREAKFAST', label: 'Frühstück'},
  {value: 'LUNCH', label: 'Mittagessen'},
  {value: 'DINNER', label: 'Abendessen'},
  {value: 'SNACK', label: 'Snack'}
];

@Component({
  selector: 'app-nutrition-canteen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './nutrition-canteen.component.html',
  styleUrl: './nutrition-canteen.component.css'
})
export class NutritionCanteenComponent implements OnInit {

  readonly mealTypes = MEAL_TYPES;

  description = new FormControl('', {nonNullable: true, validators: Validators.required});
  mealType = new FormControl<MealType>('LUNCH', {nonNullable: true});
  date = new FormControl<Date>(new Date(), {nonNullable: true});

  /** Editable macro values; populated once an estimate arrives. */
  valuesForm!: FormGroup;
  assumptions = '';
  estimating = false;
  logging = false;
  hasEstimate = false;

  private fb = inject(FormBuilder);
  private nutritionService = inject(NutritionService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.valuesForm = this.fb.group({
      kcal: [0, [Validators.required, Validators.min(0)]],
      proteinG: [0, [Validators.required, Validators.min(0)]],
      carbsG: [0, [Validators.required, Validators.min(0)]],
      fatG: [0, [Validators.required, Validators.min(0)]]
    });
  }

  estimate(): void {
    if (this.description.invalid || this.estimating) return;
    this.estimating = true;
    this.cdr.markForCheck();

    this.nutritionService.estimateMeal(this.description.value.trim()).subscribe({
      next: (estimate: MealEstimate) => {
        this.applyEstimate(estimate);
        this.estimating = false;
        this.hasEstimate = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.estimating = false;
        this.cdr.markForCheck();
        this.snackBar.open('Schätzung fehlgeschlagen', 'Schließen', {duration: 5000});
      }
    });
  }

  private applyEstimate(estimate: MealEstimate): void {
    this.valuesForm.setValue({
      kcal: Math.round(estimate.kcal),
      proteinG: estimate.proteinG,
      carbsG: estimate.carbsG,
      fatG: estimate.fatG
    });
    this.assumptions = estimate.assumptions;
  }

  log(): void {
    if (!this.hasEstimate || this.valuesForm.invalid || this.description.invalid || this.logging) return;
    this.logging = true;
    this.cdr.markForCheck();

    const v = this.valuesForm.getRawValue();
    const payload: AdHocEntryInput = {
      mealType: this.mealType.value,
      description: this.description.value.trim(),
      kcal: Number(v.kcal),
      proteinG: Number(v.proteinG),
      carbsG: Number(v.carbsG),
      fatG: Number(v.fatG)
    };
    const isoDate = format(this.date.value, 'yyyy-MM-dd');

    this.nutritionService.addEntry(isoDate, payload).subscribe({
      next: () => {
        this.logging = false;
        this.reset();
        this.cdr.markForCheck();
        this.snackBar.open('Als Eintrag gespeichert', 'OK', {duration: 3000});
      },
      error: () => {
        this.logging = false;
        this.cdr.markForCheck();
        this.snackBar.open('Eintrag konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
      }
    });
  }

  private reset(): void {
    this.description.reset('');
    this.assumptions = '';
    this.hasEstimate = false;
    this.valuesForm.reset({kcal: 0, proteinG: 0, carbsG: 0, fatG: 0});
  }
}
