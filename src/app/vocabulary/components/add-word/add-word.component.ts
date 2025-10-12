import {Component, OnInit, signal, WritableSignal} from '@angular/core';
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
import {MatTooltip} from '@angular/material/tooltip';

const DEFAULT_DECK = 'Standard';

function validateWordPrefix(
  partOfSpeechFn: () => string,
  comesFromListFn: () => boolean
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    let partOfSpeech = partOfSpeechFn();
    if (!comesFromListFn()) {
      if (!partOfSpeech) {
        return {partOfSpeechIsMissing: true};
      }
    }

    let front: string = control.value;

    if ("noun" === partOfSpeech) {
      return /^(?:a|an) [a-z]+/i.test(front) ? null : {articleIsMissing: true};
    } else if ("verb" === partOfSpeech) {
      return /^to [a-z]+/i.test(front) ? null : {toIsMissing: true};
    } else {
      return null;
    }

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
    NgClass,
    MatTooltip
  ],
  templateUrl: './add-word.component.html',
  styleUrl: './add-word.component.css',
  standalone: true
})
export class AddWordComponent implements OnInit {

  word: string = '';
  wordToShow: string = '';
  partOfSpeech: string = '';
  partsOfSpeech: Set<string> = new Set<string>();

  wordForm: FormGroup;
  wordFormTranslation: FormGroup;
  update: WritableSignal<boolean> = signal(false);
  wordEntries: WritableSignal<DictionaryEntry[]> = signal([]);
  translation: WritableSignal<string> = signal('');
  isFromRouteCall: boolean = false;
  chosenIndex: string | null = null;
  chosenForContext: any[] = [];

  id: number | null = null;
  ankiId: string | null = null;
  deck: string | null = null;
  front: string | null = null;
  back: string | null = null;
  description: string | null = null;

  constructor(
    private vocabularyService: VocabularyService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
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

    this.deck = DEFAULT_DECK;

    this.wordForm.get('deck')?.valueChanges.subscribe(deck => {
      this.deck = deck;
    });

    this.wordForm.get('back')?.valueChanges.subscribe(back => {
      this.back = back;
    });

    this.wordForm.get('description')?.valueChanges.subscribe(description => {
      this.description = description;
      this.chosenIndex = null;
    });

    this.wordFormTranslation.get('context')?.valueChanges.subscribe(_ => {
      this.chosenForContext = [];
    });
  }

