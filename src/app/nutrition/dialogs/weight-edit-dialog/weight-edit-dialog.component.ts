import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatIcon} from '@angular/material/icon';
import {WeightEntry, WeightEntryInput} from '../../models/nutrition.model';
import {notInFutureValidator, todayIso} from '../../forms';

@Component({
  selector: 'app-weight-edit-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogClose,
    NoWheelDirective,
    MatIcon
  ],
  templateUrl: './weight-edit-dialog.component.html'
})
export class WeightEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WeightEditDialogComponent>);
  private data = inject<WeightEntry>(MAT_DIALOG_DATA);

  form!: FormGroup;

  get today(): string {
    return todayIso();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      // Native date input works on yyyy-MM-dd strings, the same format the API uses.
      entryDate: [this.data.entryDate, [Validators.required, notInFutureValidator()]],
      weightKg: [this.data.weightKg, [Validators.required, Validators.min(0)]]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const {entryDate, weightKg} = this.form.value;
    const result: WeightEntryInput = {
      entryDate,
      weightKg: Number(weightKg)
    };
    this.dialogRef.close(result);
  }
}
