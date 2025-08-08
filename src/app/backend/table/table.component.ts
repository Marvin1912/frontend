import {Component, Input} from '@angular/core';
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
  MatTable
} from '@angular/material/table';
import {BookingEntryDTO} from '../model/BookingEntryDTO';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    DecimalPipe
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  @Input() bookings?: BookingEntryDTO[];
  @Input() title?: string;

  displayedColumns: string[] = ['creditName', 'additionalInfo', 'amount'];

  getSortedBookings() {
    return this.bookings?.sort((a, b) => b.amount - a.amount);
  }

  getTotalAmount() {
    return this.bookings?.map(b => b.amount)
      .reduce((amount, sum) => amount + sum, 0);
  }

}
