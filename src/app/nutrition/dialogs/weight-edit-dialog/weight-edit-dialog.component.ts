import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {format, parseISO} from 'date-fns';
import {WeightEntry, WeightEntryInput} from '../../models/nutrition.model';

@Component({
  selector: 'app-weight-edit-dialog',
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
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './weight-edit-dialog.component.html',
  styleUrl: './weight-edit-dialog.component.css'
})
export class WeightEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<WeightEditDialogComponent>);
  private data = inject<WeightEntry>(MAT_DIALOG_DATA);

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      entryDate: [parseISO(this.data.entryDate), Validators.required],
      weightKg: [this.data.weightKg, [Validators.required, Validators.min(0)]]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const {entryDate, weightKg} = this.form.value;
    const result: WeightEntryInput = {
      entryDate: format(entryDate, 'yyyy-MM-dd'),
      weightKg: Number(weightKg)
    };
    this.dialogRef.close(result);
  }
}
