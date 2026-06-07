import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-food-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './food-delete-dialog.component.html',
  styleUrl: './food-delete-dialog.component.css'
})
export class FoodDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<FoodDeleteDialogComponent>);
  foodName = inject<{name: string}>(MAT_DIALOG_DATA).name;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
