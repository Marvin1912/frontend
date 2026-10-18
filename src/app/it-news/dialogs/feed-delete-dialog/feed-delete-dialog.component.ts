import {Component, Inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {FeedSource} from '../../models/article.model';

@Component({
  selector: 'app-feed-delete-dialog',
  imports: [
    MatDialogClose,
    MatIcon
  ],
  templateUrl: './feed-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
