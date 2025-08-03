import { BookingEntryDTO } from './BookingEntryDTO';

export interface MonthlyBookingEntriesDTO {
  year: number;
  month: number;
  usualBookings: BookingEntryDTO[];
  dailyCosts: BookingEntryDTO[];
  incomes: BookingEntryDTO[];
}
