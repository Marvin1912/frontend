import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';
import {format} from 'date-fns';

/** Today as yyyy-MM-dd, the value format of native date inputs and the API. */
export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Rejects yyyy-MM-dd values after today. `[max]` on a native date input only limits
 * the picker, typed dates still pass, so the form needs this validator as well.
 */
export function notInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    control.value && control.value > todayIso() ? {future: true} : null;
}

/** Group-level validator: the `from` date must not lie after the `to` date (yyyy-MM-dd strings). */
export function dateRangeValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get('from')?.value;
    const to = group.get('to')?.value;
    if (from && to && from > to) {
      return {dateRange: true};
    }
    return null;
  };
}

/** Control has an error and was touched, so its message and `aria-invalid` show. */
export function showError(control: AbstractControl | null): boolean {
  return !!control && control.invalid && control.touched;
}
