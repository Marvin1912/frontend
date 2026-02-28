import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DeckManagementDialog} from "../deck-management-dialog/deck-management-dialog";
import {MatDialog} from "@angular/material/dialog";
import {Deck} from "../../model/Deck";
import {VocabularyService} from "../../services/vocabulary.service";

@Component({
  selector: 'vocabulary-home',
  imports: [
    RouterLink,
    RouterOutlet,
    MatFabButton,
    MatIcon
  ],
  templateUrl: './vocabulary-home.component.html',
  styleUrl: './vocabulary-home.component.css'
})
export class VocabularyHomeComponent {

  readonly dialog: MatDialog = inject(MatDialog);
  readonly vocabularyService: VocabularyService = inject(VocabularyService);

  openDialog(): void {
    let matDialogRef = this.dialog.open(DeckManagementDialog, {
      width: '800px',
      height: '600px'
    });

    matDialogRef.afterClosed().subscribe((updatedDeck: Deck | undefined) => {
      if (!updatedDeck) {
        return;
      }
      this.vocabularyService.updateDeck(updatedDeck).subscribe({
        next: res => {
          console.log(res);
        },
        error: err => {
          console.log(err);
        }
      });
    });
  }

}
