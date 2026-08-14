import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe} from '@angular/common';
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
  MatTable
} from '@angular/material/table';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {format, parseISO} from 'date-fns';
import {catchError, EMPTY, of, switchMap} from 'rxjs';
import {ArticleGroupService} from '../../services/article-group.service';
import {ReceiptService} from '../../services/receipt.service';
import {Article} from '../../models/article-group.model';
import {PriceHistoryPoint} from '../../models/price-trend.model';
import {CategoryDeleteDialogComponent} from '../../dialogs/category-delete-dialog/category-delete-dialog.component';

interface CategoryRow {
  id: number;
  name: string;
  articleCount: number;
}

@Component({
  selector: 'app-category-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    CurrencyPipe
  ],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.css'
})
export class CategoryManagementComponent implements OnInit {

  private articleGroupService = inject(ArticleGroupService);
  private receiptService = inject(ReceiptService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  categories = signal<CategoryRow[]>([]);
  displayedColumns = ['expand', 'name', 'articleCount', 'actions'];

  expandedCategoryId = signal<number | null>(null);
  historyLoading = signal<number | null>(null);
  historyByCategory = signal<Map<number, PriceHistoryPoint[]>>(new Map());

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.articleGroupService.getArticles().pipe(
      catchError(() => {
        this.snackBar.open('Kategorien konnten nicht geladen werden', 'Schließen', {duration: 5000});
        return of([] as Article[]);
      })
    ).subscribe(articles => {
      this.categories.set(this.toCategoryRows(articles));
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  toggleExpand(category: CategoryRow): void {
    if (this.expandedCategoryId() === category.id) {
      this.expandedCategoryId.set(null);
      return;
    }
    this.expandedCategoryId.set(category.id);
    if (this.historyByCategory().has(category.id)) {
      return;
    }
    this.historyLoading.set(category.id);
    this.receiptService.getArticleGroupPriceHistory(category.id.toString()).pipe(
      catchError(() => {
        this.snackBar.open('Kaufhistorie konnte nicht geladen werden', 'Schließen', {duration: 5000});
        return of([] as PriceHistoryPoint[]);
      })
    ).subscribe(points => {
      const sorted = [...points].sort((a, b) => b.date.localeCompare(a.date));
      this.historyByCategory.update(map => new Map(map).set(category.id, sorted));
      this.historyLoading.set(null);
      this.cdr.markForCheck();
    });
  }

  formatDate(date: string): string {
    return format(parseISO(date), 'dd.MM.yyyy');
  }

  removeArticleFromCategory(category: CategoryRow, point: PriceHistoryPoint): void {
    this.articleGroupService.unassignArticle(point.articleId).pipe(
      catchError(() => {
        this.snackBar.open('Artikel konnte nicht entfernt werden', 'Schließen', {duration: 5000});
        return of(null);
      })
    ).subscribe(result => {
      if (!result) {
        return;
      }
      this.historyByCategory.update(map => {
        const updated = new Map(map);
        const remaining = (updated.get(category.id) ?? []).filter(p => p.articleId !== point.articleId);
        updated.set(category.id, remaining);
        return updated;
      });
      this.categories.update(list => list.map(c => c.id === category.id
        ? {...c, articleCount: Math.max(0, c.articleCount - 1)}
        : c));
      this.cdr.markForCheck();
      this.snackBar.open(`"${point.articleName}" aus Kategorie entfernt`, 'Schließen', {duration: 3000});
    });
  }

  openDeleteDialog(category: CategoryRow): void {
    const ref = this.dialog.open(CategoryDeleteDialogComponent, {data: {name: category.name}});
    ref.afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.articleGroupService.deleteGroup(category.id) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.categories.update(list => list.filter(c => c.id !== category.id));
        if (this.expandedCategoryId() === category.id) {
          this.expandedCategoryId.set(null);
        }
        this.cdr.markForCheck();
        this.snackBar.open('Kategorie gelöscht', 'Schließen', {duration: 3000});
      },
      error: err => {
        this.snackBar.open(this.deleteErrorMessage(err), 'Schließen', {duration: 5000});
      }
    });
  }

  private toCategoryRows(articles: Article[]): CategoryRow[] {
    const groups = new Map<number, CategoryRow>();
    for (const article of articles) {
      if (article.groupId == null || !article.groupName) {
        continue;
      }
      const existing = groups.get(article.groupId);
      if (existing) {
        existing.articleCount++;
      } else {
        groups.set(article.groupId, {id: article.groupId, name: article.groupName, articleCount: 1});
      }
    }
    return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  private deleteErrorMessage(err: {status?: number}): string {
    if (err.status === 404) return 'Kategorie nicht gefunden';
    if (err.status === 409) return 'Kategorie wird noch verwendet';
    return 'Kategorie konnte nicht gelöscht werden';
  }
}
