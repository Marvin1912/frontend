import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {ChartConfiguration, TooltipItem} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {format, parseISO} from 'date-fns';
import {catchError, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {PriceHistoryPoint} from '../../models/price-trend.model';

@Component({
  selector: 'app-price-trend-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatIconButton, MatIcon, MatProgressSpinner, BaseChartDirective],
  templateUrl: './price-trend-detail.component.html',
  styleUrl: './price-trend-detail.component.css'
})
export class PriceTrendDetailComponent implements OnInit {

  loading = true;
  productName = '';
  priceHistory: PriceHistoryPoint[] = [];

  chartData: ChartConfiguration<'line'>['data'] = {labels: [], datasets: []};
  chartOptions: ChartConfiguration<'line'>['options'] = {};

  private route = inject(ActivatedRoute);
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const name = this.route.snapshot.paramMap.get('name') ?? '';
    const navigationState = window.history.state as {displayName?: string} | undefined;
    this.productName = navigationState?.displayName ?? name;

    this.receiptService.getProductPriceHistory(name)
      .pipe(catchError(() => of([] as PriceHistoryPoint[])))
      .subscribe(points => {
        this.priceHistory = points;
        this.buildChart(points);
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  get hasHistory(): boolean {
    return this.priceHistory.length > 0;
  }

  private buildChart(history: PriceHistoryPoint[]): void {
    const labels = history.map(p => format(parseISO(p.date), 'dd.MM.yyyy'));
    const supermarkets = history.map(p => p.supermarket);

    this.chartData = {
      labels,
      datasets: [{
        data: history.map(p => p.price),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.12)',
        fill: true,
        tension: 0.2,
        pointRadius: 3,
        pointBackgroundColor: '#f97316'
      }]
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
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: (item: TooltipItem<'line'>) => {
              const supermarket = supermarkets[item.dataIndex];
              return `${item.formattedValue} € · ${supermarket}`;
            }
          }
        }
      }
    };
  }
}
