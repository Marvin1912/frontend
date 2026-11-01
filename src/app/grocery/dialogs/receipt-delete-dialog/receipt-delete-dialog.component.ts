import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

export interface ReceiptDeleteDialogData {
  /** Human readable description of the receipt, e.g. "Bon vom 21.08.2026". */
  label: string;
  itemCount: number;
}

@Component({
  selector: 'app-receipt-delete-dialog',
  imports: [MatDialogClose, MatIcon],
  templateUrl: './receipt-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiptDeleteDialogComponent {

  readonly data = inject<ReceiptDeleteDialogData>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ReceiptDeleteDialogComponent>);

  confirm(): void {
    this.dialogRef.close('confirmed');
  }
}
