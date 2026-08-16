import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {ChartConfiguration} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {ProductPriceSummary} from '../../models/price-trend.model';
import {PriceTrendDetailComponent} from '../price-trend-detail/price-trend-detail.component';

const PRICE_UP_COLOR = '#e8a33d';
const PRICE_DOWN_COLOR = '#2e7d32';
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
  imports: [CurrencyPipe, DecimalPipe, MatProgressSpinner, BaseChartDirective, RouterLink],
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
    this.bottomSheet.open(PriceTrendDetailComponent, {
      data: {groupId: product.groupId, displayName: product.groupName}
    });
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
    const start = window.performance.now();

    const step = (now: number): void => {
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
