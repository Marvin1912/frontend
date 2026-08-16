import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {CurrencyPipe, DatePipe, DecimalPipe} from '@angular/common';
import {Router} from '@angular/router';
import {MatBottomSheet} from '@angular/material/bottom-sheet';
import {catchError, forkJoin, of} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {Receipt} from '../../models/receipt.model';
import {ProductPriceSummary} from '../../models/price-trend.model';
import {PriceTrendDetailComponent} from '../price-trend-detail/price-trend-detail.component';

const RECENT_RECEIPTS_LIMIT = 3;
const PRICE_HIGHLIGHTS_LIMIT = 4;

function receiptDate(receipt: Receipt): Date {
  return new Date(receipt.receiptDate ?? receipt.creationDate);
}

function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const isoWeekday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - isoWeekday);
  return result;
}

interface PriceHighlight extends ProductPriceSummary {
  up: boolean;
}

@Component({
  selector: 'app-grocery-home',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './grocery-home.component.html',
  styleUrl: './grocery-home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroceryHomeComponent implements OnInit {

  loading = true;

  greeting = this.buildGreeting();
  weekTotal = 0;
  weekDeltaPercent: number | null = null;
  weekDeltaUp = false;

  recentReceipts: Receipt[] = [];
  priceHighlights: PriceHighlight[] = [];

  private receiptService = inject(ReceiptService);
  private router = inject(Router);
  private bottomSheet = inject(MatBottomSheet);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    forkJoin({
      receipts: this.receiptService.getReceipts().pipe(catchError(() => of([] as Receipt[]))),
      priceSummaries: this.receiptService.getArticleGroupPriceSummaries()
        .pipe(catchError(() => of([] as ProductPriceSummary[])))
    }).subscribe(({receipts, priceSummaries}) => {
      this.applyReceipts(receipts);
      this.priceHighlights = [...priceSummaries]
        .sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))
        .slice(0, PRICE_HIGHLIGHTS_LIMIT)
        .map(summary => ({...summary, up: summary.percentChange > 0}));
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  navigateToReceipt(receipt: Receipt): void {
    void this.router.navigate(['/grocery/receipts', receipt.id, 'items']);
  }

  openPriceTrend(summary: ProductPriceSummary): void {
    this.bottomSheet.open(PriceTrendDetailComponent, {
      panelClass: 'grocery-bottom-sheet-panel',
      data: {groupId: summary.groupId, displayName: summary.groupName}
    });
  }

  private applyReceipts(receipts: Receipt[]): void {
    const sorted = [...receipts].sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime());
    this.recentReceipts = sorted.slice(0, RECENT_RECEIPTS_LIMIT);

    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;
    for (const receipt of receipts) {
      if (receipt.totalAmount === null) continue;
      const date = receiptDate(receipt);
      if (date >= thisWeekStart) {
        thisWeekTotal += receipt.totalAmount;
      } else if (date >= lastWeekStart) {
        lastWeekTotal += receipt.totalAmount;
      }
    }

    this.weekTotal = thisWeekTotal;
    this.weekDeltaPercent = lastWeekTotal > 0
      ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100
      : null;
    this.weekDeltaUp = (this.weekDeltaPercent ?? 0) > 0;
  }

  private buildGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  }
}
