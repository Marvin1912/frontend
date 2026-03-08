import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {BookingsDTO} from './model/BookingsDTO';
import {BookingsComponent} from './bookings/bookings.component';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {environment} from '../../environments/environment';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  standalone: true,
  imports: [
    BookingsComponent,
    MatButtonModule,
    MatIconModule,
    MatTooltip,
    RouterLink,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./backend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackendComponent {

  uploadedFile?: File;
  responseData?: BookingsDTO;
  isLoading = false;
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  uploadFile(): void {
    if (!this.uploadedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadedFile);

    this.isLoading = true;
    this.cdr.markForCheck();

    this.http.post<BookingsDTO>(`${environment.apiUrl}/camt-entries`, formData).subscribe({
      next: (response: BookingsDTO) => {
        this.responseData = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Error uploading file.');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  backupCostData(): void {
    this.http.post(`${environment.apiUrl}/export/costs`, '').subscribe({
      next: () => {
        console.log('Cost export and upload successful!');
      },
      error: (error) => {
        console.error('Export error:', error);
        alert('Error exporting and uploading costs.');
      }
    })
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.uploadedFile = target.files?.[0];
    this.cdr.markForCheck();
  }
}
