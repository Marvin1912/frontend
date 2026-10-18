import {Component, DestroyRef, inject, OnInit, signal, WritableSignal, ChangeDetectionStrategy} from '@angular/core';
import {VocabularyService} from "../../services/vocabulary.service";
import {Deck} from "../../model/Deck";
import {MatIcon} from "@angular/material/icon";
import {MatDialog, MatDialogClose} from "@angular/material/dialog";
import {DeckChangeNameDialog} from "../deck-change-name-dialog/deck-change-name-dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpResponse} from "@angular/common/http";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-deck-management-dialog',
  imports: [
    MatIcon,
    MatDialogClose
  ],
  templateUrl: './deck-management-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './deck-management-dialog.css',
})
export class DeckManagementDialog implements OnInit {

  private dialog = inject(MatDialog);
  private vocabularyService: VocabularyService = inject(VocabularyService);
  private snackBar: MatSnackBar = inject(MatSnackBar);
  private destroyRef: DestroyRef = inject(DestroyRef);

  protected decks: WritableSignal<Deck[]> = signal([]);
  protected loadState: WritableSignal<'loading' | 'loaded' | 'error'> = signal('loading');

  ngOnInit(): void {
    this.vocabularyService.getDecks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: decks => {
          this.decks.set(decks);
          this.loadState.set('loaded');
        },
        error: () => {
          this.loadState.set('error');
        }
      });
  }

  openDialog(deck: Deck): void {
    let matDialogRef = this.dialog.open(DeckChangeNameDialog, {
      data: {name: deck.name},
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ui-dialog-pane',
      ariaLabelledBy: 'deck-change-name-title'
    });

    matDialogRef.afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((newName: string | undefined) => {
        if (!newName || deck.name == newName) {
          return;
        }

        let updatedDeck: Deck = {...deck, name: newName};

        this.vocabularyService.updateDeck(updatedDeck)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (res: HttpResponse<Deck>) => {
              this.decks.update(decks => decks.map(d => d.id === deck.id ? {...d, name: res.body?.name ?? newName} : d));
              this.snackBar.open(`Name of deck ${deck.id} changed to ${res.body?.name ?? newName}`, 'OK', {duration: 10000});
            },
            error: err => {
              this.snackBar.open(`Changing name of deck ${deck.id} failed. ${err}`, 'OK', {duration: 10000});
            }
          });
      });
  }
}
