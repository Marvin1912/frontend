import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-meal-template-delete-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './meal-template-delete-dialog.component.html',
  styleUrl: './meal-template-delete-dialog.component.css'
})
export class MealTemplateDeleteDialogComponent {

  private dialogRef = inject(MatDialogRef<MealTemplateDeleteDialogComponent>);
  templateName = inject<{name: string}>(MAT_DIALOG_DATA).name;

  confirm() {
    this.dialogRef.close('confirmed');
  }
}
