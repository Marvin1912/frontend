import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

import {PriceTrendDetailComponent} from './price-trend-detail.component';
import {environment} from '../../../../environments/environment';
import {PriceHistoryPoint} from '../../models/price-trend.model';

describe('PriceTrendDetailComponent', () => {
  let component: PriceTrendDetailComponent;
  let fixture: ComponentFixture<PriceTrendDetailComponent>;
  let httpMock: HttpTestingController;

  const history: PriceHistoryPoint[] = [
    {date: '2026-01-01', price: 1.19, supermarket: 'REWE'},
    {date: '2026-02-01', price: 1.39, supermarket: 'EDEKA'}
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceTrendDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {paramMap: convertToParamMap({name: 'Milch'})}}
        }
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PriceTrendDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products/history?name=Milch`).flush([]);
    expect(component).toBeTruthy();
  });

  it('should load price history for the routed product name', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products/history?name=Milch`).flush(history);

    expect(component.loading).toBeFalse();
    expect(component.priceHistory.length).toBe(2);
    expect(component.hasHistory).toBeTrue();
  });

  it('should report no history for a product without price data', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products/history?name=Milch`).flush([]);

    expect(component.hasHistory).toBeFalse();
  });
});
