import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {Supermarket} from '../../models/receipt.model';
import {SUPERMARKETS} from '../../models/supermarket';

export interface SupermarketSelectDialogData {
  supermarket?: Supermarket | null;
}

@Component({
  selector: 'app-supermarket-select-dialog',
  imports: [ReactiveFormsModule, MatDialogClose, MatIcon],
  templateUrl: './supermarket-select-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupermarketSelectDialogComponent {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SupermarketSelectDialogComponent, Supermarket>);
  private data = inject<SupermarketSelectDialogData | undefined>(MAT_DIALOG_DATA, {optional: true});

  readonly supermarkets = SUPERMARKETS;

  readonly form = this.fb.group({
    supermarket: this.fb.control<Supermarket>(this.data?.supermarket ?? 'LIDL', Validators.required)
  });

  save(): void {
    const supermarket = this.form.value.supermarket;
    if (this.form.invalid || !supermarket) return;
    this.dialogRef.close(supermarket);
  }
}
