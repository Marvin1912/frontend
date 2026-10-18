import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {debounceTime, distinctUntilChanged, EMPTY, finalize, startWith, switchMap, tap} from 'rxjs';
import {NutritionService} from '../../services/nutrition.service';
import {Food, FoodDraft, FoodInput} from '../../models/nutrition.model';
import {nutritionDialogConfig} from '../../dialogs/dialog-config';
import {FoodEditDialogComponent, FoodEditDialogData} from '../../dialogs/food-edit-dialog/food-edit-dialog.component';
import {FoodDeleteDialogComponent} from '../../dialogs/food-delete-dialog/food-delete-dialog.component';
import {BarcodeScanDialogComponent} from '../../dialogs/barcode-scan-dialog/barcode-scan-dialog.component';

type SortKey = 'name' | 'kcal' | 'protein' | 'carbs' | 'fat';

const SORT_VALUE: Record<Exclude<SortKey, 'name'>, (food: Food) => number> = {
  kcal: food => food.kcalPer100,
  protein: food => food.proteinPer100,
  carbs: food => food.carbsPer100,
  fat: food => food.fatPer100
};

@Component({
  selector: 'app-nutrition-foods',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatIcon,
    MatProgressSpinner,
    MatTooltip
  ],
  templateUrl: './nutrition-foods.component.html',
  styleUrl: './nutrition-foods.component.css'
})
export class NutritionFoodsComponent implements OnInit {

  @ViewChild('photoInput') photoInput!: { nativeElement: HTMLInputElement };

  readonly sortColumns: { key: SortKey; label: string }[] = [
    {key: 'name', label: 'Name'},
    {key: 'kcal', label: 'kcal'},
    {key: 'protein', label: 'P'},
    {key: 'carbs', label: 'KH'},
    {key: 'fat', label: 'F'}
  ];
  readonly pageSizeOptions = [10, 25, 50, 100];

  search = new FormControl('', {nonNullable: true});
  foods: Food[] = [];
  /** Current page of the (optionally) sorted foods; recomputed only when data, sort or page change. */
  pagedFoods: Food[] = [];
  sortKey: SortKey | null = null;
  sortDir: 'asc' | 'desc' = 'asc';
  pageSize = 25;
  pageIndex = 0;
  scanning = false;
  searching = false;

  get searchTerm(): string {
    return this.search.value.trim();
  }

  get lastPage(): number {
    return Math.max(0, Math.ceil(this.foods.length / this.pageSize) - 1);
  }


  get rangeLabel(): string {
    const start = this.pageIndex * this.pageSize;
    const end = Math.min(start + this.pageSize, this.foods.length);
    return `${start + 1}–${end} von ${this.foods.length}`;
  }

  /** Cycles a column through ascending → descending → unsorted, like MatSort. */
  toggleSort(key: SortKey): void {
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortDir = 'asc';
    } else if (this.sortDir === 'asc') {
      this.sortDir = 'desc';
    } else {
      this.sortKey = null;
    }
    this.goToPage(0);
  }

  ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey !== key) return 'none';
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  /** Moves to a page (clamped to the data) and rebuilds the visible rows. */
  goToPage(index: number): void {
    this.pageIndex = Math.min(Math.max(index, 0), this.lastPage);
    const sorted = this.sortKey ? [...this.foods].sort(this.comparator(this.sortKey, this.sortDir)) : this.foods;
    const start = this.pageIndex * this.pageSize;
    this.pagedFoods = sorted.slice(start, start + this.pageSize);
  }

  onPageSizeChange(event: Event): void {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.goToPage(0);
  }

  private comparator(key: SortKey, dir: 'asc' | 'desc'): (a: Food, b: Food) => number {
    const sign = dir === 'asc' ? 1 : -1;
    if (key === 'name') {
      return (a, b) => sign * a.name.localeCompare(b.name, 'de');
    }
    const value = SORT_VALUE[key];
    return (a, b) => sign * (value(a) - value(b));
  }

  private nutritionService = inject(NutritionService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

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
      this.foods = foods;
      this.goToPage(0);
      this.cdr.markForCheck();
    });
  }

  private reload(): void {
    this.nutritionService.searchFoods(this.search.value.trim()).subscribe(foods => {
      this.foods = foods;
      this.goToPage(this.pageIndex);
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
    const ref = this.dialog.open(FoodDeleteDialogComponent, nutritionDialogConfig({name: food.name}));
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.nutritionService.deleteFood(food.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.foods = this.foods.filter(f => f.id !== food.id);
        this.goToPage(this.pageIndex);
        this.cdr.markForCheck();
        this.snackBar.open('Lebensmittel gelöscht', 'OK', {duration: 3000});
      },
      error: err => {
        this.snackBar.open(this.deleteErrorMessage(err), 'Schließen', {duration: 5000});
      }
    });
  }

  /** Message for a failed food deletion, including the 409 case where the food is still referenced. */
  private deleteErrorMessage(err: {status?: number; error?: {referencedBy?: {mealPlanRows?: number; mealTemplateItems?: number}}}): string {
    if (err.status === 404) return 'Lebensmittel nicht gefunden';
    if (err.status === 409) {
      const refs = err.error?.referencedBy;
      const parts: string[] = [];
      if (refs?.mealPlanRows) parts.push(`${refs.mealPlanRows}× im Essensplan`);
      if (refs?.mealTemplateItems) parts.push(`${refs.mealTemplateItems}× in Vorlagen`);
      const detail = parts.length ? ` (${parts.join(', ')})` : '';
      return `Lebensmittel wird noch verwendet${detail}`;
    }
    return 'Lebensmittel konnte nicht gelöscht werden';
  }

  openBarcodeDialog(): void {
    const ref = this.dialog.open(BarcodeScanDialogComponent, nutritionDialogConfig(undefined, '440px'));
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
    const ref = this.dialog.open(FoodEditDialogComponent, nutritionDialogConfig(data, '480px'));
    ref.afterClosed().pipe(
      switchMap((result: FoodInput | undefined) => {
        if (!result) return EMPTY;
        return existing ? this.nutritionService.updateFood(existing.id, result) : this.nutritionService.createFood(result);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: updated => {
        if (existing) {
          this.foods = this.foods.map(f => f.id === updated.id ? updated : f);
          this.goToPage(this.pageIndex);
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
