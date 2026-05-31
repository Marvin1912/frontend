import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MatProgressBar} from '@angular/material/progress-bar';
import {ReceiptService} from '../../services/receipt.service';

@Component({
  selector: 'app-receipt-upload',
  imports: [MatProgressBar],
  templateUrl: './receipt-upload.component.html',
  styleUrl: './receipt-upload.component.css'
})
export class ReceiptUploadComponent {

  selectedFile: File | null = null;
  uploading = false;

  constructor(private receiptService: ReceiptService, private router: Router) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.receiptService.uploadReceipt(this.selectedFile).subscribe({
      next: (response) => {
        const location = response.headers.get('Location');
        const id = location?.split('/receipts/')[1];
        this.uploading = false;
        if (id) {
          void this.router.navigate(['/grocery/receipts', id, 'items']);
        }
      },
      error: () => {
        this.uploading = false;
      }
    });
  }
}
