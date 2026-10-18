import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, EMPTY, map, of, Subject, switchMap} from 'rxjs';
import {addDays, differenceInCalendarDays, format, isValid, parseISO} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {
  ActivityType,
  DaySummary,
  FoodEntryInput,
  MealEntry,
  MealEntryUpdate,
  MealType,
  SportActivity,
  SportActivityInput,
  SportActivityUpdate
} from '../../models/nutrition.model';
import {
  AddDayEntryDialogComponent,
  AddDayEntryDialogData
} from '../../dialogs/add-day-entry-dialog/add-day-entry-dialog.component';
import {EntryEditDialogComponent} from '../../dialogs/entry-edit-dialog/entry-edit-dialog.component';
import {EntryDeleteDialogComponent} from '../../dialogs/entry-delete-dialog/entry-delete-dialog.component';
import {MealTemplatePickerDialogComponent} from '../../dialogs/meal-template-picker-dialog/meal-template-picker-dialog.component';
import {
  ActivityEditDialogComponent,
  ActivityEditDialogData
} from '../../dialogs/activity-edit-dialog/activity-edit-dialog.component';
import {nutritionDialogConfig} from '../../dialogs/dialog-config';
import {todayIso} from '../../forms';

interface MealGroup {
  type: MealType;
  label: string;
  entries: MealEntry[];
  kcal: number;
}

interface MacroBar {
  label: string;
  unit: string;
  consumed: number;
  target: number;
  remaining: number;
  pct: number;
  over: boolean;
  cls: string;
}

const MEAL_GROUPS: { type: MealType; label: string }[] = [
  {type: 'BREAKFAST', label: 'Frühstück'},
  {type: 'LUNCH', label: 'Mittagessen'},
  {type: 'DINNER', label: 'Abendessen'},
  {type: 'SNACK', label: 'Snack'}
];

const ACTIVITY_TYPES: { type: ActivityType; label: string }[] = [
  {type: 'RUNNING', label: 'Laufen'},
  {type: 'SWIMMING', label: 'Schwimmen'},
  {type: 'CYCLING', label: 'Radfahren'},
  {type: 'WALKING', label: 'Gehen'},
  {type: 'STRENGTH_TRAINING', label: 'Krafttraining'},
  {type: 'CROSS_TRAINER', label: 'Crosstrainer'},
  {type: 'OTHER', label: 'Sonstiges'}
];

const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = ACTIVITY_TYPES.reduce(
  (acc, a) => ({...acc, [a.type]: a.label}),
  {} as Record<ActivityType, string>
);

@Component({
  selector: 'app-nutrition-day',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatIcon,
    MatProgressSpinner,
    MatTooltip
  ],
  templateUrl: './nutrition-day.component.html',
  styleUrl: './nutrition-day.component.css'
})
export class NutritionDayComponent implements OnInit {

  /** Selected diary day as yyyy-MM-dd (native date input). */
  date = new FormControl<string>(todayIso(), {nonNullable: true});
  /** Last valid selected day, used for all requests. */
  private isoDate = this.date.value;
  summary: DaySummary | null = null;
  loading = false;
  /** Set when the day summary cannot be loaded due to an error. */
  unavailable: string | null = null;

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  /** Each emission (re)loads the selected day; switchMap drops a still-running older request. */
  private reload$ = new Subject<void>();

