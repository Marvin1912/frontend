import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
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
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {catchError, EMPTY, of, switchMap} from 'rxjs';
import {ArticleMatchingService} from '../../services/article-matching.service';
import {ArticleGroupSuggestion, MatchingRunResult} from '../../models/article-matching.model';
import {LlmMatchingConfirmDialogComponent} from '../../dialogs/llm-matching-confirm-dialog/llm-matching-confirm-dialog.component';

@Component({
  selector: 'app-matching-suggestions',
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
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    DecimalPipe
  ],
  templateUrl: './matching-suggestions.component.html',
  styleUrl: './matching-suggestions.component.css'
})
export class MatchingSuggestionsComponent implements OnInit {

  private articleMatchingService = inject(ArticleMatchingService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  suggestions = signal<ArticleGroupSuggestion[]>([]);
  runningHeuristic = signal(false);
  runningLlm = signal(false);
  lastRunResult = signal<MatchingRunResult | null>(null);
  displayedColumns = ['name', 'group', 'score', 'source', 'actions'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.articleMatchingService.listSuggestions().pipe(
      catchError(() => {
        this.snackBar.open('Vorschläge konnten nicht geladen werden', 'Schließen', {duration: 5000});
        return of([] as ArticleGroupSuggestion[]);
      })
    ).subscribe(suggestions => {
      this.suggestions.set(suggestions);
      this.loading.set(false);
      this.cdr.markForCheck();
    });
  }

  scorePercent(suggestion: ArticleGroupSuggestion): number {
    return suggestion.score * 100;
  }

  accept(suggestion: ArticleGroupSuggestion): void {
    this.articleMatchingService.acceptSuggestion(suggestion.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.removeSuggestion(suggestion.id);
        this.snackBar.open(`"${suggestion.articleName}" zugewiesen`, 'Schließen', {duration: 3000});
      },
      error: err => this.handleDecisionError(err, 'Vorschlag konnte nicht angenommen werden')
    });
  }

  reject(suggestion: ArticleGroupSuggestion): void {
    this.articleMatchingService.rejectSuggestion(suggestion.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.removeSuggestion(suggestion.id);
        this.snackBar.open('Vorschlag verworfen', 'Schließen', {duration: 3000});
      },
      error: err => this.handleDecisionError(err, 'Vorschlag konnte nicht verworfen werden')
    });
  }

  runHeuristic(): void {
    this.runningHeuristic.set(true);
    this.articleMatchingService.runHeuristicMatching().pipe(
      catchError(() => {
        this.snackBar.open('Heuristik-Matching fehlgeschlagen', 'Schließen', {duration: 5000});
        return of(null);
      })
    ).subscribe(result => {
      this.runningHeuristic.set(false);
      if (result) {
        this.lastRunResult.set(result);
        this.load();
      }
      this.cdr.markForCheck();
    });
  }

  openLlmConfirm(): void {
    const ref = this.dialog.open(LlmMatchingConfirmDialogComponent);
    ref.afterClosed().pipe(
      switchMap(result => {
        if (result !== 'confirmed') {
          return EMPTY;
        }
        this.runningLlm.set(true);
        return this.articleMatchingService.runLlmMatching().pipe(
          catchError(() => {
            this.snackBar.open('LLM-Matching fehlgeschlagen', 'Schließen', {duration: 5000});
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      this.runningLlm.set(false);
      if (result) {
        this.lastRunResult.set(result);
        this.load();
      }
      this.cdr.markForCheck();
    });
  }

  private removeSuggestion(id: number): void {
    this.suggestions.update(list => list.filter(s => s.id !== id));
    this.cdr.markForCheck();
  }

  private handleDecisionError(err: {status?: number}, message: string): void {
    if (err.status === 404 || err.status === 409) {
      this.snackBar.open('Vorschlag wurde bereits anderweitig entschieden', 'Schließen', {duration: 4000});
      this.load();
      return;
    }
    this.snackBar.open(message, 'Schließen', {duration: 5000});
  }
}
