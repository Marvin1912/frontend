import {Component, inject, model} from '@angular/core';
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

export interface Data {
  name: string;
}

@Component({
  selector: 'app-deck-change-name-dialog',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatDialogClose
  ],
  templateUrl: './deck-change-name-dialog.html',
  styleUrl: './deck-change-name-dialog.css',
})
export class DeckChangeNameDialog {

  readonly data = inject<Data>(MAT_DIALOG_DATA);
  readonly deckname = model(this.data.name);

}
