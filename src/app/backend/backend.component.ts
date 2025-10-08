import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BookingsDTO} from './model/BookingsDTO';
import {BookingsComponent} from './bookings/bookings.component';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  standalone: true,
  imports: [
    BookingsComponent
  ],
  styleUrls: ['./backend.component.css']
})
export class BackendComponent {

  uploadedFile?: File;
  responseData?: BookingsDTO;

  constructor(private http: HttpClient) {
  }

  uploadFile(): void {
    if (!this.uploadedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadedFile);

    this.http.post<BookingsDTO>(`${environment.apiUrl}/camt-entries`, formData).subscribe({
      next: (response: BookingsDTO) => {
        this.responseData = response;
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Error uploading file.');
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

  onFileSelected(event: any): void {
    this.uploadedFile = event.target.files[0];
  }
}
