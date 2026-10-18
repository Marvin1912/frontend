import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-entry-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogClose,
    MatIcon
  ],
  templateUrl: './entry-delete-dialog.component.html'
})
export class EntryDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<EntryDeleteDialogComponent>);
  label = inject<{label: string}>(MAT_DIALOG_DATA).label;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
