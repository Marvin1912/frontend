import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {MatProgressBar} from '@angular/material/progress-bar';
import {switchMap} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {SupermarketSelectDialogComponent} from '../../dialogs/supermarket-select-dialog/supermarket-select-dialog.component';
import {Supermarket} from '../../models/receipt.model';

@Component({
  selector: 'app-receipt-upload',
  imports: [MatProgressBar],
  templateUrl: './receipt-upload.component.html',
  styleUrl: './receipt-upload.component.css'
})
export class ReceiptUploadComponent {

  selectedFile: File | null = null;
  uploading = false;

  constructor(private receiptService: ReceiptService, private router: Router, private dialog: MatDialog) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.receiptService.uploadReceipt(this.selectedFile).pipe(
      switchMap(response => {
        const id = response.headers.get('Location')?.split('/receipts/')[1] ?? '';
        this.uploading = false;
        const ref = this.dialog.open(SupermarketSelectDialogComponent, {disableClose: true});
        return ref.afterClosed().pipe(
          switchMap((supermarket: Supermarket | undefined) => {
            const navigate = (): void => { void this.router.navigate(['/grocery/receipts', id, 'items']); };
            if (supermarket && id) {
              return this.receiptService.updateSupermarket(id, supermarket).pipe(
                switchMap(() => { navigate(); return []; })
              );
            }
            navigate();
            return [];
          })
        );
      })
    ).subscribe({
      error: () => { this.uploading = false; }
    });
  }
}
