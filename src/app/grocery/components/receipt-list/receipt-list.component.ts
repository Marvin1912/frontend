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
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Receipt} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-list',
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
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.css'
})
export class ReceiptListComponent implements OnInit {

  receipts = new MatTableDataSource<Receipt>();
  columnsToDisplay = ['receiptDate', 'creationDate', 'totalAmount'];

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.receiptService.getReceipts().subscribe(receipts => {
      this.receipts.data = receipts;
      this.cdr.markForCheck();
    });
  }

  navigateToItems(id: string): void {
    void this.router.navigate(['/grocery/receipts', id, 'items']);
  }
}
