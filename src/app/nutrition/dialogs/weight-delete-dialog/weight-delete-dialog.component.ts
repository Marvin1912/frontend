import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-weight-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './weight-delete-dialog.component.html',
  styleUrl: './weight-delete-dialog.component.css'
})
export class WeightDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<WeightDeleteDialogComponent>);

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
