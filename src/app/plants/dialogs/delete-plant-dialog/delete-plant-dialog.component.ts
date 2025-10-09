import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {Plant} from '../../model/plant';
import {MatIcon} from '@angular/material/icon';
import {PlantService} from '../../plant-service/plant.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatMiniFabButton} from '@angular/material/button';

@Component({
  selector: 'app-delete-plant-dialog',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './delete-plant-dialog.component.html',
  styleUrl: './delete-plant-dialog.component.css'
})
export class DeletePlantDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { plant: Plant },
    private dialogRef: MatDialogRef<DeletePlantDialogComponent>,
    private plantService: PlantService,
    private snackBar: MatSnackBar,
  ) {
  }

  deletePlant() {
    this.plantService.deletePlant(this.data.plant.id)
      .subscribe({
        next: () => {
          this.snackBar.open(
            `Plant ${this.data.plant.name} deleted!`,
            'Dissmiss', {
              duration: 5000
            }
          )
          this.dialogRef.close('deleted');
        },
        error: (err) => {
          console.log(err)
          this.snackBar.open(
            `Failed to delete plant. ${err.message}`,
            'Dissmiss', {
              duration: 5000
            }
          )
        }
      })
  }
}
