import {ComponentFixture, TestBed} from '@angular/core/testing';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {MatSnackBar} from '@angular/material/snack-bar';
import {format, subDays} from 'date-fns';
import {of, throwError} from 'rxjs';

import {NutritionExcludedDaysComponent} from './nutrition-excluded-days.component';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary} from '../../models/nutrition.model';

registerLocaleData(localeDe);

function day(date: string, excluded = false, kcal = 0): DaySummary {
  return {
    date,
    entries: [],
    totals: {kcal, proteinG: 0, carbsG: 0, fatG: 0},
    targets: null,
    remaining: null,
    activities: [],
    totalKcalBurned: 0,
    excluded
  };
}

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

describe('NutritionExcludedDaysComponent', () => {
  let component: NutritionExcludedDaysComponent;
  let fixture: ComponentFixture<NutritionExcludedDaysComponent>;
  let nutritionService: {
    getDaySummaries: ReturnType<typeof vi.fn>;
    getExcludedDays: ReturnType<typeof vi.fn>;
    excludeDay: ReturnType<typeof vi.fn>;
    includeDay: ReturnType<typeof vi.fn>;
  };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    nutritionService = {
      getDaySummaries: vi.fn().mockReturnValue(of([
        day('2026-10-30'),
        day('2026-10-31', true, 3200)
      ])),
      getExcludedDays: vi.fn().mockReturnValue(of([{date: '2026-10-31', reason: 'Restaurant'}])),
      excludeDay: vi.fn().mockReturnValue(of({date: '2026-10-30', reason: null})),
      includeDay: vi.fn().mockReturnValue(of(undefined))
    };
    snackBar = {open: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [NutritionExcludedDaysComponent],
      providers: [
        {provide: NutritionService, useValue: nutritionService},
        {provide: MatSnackBar, useValue: snackBar}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionExcludedDaysComponent);
    component = fixture.componentInstance;
  });

  it('loads the last 30 days by default, newest first, with reasons', () => {
    fixture.detectChanges();

    const today = new Date();
    expect(nutritionService.getDaySummaries).toHaveBeenCalledWith(iso(subDays(today, 29)), iso(today));
    expect(component.rangeDays).toBe(30);
    expect(component.rows.map(r => r.date)).toEqual(['2026-10-31', '2026-10-30']);
    expect(component.rows[0].excluded).toBe(true);
    expect(component.rows[0].reason).toBe('Restaurant');
    expect(component.excludedCount).toBe(1);
  });

  it('handles days without entries, which the backend omits from the payload', () => {
    const {entries: _, ...withoutEntries} = day('2026-10-29');
    nutritionService.getDaySummaries.mockReturnValue(of([withoutEntries as DaySummary]));
    fixture.detectChanges();

    expect(component.loading).toBe(false);
    expect(component.rows[0].entryCount).toBe(0);
  });

  it('reloads with the chosen preset', () => {
    fixture.detectChanges();
    component.onPresetChange(90);

    const today = new Date();
    expect(nutritionService.getDaySummaries).toHaveBeenLastCalledWith(iso(subDays(today, 89)), iso(today));
  });

  it('loads a custom range and clears the preset', () => {
    fixture.detectChanges();
    component.rangeForm.setValue({from: '2026-09-01', to: '2026-09-15'});
    component.applyCustomRange();

    expect(component.rangeDays).toBeNull();
    expect(nutritionService.getDaySummaries).toHaveBeenLastCalledWith('2026-09-01', '2026-09-15');
  });

  it('does not load an inverted custom range', () => {
    fixture.detectChanges();
    nutritionService.getDaySummaries.mockClear();
    component.rangeForm.setValue({from: '2026-09-15', to: '2026-09-01'});
    component.applyCustomRange();

    expect(component.rangeError).toBe(true);
    expect(nutritionService.getDaySummaries).not.toHaveBeenCalled();
  });

  it('excludes a day when its switch is turned off', () => {
    fixture.detectChanges();
    const row = component.rows[1];

    component.onToggle(row, false);

    expect(nutritionService.excludeDay).toHaveBeenCalledWith('2026-10-30', null);
    expect(row.excluded).toBe(true);
    expect(row.saving).toBe(false);
  });

  it('includes a day when its switch is turned on', () => {
    fixture.detectChanges();
    const row = component.rows[0];

    component.onToggle(row, true);

    expect(nutritionService.includeDay).toHaveBeenCalledWith('2026-10-31');
    expect(row.excluded).toBe(false);
  });

  it('rolls the switch back and shows a snackbar when saving fails', () => {
    fixture.detectChanges();
    nutritionService.excludeDay.mockReturnValue(throwError(() => new Error('offline')));
    const row = component.rows[1];

    component.onToggle(row, false);

    expect(row.excluded).toBe(false);
    expect(row.saving).toBe(false);
    expect(snackBar.open).toHaveBeenCalledWith('Tag konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
    expect(nutritionService.getDaySummaries).toHaveBeenCalledTimes(1);
  });

  it('saves a changed reason of an excluded day', () => {
    fixture.detectChanges();
    const row = component.rows[0];

    component.onReasonCommit(row, '  Urlaub ');

    expect(nutritionService.excludeDay).toHaveBeenCalledWith('2026-10-31', 'Urlaub');
    expect(row.reason).toBe('Urlaub');
  });

  it('does not save an unchanged reason', () => {
    fixture.detectChanges();

    component.onReasonCommit(component.rows[0], 'Restaurant');

    expect(nutritionService.excludeDay).not.toHaveBeenCalled();
  });

  it('shows an error state when the days cannot be loaded', () => {
    nutritionService.getDaySummaries.mockReturnValue(throwError(() => new Error('offline')));
    fixture.detectChanges();

    expect(component.loadError).toBe(true);
    expect(component.loading).toBe(false);
  });
});
