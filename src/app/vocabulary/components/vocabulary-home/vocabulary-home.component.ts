import {Component, inject} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {DeckManagementDialog} from "../deck-management-dialog/deck-management-dialog";
import {MatDialog} from "@angular/material/dialog";

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

  private dialog: MatDialog = inject(MatDialog);

  openDialog(): void {
    this.dialog.open(DeckManagementDialog, {
      width: '800px',
      height: '600px'
    });
  }

}
