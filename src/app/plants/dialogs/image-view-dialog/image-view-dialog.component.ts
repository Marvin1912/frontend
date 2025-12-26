import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-image-view-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatDialogClose,
    MatDialogActions
  ],
  templateUrl: './image-view-dialog.component.html',
  styleUrl: './image-view-dialog.component.css'
})
export class ImageViewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; name: string }) {
  }
}