  ngOnInit(): void {
    this.reload$.pipe(
      switchMap(() => this.nutritionService.getDaySummary(this.isoDate).pipe(
        map(summary => ({summary})),
        catchError(() => of({summary: null}))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(({summary}) => {
      this.summary = summary;
      this.loading = false;
      this.unavailable = summary ? null : 'Tagesübersicht konnte nicht geladen werden.';
      this.cdr.markForCheck();
    });

    this.date.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
      // A cleared or half-typed native date input yields '', and typed future days slip past
      // [max]; keep showing the last valid day for both.
      if (!isValid(parseISO(value)) || value > todayIso()) return;
      this.isoDate = value;
      this.load();
    });
    this.load();
  }

  /** Upper bound for the native date input; a getter so it moves on past midnight. */
  get today(): string {
    return todayIso();
  }

  /** True when the selected date is today; stepping forward is then disabled. */
  get isToday(): boolean {
    return this.isoDate === todayIso();
  }

  /** "Heute" stays usable while the input shows something else (e.g. after clearing it). */
  get canGoToToday(): boolean {
    return !this.isToday || this.date.value !== this.isoDate;
  }

  /** Relative orientation label (Heute / Gestern / Vorgestern) or null. */
  get relativeLabel(): string | null {
    const diff = differenceInCalendarDays(parseISO(this.isoDate), parseISO(todayIso()));
    switch (diff) {
      case 0:
        return 'Heute';
      case -1:
        return 'Gestern';
      case -2:
        return 'Vorgestern';
      default:
        return null;
    }
  }

  /** Step the diary date by the given number of days. */
  stepDay(days: number): void {
    this.date.setValue(format(addDays(parseISO(this.isoDate), days), 'yyyy-MM-dd'));
  }

  /** Jump back to today. */
  goToToday(): void {
    if (!this.canGoToToday) return;
    if (this.isToday) {
      // Only the input was cleared; the day itself is still loaded.
      this.date.setValue(todayIso(), {emitEvent: false});
    } else {
      this.date.setValue(todayIso());
    }
  }

  private load(): void {
    this.loading = true;
    this.unavailable = null;
    this.cdr.markForCheck();

    this.reload$.next();
  }

  get activities(): SportActivity[] {
    return this.summary?.activities ?? [];
  }

  get totalKcalBurned(): number {
    return this.summary?.totalKcalBurned ?? 0;
  }

  get groups(): MealGroup[] {
    const entries = this.summary?.entries ?? [];
    return MEAL_GROUPS.map(g => {
      const groupEntries = entries.filter(e => e.mealType === g.type);
      return {
        type: g.type,
        label: g.label,
        entries: groupEntries,
        kcal: groupEntries.reduce((sum, e) => sum + e.kcal, 0)
      };
    });
  }

  /** Default meal type based on the current time of day (German meal conventions). */
  private defaultMealType(): MealType {
    const hour = new Date().getHours();
    if (hour < 11) return 'BREAKFAST';
    if (hour < 15) return 'LUNCH';
    if (hour < 21) return 'DINNER';
    return 'SNACK';
  }

  get hasTargets(): boolean {
    return !!this.summary?.targets && !!this.summary?.remaining;
  }

  get bars(): MacroBar[] {
    if (!this.summary?.targets || !this.summary?.remaining) return [];
    const {totals, targets, remaining} = this.summary;
    const netKcal = totals.kcal - this.totalKcalBurned;
    return [
      this.bar('Kalorien', 'kcal', netKcal, targets.targetKcal, remaining.kcal, 'kcal'),
      this.bar('Protein', 'g', totals.proteinG, targets.proteinG, remaining.proteinG, 'p'),
      this.bar('Kohlenhydrate', 'g', totals.carbsG, targets.carbsG, remaining.carbsG, 'c'),
      this.bar('Fett', 'g', totals.fatG, targets.fatG, remaining.fatG, 'f')
    ];
  }

  private bar(label: string, unit: string, consumed: number, target: number, remaining: number, cls: string): MacroBar {
    const pct = target > 0 ? Math.min(100, Math.round(consumed / target * 100)) : 0;
    return {label, unit, consumed, target, remaining, pct, over: remaining < 0, cls};
  }

  entryName(entry: MealEntry): string {
    return entry.description ?? entry.foodName ?? 'Eintrag';
  }

  activityLabel(activity: SportActivity): string {
    return activity.description ?? ACTIVITY_TYPE_LABELS[activity.activityType];
  }

  openAddDialog(mealType?: MealType): void {
    const data: AddDayEntryDialogData = {mealType: mealType ?? this.defaultMealType()};
    const ref = this.dialog.open(AddDayEntryDialogComponent, nutritionDialogConfig(data, '520px'));
    ref.afterClosed().pipe(
      switchMap((result: FoodEntryInput[] | undefined) => result?.length ? this.nutritionService.addEntries(this.isoDate, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: created => {
        this.load();
        const message = created.length === 1 ? '1 Eintrag hinzugefügt' : `${created.length} Einträge hinzugefügt`;
        this.snackBar.open(message, 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Eintrag konnte nicht gespeichert werden', 'Schließen', {duration: 5000})
    });
  }

  openTemplatePickerDialog(mealType?: MealType): void {
    const data = {mealType: mealType ?? this.defaultMealType()};
    const ref = this.dialog.open(MealTemplatePickerDialogComponent, nutritionDialogConfig(data, '440px'));
    ref.afterClosed().pipe(
      switchMap(result => result ? this.nutritionService.logMealTemplate(this.isoDate, result.templateId, result.mealType) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: created => {
        this.load();
        const message = created.length === 1 ? '1 Eintrag aus Vorlage hinzugefügt' : `${created.length} Einträge aus Vorlage hinzugefügt`;
        this.snackBar.open(message, 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Vorlage konnte nicht geloggt werden', 'Schließen', {duration: 5000})
    });
  }

  openEditDialog(entry: MealEntry): void {
    const ref = this.dialog.open(EntryEditDialogComponent, nutritionDialogConfig(entry, '440px'));
    ref.afterClosed().pipe(
      switchMap((update: MealEntryUpdate | undefined) => update ? this.nutritionService.updateEntry(entry.id, update) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag aktualisiert', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Eintrag konnte nicht aktualisiert werden', 'Schließen', {duration: 5000})
    });
  }

  openDeleteDialog(entry: MealEntry): void {
    const ref = this.dialog.open(EntryDeleteDialogComponent, nutritionDialogConfig({label: this.entryName(entry)}));
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteEntry(entry.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Eintrag nicht gefunden' : 'Eintrag konnte nicht gelöscht werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }

  openAddActivityDialog(): void {
    const ref = this.dialog.open(ActivityEditDialogComponent, nutritionDialogConfig<ActivityEditDialogData>(null, '440px'));
    ref.afterClosed().pipe(
      switchMap((result: SportActivityInput | undefined) => result ? this.nutritionService.addSportActivity(this.isoDate, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Aktivität hinzugefügt', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Aktivität konnte nicht gespeichert werden', 'Schließen', {duration: 5000})
    });
  }

  openEditActivityDialog(activity: SportActivity): void {
    const ref = this.dialog.open(ActivityEditDialogComponent, nutritionDialogConfig<ActivityEditDialogData>(activity, '440px'));
    ref.afterClosed().pipe(
      switchMap((update: SportActivityUpdate | undefined) => update ? this.nutritionService.updateSportActivity(activity.id, update) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Aktivität aktualisiert', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Aktivität konnte nicht aktualisiert werden', 'Schließen', {duration: 5000})
    });
  }

  openDeleteActivityDialog(activity: SportActivity): void {
    const ref = this.dialog.open(EntryDeleteDialogComponent, nutritionDialogConfig({label: this.activityLabel(activity)}));
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteSportActivity(activity.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Aktivität gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Aktivität nicht gefunden' : 'Aktivität konnte nicht gelöscht werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }
}
