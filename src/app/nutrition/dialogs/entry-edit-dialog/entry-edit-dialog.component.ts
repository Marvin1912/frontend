import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {MealEntry, MealEntryUpdate} from '../../models/nutrition.model';

/**
 * Edit a logged entry. Food-based entries edit only the portion (`quantityG`);
 * the backend re-snapshots the macros. Ad-hoc entries edit the values directly.
 */
@Component({
  selector: 'app-entry-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './entry-edit-dialog.component.html',
  styleUrl: './entry-edit-dialog.component.css'
})
export class EntryEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EntryEditDialogComponent>);
  private entry = inject<MealEntry>(MAT_DIALOG_DATA);

  form!: FormGroup;
  /** Ad-hoc entries have no food reference and edit their macro values. */
  readonly isAdHoc = this.entry.foodId == null;
  readonly label = this.entry.description ?? this.entry.foodName ?? 'Eintrag';

  ngOnInit(): void {
    if (this.isAdHoc) {
      this.form = this.fb.group({
        description: [this.entry.description ?? '', Validators.required],
        kcal: [this.entry.kcal, [Validators.required, Validators.min(0)]],
        proteinG: [this.entry.proteinG, [Validators.required, Validators.min(0)]],
        carbsG: [this.entry.carbsG, [Validators.required, Validators.min(0)]],
        fatG: [this.entry.fatG, [Validators.required, Validators.min(0)]]
      });
    } else {
      this.form = this.fb.group({
        quantityG: [this.entry.quantityG, [Validators.required, Validators.min(0)]]
      });
    }
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const update: MealEntryUpdate = this.isAdHoc
      ? {
        description: v.description.trim(),
        kcal: Number(v.kcal),
        proteinG: Number(v.proteinG),
        carbsG: Number(v.carbsG),
        fatG: Number(v.fatG)
      }
      : {quantityG: Number(v.quantityG)};
    this.dialogRef.close(update);
  }
}
