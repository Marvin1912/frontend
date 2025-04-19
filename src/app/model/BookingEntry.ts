import {CreditDebitCode} from './CreditDebitCode';

export interface BookingEntry {
  creditDebitCode: CreditDebitCode;
  entryInfo: string;
  amount: number;
  bookingDate: Date;
  firstOfMonth: Date;
  debitName: String;
  debitIban: String;
  creditName: String;
  creditIban: String;
  additionalInf: String;
}
