import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {FeedSource} from '../../models/article.model';

@Component({
  selector: 'app-feed-delete-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './feed-delete-dialog.component.html',
  styleUrl: './feed-delete-dialog.component.css'
})
export class FeedDeleteDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { feed: FeedSource },
    private dialogRef: MatDialogRef<FeedDeleteDialogComponent>
  ) {
  }

  confirm() {
    this.dialogRef.close('confirmed');
  }

}
