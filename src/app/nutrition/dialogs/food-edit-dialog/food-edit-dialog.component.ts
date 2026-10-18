import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {showError} from '../../forms';
import {MatIcon} from '@angular/material/icon';
import {Food, FoodDraft, FoodInput, FoodSource} from '../../models/nutrition.model';

/**
 * Add/edit form for a food. Used for manual entry, editing an existing food, and
 * reviewing a draft parsed from a label photo. The `source` from the dialog data
 * is carried through to the saved payload (e.g. `PHOTO` for scanned drafts).
 */
export interface FoodEditDialogData {
  /** Existing food to edit, or null when adding a new one. */
  food: Food | null;
  /** Optional values parsed from a label photo to prefill an add form. */
  prefill?: FoodDraft;
  /** Source recorded on save. */
  source: FoodSource;
}

@Component({
  selector: 'app-food-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogClose,
    NoWheelDirective,
    MatIcon
  ],
  templateUrl: './food-edit-dialog.component.html'
})
export class FoodEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FoodEditDialogComponent>);
  private data = inject<FoodEditDialogData>(MAT_DIALOG_DATA);

  form!: FormGroup;
  title = this.data.food ? 'Lebensmittel bearbeiten' : 'Lebensmittel hinzufügen';

  ngOnInit(): void {
    const source = this.data.food ?? this.data.prefill;
    this.form = this.fb.group({
      name: [source?.name ?? '', Validators.required],
      brand: [source?.brand ?? ''],
      kcalPer100: [source?.kcalPer100 ?? null, [Validators.required, Validators.min(0)]],
      proteinPer100: [source?.proteinPer100 ?? null, [Validators.required, Validators.min(0)]],
      carbsPer100: [source?.carbsPer100 ?? null, [Validators.required, Validators.min(0)]],
      fatPer100: [source?.fatPer100 ?? null, [Validators.required, Validators.min(0)]],
      fiberPer100: [source?.fiberPer100 ?? null, Validators.min(0)],
      defaultServingG: [this.servingFrom(source), Validators.min(0)]
    });
  }

  /** Stored foods expose `defaultServingG`; label drafts expose `servingG`. */
  private servingFrom(source: Food | FoodDraft | undefined): number | null {
    if (!source) return null;
    return 'defaultServingG' in source ? source.defaultServingG : source.servingG;
  }

  isInvalid(name: string): boolean {
    return showError(this.form.get(name));
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result: FoodInput = {
      name: v.name.trim(),
      brand: v.brand?.trim() ? v.brand.trim() : null,
      kcalPer100: Number(v.kcalPer100),
      proteinPer100: Number(v.proteinPer100),
      carbsPer100: Number(v.carbsPer100),
      fatPer100: Number(v.fatPer100),
      fiberPer100: v.fiberPer100 != null && v.fiberPer100 !== '' ? Number(v.fiberPer100) : null,
      defaultServingG: v.defaultServingG != null && v.defaultServingG !== '' ? Number(v.defaultServingG) : null,
      source: this.data.source
    };
    this.dialogRef.close(result);
  }
}
