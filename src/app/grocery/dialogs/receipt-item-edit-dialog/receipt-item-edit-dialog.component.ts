import {ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {CurrencyPipe} from '@angular/common';
import {ReceiptItem} from '../../models/receipt.model';

@Component({
  selector: 'app-receipt-item-edit-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogClose,
    MatIcon,
    CurrencyPipe
  ],
  templateUrl: './receipt-item-edit-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ReceiptItemEditDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private dialogRef = inject(MatDialogRef<ReceiptItemEditDialogComponent>);
  item: ReceiptItem = inject(MAT_DIALOG_DATA);

  form!: FormGroup;
  calculatedPrice = 0;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.item.name, Validators.required],
      quantity: [this.item.quantity, [Validators.required, Validators.min(0)]],
      singlePrice: [this.item.singlePrice, [Validators.required, Validators.min(0)]]
    });

    this.calculatedPrice = this.item.price;

    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      const q = Number(v.quantity) || 0;
      const p = Number(v.singlePrice) || 0;
      this.calculatedPrice = Math.round(q * p * 100) / 100;
    });
  }

  isInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && control.touched;
  }

  save(): void {
    if (this.form.invalid) return;
    const {name, quantity, singlePrice} = this.form.value;
    this.dialogRef.close({
      ...this.item,
      name,
      quantity: Number(quantity),
      singlePrice: Number(singlePrice),
      price: this.calculatedPrice
    } as ReceiptItem);
  }
}
