import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DatePipe, DecimalPipe} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {NoWheelDirective} from '../../directives/no-wheel.directive';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {EMPTY, switchMap} from 'rxjs';
import {format} from 'date-fns';
import {NutritionService} from '../../services/nutrition.service';
import {WeightEntry, WeightEntryInput} from '../../models/nutrition.model';
import {TargetsCardComponent} from '../targets-card/targets-card.component';
import {WeightEditDialogComponent} from '../../dialogs/weight-edit-dialog/weight-edit-dialog.component';
import {WeightDeleteDialogComponent} from '../../dialogs/weight-delete-dialog/weight-delete-dialog.component';

@Component({
  selector: 'app-nutrition-weight',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    NoWheelDirective,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    TargetsCardComponent
  ],
  templateUrl: './nutrition-weight.component.html',
  styleUrl: './nutrition-weight.component.css'
})
export class NutritionWeightComponent implements OnInit {

  @ViewChild(TargetsCardComponent) targetsCard?: TargetsCardComponent;

  form!: FormGroup;
  saving = false;
  entries = new MatTableDataSource<WeightEntry>();
  columnsToDisplay = ['entryDate', 'weightKg', 'actions'];

  private fb = inject(FormBuilder);
  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.form = this.fb.group({
      entryDate: [new Date(), Validators.required],
      weightKg: [null, [Validators.required, Validators.min(0)]]
    });
    this.loadEntries();
  }

  private loadEntries(): void {
    this.nutritionService.getWeightEntries().subscribe({
      next: entries => {
        this.entries.data = this.sortDesc(entries);
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Gewichtseinträge konnten nicht geladen werden', 'Schließen', {duration: 5000});
      }
    });
  }

  private sortDesc(entries: WeightEntry[]): WeightEntry[] {
    return [...entries].sort((a, b) => b.entryDate.localeCompare(a.entryDate));
  }

  add(): void {
    if (this.form.invalid) return;
    const {entryDate, weightKg} = this.form.value;
    const payload: WeightEntryInput = {
      entryDate: format(entryDate, 'yyyy-MM-dd'),
      weightKg: Number(weightKg)
    };
    this.saving = true;
    this.cdr.markForCheck();
    this.nutritionService.addWeightEntry(payload).subscribe({
      next: created => {
        this.saving = false;
        this.entries.data = this.sortDesc([...this.entries.data, created]);
        this.form.reset({entryDate: new Date(), weightKg: null});
        this.targetsCard?.reload();
        this.cdr.markForCheck();
        this.snackBar.open('Gewicht gespeichert', 'OK', {duration: 3000});
      },
      error: () => {
        this.saving = false;
        this.cdr.markForCheck();
        this.snackBar.open('Gewicht konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
      }
    });
  }

  openEditDialog(entry: WeightEntry): void {
    const ref = this.dialog.open(WeightEditDialogComponent, {data: entry});
    ref.afterClosed().pipe(
      switchMap((result: WeightEntryInput | undefined) => result ? this.nutritionService.updateWeightEntry(entry.id, result) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        this.entries.data = this.sortDesc(this.entries.data.map(e => e.id === updated.id ? updated : e));
        this.targetsCard?.reload();
        this.cdr.markForCheck();
        this.snackBar.open('Gewicht aktualisiert', 'OK', {duration: 3000});
      },
      error: () => {
        this.snackBar.open('Gewicht konnte nicht aktualisiert werden', 'Schließen', {duration: 5000});
      }
    });
  }

  openDeleteDialog(entry: WeightEntry): void {
    const ref = this.dialog.open(WeightDeleteDialogComponent);
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteWeightEntry(entry.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.entries.data = this.entries.data.filter(e => e.id !== entry.id);
        this.targetsCard?.reload();
        this.cdr.markForCheck();
        this.snackBar.open('Gewicht gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Eintrag nicht gefunden' : 'Gewicht konnte nicht gelöscht werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }
}
