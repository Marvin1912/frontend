import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
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
import {MatFormField, MatLabel, MatPrefix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, distinctUntilChanged, EMPTY, finalize, startWith, switchMap, tap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, FoodDraft, FoodInput} from '../../models/nutrition.model';
import {FoodEditDialogComponent, FoodEditDialogData} from '../../dialogs/food-edit-dialog/food-edit-dialog.component';
import {FoodDeleteDialogComponent} from '../../dialogs/food-delete-dialog/food-delete-dialog.component';
import {BarcodeScanDialogComponent} from '../../dialogs/barcode-scan-dialog/barcode-scan-dialog.component';

@Component({
  selector: 'app-nutrition-foods',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
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
    MatPrefix,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    MatTooltip,
    MatSortModule
  ],
  templateUrl: './nutrition-foods.component.html',
  styleUrl: './nutrition-foods.component.css'
})
export class NutritionFoodsComponent implements OnInit, AfterViewInit {

  @ViewChild('photoInput') photoInput!: { nativeElement: HTMLInputElement };
  @ViewChild(MatSort) sort!: MatSort;

  search = new FormControl('', {nonNullable: true});
  foods = new MatTableDataSource<Food>();
  columnsToDisplay = ['name', 'kcal', 'protein', 'carbs', 'fat', 'actions'];
  scanning = false;
  searching = false;

  get searchTerm(): string {
    return this.search.value.trim();
  }

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.foods.sort = this.sort;
  }

  ngOnInit(): void {
    this.search.valueChanges.pipe(
      startWith(this.search.value),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.searching = true;
        this.cdr.markForCheck();
      }),
      switchMap(query => this.nutritionService.searchFoods(query.trim()).pipe(
        finalize(() => {
          this.searching = false;
          this.cdr.markForCheck();
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(foods => {
      this.foods.data = foods;
      this.cdr.markForCheck();
    });
  }

  private reload(): void {
    this.nutritionService.searchFoods(this.search.value.trim()).subscribe(foods => {
      this.foods.data = foods;
      this.cdr.markForCheck();
    });
  }

  openAddDialog(): void {
    this.openFoodDialog({food: null, source: 'MANUAL'}, null);
  }

  openEditDialog(food: Food): void {
    this.openFoodDialog({food, source: food.source}, food);
  }

  openDeleteDialog(food: Food): void {
    const ref = this.dialog.open(FoodDeleteDialogComponent, {data: {name: food.name}});
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteFood(food.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.foods.data = this.foods.data.filter(f => f.id !== food.id);
        this.cdr.markForCheck();
        this.snackBar.open('Lebensmittel gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        const msg = err.status === 404 ? 'Lebensmittel nicht gefunden' : 'Lebensmittel konnte nicht gelöscht werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }

  openBarcodeDialog(): void {
    const ref = this.dialog.open(BarcodeScanDialogComponent);
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((draft: FoodDraft | undefined) => {
      if (!draft) return;
      // Same review-and-save flow as the photo scan, tagged as a BARCODE source.
      this.openFoodDialog({food: null, prefill: draft, source: 'BARCODE'}, null);
    });
  }

  triggerPhoto(): void {
    this.photoInput.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    // Reset so re-selecting the same file fires the change event again.
    input.value = '';
    if (!file) return;

    this.scanning = true;
    this.nutritionService.scanLabel(file).subscribe({
      next: draft => {
        this.scanning = false;
        this.cdr.markForCheck();
        // Prefill the add form with the parsed values; the user reviews and saves
        // as a PHOTO-sourced food. The image itself is not stored.
        this.openFoodDialog({food: null, prefill: draft, source: 'PHOTO'}, null);
      },
      error: () => {
        this.scanning = false;
        this.cdr.markForCheck();
        this.snackBar.open('Etikett konnte nicht gelesen werden', 'Schließen', {duration: 5000});
      }
    });
  }

  private openFoodDialog(data: FoodEditDialogData, existing: Food | null): void {
    const ref = this.dialog.open(FoodEditDialogComponent, {data});
    ref.afterClosed().pipe(
      switchMap((result: FoodInput | undefined) => {
        if (!result) return EMPTY;
        return existing ? this.nutritionService.updateFood(existing.id, result) : this.nutritionService.createFood(result);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        if (existing) {
          this.foods.data = this.foods.data.map(f => f.id === updated.id ? updated : f);
          this.cdr.markForCheck();
          this.snackBar.open('Lebensmittel aktualisiert', 'OK', {duration: 3000});
        } else {
          this.reload();
          this.snackBar.open('Lebensmittel gespeichert', 'OK', {duration: 3000});
        }
      },
      error: () => {
        const msg = existing ? 'Lebensmittel konnte nicht aktualisiert werden' : 'Lebensmittel konnte nicht gespeichert werden';
        this.snackBar.open(msg, 'Schließen', {duration: 5000});
      }
    });
  }
}
