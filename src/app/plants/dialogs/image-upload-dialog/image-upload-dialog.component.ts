import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {Plant} from '../../models/plant.model';
import {ImageService} from '../../services/image.service';

@Component({
  selector: 'app-image-upload-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    FormsModule,
    MatButton
  ],
  templateUrl: './image-upload-dialog.component.html',
  styleUrl: './image-upload-dialog.component.css'
})
export class ImageUploadDialogComponent {

  selectedFile?: File;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private imageService: ImageService,
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

    this.imageService.createImage(this.selectedFile).subscribe({
      next: (response) => {
        const uuid = this.imageService.extractUuidFromResponse(response);
        this.dialogRef.close(uuid);
      },
      error: (err) => {
        console.error('Upload failed', err);
      },
    });
  }
}
