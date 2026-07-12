import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ChartConfiguration} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {ProductPriceSummary} from '../../models/price-trend.model';

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
}

@Component({
  selector: 'app-price-trends-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCellDef,
    MatCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    CurrencyPipe,
    DecimalPipe,
    MatProgressSpinner,
    BaseChartDirective,
    RouterLink
  ],
  templateUrl: './price-trends-list.component.html',
  styleUrl: './price-trends-list.component.css'
})
export class PriceTrendsListComponent implements OnInit {

  readonly sparklineOptions = SPARKLINE_OPTIONS;

  loading = true;
  products = new MatTableDataSource<PriceTrendRow>();
  columnsToDisplay = ['groupName', 'firstPrice', 'latestPrice', 'percentChange', 'sparkline'];

  private receiptService = inject(ReceiptService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.receiptService.getArticleGroupPriceSummaries()
      .pipe(catchError(() => of([] as ProductPriceSummary[])))
      .subscribe(summaries => {
        this.products.data = summaries.map(summary => ({
          ...summary,
          sparklineData: this.buildSparklineData(summary)
        }));
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get hasProducts(): boolean {
    return this.products.data.length > 0;
  }

  navigateToDetail(product: ProductPriceSummary): void {
    void this.router.navigate(['/grocery/price-trends', product.groupId], {
      state: {displayName: product.groupName}
    });
  }

  private buildSparklineData(summary: ProductPriceSummary): ChartConfiguration<'line'>['data'] {
    const up = summary.percentChange > 0;
    const color = up ? '#fb7185' : '#2dd4bf';
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
}
