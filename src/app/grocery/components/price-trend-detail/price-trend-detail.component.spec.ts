import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';

import {PriceTrendDetailComponent} from './price-trend-detail.component';
import {environment} from '../../../../environments/environment';
import {PriceHistoryPoint} from '../../models/price-trend.model';

describe('PriceTrendDetailComponent', () => {
  let component: PriceTrendDetailComponent;
  let fixture: ComponentFixture<PriceTrendDetailComponent>;
  let httpMock: HttpTestingController;

  const history: PriceHistoryPoint[] = [
    {date: '2026-01-01', singlePrice: 1.19, supermarket: 'REWE', articleName: 'Milch 1,5%', articleId: 1},
    {date: '2026-02-01', singlePrice: 1.39, supermarket: 'EDEKA', articleName: 'Milch 1,5% Bio', articleId: 2}
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceTrendDetailComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideCharts(withDefaultRegisterables()),
        {provide: MAT_BOTTOM_SHEET_DATA, useValue: {groupId: 4, displayName: 'Milch'}},
        {provide: MatBottomSheetRef, useValue: {dismiss: vi.fn()}}
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

  it('should load price history for the given article group', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.loading).toBe(false);
    expect(component.priceHistory.length).toBe(2);
    expect(component.hasHistory).toBe(true);
  });

  it('should report no history for a product without price data', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush([]);

    expect(component.hasHistory).toBe(false);
  });

  it('should build a chart series per supermarket', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.chartData.datasets.length).toBe(2);
    expect(component.chartData.datasets.map(d => d.label)).toEqual(['REWE', 'EDEKA']);
  });

  it('should compute the cheapest current price per supermarket, sorted ascending', () => {
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(history);

    expect(component.latestBySupermarket.map(r => r.supermarket)).toEqual(['REWE', 'EDEKA']);
    expect(component.latestBySupermarket.map(r => r.price)).toEqual([1.19, 1.39]);
  });

  it('should still plot points that have no supermarket field', () => {
    const historyWithoutSupermarket: PriceHistoryPoint[] = [
      {date: '2026-01-01', singlePrice: 1.19, articleName: 'Milch 1,5%', articleId: 1}
    ];
    httpMock.expectOne(`${environment.apiUrl}/receipts/groups/4/history`).flush(historyWithoutSupermarket);

    expect(component.chartData.datasets[0].data).toEqual([1.19]);
    expect(component.latestBySupermarket[0].price).toBe(1.19);
  });
});
