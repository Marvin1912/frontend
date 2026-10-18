import {ComponentFixture, TestBed} from '@angular/core/testing';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';

import {TableComponent} from './table.component';
import {BookingEntryDTO} from '../model/BookingEntryDTO';

registerLocaleData(localeDe);

function entry(amount: number, name: string): BookingEntryDTO {
  return {
    amount,
    creditName: `credit ${name}`,
    creditIban: `DE-C-${name}`,
    debitName: `debit ${name}`,
    debitIban: `DE-D-${name}`,
    additionalInfo: `info ${name}`
  } as BookingEntryDTO;
}

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  const bookings = [entry(10, 'a'), entry(30.5, 'b'), entry(20, 'c')];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('category', 'usualBookings');
    fixture.componentRef.setInput('title', 'Generelle Buchungen');
    fixture.componentRef.setInput('bookings', bookings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sorts descending by default and toggles to ascending', () => {
    expect(component.sortedBookings().map(b => b.amount)).toEqual([30.5, 20, 10]);
    component.toggleSort();
    expect(component.sortedBookings().map(b => b.amount)).toEqual([10, 20, 30.5]);
  });

  it('renders the total in German number format', () => {
    const sum = fixture.nativeElement.querySelector('.tbl__sum-val') as HTMLElement;
    expect(sum.textContent?.trim()).toBe('60,50');
  });

  it('uses the debtor for incomes and the creditor otherwise', () => {
    expect(component.getPartyName(bookings[0])).toBe('credit a');
    fixture.componentRef.setInput('category', 'incomes');
    expect(component.getPartyName(bookings[0])).toBe('debit a');
    expect(component.getPartyIban(bookings[0])).toBe('DE-D-a');
  });

  it('formats IBANs in groups of four', () => {
    expect(component.formatIban('DE89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
  });

  it('emits the booking with its category on remove', () => {
    const emitted: unknown[] = [];
    component.itemRemoved.subscribe(e => emitted.push(e));
    component.removeItem(bookings[1]);
    expect(emitted).toEqual([{booking: bookings[1], category: 'usualBookings'}]);
  });

  it('shows an empty row without bookings', () => {
    fixture.componentRef.setInput('bookings', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty')?.textContent).toContain('Keine Buchungen');
  });
});
