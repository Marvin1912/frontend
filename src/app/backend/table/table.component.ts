import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {BookingEntryDTO} from '../model/BookingEntryDTO';
import {DecimalPipe} from '@angular/common';
import {round2, sumAmounts} from '../model/booking-math';

export type BookingCategory = 'usualBookings' | 'dailyCosts' | 'incomes';

@Component({
  selector: 'app-table',
  imports: [
    MatIconModule,
    MatTooltipModule,
    ClipboardModule,
    DecimalPipe
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {

  bookings = input<BookingEntryDTO[]>();
  title = input('');
  category = input.required<BookingCategory>();
  itemRemoved = output<{ booking: BookingEntryDTO, category: BookingCategory }>();

  sortDirection = signal<'asc' | 'desc'>('desc');
  copiedIban = signal<string | null>(null);

  sortedBookings = computed(() => {
    const direction = this.sortDirection();
    return [...(this.bookings() ?? [])].sort((a, b) => direction === 'desc' ? b.amount - a.amount : a.amount - b.amount);
  });

  totalAmount = computed(() => round2(sumAmounts(this.bookings())));

  sortLabel = computed(() => 'Sortierung: ' + (this.sortDirection() === 'desc' ? 'Höchste zuerst' : 'Niedrigste zuerst'));

  private copiedTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimeout));
  }

  toggleSort() {
    this.sortDirection.update(direction => direction === 'desc' ? 'asc' : 'desc');
  }

  getPartyName(element: BookingEntryDTO): string {
    return this.category() === 'incomes' ? element.debitName : element.creditName;
  }

  getPartyIban(element: BookingEntryDTO): string {
    return this.category() === 'incomes' ? element.debitIban : element.creditIban;
  }

  // Anzeige in 4er-Gruppen; kopiert wird die IBAN ohne Leerzeichen
  formatIban(iban: string): string {
    return iban.replace(/\s/g, '').replace(/(.{4})(?=.)/g, '$1 ');
  }

  onIbanCopied(iban: string) {
    this.copiedIban.set(iban);
    clearTimeout(this.copiedTimeout);
    this.copiedTimeout = setTimeout(() => this.copiedIban.set(null), 1500);
  }

  removeItem(booking: BookingEntryDTO) {
    this.itemRemoved.emit({booking, category: this.category()});
  }
}
