import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-entry-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './entry-delete-dialog.component.html',
  styleUrl: './entry-delete-dialog.component.css'
})
export class EntryDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<EntryDeleteDialogComponent>);
  label = inject<{label: string}>(MAT_DIALOG_DATA).label;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
