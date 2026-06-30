import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {format, subDays} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';

function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    if (from && to && from > to) {
      return {dateRange: true};
    }
    return null;
  };
}

@Component({
  selector: 'app-export-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatIcon,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './export-dialog.component.html',
  styleUrl: './export-dialog.component.css'
})
export class ExportDialogComponent {

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<ExportDialogComponent>);
  private nutritionService = inject(NutritionService);
  private snackBar = inject(MatSnackBar);

  today = new Date();
  exporting = signal(false);

  form = this.fb.group(
    {
      from: [subDays(this.today, 13), Validators.required],
      to: [this.today, Validators.required]
    },
    {validators: dateRangeValidator()}
  );

  get rangeError(): boolean {
    const from = this.form.get('from')?.value;
    const to = this.form.get('to')?.value;
    return !!from && !!to && this.form.hasError('dateRange');
  }

  export(): void {
    if (this.form.invalid) return;
    const fromStr = format(this.form.value.from as Date, 'yyyy-MM-dd');
    const toStr = format(this.form.value.to as Date, 'yyyy-MM-dd');

    this.exporting.set(true);
    this.cdr.markForCheck();

    this.nutritionService.exportPdf(fromStr, toStr).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutrition-${fromStr}_${toStr}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.dialogRef.close();
      },
      error: () => {
        this.exporting.set(false);
        this.cdr.markForCheck();
        this.snackBar.open('PDF-Export fehlgeschlagen', 'OK', {duration: 4000});
      }
    });
  }
}
