import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal} from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {format, subDays} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {notInFutureValidator, todayIso} from '../../forms';

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
    MatDialogClose,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './export-dialog.component.html'
})
export class ExportDialogComponent {

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<ExportDialogComponent>);
  private nutritionService = inject(NutritionService);
  private snackBar = inject(MatSnackBar);

  exporting = signal(false);

  form = this.fb.group(
    {
      // Native date inputs work on yyyy-MM-dd strings, which also compare correctly as strings.
      from: [format(subDays(new Date(), 13), 'yyyy-MM-dd'), [Validators.required, notInFutureValidator()]],
      to: [todayIso(), [Validators.required, notInFutureValidator()]]
    },
    {validators: dateRangeValidator()}
  );

  get today(): string {
    return todayIso();
  }

  /** Either date lies after today. */
  get futureError(): boolean {
    return !!this.form.get('from')?.hasError('future') || !!this.form.get('to')?.hasError('future');
  }

  get rangeError(): boolean {
    const from = this.form.get('from')?.value;
    const to = this.form.get('to')?.value;
    return !!from && !!to && this.form.hasError('dateRange');
  }

  export(): void {
    if (this.form.invalid || this.exporting()) return;
    const fromStr = this.form.value.from as string;
    const toStr = this.form.value.to as string;

    this.exporting.set(true);
    this.dialogRef.disableClose = true;
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
        this.dialogRef.disableClose = false;
        this.cdr.markForCheck();
        this.snackBar.open('PDF-Export fehlgeschlagen', 'OK', {duration: 4000});
      }
    });
  }
}
