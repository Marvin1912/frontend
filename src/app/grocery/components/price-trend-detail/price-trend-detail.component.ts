import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {ChartConfiguration, TooltipItem} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {format, parseISO} from 'date-fns';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {PriceHistoryPoint, ProductPriceSummary} from '../../models/price-trend.model';
import {findSupermarket, UNKNOWN_SUPERMARKET_COLOR} from '../../models/supermarket';

const UNKNOWN_SUPERMARKET = 'Unbekannt';

const AXIS_COLOR = '#3d5470';
const GRID_COLOR = 'rgba(255, 255, 255, 0.07)';
const TICK_FONT = {family: 'Outfit, sans-serif', size: 10};

function colorForSupermarket(supermarket: string): string {
  return findSupermarket(supermarket)?.color ?? UNKNOWN_SUPERMARKET_COLOR;
}

function labelForSupermarket(supermarket: string): string {
  return findSupermarket(supermarket)?.label ?? supermarket;
}

export interface PriceTrendDetailData {
  groupId: number;
  displayName: string;
}

interface SupermarketLatestPrice {
  supermarket: string;
  label: string;
  color: string;
  price: number;
}

/** Opens the price history of an article group as a dark bottom sheet. */
export function openPriceTrendDetail(bottomSheet: MatBottomSheet, summary: ProductPriceSummary): void {
  bottomSheet.open<PriceTrendDetailComponent, PriceTrendDetailData>(PriceTrendDetailComponent, {
    panelClass: ['ui-sheet-pane', 'grocery-scope'],
    data: {groupId: summary.groupId, displayName: summary.groupName}
  });
}

@Component({
  selector: 'app-price-trend-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatProgressSpinner, BaseChartDirective, CurrencyPipe],
  templateUrl: './price-trend-detail.component.html',
  styleUrl: './price-trend-detail.component.css'
})
export class PriceTrendDetailComponent implements OnInit {

  readonly data = inject<PriceTrendDetailData>(MAT_BOTTOM_SHEET_DATA);

  loading = true;
  expanded = false;
  priceHistory: PriceHistoryPoint[] = [];
  latestBySupermarket: SupermarketLatestPrice[] = [];

  chartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};
  chartOptions: ChartConfiguration<'line'>['options'] = {};

  private sheetRef = inject(MatBottomSheetRef<PriceTrendDetailComponent>);
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.receiptService.getArticleGroupPriceHistory(`${this.data.groupId}`)
      .pipe(catchError(() => of([] as PriceHistoryPoint[])))
      .subscribe(points => {
        this.priceHistory = points;
        this.buildChart(points);
        this.latestBySupermarket = this.buildLatestBySupermarket(points);
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get hasHistory(): boolean {
    return this.priceHistory.length > 0;
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  close(): void {
    this.sheetRef.dismiss();
  }

  private buildChart(history: PriceHistoryPoint[]): void {
    const labels = history.map(p => format(parseISO(p.date), 'dd.MM.yyyy'));
    const supermarkets = Array.from(new Set(history.map(p => p.supermarket ?? UNKNOWN_SUPERMARKET)));

    this.chartData = {
      labels,
      datasets: supermarkets.map(supermarket => ({
        label: labelForSupermarket(supermarket),
        data: history.map(p => (p.supermarket ?? UNKNOWN_SUPERMARKET) === supermarket ? p.singlePrice : null),
        borderColor: colorForSupermarket(supermarket),
        backgroundColor: colorForSupermarket(supermarket),
        fill: false,
        tension: 0.2,
        spanGaps: true,
        pointRadius: 4,
        pointBackgroundColor: colorForSupermarket(supermarket)
      }))
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {color: AXIS_COLOR, font: TICK_FONT},
          grid: {color: GRID_COLOR},
          border: {color: GRID_COLOR}
        },
        y: {
          ticks: {color: AXIS_COLOR, font: TICK_FONT},
          grid: {color: GRID_COLOR},
          border: {color: GRID_COLOR}
        }
      },
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<'line'>) => {
              const point = history[item.dataIndex];
              return `${item.formattedValue} € · ${labelForSupermarket(point.supermarket ?? UNKNOWN_SUPERMARKET)} · ${point.articleName}`;
            }
          }
        }
      }
    };
  }

  private buildLatestBySupermarket(history: PriceHistoryPoint[]): SupermarketLatestPrice[] {
    const latest = new Map<string, PriceHistoryPoint>();
    for (const point of history) {
      const supermarket = point.supermarket ?? UNKNOWN_SUPERMARKET;
      const current = latest.get(supermarket);
      if (!current || point.date > current.date) {
        latest.set(supermarket, point);
      }
    }

    return Array.from(latest.entries())
      .map(([supermarket, p]) => ({
        supermarket,
        label: labelForSupermarket(supermarket),
        color: colorForSupermarket(supermarket),
        price: p.singlePrice
      }))
      .sort((a, b) => a.price - b.price);
  }
}
