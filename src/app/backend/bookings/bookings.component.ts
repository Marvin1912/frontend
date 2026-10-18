import {ChangeDetectionStrategy, Component, computed, input, linkedSignal} from '@angular/core';
import {BookingsDTO} from '../model/BookingsDTO';
import {BookingCategory, TableComponent} from '../table/table.component';
import {MonthlyBookingEntriesDTO} from '../model/MonthlyBookingEntriesDTO';
import {BookingEntryDTO} from '../model/BookingEntryDTO';
import {DecimalPipe, formatDate} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {round2, sumAmounts} from '../model/booking-math';

export interface MonthSummary {
  key: string;
  label: string;
  month: MonthlyBookingEntriesDTO;
  expenses: number;
  income: number;
  difference: number;
}

@Component({
  selector: 'app-bookings',
  imports: [
    TableComponent,
    DecimalPipe,
    MatIcon
  ],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent {

  bookings = input<BookingsDTO>();

  // Lokale Kopie: Entfernen einer Buchung verändert nicht das Input-Objekt
  private months = linkedSignal(() => this.bookings()?.bookingsPerMonth ?? []);

  summaries = computed<MonthSummary[]>(() => this.months().map(month => {
    const expenses = round2(sumAmounts(month.usualBookings) + sumAmounts(month.dailyCosts));
    const income = round2(sumAmounts(month.incomes));
    return {
      key: `${month.year}-${month.month}`,
      label: formatDate(new Date(month.year, month.month - 1, 1), 'MMMM yyyy', 'de'),
      month,
      expenses,
      income,
      difference: round2(income - expenses)
    };
  }));

  onItemRemoved(event: { booking: BookingEntryDTO, category: BookingCategory }, month: MonthlyBookingEntriesDTO) {
    const {booking, category} = event;
    this.months.update(months => months.map(m => m === month
      ? {...m, [category]: (m[category] ?? []).filter(b => b !== booking)}
      : m));
  }
}
