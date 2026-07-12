import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
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
  MatTable
} from '@angular/material/table';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {MatOption} from '@angular/material/core';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle, MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {catchError, of} from 'rxjs';
import {ArticleGroupService} from '../../services/article-group.service';
import {Article} from '../../models/article-group.model';

interface ArticleRow {
  article: Article;
  groupControl: FormControl<string>;
}

@Component({
  selector: 'app-article-group-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
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
    MatInput,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatIconButton,
    MatIcon,
    MatSlideToggle,
    MatProgressSpinner
  ],
  templateUrl: './article-group-management.component.html',
  styleUrl: './article-group-management.component.css'
})
export class ArticleGroupManagementComponent implements OnInit {

  private articleGroupService = inject(ArticleGroupService);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  loading = signal(false);
  rows = signal<ArticleRow[]>([]);
  searchTerm = signal('');
  unassignedOnly = signal(false);
  displayedColumns = ['name', 'purchaseCount', 'group', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.articleGroupService.getArticles().pipe(
      catchError(() => {
        this.snackBar.open('Artikel konnten nicht geladen werden', 'Schließen', {duration: 5000});
        return of([] as Article[]);
      })
    ).subscribe(articles => {
      this.rows.set(articles.map(article => ({
        article,
        groupControl: new FormControl<string>(article.groupName ?? '', {nonNullable: true})
      })));
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  get filteredRows(): ArticleRow[] {
    const term = this.searchTerm().trim().toLowerCase();
    return this.rows().filter(row => {
      if (this.unassignedOnly() && row.article.groupId) {
        return false;
      }
      if (!term) {
        return true;
      }
      return row.article.name.toLowerCase().includes(term)
        || row.article.normalizedName.toLowerCase().includes(term);
    });
  }

  get hasRows(): boolean {
    return this.filteredRows.length > 0;
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  onUnassignedOnlyChange(event: MatSlideToggleChange): void {
    this.unassignedOnly.set(event.checked);
  }

  filteredGroups(query: string): string[] {
    const q = query.trim().toLowerCase();
    const names = this.groupNames;
    return q ? names.filter(name => name.toLowerCase().includes(q)) : names;
  }

  onGroupSelected(row: ArticleRow, event: MatAutocompleteSelectedEvent): void {
    const name = event.option.value as string;
    const groupId = this.findGroupIdByName(name);
    if (groupId) {
      this.applyAssignment(row, groupId, name);
    }
  }

  onGroupCommitted(row: ArticleRow): void {
    const value = row.groupControl.value.trim();
    const current = row.article.groupName ?? '';
    if (value === current) {
      return;
    }
    if (!value) {
      this.removeAssignment(row);
      return;
    }
    const existingId = this.findGroupIdByName(value);
    if (existingId) {
      this.applyAssignment(row, existingId, value);
      return;
    }
    this.articleGroupService.createGroup(value).pipe(
      catchError(() => {
        this.handleError(row, 'Gruppe konnte nicht angelegt werden');
        return of(null);
      })
    ).subscribe(group => {
      if (group) {
        this.applyAssignment(row, group.id, group.name);
      }
    });
  }

  removeAssignment(row: ArticleRow): void {
    if (!row.article.groupId) {
      row.groupControl.setValue('', {emitEvent: false});
      return;
    }
    this.articleGroupService.unassignArticle(row.article.id).pipe(
      catchError(() => {
        this.handleError(row, 'Zuweisung konnte nicht entfernt werden');
        return of(null);
      })
    ).subscribe(() => {
      this.updateRow(row.article.id, {...row.article, groupId: null, groupName: null});
      row.groupControl.setValue('', {emitEvent: false});
      this.snackBar.open('Zuweisung entfernt', 'Schließen', {duration: 2500});
    });
  }

  private get groupNames(): string[] {
    const names = new Set<string>();
    for (const row of this.rows()) {
      if (row.article.groupName) {
        names.add(row.article.groupName);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'de'));
  }

  private findGroupIdByName(name: string): number | undefined {
    return this.rows().find(row => row.article.groupName?.toLowerCase() === name.toLowerCase())?.article.groupId ?? undefined;
  }

  private applyAssignment(row: ArticleRow, groupId: number, groupName: string): void {
    this.articleGroupService.assignArticleToGroup(row.article.id, groupId).pipe(
      catchError(() => {
        this.handleError(row, 'Zuweisung fehlgeschlagen');
        return of(null);
      })
    ).subscribe(() => {
      this.updateRow(row.article.id, {...row.article, groupId, groupName});
      row.groupControl.setValue(groupName, {emitEvent: false});
      this.snackBar.open('Artikel zugewiesen', 'Schließen', {duration: 2500});
    });
  }

  private updateRow(articleId: number, article: Article): void {
    this.rows.update(list => list.map(row => row.article.id === articleId ? {...row, article} : row));
    this.cdr.markForCheck();
  }

  private handleError(row: ArticleRow, message: string): void {
    row.groupControl.setValue(row.article.groupName ?? '', {emitEvent: false});
    this.snackBar.open(message, 'Schließen', {duration: 4000});
    this.cdr.markForCheck();
  }
}
