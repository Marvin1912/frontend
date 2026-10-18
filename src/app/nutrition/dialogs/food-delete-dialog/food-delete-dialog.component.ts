import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-food-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogClose,
    MatIcon
  ],
  templateUrl: './food-delete-dialog.component.html'
})
export class FoodDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<FoodDeleteDialogComponent>);
  foodName = inject<{name: string}>(MAT_DIALOG_DATA).name;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
