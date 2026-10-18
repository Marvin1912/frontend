import {ComponentFixture, TestBed} from '@angular/core/testing';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';

import {BookingsComponent} from './bookings.component';
import {BookingsDTO} from '../model/BookingsDTO';
import {BookingEntryDTO} from '../model/BookingEntryDTO';

registerLocaleData(localeDe);

const entry = (amount: number) => ({amount} as BookingEntryDTO);

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;
  let data: BookingsDTO;

  beforeEach(async () => {
    data = {
      bookingsPerMonth: [
        {year: 2026, month: 3, usualBookings: [entry(100.1), entry(50)], dailyCosts: [entry(0.2)], incomes: [entry(120)]},
        {year: 2026, month: 4, usualBookings: [], dailyCosts: [], incomes: [entry(10)]}
      ]
    };

    await TestBed.configureTestingModule({
      imports: [BookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bookings', data);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('summarises expenses, income and difference per month', () => {
    const [march, april] = component.summaries();
    expect(march).toMatchObject({label: 'März 2026', expenses: 150.3, income: 120, difference: -30.3});
    expect(april).toMatchObject({label: 'April 2026', expenses: 0, income: 10, difference: 10});
  });

  it('renders one panel per month with a negative accent for deficits', () => {
    const panels = fixture.nativeElement.querySelectorAll('details.ui-panel') as NodeListOf<HTMLElement>;
    expect(panels.length).toBe(2);
    expect(panels[0].classList).toContain('ui-panel--rose');
    expect(panels[1].classList).toContain('ui-panel--green');
  });

  it('removes a booking without mutating the input', () => {
    const march = data.bookingsPerMonth[0];
    const removed = march.usualBookings[0];
    component.onItemRemoved({booking: removed, category: 'usualBookings'}, component.summaries()[0].month);

    expect(component.summaries()[0].expenses).toBe(50.2);
    expect(component.summaries()[0].month.usualBookings).not.toContain(removed);
    expect(march.usualBookings).toContain(removed);
  });
});
