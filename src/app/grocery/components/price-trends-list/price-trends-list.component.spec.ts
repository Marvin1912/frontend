import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient} from '@angular/common/http';
import {provideRouter} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localeDe from '@angular/common/locales/de';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

import {PriceTrendsListComponent} from './price-trends-list.component';
import {environment} from '../../../../environments/environment';
import {ProductPriceSummary} from '../../models/price-trend.model';

registerLocaleData(localeDe);

describe('PriceTrendsListComponent', () => {
  let component: PriceTrendsListComponent;
  let fixture: ComponentFixture<PriceTrendsListComponent>;
  let httpMock: HttpTestingController;

  const summaries: ProductPriceSummary[] = [
    {name: 'Milch', firstPrice: 1.19, latestPrice: 1.39, percentChange: 16.8, history: [1.19, 1.29, 1.39]}
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceTrendsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PriceTrendsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products`).flush([]);
    expect(component).toBeTruthy();
  });

  it('should load product price summaries and stop loading', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products`).flush(summaries);

    expect(component.loading).toBeFalse();
    expect(component.products.data.length).toBe(1);
    expect(component.products.data[0].name).toBe('Milch');
    expect(component.hasProducts).toBeTrue();
  });

  it('should report no products for an empty summary list', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/products`).flush([]);

    expect(component.hasProducts).toBeFalse();
  });
});
