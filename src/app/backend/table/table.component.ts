import {Component, EventEmitter, Input, Output} from '@angular/core';
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
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
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
    MatIconModule,
    MatTooltipModule,
    DecimalPipe
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent {

  @Input() bookings?: BookingEntryDTO[];
  @Input() title?: string;
  @Output() itemRemoved = new EventEmitter<{ booking: BookingEntryDTO, category: string }>();

  displayedColumns: string[] = ['creditName', 'additionalInfo', 'amount', 'actions'];
  sortDirection: 'asc' | 'desc' = 'desc';

  getSortedBookings() {
    if (!this.bookings) return [];
    return [...this.bookings].sort((a, b) => {
      return this.sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    });
  }

  getTotalAmount() {
    return this.bookings?.map(b => b.amount)
      .reduce((amount, sum) => amount + sum, 0);
  }

  toggleSort() {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
  }

  removeItem(booking: BookingEntryDTO) {
    this.itemRemoved.emit({
      booking,
      category: this.getCategoryFromTitle()
    });
  }

  private getCategoryFromTitle(): string {
    if (!this.title) return 'unknown';

    switch (this.title) {
      case 'Generelle Buchungen':
        return 'usualBookings';
      case 'Täglicher Bedarf':
        return 'dailyCosts';
      case 'Einkommen':
        return 'incomes';
      default:
        return 'unknown';
    }
  }

}
