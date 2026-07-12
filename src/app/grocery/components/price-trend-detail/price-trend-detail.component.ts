import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ChartConfiguration, TooltipItem} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {format, parseISO} from 'date-fns';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {PriceHistoryPoint} from '../../models/price-trend.model';

const SUPERMARKET_COLORS: Record<string, string> = {
  REWE: '#f97316',
  EDEKA: '#4da6ff',
  LIDL: '#2dd4bf'
};
const FALLBACK_COLOR = '#c8d4e8';

function colorForSupermarket(supermarket: string): string {
  return SUPERMARKET_COLORS[supermarket] ?? FALLBACK_COLOR;
}

interface SupermarketLatestPrice {
  supermarket: string;
  price: number;
  articleName: string;
  date: string;
}

@Component({
  selector: 'app-price-trend-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconButton, MatIcon, MatProgressSpinner, BaseChartDirective, CurrencyPipe],
  templateUrl: './price-trend-detail.component.html',
  styleUrl: './price-trend-detail.component.css'
})
export class PriceTrendDetailComponent implements OnInit {

  loading = true;
  productName = '';
  priceHistory: PriceHistoryPoint[] = [];
  latestBySupermarket: SupermarketLatestPrice[] = [];

  chartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};
  chartOptions: ChartConfiguration<'line'>['options'] = {};

  private route = inject(ActivatedRoute);
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('groupId') ?? '';
    const navigationState = window.history.state as {displayName?: string} | undefined;
    this.productName = navigationState?.displayName ?? groupId;

    this.receiptService.getArticleGroupPriceHistory(groupId)
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

  colorFor(supermarket: string): string {
    return colorForSupermarket(supermarket);
  }

  private buildChart(history: PriceHistoryPoint[]): void {
    const labels = history.map(p => format(parseISO(p.date), 'dd.MM.yyyy'));
    const supermarkets = Array.from(new Set(history.map(p => p.supermarket)));

    this.chartData = {
      labels,
      datasets: supermarkets.map(supermarket => ({
        label: supermarket,
        data: history.map(p => p.supermarket === supermarket ? p.price : null),
        borderColor: colorForSupermarket(supermarket),
        backgroundColor: colorForSupermarket(supermarket),
        fill: false,
        tension: 0.2,
        spanGaps: false,
        pointRadius: 4,
        pointBackgroundColor: colorForSupermarket(supermarket)
      }))
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {color: '#7a93b0', font: {family: 'JetBrains Mono', size: 10}},
          grid: {color: 'rgba(255, 255, 255, 0.07)'}
        },
        y: {
          ticks: {color: '#7a93b0', font: {family: 'JetBrains Mono', size: 10}},
          grid: {color: 'rgba(255, 255, 255, 0.07)'}
        }
      },
      plugins: {
        legend: {
          display: supermarkets.length > 1,
          labels: {color: '#7a93b0', font: {family: 'JetBrains Mono', size: 10}}
        },
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<'line'>) => {
              const point = history[item.dataIndex];
              return `${item.formattedValue} € · ${point.supermarket} · ${point.articleName}`;
            }
          }
        }
      }
    };
  }

  private buildLatestBySupermarket(history: PriceHistoryPoint[]): SupermarketLatestPrice[] {
    const latest = new Map<string, PriceHistoryPoint>();
    for (const point of history) {
      const current = latest.get(point.supermarket);
      if (!current || point.date > current.date) {
        latest.set(point.supermarket, point);
      }
    }

    return Array.from(latest.values())
      .map(p => ({
        supermarket: p.supermarket,
        price: p.price,
        articleName: p.articleName,
        date: format(parseISO(p.date), 'dd.MM.yyyy')
      }))
      .sort((a, b) => a.price - b.price);
  }
}
