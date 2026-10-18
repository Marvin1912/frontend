import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {MatIcon} from '@angular/material/icon';
import {DeckManagementDialog} from "../deck-management-dialog/deck-management-dialog";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'vocabulary-home',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatIcon
  ],
  templateUrl: './vocabulary-home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './vocabulary-home.component.css',
  host: {class: 'ui-bg'}
})
export class VocabularyHomeComponent {

  private dialog: MatDialog = inject(MatDialog);

  openDialog(): void {
    this.dialog.open(DeckManagementDialog, {
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'ui-dialog-pane',
      ariaLabelledBy: 'deck-management-title'
    });
  }
}
