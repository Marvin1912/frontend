import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, switchMap} from 'rxjs';
import {format} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {DaySummary, FoodEntryInput, MealEntry, MealEntryUpdate, MealType} from '../../models/nutrition.model';
import {
  AddDayEntryDialogComponent,
  AddDayEntryDialogData
} from '../../dialogs/add-day-entry-dialog/add-day-entry-dialog.component';
import {EntryEditDialogComponent} from '../../dialogs/entry-edit-dialog/entry-edit-dialog.component';
import {EntryDeleteDialogComponent} from '../../dialogs/entry-delete-dialog/entry-delete-dialog.component';

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
  cls: string;
}

const MEAL_GROUPS: { type: MealType; label: string }[] = [
  {type: 'BREAKFAST', label: 'Frühstück'},
  {type: 'LUNCH', label: 'Mittagessen'},
  {type: 'DINNER', label: 'Abendessen'},
  {type: 'SNACK', label: 'Snack'}
];

@Component({
  selector: 'app-nutrition-day',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './nutrition-day.component.html',
  styleUrl: './nutrition-day.component.css'
})
export class NutritionDayComponent implements OnInit {

  date = new FormControl<Date>(new Date(), {nonNullable: true});
  summary: DaySummary | null = null;
  loading = false;
  /** Set when the day summary cannot be loaded (e.g. no targets yet). */
  unavailable: string | null = null;

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.date.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
    this.load();
  }

  private get isoDate(): string {
    return format(this.date.value, 'yyyy-MM-dd');
  }

  private load(): void {
    this.loading = true;
    this.unavailable = null;
    this.cdr.markForCheck();

    this.nutritionService.getDaySummary(this.isoDate).subscribe({
      next: summary => {
        this.summary = summary;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: HttpErrorResponse) => {
        this.summary = null;
        this.loading = false;
        this.unavailable = err.status >= 400 && err.status < 500
          ? 'Keine Tagesübersicht verfügbar. Bitte zuerst ein Profil und einen Gewichtseintrag erfassen.'
          : 'Tagesübersicht konnte nicht geladen werden.';
        this.cdr.markForCheck();
      }
    });
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
    }).filter(g => g.entries.length > 0);
  }

  get hasEntries(): boolean {
    return (this.summary?.entries.length ?? 0) > 0;
  }

  get hasTargets(): boolean {
    return !!this.summary?.targets && !!this.summary?.remaining;
  }

  get bars(): MacroBar[] {
    if (!this.summary?.targets || !this.summary?.remaining) return [];
    const {totals, targets, remaining} = this.summary;
    return [
      this.bar('Kalorien', 'kcal', totals.kcal, targets.targetKcal, remaining.kcal, 'kcal'),
      this.bar('Protein', 'g', totals.proteinG, targets.proteinG, remaining.proteinG, 'p'),
      this.bar('Kohlenhydrate', 'g', totals.carbsG, targets.carbsG, remaining.carbsG, 'c'),
      this.bar('Fett', 'g', totals.fatG, targets.fatG, remaining.fatG, 'f')
    ];
  }

  private bar(label: string, unit: string, consumed: number, target: number, remaining: number, cls: string): MacroBar {
    const pct = target > 0 ? Math.min(100, Math.round(consumed / target * 100)) : 0;
    return {label, unit, consumed, target, remaining, pct, cls};
  }

  entryName(entry: MealEntry): string {
    return entry.description ?? entry.foodName ?? 'Eintrag';
  }

  openAddDialog(mealType?: MealType): void {
    const data: AddDayEntryDialogData = {mealType};
    const ref = this.dialog.open(AddDayEntryDialogComponent, {data});
    ref.afterClosed().pipe(
      switchMap((result: FoodEntryInput | undefined) => result ? this.nutritionService.addEntry(this.isoDate, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.load();
        this.snackBar.open('Eintrag hinzugefügt', 'OK', {duration: 3000});
      },
      error: () => this.snackBar.open('Eintrag konnte nicht gespeichert werden', 'Schließen', {duration: 5000})
    });
  }

  openEditDialog(entry: MealEntry): void {
    const ref = this.dialog.open(EntryEditDialogComponent, {data: entry});
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
    const ref = this.dialog.open(EntryDeleteDialogComponent, {data: {label: this.entryName(entry)}});
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
}
