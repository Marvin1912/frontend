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
    {date: '2026-01-01', singlePrice: 1.19, supermarket: 'REWE', articleName: 'Milch 1,5%'},
    {date: '2026-02-01', singlePrice: 1.39, supermarket: 'EDEKA', articleName: 'Milch 1,5% Bio'}
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
          useValue: {snapshot: {paramMap: convertToParamMap({groupId: '4'})}}
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
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush([]);
    expect(component).toBeTruthy();
  });

  it('should load price history for the routed product name', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.loading).toBeFalse();
    expect(component.priceHistory.length).toBe(2);
    expect(component.hasHistory).toBeTrue();
  });

  it('should report no history for a product without price data', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush([]);

    expect(component.hasHistory).toBeFalse();
  });

  it('should build a chart series per supermarket', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.chartData.datasets.length).toBe(2);
    expect(component.chartData.datasets.map(d => d.label)).toEqual(['REWE', 'EDEKA']);
  });

  it('should compute the cheapest current price per supermarket, sorted ascending', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.latestBySupermarket.map(r => r.supermarket)).toEqual(['REWE', 'EDEKA']);
    expect(component.latestBySupermarket[0].articleName).toBe('Milch 1,5%');
  });

  it('should still plot points that have no supermarket field', () => {
    const historyWithoutSupermarket: PriceHistoryPoint[] = [
      {date: '2026-01-01', singlePrice: 1.19, articleName: 'Milch 1,5%'}
    ];
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(historyWithoutSupermarket);

    expect(component.chartData.datasets[0].data).toEqual([1.19]);
    expect(component.latestBySupermarket[0].price).toBe(1.19);
  });
});
