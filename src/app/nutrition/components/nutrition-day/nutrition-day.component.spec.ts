import {ComponentFixture, TestBed} from '@angular/core/testing';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {of, Subject, throwError} from 'rxjs';

import {NutritionDayComponent} from './nutrition-day.component';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary, MealEntry} from '../../models/nutrition.model';

registerLocaleData(localeDe);

const entry: MealEntry = {
  id: 'e1',
  entryDate: '2026-11-01',
  mealType: 'LUNCH',
  foodId: null,
  foodName: null,
  description: 'Nudeln',
  quantityG: null,
  kcal: 500,
  proteinG: 20,
  carbsG: 80,
  fatG: 10
};

function summaryWith(entries: MealEntry[]): DaySummary {
  return {
    date: '2026-11-01',
    entries,
    totals: {kcal: 0, proteinG: 0, carbsG: 0, fatG: 0},
    targets: null,
    remaining: null,
    activities: [],
    totalKcalBurned: 0,
    excluded: false
  };
}

describe('NutritionDayComponent', () => {
  let component: NutritionDayComponent;
  let fixture: ComponentFixture<NutritionDayComponent>;
  let nutritionService: { getDaySummary: ReturnType<typeof vi.fn>; updateEntry: ReturnType<typeof vi.fn> };
  let dialog: { open: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    nutritionService = {
      getDaySummary: vi.fn().mockReturnValue(of(summaryWith([entry]))),
      updateEntry: vi.fn().mockReturnValue(of(entry))
    };
    dialog = {open: vi.fn().mockReturnValue({afterClosed: () => of({kcal: 600})})};
    snackBar = {open: vi.fn()};

    await TestBed.configureTestingModule({
      imports: [NutritionDayComponent],
      providers: [
        {provide: NutritionService, useValue: nutritionService},
        {provide: MatDialog, useValue: dialog},
        {provide: MatSnackBar, useValue: snackBar}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionDayComponent);
    component = fixture.componentInstance;
  });

  it('shows the loading state until the day is loaded', () => {
    const response$ = new Subject<DaySummary>();
    nutritionService.getDaySummary.mockReturnValue(response$);
    fixture.detectChanges();
    expect(component.loading).toBe(true);

    response$.next(summaryWith([entry]));
    expect(component.loading).toBe(false);
    expect(component.summary?.entries).toEqual([entry]);
  });

  it('refreshes the day after an edit without showing the loading state', () => {
    fixture.detectChanges();
    const response$ = new Subject<DaySummary>();
    nutritionService.getDaySummary.mockReturnValue(response$);

    component.openEditDialog(entry);
    expect(nutritionService.updateEntry).toHaveBeenCalledWith('e1', {kcal: 600});
    expect(component.loading).toBe(false);
    expect(component.summary?.entries).toEqual([entry]);

    const updated = {...entry, kcal: 600};
    response$.next(summaryWith([updated]));
    expect(nutritionService.getDaySummary).toHaveBeenCalledTimes(2);
    expect(component.loading).toBe(false);
    expect(component.summary?.entries).toEqual([updated]);
  });

  it('keeps the current day when the silent refresh fails', () => {
    fixture.detectChanges();
    nutritionService.getDaySummary.mockReturnValue(throwError(() => new Error('offline')));

    component.openEditDialog(entry);
    expect(component.summary?.entries).toEqual([entry]);
    expect(component.unavailable).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith('Tagesübersicht konnte nicht aktualisiert werden', 'Schließen', {duration: 5000});
  });
});
