import {Component} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-receipt-delete-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './receipt-delete-dialog.component.html',
  styleUrl: './receipt-delete-dialog.component.css'
})
export class ReceiptDeleteDialogComponent {

  constructor(private dialogRef: MatDialogRef<ReceiptDeleteDialogComponent>) {}

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
