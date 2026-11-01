import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, forkJoin, Observable, of} from 'rxjs';
import {format, parseISO, subDays} from 'date-fns';
import {de} from 'date-fns/locale';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary, ExcludedDay} from '../../models/nutrition.model';
import {dateRangeValidator, notInFutureValidator, todayIso} from '../../forms';

/** Selectable ranges (in days) for the day list. */
const RANGES = [30, 60, 90] as const;

/** Default number of days shown. */
const DEFAULT_DAYS = 30;

/** One day of the list, newest first. */
export interface ExcludedDayRow {
  date: string;
  label: string;
  weekday: string;
  kcal: number;
  entryCount: number;
  excluded: boolean;
  reason: string;
  saving: boolean;
}

@Component({
  selector: 'app-nutrition-excluded-days',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, ReactiveFormsModule, MatIcon, MatProgressSpinner, MatSlideToggle],
  templateUrl: './nutrition-excluded-days.component.html',
  styleUrl: './nutrition-excluded-days.component.css'
})
export class NutritionExcludedDaysComponent implements OnInit {

  readonly ranges = RANGES;
  /** Active preset, or null while a custom range is shown. */
  rangeDays: number | null = DEFAULT_DAYS;

  loading = true;
  loadError = false;
  rows: ExcludedDayRow[] = [];

  private fb = inject(FormBuilder);
  private nutritionService = inject(NutritionService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Native date inputs work on yyyy-MM-dd strings, which also compare correctly as strings.
  rangeForm = this.fb.group(
    {
      from: [this.presetFrom(DEFAULT_DAYS), [Validators.required, notInFutureValidator()]],
      to: [todayIso(), [Validators.required, notInFutureValidator()]]
    },
    {validators: dateRangeValidator()}
  );

  ngOnInit(): void {
    this.load();
  }

  get today(): string {
    return todayIso();
  }

  get excludedCount(): number {
    return this.rows.filter(r => r.excluded).length;
  }

  /** Either date lies after today. */
  get futureError(): boolean {
    return !!this.rangeForm.get('from')?.hasError('future') || !!this.rangeForm.get('to')?.hasError('future');
  }

  get rangeError(): boolean {
    return this.rangeForm.hasError('dateRange');
  }

  onPresetChange(days: number): void {
    if (days === this.rangeDays) return;
    this.rangeDays = days;
    this.rangeForm.setValue({from: this.presetFrom(days), to: todayIso()});
    this.load();
  }

  applyCustomRange(): void {
    if (this.rangeForm.invalid) return;
    this.rangeDays = null;
    this.load();
  }

  /** Toggle handler: `included` is the new state of the "in Berechnung" switch. */
  onToggle(row: ExcludedDayRow, included: boolean): void {
    const previous = row.excluded;
    row.excluded = !included;
    row.saving = true;
    this.cdr.markForCheck();

    const request: Observable<unknown> = row.excluded
      ? this.nutritionService.excludeDay(row.date, row.reason || null)
      : this.nutritionService.includeDay(row.date);

    request.subscribe({
      next: () => {
        row.saving = false;
        this.cdr.markForCheck();
      },
      error: () => {
        row.excluded = previous;
        row.saving = false;
        this.snackBar.open('Tag konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        this.cdr.markForCheck();
      }
    });
  }

  /** Persists a changed reason of an excluded day (on blur or Enter). */
  onReasonCommit(row: ExcludedDayRow, value: string): void {
    const reason = value.trim();
    if (!row.excluded || reason === row.reason) return;
    const previous = row.reason;
    row.reason = reason;
    this.nutritionService.excludeDay(row.date, reason || null).subscribe({
      error: () => {
        row.reason = previous;
        this.snackBar.open('Grund konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        this.cdr.markForCheck();
      }
    });
  }

  private load(): void {
    const {from, to} = this.rangeForm.getRawValue();
    if (!from || !to) return;
    this.loading = true;
    this.loadError = false;
    this.cdr.markForCheck();

    forkJoin({
      days: this.nutritionService.getDaySummaries(from, to),
      excluded: this.nutritionService.getExcludedDays(from, to).pipe(catchError(() => of([] as ExcludedDay[])))
    }).subscribe({
      next: ({days, excluded}) => {
        this.rows = this.buildRows(days, excluded);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.rows = [];
        this.loading = false;
        this.loadError = true;
        this.cdr.markForCheck();
      }
    });
  }

  private buildRows(days: DaySummary[], excluded: ExcludedDay[]): ExcludedDayRow[] {
    const reasonByDate = new Map(excluded.map(e => [e.date, e.reason ?? '']));
    return [...days]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(day => {
        const date = parseISO(day.date);
        return {
          date: day.date,
          label: format(date, 'dd.MM.yyyy'),
          weekday: format(date, 'EEEEEE', {locale: de}),
          kcal: day.totals.kcal,
          entryCount: day.entries.length,
          excluded: day.excluded,
          reason: reasonByDate.get(day.date) ?? '',
          saving: false
        };
      });
  }

  private presetFrom(days: number): string {
    return format(subDays(new Date(), days - 1), 'yyyy-MM-dd');
  }
}
