import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {CurrencyPipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ReceiptItem} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';
import {ReceiptItemEditDialogComponent} from '../../dialogs/receipt-item-edit-dialog/receipt-item-edit-dialog.component';
import {ReceiptItemAddDialogComponent} from '../../dialogs/receipt-item-add-dialog/receipt-item-add-dialog.component';

@Component({
  selector: 'app-receipt-items',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    CurrencyPipe,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './receipt-items.component.html',
  styleUrl: './receipt-items.component.css'
})
export class ReceiptItemsComponent implements OnInit {

  items = new MatTableDataSource<ReceiptItem>();
  columnsToDisplay = ['name', 'quantity', 'singlePrice', 'price', 'actions'];
  receiptId = '';

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.receiptId = this.route.snapshot.paramMap.get('id')!;
    this.receiptService.getReceiptItems(this.receiptId).subscribe(items => {
      this.items.data = items;
      this.cdr.markForCheck();
    });
  }

  openEditDialog(item: ReceiptItem): void {
    const ref = this.dialog.open(ReceiptItemEditDialogComponent, {data: item});
    ref.afterClosed().subscribe((result: ReceiptItem | undefined) => {
      if (!result) return;
      this.receiptService.updateReceiptItem(this.receiptId, result).subscribe({
        next: (updated) => {
          this.items.data = this.items.data.map(i => i.id === updated.id ? updated : i);
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open('Artikel konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(ReceiptItemAddDialogComponent);
    ref.afterClosed().subscribe((result: {name: string; quantity: number; singlePrice: number} | undefined) => {
      if (!result) return;
      this.receiptService.addReceiptItem(this.receiptId, result).subscribe({
        next: (created) => {
          this.items.data = [...this.items.data, created];
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open('Artikel konnte nicht hinzugefügt werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }
}