  ngOnInit() {
    let rawId: string | null = this.route.snapshot.paramMap.get('id');
    if (rawId) {
      this.isFromRouteCall = true;
      this.vocabularyService.getFlashcard(parseInt(rawId)).subscribe({
          next: flashcard => {

            this.update.set(true);

            this.id = flashcard.id;
            this.ankiId = flashcard.ankiId;
            this.deck = flashcard.deck;
            this.front = flashcard.front;
            this.back = flashcard.back;
            this.description = flashcard.description;

            this.patchForm(flashcard.deck, flashcard.front, flashcard.back, flashcard.description);
            this.wordFormTranslation.patchValue({'word': flashcard.front}, {emitEvent: false});

            let match = /^(?:(to|a|an)\s)?([A-Za-z! ]+)(?:\s(sth\.|sb\.|sb\.\/sth\.))?$/i
              .exec(flashcard.front!)!;
            this.wordToShow = match[2].replace(new RegExp(/([!?#])/i), '').toLowerCase();

            this.vocabularyService.getWord(this.wordToShow).subscribe({
                next: res => {
                  this.wordEntries.set(res);
                  this.partsOfSpeech = this.setPartsOfSpeech(res);
                },
                error: err => {
                  this.snackBar.open(`Getting word failed: ${err.message}`, 'Dismiss', {
                    duration: 10000
                  });
                }
              }
            );
          },
          error: err => {
            this.snackBar.open(`Getting flashcard failed: ${err.message}`, 'Dismiss', {
              duration: 10000
            });
          }
        }
      );
    }
  }

  getWord(word: string): void {
    this.partOfSpeech = '';
    this.vocabularyService.getWord(word).subscribe({
        next: res => {
          this.update.set(false);
          this.wordEntries.set(res);
          this.wordToShow = word;
          this.partsOfSpeech = this.setPartsOfSpeech(res);
          this.patchForm(this.deck, word, '', '');
          this.wordFormTranslation.patchValue({'word': word}, {emitEvent: false});
        },
        error: err => {
          this.snackBar.open(`Getting word failed: ${err.message}`, 'Dismiss', {
            duration: 10000
          });
        }
      }
    )
  }

  setPartsOfSpeech(dictionaryEntries: DictionaryEntry[]): Set<string> {
    let partsOfSpeech = new Set<string>;
    for (let dictionaryEntry of dictionaryEntries) {
      for (let meaning of dictionaryEntry.meanings) {
        partsOfSpeech.add(meaning.partOfSpeech)
      }
    }
    return partsOfSpeech;
  }

  addArticleToWord(partOfSpeech: string) {

    let match = new RegExp(/^(?:(a|an|to)\s)?([a-z- ]+)$/i).exec(this.wordToShow)

    if (match) {
      let word: string = match[2];
      let changedWord: string = word;
      if (partOfSpeech === 'noun') {

        let dialogRef = this.dialog.open(ArticleDialogComponent, {
          width: '200px',
          autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result !== undefined && result !== '') {
            this.front = `${result} ${word}`;
            this.patchForm(this.deck, `${result} ${word}`, this.back, this.description);
          }
        });

      } else if (partOfSpeech === 'verb') {
        changedWord = `to ${word}`;
      } else {
        changedWord = word;
      }

      this.front = changedWord;
      this.patchForm(this.deck, changedWord, this.back, this.description);
    }

    this.wordForm.get('front')?.updateValueAndValidity();
  }

  patchForm(deck: string | null, front: string | null, back: string | null, description: string | null): void {
    const patch: any = {};
    if (deck != null) patch.deck = deck;
    if (front != null) patch.front = front;
    if (back != null) patch.back = back;
    if (description != null) patch.description = description;

    this.wordForm.patchValue(patch, {emitEvent: false});
  }

  onSubmit() {
    let tmpFlashcard: Flashcard = {
      id: this.id ?? null,
      ankiId: this.ankiId ?? null,
      deck: this.wordForm.value.deck,
      front: this.wordForm.value.front,
      back: this.wordForm.value.back,
      description: this.wordForm.value.description,
      updated: true
    };

    let observable = this.update()
      ? this.vocabularyService.updateFlashcard(tmpFlashcard)
      : this.vocabularyService.postFlashcard(tmpFlashcard);

    observable.subscribe({
      next: _ => {
        this.snackBar.open(`Flashcard updated successfully`, 'Dismiss', {
          duration: 10000
        });
      },
      error: err => {
        this.snackBar.open(`Flashcard update failed: ${err.error.message}`, 'Dismiss', {
          duration: 10000
        });
      }
    });
  }

  onSubmitTranslation() {
    let word: string = this.wordFormTranslation.get('word')?.value;
    let context: string = this.wordFormTranslation.get('context')?.value;
    this.translation.update(_ => '');
    this.vocabularyService.getTranslation(word, context).subscribe({
      next: response => {
        if (response && response.length > 0) {
          this.translation.update(_ => response[0].text);
          console.log(response);
        }
      },
      error: err => {
        this.snackBar.open(`Getting translation failed: ${err.error.message}`, 'Dismiss', {
          duration: 10000
        });
      }
    });
  }

  isChosen(index: string): boolean {
    return this.chosenIndex !== null && this.chosenIndex === index;
  }

  setChosenText(index: string, description: string) {
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

  setChosenForContext(index: string, text: string): boolean {

    let isChosen: boolean;

    if (this.isChosenForContext(index)) {
      this.chosenForContext = this.chosenForContext.filter(value => index !== value.index);
      isChosen = false;
    } else {
      this.chosenForContext.push({
        index: index,
        text: text
      });
      isChosen = true;
    }

    let joinedText: string = this.chosenForContext.map(value => value.text).join(', \n');
    this.wordFormTranslation.patchValue({'context': joinedText}, {emitEvent: false});

    return isChosen;
  }

  isChosenForContext(index: string): boolean {
    return this.chosenForContext.filter(value => index === value.index).length > 0;
  }
}
