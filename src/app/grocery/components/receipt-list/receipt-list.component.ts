import {Component, inject} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';
import {Receipt, Supermarket} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';
import {SupermarketSelectDialogComponent} from '../../dialogs/supermarket-select-dialog/supermarket-select-dialog.component';
import {SwipeRevealDirective} from '../../directives/swipe-reveal.directive';

const UNDO_DURATION_MS = 5000;
const PULL_TRIGGER_DISTANCE = 56;
const PULL_MAX_DISTANCE = 80;

function receiptDate(receipt: Receipt): Date {
  return new Date(receipt.receiptDate ?? receipt.creationDate);
}

function sortByDateDesc(receipts: Receipt[]): Receipt[] {
  return [...receipts].sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime());
}

@Component({
  selector: 'app-receipt-list',
  imports: [CurrencyPipe, DatePipe, MatIcon, SwipeRevealDirective],
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.css'
})
export class ReceiptListComponent {

  receipts: Receipt[] = [];
  loading = true;
  refreshing = false;
  pullDistance = 0;

  private readonly supermarketLabels: Record<Supermarket, string> = {
    LIDL: 'Lidl',
    EDEKA: 'Edeka',
    REWE: 'Rewe'
  };

  private pullStartY: number | null = null;

  private receiptService = inject(ReceiptService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.receiptService.getReceipts().subscribe(receipts => {
      this.receipts = sortByDateDesc(receipts);
      this.loading = false;
    });
  }

  navigateToItems(id: string): void {
    void this.router.navigate(['/grocery/receipts', id, 'items']);
  }

  supermarketLabel(supermarket: Supermarket | null): string {
    return supermarket ? this.supermarketLabels[supermarket] : '—';
  }

  openSupermarketDialog(event: MouseEvent, receipt: Receipt): void {
    event.stopPropagation();
    const ref = this.dialog.open(SupermarketSelectDialogComponent, {
      data: {supermarket: receipt.supermarket}
    });
    ref.afterClosed().subscribe((supermarket: Supermarket | undefined) => {
      if (!supermarket) return;
      this.receiptService.updateSupermarket(receipt.id, supermarket).subscribe({
        next: updated => {
          this.receipts = this.receipts.map(r => r.id === updated.id ? updated : r);
        },
        error: () => {
          this.snackBar.open('Supermarkt konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }

  requestDelete(event: MouseEvent, receipt: Receipt, swipe: SwipeRevealDirective): void {
    event.stopPropagation();
    swipe.close();
    this.receipts = this.receipts.filter(r => r.id !== receipt.id);

    let undone = false;
    const ref = this.snackBar.open('Bon gelöscht', 'Rückgängig', {duration: UNDO_DURATION_MS});
    ref.onAction().subscribe(() => {
      undone = true;
      this.receipts = sortByDateDesc([...this.receipts, receipt]);
    });
    ref.afterDismissed().subscribe(() => {
      if (undone) return;
      this.receiptService.deleteReceipt(receipt.id).subscribe({
        error: () => {
          this.snackBar.open('Bon konnte nicht gelöscht werden', 'Schließen', {duration: 5000});
          this.receipts = sortByDateDesc([...this.receipts, receipt]);
        }
      });
    });
  }

  onPullStart(event: PointerEvent, scrollEl: HTMLElement): void {
    this.pullStartY = scrollEl.scrollTop <= 0 ? event.clientY : null;
  }

  onPullMove(event: PointerEvent, scrollEl: HTMLElement): void {
    if (this.pullStartY === null) return;
    const delta = event.clientY - this.pullStartY;
    if (delta <= 0 || scrollEl.scrollTop > 0) {
      this.pullStartY = null;
      this.pullDistance = 0;
      return;
    }
    this.pullDistance = Math.min(PULL_MAX_DISTANCE, delta * 0.5);
  }

  onPullEnd(): void {
    if (this.pullDistance >= PULL_TRIGGER_DISTANCE) {
      this.refresh();
    }
    this.pullStartY = null;
    this.pullDistance = 0;
  }

  private refresh(): void {
    this.refreshing = true;
    this.receiptService.getReceipts().subscribe({
      next: receipts => {
        this.receipts = sortByDateDesc(receipts);
        this.refreshing = false;
      },
      error: () => { this.refreshing = false; }
    });
  }
}
