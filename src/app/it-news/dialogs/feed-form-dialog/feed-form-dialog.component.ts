import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FeedSource} from '../../models/article.model';

@Component({
  selector: 'app-feed-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogClose,
    MatSlideToggle
  ],
  templateUrl: './feed-form-dialog.component.html',
  styleUrl: './feed-form-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedFormDialogComponent {

  readonly fields = [
    {name: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Baeldung'},
    {name: 'url', label: 'URL', type: 'url', placeholder: 'https://example.com/feed.xml'},
    {name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. Java'}
  ] as const;

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

  showError(controlName: string): boolean {
    const control = this.feedForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  save() {
    if (this.feedForm.invalid) {
      this.feedForm.markAllAsTouched();
      return;
    }
    const result: FeedSource = {
      ...this.feedForm.value,
      ...(this.isEdit ? {id: this.data.feed!.id} : {})
    };
    this.dialogRef.close(result);
  }

}
