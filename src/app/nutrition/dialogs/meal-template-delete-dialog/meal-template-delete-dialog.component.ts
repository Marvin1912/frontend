import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-meal-template-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogClose,
    MatIcon
  ],
  templateUrl: './meal-template-delete-dialog.component.html'
})
export class MealTemplateDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<MealTemplateDeleteDialogComponent>);
  templateName = inject<{name: string}>(MAT_DIALOG_DATA).name;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
