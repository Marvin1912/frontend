import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ChartConfiguration} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {ProductPriceSummary} from '../../models/price-trend.model';
import {openPriceTrendDetail} from '../price-trend-detail/price-trend-detail.component';

/* ui-badge--amber / --green */
const PRICE_UP_COLOR = '#fbbf24';
const PRICE_DOWN_COLOR = '#22d35e';
const BADGE_ANIMATION_MS = 600;

const SPARKLINE_OPTIONS: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  elements: {
    point: {radius: 0},
    line: {borderWidth: 2, tension: 0.2}
  },
  scales: {
    x: {display: false},
    y: {display: false}
  },
  plugins: {
    legend: {display: false},
    tooltip: {enabled: false}
  }
};

interface PriceTrendRow extends ProductPriceSummary {
  sparklineData: ChartConfiguration<'line'>['data'];
  up: boolean;
  displayPercent: number;
}

@Component({
  selector: 'app-price-trends-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DecimalPipe, MatIcon, MatProgressSpinner, BaseChartDirective, RouterLink],
  templateUrl: './price-trends-list.component.html',
  styleUrl: './price-trends-list.component.css'
})
export class PriceTrendsListComponent implements OnInit {

  readonly sparklineOptions = SPARKLINE_OPTIONS;

  loading = true;
  products: PriceTrendRow[] = [];

  private receiptService = inject(ReceiptService);
  private bottomSheet = inject(MatBottomSheet);
  private cdr = inject(ChangeDetectorRef);
  private destroyed = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.destroyed = true; });
  }

  ngOnInit(): void {
    this.receiptService.getArticleGroupPriceSummaries()
      .pipe(catchError(() => of([] as ProductPriceSummary[])))
      .subscribe(summaries => {
        this.products = summaries.map(summary => ({
          ...summary,
          sparklineData: this.buildSparklineData(summary),
          up: summary.percentChange > 0,
          displayPercent: 0
        }));
        this.loading = false;
        this.cdr.markForCheck();
        this.animateBadges();
      });
  }

  get hasProducts(): boolean {
    return this.products.length > 0;
  }

  openDetail(product: ProductPriceSummary): void {
    openPriceTrendDetail(this.bottomSheet, product);
  }

  private buildSparklineData(summary: ProductPriceSummary): ChartConfiguration<'line'>['data'] {
    const color = summary.percentChange > 0 ? PRICE_UP_COLOR : PRICE_DOWN_COLOR;
    return {
      labels: summary.sparklinePrices.map((_, i) => `${i}`),
      datasets: [{
        data: summary.sparklinePrices,
        borderColor: color,
        backgroundColor: color,
        fill: false
      }]
    };
  }

  private animateBadges(): void {
    const targets = this.products.map(p => Math.abs(p.percentChange));
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.products.forEach((product, i) => { product.displayPercent = targets[i]; });
      return;
    }
    const start = window.performance.now();

    const step = (now: number): void => {
      if (this.destroyed) return;
      const progress = Math.min(1, (now - start) / BADGE_ANIMATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      this.products.forEach((product, i) => { product.displayPercent = targets[i] * eased; });
      this.cdr.markForCheck();
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}
