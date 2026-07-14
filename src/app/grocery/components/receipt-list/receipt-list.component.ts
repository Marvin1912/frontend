import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
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
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {Receipt, Supermarket} from '../../models/receipt.model';
import {ReceiptService} from '../../services/receipt.service';
import {ReceiptDeleteDialogComponent} from '../../dialogs/receipt-delete-dialog/receipt-delete-dialog.component';
import {SupermarketSelectDialogComponent} from '../../dialogs/supermarket-select-dialog/supermarket-select-dialog.component';

@Component({
  selector: 'app-receipt-list',
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
    DatePipe,
    CurrencyPipe,
    MatIconButton,
    MatIcon,
    MatSortModule
  ],
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.css'
})
export class ReceiptListComponent implements OnInit {

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this.receipts.sort = sort;
  }

  receipts = new MatTableDataSource<Receipt>();
  columnsToDisplay = ['receiptDate', 'creationDate', 'totalAmount', 'supermarket', 'actions'];

  private readonly supermarketLabels: Record<Supermarket, string> = {
    LIDL: 'Lidl',
    EDEKA: 'Edeka',
    REWE: 'Rewe'
  };

  constructor(
    private receiptService: ReceiptService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.receipts.sortingDataAccessor = (receipt, column) => {
      if (column === 'receiptDate') {
        return new Date(receipt.receiptDate ?? receipt.creationDate).getTime();
      }
      return '';
    };
  }

  ngOnInit(): void {
    this.receiptService.getReceipts().subscribe(receipts => {
      this.receipts.data = receipts;
      this.cdr.markForCheck();
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
          this.receipts.data = this.receipts.data.map(r => r.id === receipt.id ? updated : r);
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open('Supermarkt konnte nicht gespeichert werden', 'Schließen', {duration: 5000});
        }
      });
    });
  }

  openDeleteDialog(event: MouseEvent, receipt: Receipt): void {
    event.stopPropagation();
    const ref = this.dialog.open(ReceiptDeleteDialogComponent);
    ref.afterClosed().subscribe(result => {
      if (result === 'confirmed') {
        this.receiptService.deleteReceipt(receipt.id).subscribe({
          next: () => {
            this.receipts.data = this.receipts.data.filter(r => r.id !== receipt.id);
            this.cdr.markForCheck();
          },
          error: (err) => {
            const msg = err.status === 404 ? 'Bon nicht gefunden' : 'Bon konnte nicht gelöscht werden';
            this.snackBar.open(msg, 'Schließen', {duration: 5000});
          }
        });
      }
    });
  }
}
