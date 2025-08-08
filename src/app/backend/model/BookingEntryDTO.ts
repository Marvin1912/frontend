import {CreditDebitCodeDTO} from './CreditDebitCodeDTO';

export interface BookingEntryDTO {
  creditDebitCode: CreditDebitCodeDTO;
  entryInfo: string;
  amount: number;
  bookingDate: string;
  firstOfMonth: string;
  debitName: string;
  debitIban: string;
  creditName: string;
  creditIban: string;
  additionalInfo: string;
}
