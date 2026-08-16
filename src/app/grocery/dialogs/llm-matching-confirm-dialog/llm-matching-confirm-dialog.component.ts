import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-llm-matching-confirm-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './llm-matching-confirm-dialog.component.html',
  styleUrl: './llm-matching-confirm-dialog.component.css'
})
export class LlmMatchingConfirmDialogComponent {

  constructor(private dialogRef: MatDialogRef<LlmMatchingConfirmDialogComponent>) {
  }

  confirm() {
    this.dialogRef.close('confirmed');
  }

}
