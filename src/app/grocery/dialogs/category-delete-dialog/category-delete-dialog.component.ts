import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-category-delete-dialog',
  imports: [MatDialogClose, MatIcon],
  templateUrl: './category-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDeleteDialogComponent {

  readonly data = inject<{ name: string }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<CategoryDeleteDialogComponent>);

  confirm(): void {
    this.dialogRef.close('confirmed');
  }
}
