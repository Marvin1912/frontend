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
import {ReceiptItem} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';

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
    CurrencyPipe
  ],
  templateUrl: './receipt-items.component.html',
  styleUrl: './receipt-items.component.css'
})
export class ReceiptItemsComponent implements OnInit {

  items = new MatTableDataSource<ReceiptItem>();
  columnsToDisplay = ['name', 'price'];

  constructor(
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.receiptService.getReceiptItems(id).subscribe(items => {
      this.items.data = items;
      this.cdr.markForCheck();
    });
  }
}
