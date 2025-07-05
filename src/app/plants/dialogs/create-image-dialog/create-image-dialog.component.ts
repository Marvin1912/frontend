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
import {Plant} from '../../model/plant';
import {ImageService} from '../../image-service/image.service';

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
        let uuid = this.imageService.extractUuidFromResponse(response);
        this.dialogRef.close(uuid);
      },
      error: (err) => {
        console.error('Upload failed', err);
      },
    });
  }
}
