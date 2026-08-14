import {Component, inject, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-category-rename-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './category-rename-dialog.component.html',
  styleUrl: './category-rename-dialog.component.css'
})
export class CategoryRenameDialogComponent {

  private data = inject<{ name: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<CategoryRenameDialogComponent>);

  name = model(this.data.name);

  get isValid(): boolean {
    return this.name().trim().length > 0;
  }

  confirm(): void {
    const trimmed = this.name().trim();
    if (!trimmed) {
      return;
    }
    this.dialogRef.close(trimmed);
  }

}
