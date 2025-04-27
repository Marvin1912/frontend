import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {PlantService} from '../../plant-service/plant.service';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {Plant} from '../../model/plant';

@Component({
  selector: 'app-create-image-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    FormsModule,
    MatButton
  ],
  templateUrl: './create-image-dialog.component.html',
  styleUrl: './create-image-dialog.component.css'
})
export class CreateImageDialogComponent {

  selectedFile?: File;

  constructor(
    public dialogRef: MatDialogRef<CreateImageDialogComponent>,
    private plantService: PlantService,
    @Inject(MAT_DIALOG_DATA) public plant: Plant
  ) {
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (!this.selectedFile) {
      return;
    }

    this.plantService.uploadImage(this.plant.id, this.selectedFile).subscribe({
      next: (res) => {
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Upload failed', err);
      },
    });
  }
}
