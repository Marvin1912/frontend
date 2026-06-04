import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {CurrencyPipe} from '@angular/common';

@Component({
  selector: 'app-receipt-item-add-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatMiniFabButton,
    CurrencyPipe
  ],
  templateUrl: './receipt-item-add-dialog.component.html',
  styleUrl: './receipt-item-add-dialog.component.css'
})
export class ReceiptItemAddDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ReceiptItemAddDialogComponent>);

  form!: FormGroup;
  calculatedPrice = 0;

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
      singlePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.form.valueChanges.subscribe(v => {
      const q = Number(v.quantity) || 0;
      const p = Number(v.singlePrice) || 0;
      this.calculatedPrice = Math.round(q * p * 100) / 100;
    });
  }

  save(): void {
    if (this.form.invalid) return;
    const {name, quantity, singlePrice} = this.form.value;
    this.dialogRef.close({
      name,
      quantity: Number(quantity),
      singlePrice: Number(singlePrice)
    });
  }
}
