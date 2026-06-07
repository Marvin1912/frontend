import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import {MatIcon} from '@angular/material/icon';
import {MatMiniFabButton} from '@angular/material/button';
import {Supermarket} from '../../models/receipt.model';

@Component({
  selector: 'app-supermarket-select-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    MatMiniFabButton
  ],
  templateUrl: './supermarket-select-dialog.component.html',
  styleUrl: './supermarket-select-dialog.component.css'
})
export class SupermarketSelectDialogComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SupermarketSelectDialogComponent>);

  readonly supermarkets: {value: Supermarket; label: string}[] = [
    {value: 'LIDL', label: 'Lidl'},
    {value: 'EDEKA', label: 'Edeka'},
    {value: 'REWE', label: 'Rewe'}
  ];

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      supermarket: ['LIDL', Validators.required]
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value.supermarket as Supermarket);
  }
}
