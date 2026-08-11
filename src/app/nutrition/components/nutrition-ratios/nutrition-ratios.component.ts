import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DatePipe, DecimalPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ChartConfiguration} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {catchError, of} from 'rxjs';
import {format, parseISO, subDays} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {WeightRatioDay} from '../../models/nutrition.model';

/** Selectable ranges (in days) for the ratio charts. */
const RATIO_RANGES = [30, 90, 180] as const;

/** Default number of days of ratio history to load. */
const DEFAULT_RATIO_DAYS = 90;

const COLOR_PROTEIN = '#4da6ff';
const COLOR_CARBS = '#a3e635';
const COLOR_FAT = '#fbbf24';
const COLOR_KCAL = '#fb7185';
const AXIS_COLOR = '#7a93b0';
const GRID_COLOR = 'rgba(255, 255, 255, 0.07)';
const AXIS_FONT = {family: 'JetBrains Mono', size: 10};

@Component({
  selector: 'app-nutrition-ratios',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, MatProgressSpinner, MatButtonToggleModule, BaseChartDirective],
  templateUrl: './nutrition-ratios.component.html',
  styleUrl: './nutrition-ratios.component.css'
})
export class NutritionRatiosComponent implements OnInit {

  readonly ratioRanges = RATIO_RANGES;
  ratioRangeDays: number = DEFAULT_RATIO_DAYS;

  loading = true;
  days: WeightRatioDay[] = [];

  macroChartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};
  macroChartOptions: ChartConfiguration<'line'>['options'] = {};

  kcalChartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};
  kcalChartOptions: ChartConfiguration<'line'>['options'] = {};

  private nutritionService = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.load();
  }

  get hasData(): boolean {
    return this.days.some(d => d.weightKg !== null);
  }

  onRangeChange(days: number): void {
    if (days === this.ratioRangeDays) return;
    this.ratioRangeDays = days;
    this.load();
  }

  private load(): void {
    this.loading = true;
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), this.ratioRangeDays - 1), 'yyyy-MM-dd');

    this.nutritionService.getWeightRatios(from, to)
      .pipe(catchError(() => of([] as WeightRatioDay[])))
      .subscribe(days => {
        this.days = days;
        this.buildMacroChart(days);
        this.buildKcalChart(days);
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  private buildMacroChart(days: WeightRatioDay[]): void {
    const labels = days.map(d => format(parseISO(d.date), 'dd.MM.yyyy'));

    this.macroChartData = {
      labels,
      datasets: [
        {
          label: 'Protein (g/kg)',
          data: days.map(d => d.proteinPerKg),
          borderColor: COLOR_PROTEIN,
          backgroundColor: COLOR_PROTEIN,
          fill: false,
          tension: 0.2,
          spanGaps: false,
          pointRadius: 3
        },
        {
          label: 'Kohlenhydrate (g/kg)',
          data: days.map(d => d.carbsPerKg),
          borderColor: COLOR_CARBS,
          backgroundColor: COLOR_CARBS,
          fill: false,
          tension: 0.2,
          spanGaps: false,
          pointRadius: 3
        },
        {
          label: 'Fett (g/kg)',
          data: days.map(d => d.fatPerKg),
          borderColor: COLOR_FAT,
          backgroundColor: COLOR_FAT,
          fill: false,
          tension: 0.2,
          spanGaps: false,
          pointRadius: 3
        }
      ]
    };

    this.macroChartOptions = this.buildOptions();
  }

  private buildKcalChart(days: WeightRatioDay[]): void {
    const labels = days.map(d => format(parseISO(d.date), 'dd.MM.yyyy'));

    this.kcalChartData = {
      labels,
      datasets: [
        {
          label: 'kcal/kg',
          data: days.map(d => d.kcalPerKg),
          borderColor: COLOR_KCAL,
          backgroundColor: COLOR_KCAL,
          fill: false,
          tension: 0.2,
          spanGaps: false,
          pointRadius: 3
        }
      ]
    };

    this.kcalChartOptions = this.buildOptions();
  }

  private buildOptions(): ChartConfiguration<'line'>['options'] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {color: AXIS_COLOR, font: AXIS_FONT},
          grid: {color: GRID_COLOR}
        },
        y: {
          ticks: {color: AXIS_COLOR, font: AXIS_FONT},
          grid: {color: GRID_COLOR}
        }
      },
      plugins: {
        legend: {
          labels: {color: AXIS_COLOR, font: AXIS_FONT}
        }
      }
    };
  }
}
