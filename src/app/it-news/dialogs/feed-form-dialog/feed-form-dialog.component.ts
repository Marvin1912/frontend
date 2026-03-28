import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatButton} from '@angular/material/button';
import {FeedSource} from '../../models/article.model';

@Component({
  selector: 'app-feed-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatInput,
    MatSlideToggle,
    MatButton
  ],
  templateUrl: './feed-form-dialog.component.html',
  styleUrl: './feed-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedFormDialogComponent {

  feedForm: FormGroup;
  isEdit: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { feed?: FeedSource },
    private dialogRef: MatDialogRef<FeedFormDialogComponent>,
    private fb: FormBuilder
  ) {
    this.isEdit = !!data?.feed;
    this.feedForm = this.fb.group({
      name: [data?.feed?.name || '', Validators.required],
      url: [data?.feed?.url || '', Validators.required],
      category: [data?.feed?.category || '', Validators.required],
      active: [data?.feed?.active ?? true]
    });
  }

  save() {
    if (this.feedForm.valid) {
      const result: FeedSource = {
        ...this.feedForm.value,
        ...(this.isEdit ? {id: this.data.feed!.id} : {})
      };
      this.dialogRef.close(result);
    }
  }

}
