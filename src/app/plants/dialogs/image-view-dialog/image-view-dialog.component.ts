import {Component, Inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose} from '@angular/material/dialog';

@Component({
  selector: 'app-image-view-dialog',
  imports: [
    MatDialogClose
  ],
  templateUrl: './image-view-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './image-view-dialog.component.css'
})
export class ImageViewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { imageUrl: string; name: string }) {
  }
}
