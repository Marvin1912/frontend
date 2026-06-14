import {AfterViewInit, Component, inject, model, ModelSignal, OnDestroy, OnInit, Signal, signal, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {VocabularyService} from '../../services/vocabulary.service';
import {Flashcard} from '../../model/Flashcard';
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
import {ActivatedRoute, Router} from '@angular/router';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatLabel, MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';

import {toSignal} from "@angular/core/rxjs-interop";
import {Deck} from "../../model/Deck";

function applyFilter(flashcard: Flashcard, filter: string, value: string): boolean {

  const deckFilter: RegExpExecArray | null = /deck#([0-9]+)/i.exec(filter);
  if (deckFilter) {
    return flashcard.deckId === Number(deckFilter[1]);
  }

  if ('withoutArticle' === filter) {
    return !(/^(a|an|to)\s(.+)$/i.test(value));
  }

  if ('markedAsUpdated' === filter) {
    return flashcard.updated;
  }

  if ('withoutDescription' === filter) {
    return !flashcard.description || flashcard.description.trim() === '';
  }

  const wordFilter = /####([a-z]+)####/i.exec(filter);
  if (wordFilter) {
    return value.toLowerCase().includes(wordFilter[1]);
  }

  return true;
}

@Component({
  selector: 'vocabulary-list',
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatLabel,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    MatSortHeader,
    MatSort,
    MatFormField,
    MatInput,
    MatCheckbox,
    FormsModule,
    MatSelect,
    MatOption
  ],
  templateUrl: './vocabulary-list.component.html',
  styleUrl: './vocabulary-list.component.css'
})
export class VocabularyListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatSort) sort: MatSort | null = null;

  flashcards: MatTableDataSource<Flashcard> = new MatTableDataSource();
  displayedColumns: string[] = ['deck', 'front', 'back', 'description', 'ankiId'];
  filters: string[] = [];

  readonly withoutArticle: ModelSignal<boolean> = model(false);
  readonly markedAsUpdated: ModelSignal<boolean> = model(false);
  readonly withoutDescription: ModelSignal<boolean> = model(false);

  // Use signals to track count updates properly
  readonly filteredCount = signal(0);
  readonly totalCount = signal(0);
  readonly hasActiveFilters = signal(false);

  readonly searchText = signal('');
  readonly selectedDeckId = signal<number | null>(null);

  private readonly destroyed$ = new Subject<void>();
  private readonly searchChanged$ = new Subject<string>();

  private vocabularyService: VocabularyService = inject(VocabularyService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);

  readonly decks: Signal<Deck[]> = toSignal(this.vocabularyService.getDecks(), {initialValue: []})

  ngOnInit(): void {
    this.vocabularyService.getFlashcards().subscribe({
      next: value => {
        this.flashcards.data = value;
        this.applyStateFromQueryParams();
        this.updateCounts();
      },
      error: err => {
        console.log(err)
      }
    });

    this.flashcards.filterPredicate = (data: Flashcard, filter) => {

      const front: string = data.front!
      const filters: string[] = filter.split(',');

      let isFiltered: boolean = true;
      for (const filter of filters) {
        isFiltered = isFiltered && applyFilter(data, filter, front);
      }

      return isFiltered;
    };

    this.searchChanged$
        .pipe(debounceTime(300), takeUntil(this.destroyed$))
        .subscribe(value => {
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {search: value || null},
            queryParamsHandling: 'merge',
            replaceUrl: true
          });
        });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private applyStateFromQueryParams(): void {
    const params = this.route.snapshot.queryParams;

    const search: string = params['search'] ?? '';
    const deckId: string | null = params['deck'] ?? null;
    const withoutArticle = params['withoutArticle'] === 'true';
    const markedAsUpdated = params['markedAsUpdated'] === 'true';
    const withoutDescription = params['withoutDescription'] === 'true';

    this.searchText.set(search);
    this.selectedDeckId.set(deckId ? Number(deckId) : null);
    this.withoutArticle.set(withoutArticle);
    this.markedAsUpdated.set(markedAsUpdated);
    this.withoutDescription.set(withoutDescription);

    this.filters = [];

    if (search) {
      this.filters.push(`####${search.toLowerCase()}####`);
    }

    if (deckId) {
      this.filters.push(`deck#${deckId}`);
    }

    if (withoutArticle) {
      this.filters.push('withoutArticle');
    }

    if (markedAsUpdated) {
      this.filters.push('markedAsUpdated');
    }

    if (withoutDescription) {
      this.filters.push('withoutDescription');
    }

    this.flashcards.filter = this.filters.join(',') || ' ';
  }

  ngAfterViewInit() {
    this.flashcards.sort = this.sort;
    this.flashcards.sortingDataAccessor = (data, sortHeaderId) => {
      if (sortHeaderId === 'front') {
        return data[sortHeaderId]?.toLowerCase();
      } else {
        return (data as any)[sortHeaderId];
      }
    }
  }

  navigateToWord(id: number) {
    void this.router.navigate(['/vocabulary/add', id]);
  }

  applyFilter(event: Event): void {
    const word = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.filters = this.filters.filter(t => !/^####.+####$/.test(t));

    if (word) {
      this.filters.push(`####${word}####`);
    }

    this.flashcards.filter = this.filters.join(',') || ' ';
    this.updateCounts();
    this.searchChanged$.next(word);
  }

  filterDeck(event: MatSelectChange) {

    let deckId: number = event.value;

    this.filters = this.filters.filter(t => !/^deck#[0-9]+$/.test(t));

    if (deckId) {
      this.filters.push(`deck#${deckId}`);
    }

    this.flashcards.filter = this.filters.join(',') || ' ';
    this.updateCounts();

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {deck: deckId || null},
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  filterWithoutArticle(value: string): void {
    this.filterFlashcards(value, this.withoutArticle());
    this.updateQueryParam('withoutArticle', this.withoutArticle());
  }

  filterMarkedAsUpdated(value: string): void {
    this.filterFlashcards(value, this.markedAsUpdated());
    this.updateQueryParam('markedAsUpdated', this.markedAsUpdated());
  }

  filterWithoutDescription(value: string): void {
    this.filterFlashcards(value, this.withoutDescription());
    this.updateQueryParam('withoutDescription', this.withoutDescription());
  }

  private updateQueryParam(name: string, isSet: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {[name]: isSet ? 'true' : null},
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  getDeck(flashcard: Flashcard): string {
    return this.decks().find((value: Deck) => value.id === flashcard.deckId)?.name ?? 'n/a';
  }

  private filterFlashcards(value: string, isSet: boolean): void {
    if (isSet) {
      if (!this.filters.includes(value)) {
        this.filters.push(value);
      }
    } else {
      this.filters = this.filters.filter(v => v !== value);
    }
    this.flashcards.filter = this.filters.join(',') || ' ';
    this.updateCounts();
  }

  private updateCounts(): void {
    this.totalCount.set(this.flashcards.data.length);
    this.filteredCount.set(this.flashcards.filteredData.length);
    this.hasActiveFilters.set(this.filters.length > 0 && this.filters.some(f => f.trim() !== '' && f !== ' '));
  }

}
