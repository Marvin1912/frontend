import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
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

/** Days of intake history to load for the trend chart. */
const INTAKE_DAYS = 14;

/** A day's consumed kcal against its target, for the intake chart. */
interface IntakeDay {
  date: string;
  label: string;
  consumed: number;
  target: number;
  x: number;
  /** Bar top (consumed) and bar height in view-box units. */
  y: number;
  h: number;
  /** within | under | over target */
  state: 'within' | 'under' | 'over';
}

interface WeightPoint {
  x: number;
  y: number;
  weightKg: number;
  label: string;
}

@Component({
  selector: 'app-nutrition-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, MatProgressSpinner],
  templateUrl: './nutrition-dashboard.component.html',
  styleUrl: './nutrition-dashboard.component.css'
})
export class NutritionDashboardComponent implements OnInit {

  readonly vbW = VB_W;
  readonly vbH = VB_H;
  readonly axisX1 = PAD_L;
  readonly axisX2 = VB_W - PAD_R;
  readonly baselineY = VB_H - PAD_B;

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

  ngOnInit(): void {
    const today = new Date();
    const dates = Array.from({length: INTAKE_DAYS}, (_, i) =>
      format(subDays(today, INTAKE_DAYS - 1 - i), 'yyyy-MM-dd'));

    forkJoin({
      weights: this.nutritionService.getWeightEntries().pipe(catchError(() => of([] as WeightEntry[]))),
      // A day without targets/entries 4xx's; treat it as "no data" rather than failing all.
      days: forkJoin(dates.map(d =>
        this.nutritionService.getDaySummary(d).pipe(catchError(() => of(null)))))
    }).subscribe(({weights, days}) => {
      this.buildWeightChart(weights);
      this.buildIntakeChart(dates, days);
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
      return {x, y, weightKg: e.weightKg, label: format(parseISO(e.entryDate), 'dd.MM.')};
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
  private buildIntakeChart(dates: string[], days: (DaySummary | null)[]): void {
    const target = days.find(d => d?.targets)?.targets.targetKcal ?? null;
    this.intakeTargetKcal = target;

    const consumed = days.map(d => d?.totals.kcal ?? 0);
    const maxConsumed = Math.max(0, ...consumed);
    this.intakeMax = Math.max(maxConsumed, (target ?? 0) * 1.1, 1);

    const innerW = VB_W - PAD_L - PAD_R;
    const innerH = VB_H - PAD_T - PAD_B;
    const slot = innerW / dates.length;
    this.barWidth = slot * 0.6;

    this.intakeDays = dates.map((date, i) => {
      const summary = days[i];
      const kcal = summary?.totals.kcal ?? 0;
      const dayTarget = summary?.targets.targetKcal ?? target ?? 0;
      const h = innerH * (kcal / this.intakeMax);
      const x = PAD_L + slot * i + (slot - this.barWidth) / 2;
      const y = PAD_T + innerH - h;
      return {
        date,
        label: format(parseISO(date), 'dd.MM.'),
        consumed: kcal,
        target: dayTarget,
        x,
        y,
        h,
        state: this.targetState(kcal, dayTarget)
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
