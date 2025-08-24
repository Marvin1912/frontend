import {AfterViewInit, Component, model, ModelSignal, OnInit, ViewChild} from '@angular/core';
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
import {HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatLabel} from '@angular/material/select';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';

function applyFilter(flashcard: Flashcard, filter: string, value: string): boolean {

  if ('withoutArticle' === filter) {
    return !(/^(a|an|to)\s(.+)$/i.test(value));
  }

  if ('markedAsUpdated' === filter) {
    return flashcard.updated;
  }

  let wordFilter = /####([a-z]+)####/i.exec(filter);
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
    FormsModule
  ],
  templateUrl: './vocabulary-list.component.html',
  styleUrl: './vocabulary-list.component.css'
})
export class VocabularyListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort: MatSort | null = null;

  uploadedFile?: File;
  flashcards: MatTableDataSource<Flashcard> = new MatTableDataSource();
  displayedColumns: string[] = ['deck', 'front', 'back', 'description', 'ankiId'];
  filters: string[] = [];

  readonly withoutArticle: ModelSignal<boolean> = model(false);
  readonly markedAsupdated: ModelSignal<boolean> = model(false);

  constructor(
    private vocabularyService: VocabularyService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.vocabularyService.getFlashcards().subscribe({
      next: value => {
        this.flashcards.data = value;
      },
      error: err => {
        console.log(err)
      }
    });

    this.flashcards.filterPredicate = (data: Flashcard, filter) => {

      let front: string = data.front!
      let filters: string[] = filter.split(',');

      let isFiltered: boolean = true;
      for (let filter of filters) {
        isFiltered = isFiltered && applyFilter(data, filter, front);
      }

      return isFiltered;
    };
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

  onFileSelected(event: any): void {
    this.uploadedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.uploadedFile) {
      alert('Please select a file first!');
      return;
    }

    this.vocabularyService.uploadFlashcardFile(this.uploadedFile).subscribe({
      next: (response: HttpResponse<number>) => {
        console.log(`Uploaded ${response} flashcards`);
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Error uploading file.');
      }
    });
  }

  navigateToWord(id: number) {
    void this.router.navigate(['/vocabulary/add', id]);
  }

  downloadFile() {
    this.vocabularyService.getFlashcardFile().subscribe({
      next: value => {
        let filename = value.headers.get('filename') ?? 'Standard.csv';

        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(value.body!);
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objectUrl);
      },
      error: err => {
        console.log(err)
      }
    });
  }

  applyFilter(event: Event): void {
    const word = (event.target as HTMLInputElement).value.trim().toLowerCase();

    this.filters = this.filters.filter(t => !/^####.+####$/.test(t));

    if (word) {
      this.filters.push(`####${word}####`);
    }

    this.flashcards.filter = this.filters.join(',') || ' ';
  }

  filterWithoutArticle(value: string): void {
    this.filterFlashcards(value, this.withoutArticle());
  }

  filterMarkedAsUpdated(value: string): void {
    this.filterFlashcards(value, this.markedAsupdated());
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
  }
}
