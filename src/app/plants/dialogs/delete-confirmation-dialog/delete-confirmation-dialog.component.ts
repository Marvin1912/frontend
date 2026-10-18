import {Component, Inject, ChangeDetectionStrategy, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {Plant} from '../../models/plant.model';
import {MatIcon} from '@angular/material/icon';
import {PlantService} from '../../services/plant.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-confirmation-dialog',
  imports: [
    MatDialogClose,
    MatIcon,
  ],
  templateUrl: './delete-confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `.ui-btn mat-icon { width: 18px; height: 18px; font-size: 18px; }
           .dialog-alert { margin-top: var(--ui-space-3); }`
})
export class DeleteConfirmationDialogComponent {

  deleting = signal(false);
  error = signal<string | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { plant: Plant },
    private dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    private plantService: PlantService,
    private snackBar: MatSnackBar,
  ) {
  }

  deletePlant() {
    this.deleting.set(true);
    this.dialogRef.disableClose = true;
    this.error.set(null);
    this.plantService.deletePlant(this.data.plant.id)
      .subscribe({
        next: () => {
          this.snackBar.open(`Plant ${this.data.plant.name} deleted!`, 'Dismiss', {duration: 5000});
          this.dialogRef.close('deleted');
        },
        error: (err) => {
          this.deleting.set(false);
          this.dialogRef.disableClose = false;
          this.error.set(`Failed to delete plant. ${err.message}`);
        }
      })
  }
}
