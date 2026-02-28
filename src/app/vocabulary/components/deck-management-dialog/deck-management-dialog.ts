import {Component, inject, model, ModelSignal, signal, WritableSignal} from '@angular/core';
import {VocabularyService} from "../../services/vocabulary.service";
import {Deck} from "../../model/Deck";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {DeckChangeNameDialog} from "../deck-change-name-dialog/deck-change-name-dialog";

@Component({
  selector: 'app-deck-management-dialog',
  imports: [
    MatIconButton,
    MatIcon,
    MatDialogContent,
    MatButton,
    MatDialogActions,
    MatDialogClose
  ],
  templateUrl: './deck-management-dialog.html',
  styleUrl: './deck-management-dialog.css',
})
export class DeckManagementDialog {

  readonly deck: ModelSignal<Deck | null> = model<Deck | null>(null);

  private dialog = inject(MatDialog);
  private vocabularyService: VocabularyService = inject(VocabularyService);

  protected decks: WritableSignal<Deck[]> = signal([]);

  constructor() {
    this.vocabularyService.getDecks().subscribe(decks => {
      this.decks.set(decks);
    })
  }

  openDialog(deck: Deck): void {

    let matDialogRef = this.dialog.open(DeckChangeNameDialog, {
      data: {name: deck.name}
    });

    matDialogRef.afterClosed().subscribe((newName: string | undefined) => {
      if (!newName || deck.name == newName) {
        return;
      }

      this.decks.update(decks => decks.map(d => d.id === deck.id ? {...d, name: newName} : d));

      let updatedDeck: Deck | undefined = this.decks().find(d => d.id === deck.id);
      if (updatedDeck) {
        this.deck.set(updatedDeck);
      }
    });
  }

}
