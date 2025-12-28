import {Component, OnInit, signal, WritableSignal, DestroyRef} from '@angular/core';
import {VocabularyService} from '../../services/vocabulary.service';
import {MatFormField, MatInput} from '@angular/material/input';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatLabel} from '@angular/material/select';
import {DictionaryEntry} from '../../model/DictionaryEntry';
import {MatButtonModule} from '@angular/material/button';
import {ArticleDialogComponent} from '../article-dialog/article-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Flashcard} from '../../model/Flashcard';
import {ActivatedRoute} from '@angular/router';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {MatSnackBar} from '@angular/material/snack-bar';
import {NgClass} from '@angular/common';
import {
  DictionaryApiError,
  DictionaryServiceUnavailableError,
  InvalidWordError,
  RateLimitExceededError,
  UnexpectedDictionaryError,
  WordNotFoundError
} from '../../model/dictionary-error.model';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

const DEFAULT_DECK = 'Standard';
const ARTICLE_PATTERN = /^(?:a|an) [a-z]+/i;
const VERB_PATTERN = /^to [a-z]+/i;
const WORD_PATTERN = /^(?:(to|a|an)\s)?([A-Za-z! ]+)(?:\s(sth\.|sb\.|sb\.\/sth\.))?$/i;
const ARTICLE_WORD_PATTERN = /^(?:(a|an|to)\s)?([a-z- ]+)$/i;
const SPECIAL_CHAR_PATTERN = new RegExp(/([!?#])/i);

enum PartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb'
}

interface ChosenContextItem {
  index: string;
  text: string;
}

function validateWordPrefix(
  partOfSpeechFn: () => string,
  comesFromListFn: () => boolean
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const partOfSpeech = partOfSpeechFn();

    if (!comesFromListFn() && !partOfSpeech) {
      return { partOfSpeechIsMissing: true };
    }

    const front: string = control.value || '';

    if (partOfSpeech === PartOfSpeech.NOUN) {
      return ARTICLE_PATTERN.test(front) ? null : { articleIsMissing: true };
    } else if (partOfSpeech === PartOfSpeech.VERB) {
      return VERB_PATTERN.test(front) ? null : { toIsMissing: true };
    }

    return null;
  };
}

@Component({
  selector: 'vocabulary-add',
  imports: [
    MatInput,
    FormsModule,
    MatIcon,
    MatLabel,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatButtonToggleGroup,
    MatButtonToggle,
    NgClass
  ],
  templateUrl: './add-word.component.html',
  styleUrl: './add-word.component.css',
  standalone: true
})
export class AddWordComponent implements OnInit {
  public word: string = '';
  public wordToShow: string = '';
  public partOfSpeech: string = '';
  public partsOfSpeech: Set<string> = new Set<string>();

  public wordForm!: FormGroup;
  public wordFormTranslation!: FormGroup;
  public update: WritableSignal<boolean> = signal(false);
  public wordEntries: WritableSignal<DictionaryEntry[]> = signal([]);
  public translation: WritableSignal<string> = signal('');
  public isFromRouteCall: boolean = false;
  public chosenIndex: string | null = null;
  public chosenForContext: ChosenContextItem[] = [];

  private id: number | null = null;
  private ankiId: string | null = null;
  public deck: string | null = null;
  public front: string | null = null;
  public back: string | null = null;
  public description: string | null = null;

  constructor(
    private readonly vocabularyService: VocabularyService,
    private readonly dialog: MatDialog,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
    private readonly destroyRef: DestroyRef
  ) {
    this.initializeForms();
    this.setupFormSubscriptions();
    this.deck = DEFAULT_DECK;
  }

  private initializeForms(): void {
    this.wordForm = new FormGroup({
      deck: new FormControl(DEFAULT_DECK, Validators.required),
      front: new FormControl('', [Validators.required, validateWordPrefix(() => this.partOfSpeech, () => this.update())]),
      back: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required)
    });

    this.wordFormTranslation = new FormGroup({
      word: new FormControl('', Validators.required),
      context: new FormControl('', Validators.required)
    });
  }

  private setupFormSubscriptions(): void {
    // Deck selection - prevent duplicate values since deck changes are less frequent
    this.wordForm.get('deck')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        distinctUntilChanged()
      )
      .subscribe(deck => {
        this.deck = deck;
      });

    // Back translation - debounce to prevent excessive updates during typing
    this.wordForm.get('back')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(back => {
        this.back = back;
      });

    // Description - debounce to prevent clearing selection during typing
    this.wordForm.get('description')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(description => {
        this.description = description;
        this.chosenIndex = null;
      });

    // Context translation - debounce to prevent excessive array operations during typing
    this.wordFormTranslation.get('context')?.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.chosenForContext = [];
      });
  }

  public ngOnInit(): void {
    const rawId: string | null = this.route.snapshot.paramMap.get('id');
    if (rawId) {
      this.isFromRouteCall = true;
      this.loadFlashcard(parseInt(rawId, 10));
    }
  }

  private loadFlashcard(id: number): void {
    this.vocabularyService.getFlashcard(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: flashcard => {
          this.handleFlashcardLoad(flashcard);
        },
        error: err => {
          this.showSnackBar(`Getting flashcard failed: ${err.message}`, 10000);
        }
      });
  }

  private handleFlashcardLoad(flashcard: Flashcard): void {
    this.update.set(true);

    this.id = flashcard.id;
    this.ankiId = flashcard.ankiId;
    this.deck = flashcard.deck;
    this.front = flashcard.front;
    this.back = flashcard.back;
    this.description = flashcard.description;

    this.patchForm(flashcard.deck, flashcard.front, flashcard.back, flashcard.description);
    this.wordFormTranslation.patchValue({'word': flashcard.front}, {emitEvent: false});

    const match = WORD_PATTERN.exec(flashcard.front!);
    if (match) {
      this.wordToShow = match[2].replace(SPECIAL_CHAR_PATTERN, '').toLowerCase();
      this.loadWordEntries(this.wordToShow);
    }
  }

  private loadWordEntries(word: string): void {
    this.vocabularyService.getWord(word)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.wordEntries.set(res);
          this.partsOfSpeech = this.extractPartsOfSpeech(res);
        },
        error: err => {
          this.handleDictionaryError(err, word);
        }
      });
  }

  public getWord(word: string): void {
    this.resetWordState();
    this.front = word;
    this.back = null;

    this.vocabularyService.getWord(word)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.handleWordLookupSuccess(res, word);
        },
        error: err => {
          this.handleDictionaryError(err, word);
        }
      });
  }

  private resetWordState(): void {
    this.partOfSpeech = '';
    this.chosenIndex = null;
    this.chosenForContext = [];
    this.description = null;
  }

  private handleWordLookupSuccess(res: DictionaryEntry[], word: string): void {
    this.update.set(false);
    this.wordEntries.set(res);
    this.wordToShow = word;
    this.partsOfSpeech = this.extractPartsOfSpeech(res);
    this.patchForm(this.deck, word, '', '');
    this.wordFormTranslation.patchValue({'word': word, 'context': ''}, {emitEvent: false});
  }

  private extractPartsOfSpeech(dictionaryEntries: DictionaryEntry[]): Set<string> {
    const partsOfSpeech = new Set<string>();
    for (const dictionaryEntry of dictionaryEntries) {
      for (const meaning of dictionaryEntry.meanings) {
        partsOfSpeech.add(meaning.partOfSpeech);
      }
    }
    return partsOfSpeech;
  }

  public addArticleToWord(partOfSpeech: string): void {
    const match = ARTICLE_WORD_PATTERN.exec(this.wordToShow);

    if (!match) {
      return;
    }

    const word: string = match[2];
    let changedWord: string = word;

    if (partOfSpeech?.toLowerCase() === PartOfSpeech.NOUN) {
      this.openArticleDialog(word);
    } else if (partOfSpeech?.toLowerCase() === PartOfSpeech.VERB) {
      changedWord = `to ${word}`;
      this.updateWordFront(changedWord);
    } else {
      this.updateWordFront(changedWord);
    }

    this.wordForm.get('front')?.updateValueAndValidity();
  }

  private openArticleDialog(word: string): void {
    const dialogRef = this.dialog.open(ArticleDialogComponent, {
      width: '200px',
      autoFocus: false
    });

    dialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result !== undefined && result !== '') {
          const changedWord = `${result} ${word}`;
          this.updateWordFront(changedWord);
        }
      });
  }

  private updateWordFront(changedWord: string): void {
    this.front = changedWord;
    this.patchForm(this.deck, changedWord, this.back, this.description);
  }

  public patchForm(deck: string | null, front: string | null, back: string | null, description: string | null): void {
    const patch: Record<string, string> = {};
    if (deck != null) patch['deck'] = deck;
    if (front != null) patch['front'] = front;
    if (back != null) patch['back'] = back;
    if (description != null) patch['description'] = description;

    this.wordForm.patchValue(patch, {emitEvent: false});
  }

  public onSubmit(): void {
    const flashcard: Flashcard = this.createFlashcardFromForm();

    const observable = this.update()
      ? this.vocabularyService.updateFlashcard(flashcard)
      : this.vocabularyService.postFlashcard(flashcard);

    observable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const message = this.update() ? 'Flashcard updated successfully' : 'Flashcard created successfully';
          this.showSnackBar(message, 10000);
        },
        error: err => {
          const action = this.update() ? 'update' : 'creation';
          this.showSnackBar(`Flashcard ${action} failed: ${err.error.message}`, 10000);
        }
      });
  }

  private createFlashcardFromForm(): Flashcard {
    return {
      id: this.id ?? null,
      ankiId: this.ankiId ?? null,
      deck: this.wordForm.value.deck,
      front: this.wordForm.value.front,
      back: this.wordForm.value.back,
      description: this.wordForm.value.description,
      updated: true
    };
  }

  public onSubmitTranslation(): void {
    const word: string = this.wordFormTranslation.get('word')?.value;
    const context: string = this.wordFormTranslation.get('context')?.value;

    if (!word || !context) {
      return;
    }

    this.translation.set('ggogogo');
    this.vocabularyService.getTranslation(word, context)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          if (response && response.length > 0) {
            this.translation.set(response[0].text);
          }
        },
        error: err => {
          this.showSnackBar(`Getting translation failed: ${err.error.message}`, 10000);
        }
      });
  }

  private showSnackBar(message: string, duration: number): void {
    this.snackBar.open(message, 'Dismiss', { duration });
  }

  public isChosen(index: string): boolean {
    return this.chosenIndex === index;
  }

  public setChosenText(index: string, description: string): void {
    if (this.isChosen(index)) {
      this.chosenIndex = null;
      this.description = null;
      this.patchForm(this.deck, this.front, this.back, '');
    } else {
      this.chosenIndex = index;
      this.description = description;
      this.patchForm(this.deck, this.front, this.back, description);
    }
  }

  public setChosenForContext(index: string, text: string): boolean {
    const isCurrentlyChosen = this.isChosenForContext(index);

    if (isCurrentlyChosen) {
      this.chosenForContext = this.chosenForContext.filter(item => item.index !== index);
    } else {
      this.chosenForContext.push({ index, text });
    }

    const joinedText: string = this.chosenForContext.map(item => item.text).join(', \n');
    this.wordFormTranslation.patchValue({'context': joinedText}, {emitEvent: false});

    return !isCurrentlyChosen;
  }

  public isChosenForContext(index: string): boolean {
    return this.chosenForContext.some(item => item.index === index);
  }

  public getDefinitionIndex(entryIndex: number, meaningIndex: number, definitionIndex: number): string {
    return `${entryIndex}-${meaningIndex}-${definitionIndex}`;
  }

  private handleDictionaryError(error: any, word: string = ''): void {
    const errorConfig = this.getErrorConfiguration(error, word);

    this.snackBar.open(errorConfig.message, 'Dismiss', {
      duration: errorConfig.duration,
      panelClass: ['dictionary-error-snackbar']
    });
  }

  private getErrorConfiguration(error: any, word: string): { message: string; duration: number } {
    if (error instanceof WordNotFoundError) {
      return {
        message: `Word "${word}" not found in dictionary. Please check the spelling and try again.`,
        duration: 8000
      };
    }

    if (error instanceof RateLimitExceededError) {
      return {
        message: 'Rate limit exceeded. Please wait a moment before trying again.',
        duration: 15000
      };
    }

    if (error instanceof DictionaryServiceUnavailableError) {
      return {
        message: 'Dictionary service is temporarily unavailable. Please try again later.',
        duration: 12000
      };
    }

    if (error instanceof InvalidWordError) {
      return {
        message: `Invalid word: "${word}". Please enter a valid English word containing only letters, spaces, or hyphens.`,
        duration: 8000
      };
    }

    if (error instanceof DictionaryApiError) {
      return {
        message: `Dictionary API error: ${error.message}`,
        duration: 10000
      };
    }

    if (error instanceof UnexpectedDictionaryError) {
      return {
        message: `Unexpected error occurred while processing word "${word}". Please try again.`,
        duration: 10000
      };
    }

    return {
      message: `Dictionary lookup failed: ${error.message || 'Unknown error'}`,
      duration: 10000
    };
  }
}
