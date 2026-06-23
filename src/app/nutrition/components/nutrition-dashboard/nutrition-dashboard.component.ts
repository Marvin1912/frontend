import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {catchError, forkJoin, of} from 'rxjs';
import {format, parseISO, subDays} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary, WeightEntry} from '../../models/nutrition.model';

/** SVG view-box geometry shared by the inline charts. */
const VB_W = 320;
const VB_H = 140;
const PAD_L = 6;
const PAD_R = 6;
const PAD_T = 12;
const PAD_B = 20;

/** Selectable ranges (in days) for the intake trend chart. */
const INTAKE_RANGES = [7, 14, 30] as const;

/** Default number of days of intake history to load for the trend chart. */
const DEFAULT_INTAKE_DAYS = 14;

/** A day's net kcal (consumed minus burned) against its target, for the intake chart. */
interface IntakeDay {
  date: string;
  label: string;
  consumed: number;
  burned: number;
  target: number;
  x: number;
  /** Bar top (consumed) and bar height in view-box units. */
  y: number;
  h: number;
  /** within | under | over target */
  state: 'within' | 'under' | 'over';
  tooltip: string;
}

interface WeightPoint {
  x: number;
  y: number;
  weightKg: number;
  label: string;
  tooltip: string;
}

@Component({
  selector: 'app-nutrition-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatProgressSpinner, MatTooltipModule, MatButtonToggleModule],
  templateUrl: './nutrition-dashboard.component.html',
  styleUrl: './nutrition-dashboard.component.css'
})
export class NutritionDashboardComponent implements OnInit {

  readonly vbW = VB_W;
  readonly vbH = VB_H;
  readonly axisX1 = PAD_L;
  readonly axisX2 = VB_W - PAD_R;
  readonly baselineY = VB_H - PAD_B;

  readonly intakeRanges = INTAKE_RANGES;
  intakeRangeDays: number = DEFAULT_INTAKE_DAYS;

  loading = true;

  // ── Weight chart ──
  weightPoints: WeightPoint[] = [];
  weightLine = '';
  weightArea = '';
  weightMin = 0;
  weightMax = 0;
  latestWeight: number | null = null;
  weightDelta: number | null = null;

  // ── Intake chart ──
  intakeDays: IntakeDay[] = [];
  intakeTargetY: number | null = null;
  intakeTargetKcal: number | null = null;
  intakeMax = 0;
  barWidth = 0;

  // ── Adherence ──
  avgKcal: number | null = null;
  daysOnTarget = 0;
  daysWithData = 0;

