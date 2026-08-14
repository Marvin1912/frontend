import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-category-delete-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './category-delete-dialog.component.html',
  styleUrl: './category-delete-dialog.component.css'
})
export class CategoryDeleteDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string },
    private dialogRef: MatDialogRef<CategoryDeleteDialogComponent>
  ) {
  }

  confirm() {
    this.dialogRef.close('confirmed');
  }

}
