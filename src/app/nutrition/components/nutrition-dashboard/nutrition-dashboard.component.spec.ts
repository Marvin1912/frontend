import {ComponentFixture, TestBed} from '@angular/core/testing';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {provideRouter} from '@angular/router';
import {format, subDays} from 'date-fns';
import {of} from 'rxjs';

import {NutritionDashboardComponent} from './nutrition-dashboard.component';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary} from '../../models/nutrition.model';

registerLocaleData(localeDe);

function day(offset: number, kcal: number, excluded = false): DaySummary {
  return {
    date: format(subDays(new Date(), offset), 'yyyy-MM-dd'),
    entries: [],
    totals: {kcal, proteinG: 0, carbsG: 0, fatG: 0},
    targets: null,
    remaining: null,
    activities: [],
    totalKcalBurned: 0,
    excluded
  };
}

describe('NutritionDashboardComponent', () => {
  let component: NutritionDashboardComponent;
  let fixture: ComponentFixture<NutritionDashboardComponent>;

  beforeEach(async () => {
    const nutritionService = {
      getWeightEntries: vi.fn().mockReturnValue(of([])),
      getDaySummaries: vi.fn().mockReturnValue(of([
        day(0, 2000),
        day(1, 2200),
        day(2, 4000, true)
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [NutritionDashboardComponent],
      providers: [
        provideRouter([]),
        {provide: NutritionService, useValue: nutritionService}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('leaves excluded days out of the averages and tracked-day count', () => {
    expect(component.daysWithData).toBe(2);
    expect(component.avgKcal).toBe(2100);
    expect(component.daysExcluded).toBe(1);
  });

  it('marks excluded days in the intake chart', () => {
    const excluded = component.intakeDays.find(d => d.state === 'excluded');
    expect(excluded?.date).toBe(format(subDays(new Date(), 2), 'yyyy-MM-dd'));
    expect(excluded?.tooltip).toContain('(ausgeschlossen)');
  });
});
