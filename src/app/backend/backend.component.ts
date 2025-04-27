import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TableComponent} from '../table/table.component';

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  standalone: true,
  imports: [
    TableComponent
  ],
  styleUrls: ['./backend.component.css']
})
export class BackendComponent {

  private readonly BASE_URL = 'http://192.168.178.29:9001';

  uploadedFile?: File;
  responseData?: any;

  constructor(private http: HttpClient) {
  }

  uploadFile(): void {
    if (!this.uploadedFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.uploadedFile);

    this.http.post(`${this.BASE_URL}/camt-entries`, formData).subscribe({
      next: (response) => {
        console.log('Upload successful:', response);
        this.responseData = response;
      },
      error: (error) => {
        console.error('Upload error:', error);
        alert('Error uploading file.');
      }
    });
  }

  backupCostData(): void {
    this.http.post(`${this.BASE_URL}/export/costs`, '').subscribe({
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
