import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-llm-matching-confirm-dialog',
  imports: [MatDialogClose, MatIcon],
  templateUrl: './llm-matching-confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LlmMatchingConfirmDialogComponent {

  private dialogRef = inject(MatDialogRef<LlmMatchingConfirmDialogComponent>);

  confirm(): void {
    this.dialogRef.close('confirmed');
  }
}
