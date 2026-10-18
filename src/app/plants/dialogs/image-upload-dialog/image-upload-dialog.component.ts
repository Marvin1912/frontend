import {Component, Inject, ChangeDetectionStrategy, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import {Plant} from '../../models/plant.model';
import {ImageService} from '../../services/image.service';

@Component({
  selector: 'app-image-upload-dialog',
  imports: [
    FormsModule,
  ],
  templateUrl: './image-upload-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './image-upload-dialog.component.css'
})
export class ImageUploadDialogComponent {

  selectedFile = signal<File | undefined>(undefined);
  uploading = signal(false);
  error = signal<string | null>(null);

  constructor(
    public dialogRef: MatDialogRef<ImageUploadDialogComponent>,
    private imageService: ImageService,
    @Inject(MAT_DIALOG_DATA) public plant: Plant
  ) {
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  onSubmit() {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.uploading.set(true);
    this.dialogRef.disableClose = true;
    this.error.set(null);
    this.imageService.createImage(file).subscribe({
      next: (response) => {
        const uuid = this.imageService.extractUuidFromResponse(response);
        this.dialogRef.close(uuid);
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.uploading.set(false);
        this.dialogRef.disableClose = false;
        this.error.set('Upload failed. Please try again.');
      },
    });
  }
}
