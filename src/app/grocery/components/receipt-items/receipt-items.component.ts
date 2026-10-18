import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {CurrencyPipe, DatePipe, DecimalPipe} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {forkJoin} from 'rxjs';
import {Receipt, ReceiptItem, Supermarket} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';
import {ReceiptItemEditDialogComponent} from '../../dialogs/receipt-item-edit-dialog/receipt-item-edit-dialog.component';
import {ReceiptItemAddDialogComponent} from '../../dialogs/receipt-item-add-dialog/receipt-item-add-dialog.component';
import {SupermarketSelectDialogComponent, SupermarketSelectDialogData} from '../../dialogs/supermarket-select-dialog/supermarket-select-dialog.component';
import {groceryDialogConfig} from '../../dialogs/dialog-config';
import {findSupermarket, SupermarketOption} from '../../models/supermarket';
import {SwipeRevealDirective} from '../../directives/swipe-reveal.directive';

@Component({
  selector: 'app-receipt-items',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, MatIcon, MatProgressSpinner, SwipeRevealDirective],
  templateUrl: './receipt-items.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './receipt-items.component.css'
})
export class ReceiptItemsComponent {

  receiptId = '';
  receipt: Receipt | null = null;
  items: ReceiptItem[] = [];
  loading = true;
  loadFailed = false;

  private receiptService = inject(ReceiptService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.receiptId = this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      receipt: this.receiptService.getReceipt(this.receiptId),
      items: this.receiptService.getReceiptItems(this.receiptId)
    }).subscribe({
      next: ({receipt, items}) => {
        this.receipt = receipt ?? null;
        this.items = items;
        this.loading = false;
      },
      error: () => {
        this.loadFailed = true;
        this.loading = false;
      }
    });
  }

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  supermarket(): SupermarketOption | undefined {
    return findSupermarket(this.receipt?.supermarket);
  }

  changeSupermarket(): void {
    if (!this.receipt) return;
    const ref = this.dialog.open<SupermarketSelectDialogComponent, SupermarketSelectDialogData, Supermarket>(
      SupermarketSelectDialogComponent, groceryDialogConfig({supermarket: this.receipt.supermarket}));
    ref.afterClosed().subscribe((supermarket: Supermarket | undefined) => {
      if (!supermarket || !this.receipt) return;
      this.receiptService.updateSupermarket(this.receiptId, supermarket).subscribe({
        next: updated => { this.receipt = updated; },
        error: () => {
          this.snackBar.open('Supermarkt konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }

  openEditDialog(item: ReceiptItem, swipe: SwipeRevealDirective): void {
    swipe.close();
    const ref = this.dialog.open(ReceiptItemEditDialogComponent, groceryDialogConfig(item));
    ref.afterClosed().subscribe((result: ReceiptItem | undefined) => {
      if (!result) return;
      this.receiptService.updateReceiptItem(this.receiptId, result).subscribe({
        next: updated => {
          this.items = this.items.map(i => i.id === updated.id ? updated : i);
        },
        error: () => {
          this.snackBar.open('Artikel konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(ReceiptItemAddDialogComponent, groceryDialogConfig());
    ref.afterClosed().subscribe((result: {name: string; quantity: number; singlePrice: number} | undefined) => {
      if (!result) return;
      this.receiptService.addReceiptItem(this.receiptId, result).subscribe({
        next: created => {
          this.items = [...this.items, created];
        },
        error: () => {
          this.snackBar.open('Artikel konnte nicht hinzugefügt werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }
}