  private nutritionService = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);

  private weightEntries: WeightEntry[] = [];
  private daySummaries: DaySummary[] = [];

  ngOnInit(): void {
    const today = new Date();
    const maxDays = Math.max(...INTAKE_RANGES);
    const dates = Array.from({length: maxDays}, (_, i) =>
      format(subDays(today, maxDays - 1 - i), 'yyyy-MM-dd'));

    forkJoin({
      weights: this.nutritionService.getWeightEntries().pipe(catchError(() => of([] as WeightEntry[]))),
      days: this.nutritionService.getDaySummaries(dates[0], dates[dates.length - 1])
        .pipe(catchError(() => of([] as DaySummary[])))
    }).subscribe(({weights, days}) => {
      this.weightEntries = weights;
      this.daySummaries = days;
      this.buildWeightChart(weights);
      this.rebuildIntakeChart();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  get hasWeight(): boolean {
    return this.weightPoints.length > 0;
  }

  get hasIntake(): boolean {
    return this.intakeDays.length > 0;
  }

  get weightChartLabel(): string {
    return `Gewichtsverlauf der letzten ${this.weightPoints.length} Tage`;
  }

  get intakeChartLabel(): string {
    return `Kalorienaufnahme der letzten ${this.intakeRangeDays} Tage`;
  }

  onIntakeRangeChange(days: number): void {
    if (days === this.intakeRangeDays) return;
    this.intakeRangeDays = days;
    this.rebuildIntakeChart();
    this.cdr.markForCheck();
  }

  private rebuildIntakeChart(): void {
    const today = new Date();
    const dates = Array.from({length: this.intakeRangeDays}, (_, i) =>
      format(subDays(today, this.intakeRangeDays - 1 - i), 'yyyy-MM-dd'));
    this.buildIntakeChart(dates, this.daySummaries);
  }

  // ── Weight ─────────────────────────────────────────
  private buildWeightChart(entries: WeightEntry[]): void {
    const sorted = [...entries].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
    if (sorted.length === 0) return;

    const values = sorted.map(e => e.weightKg);
    const min = Math.min(...values);
    const max = Math.max(...values);
    // Pad the range so a flat line doesn't sit on the axis.
    const span = max - min || 1;
    this.weightMin = min - span * 0.1;
    this.weightMax = max + span * 0.1;

    const innerW = VB_W - PAD_L - PAD_R;
    const innerH = VB_H - PAD_T - PAD_B;
    const stepX = sorted.length > 1 ? innerW / (sorted.length - 1) : 0;

    this.weightPoints = sorted.map((e, i) => {
      const x = PAD_L + (sorted.length > 1 ? stepX * i : innerW / 2);
      const t = (e.weightKg - this.weightMin) / (this.weightMax - this.weightMin);
      const y = PAD_T + innerH * (1 - t);
      const label = format(parseISO(e.entryDate), 'dd.MM.');
      const dateLabel = format(parseISO(e.entryDate), 'dd.MM.yyyy');
      return {
        x, y, weightKg: e.weightKg, label,
        tooltip: `${dateLabel}: ${e.weightKg.toFixed(1)} kg`
      };
    });

    this.weightLine = this.weightPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const first = this.weightPoints[0];
    const last = this.weightPoints[this.weightPoints.length - 1];
    this.weightArea =
      `${first.x.toFixed(1)},${(VB_H - PAD_B).toFixed(1)} ${this.weightLine} ${last.x.toFixed(1)},${(VB_H - PAD_B).toFixed(1)}`;

    this.latestWeight = last.weightKg;
    this.weightDelta = sorted.length > 1 ? last.weightKg - first.weightKg : null;
  }

  // ── Intake ─────────────────────────────────────────
  private buildIntakeChart(dates: string[], days: DaySummary[]): void {
    const byDate = new Map(days.map(d => [d.date, d]));
    const target = days.find(d => d.targets)?.targets?.targetKcal ?? null;
    this.intakeTargetKcal = target;

    const netKcal = dates.map(date => {
      const summary = byDate.get(date);
      return (summary?.totals.kcal ?? 0) - (summary?.totalKcalBurned ?? 0);
    });
    const maxConsumed = Math.max(0, ...netKcal);
    this.intakeMax = Math.max(maxConsumed, (target ?? 0) * 1.1, 1);

    const innerW = VB_W - PAD_L - PAD_R;
    const innerH = VB_H - PAD_T - PAD_B;
    const slot = innerW / dates.length;
    this.barWidth = slot * 0.6;

    this.intakeDays = dates.map((date, i) => {
      const summary = byDate.get(date);
      const eaten = summary?.totals.kcal ?? 0;
      const burned = summary?.totalKcalBurned ?? 0;
      const kcal = eaten - burned;
      const dayTarget = summary?.targets?.targetKcal ?? target ?? 0;
      const h = innerH * (Math.max(kcal, 0) / this.intakeMax);
      const x = PAD_L + slot * i + (slot - this.barWidth) / 2;
      const y = PAD_T + innerH - h;
      const dateLabel = format(parseISO(date), 'dd.MM.yyyy');
      const tooltip = burned > 0
        ? `${dateLabel}: ${Math.round(eaten)} kcal − ${Math.round(burned)} verbrannt = ${Math.round(kcal)} kcal`
        : `${dateLabel}: ${Math.round(kcal)} kcal`;
      return {
        date,
        label: format(parseISO(date), 'dd.MM.'),
        consumed: kcal,
        burned,
        target: dayTarget,
        x,
        y,
        h,
        state: this.targetState(kcal, dayTarget),
        tooltip
      };
    });

    if (target != null) {
      this.intakeTargetY = PAD_T + innerH * (1 - target / this.intakeMax);
    }

    this.buildAdherence(target);
  }

  private targetState(kcal: number, target: number): 'within' | 'under' | 'over' {
    if (!target || kcal === 0) return 'under';
    if (kcal > target * 1.1) return 'over';
    if (kcal < target * 0.9) return 'under';
    return 'within';
  }

  private buildAdherence(target: number | null): void {
    const withData = this.intakeDays.filter(d => d.consumed > 0);
    this.daysWithData = withData.length;
    if (withData.length === 0) {
      this.avgKcal = null;
      this.daysOnTarget = 0;
      return;
    }
    this.avgKcal = withData.reduce((sum, d) => sum + d.consumed, 0) / withData.length;
    this.daysOnTarget = target == null ? 0 : withData.filter(d => d.state === 'within').length;
  }
}
