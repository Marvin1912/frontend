import {Component, Input} from '@angular/core';
import {BookingsDTO} from '../model/BookingsDTO';
import {TableComponent} from '../table/table.component';
import {MonthlyBookingEntriesDTO} from '../model/MonthlyBookingEntriesDTO';
import {BookingEntryDTO} from '../model/BookingEntryDTO';
import {DecimalPipe, NgClass} from '@angular/common';

@Component({
  selector: 'app-bookings',
  imports: [
    TableComponent,
    DecimalPipe,
    NgClass
  ],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent {

  @Input() bookings?: BookingsDTO;
  totalAmount = 0;

  private sumAmounts(items: { amount: number }[] | undefined): number {
    if (!items?.length) {
      return 0;
    }
    return items.reduce((sum, b) => sum + (b?.amount ?? 0), 0);
  }

  private round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }

  getTotalAmount(booking: MonthlyBookingEntriesDTO): number {
    const usual = this.sumAmounts(booking.usualBookings);
    const daily = this.sumAmounts(booking.dailyCosts);
    return this.round2(usual + daily);
  }

  areExpensesHigherThanIncome(booking: MonthlyBookingEntriesDTO): boolean {
    const total = this.getTotalAmount(booking);
    const income = this.round2(this.sumAmounts(booking.incomes));
    return total > income;
  }

  getIncomeAmount(booking: MonthlyBookingEntriesDTO): number {
    return this.round2(this.sumAmounts(booking.incomes));
  }

  getEarningsDifference(booking: MonthlyBookingEntriesDTO): number {
    const income = this.getIncomeAmount(booking);
    const expenses = this.getTotalAmount(booking);
    return this.round2(income - expenses);
  }

  onItemRemoved(event: { booking: BookingEntryDTO, category: string }, monthBooking: MonthlyBookingEntriesDTO) {
    const { booking, category } = event;

    switch (category) {
      case 'usualBookings':
        monthBooking.usualBookings = monthBooking.usualBookings?.filter(b => b !== booking);
        break;
      case 'dailyCosts':
        monthBooking.dailyCosts = monthBooking.dailyCosts?.filter(b => b !== booking);
        break;
      case 'incomes':
        monthBooking.incomes = monthBooking.incomes?.filter(b => b !== booking);
        break;
    }
  }

}
