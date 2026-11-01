import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController} from '@angular/common/http/testing';
import {ActivatedRoute, convertToParamMap, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {of} from 'rxjs';

import {ReceiptItemsComponent} from './receipt-items.component';
import {environment} from '../../../../environments/environment';

registerLocaleData(localeDe);

describe('ReceiptItemsComponent', () => {
  let component: ReceiptItemsComponent;
  let fixture: ComponentFixture<ReceiptItemsComponent>;
  let httpMock: HttpTestingController;
  let dialogResult: string | undefined;

  beforeEach(async () => {
    dialogResult = undefined;
    await TestBed.configureTestingModule({
      imports: [ReceiptItemsComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: convertToParamMap({id: 'abc'})}}},
        {provide: MatDialog, useValue: {open: vi.fn(() => ({afterClosed: () => of(dialogResult)}))}}
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReceiptItemsComponent);
    component = fixture.componentInstance;
    httpMock.expectOne(`${environment.apiUrl}/receipts`).flush([
      {id: 'abc', receiptDate: '2026-08-21', totalAmount: 1.19, creationDate: '2026-11-01T11:47:48', supermarket: 'LIDL'}
    ]);
    httpMock.expectOne(`${environment.apiUrl}/receipts/abc/items`)
      .flush([{id: '1', name: 'Milch', singlePrice: 1.19, quantity: 1, price: 1.19}]);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('shows a visible delete button for the receipt', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-label="Bon löschen"]');
    expect(button).toBeTruthy();
    expect(button.disabled).toBe(false);
  });

  it('deletes the receipt after confirmation and returns to the list', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    dialogResult = 'confirmed';

    component.deleteReceipt();

    const req = httpMock.expectOne(`${environment.apiUrl}/receipts/abc`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(navigate).toHaveBeenCalledWith(['/grocery/receipts']);
  });

  it('keeps the receipt when the dialog is cancelled', () => {
    component.deleteReceipt();

    httpMock.expectNone(`${environment.apiUrl}/receipts/abc`);
  });
});
