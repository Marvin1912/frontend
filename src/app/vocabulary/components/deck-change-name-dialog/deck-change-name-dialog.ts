import {Component, inject, model, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogClose} from "@angular/material/dialog";

export interface Data {
  name: string;
}

@Component({
  selector: 'app-deck-change-name-dialog',
  imports: [
    FormsModule,
    MatDialogClose
  ],
  templateUrl: './deck-change-name-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class DeckChangeNameDialog {
  readonly data = inject<Data>(MAT_DIALOG_DATA);
  readonly deckname = model(this.data.name);
}
