import {Component, Input} from '@angular/core';
import {BookingsDTO} from '../model/BookingsDTO';
import {TableComponent} from '../table/table.component';
import {MonthlyBookingEntriesDTO} from '../model/MonthlyBookingEntriesDTO';
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

  getTotalAmount(booking: MonthlyBookingEntriesDTO) {

    let usualCosts = booking.usualBookings
      .map(b => b.amount)
      .reduce((amount, sum) => amount + sum, 0) ?? 0;

    let dailyCosts = booking.dailyCosts
      .map(b => b.amount)
      .reduce((amount, sum) => amount + sum, 0) ?? 0;

    return usualCosts + dailyCosts;
  }

  areExpensesHigherThanIncome(booking: MonthlyBookingEntriesDTO) {
    return this.getTotalAmount(booking) >
      booking.incomes.map(b => b.amount)
        .reduce((amount, sum) => amount + sum, 0);
  }

}
