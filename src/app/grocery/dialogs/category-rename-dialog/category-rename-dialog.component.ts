import {ChangeDetectionStrategy, Component, inject, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-category-rename-dialog',
  imports: [FormsModule, MatDialogClose, MatIcon],
  templateUrl: './category-rename-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
