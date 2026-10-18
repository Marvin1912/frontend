import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-weight-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogClose,
    MatIcon
  ],
  templateUrl: './weight-delete-dialog.component.html'
})
export class WeightDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<WeightDeleteDialogComponent>);

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
