import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BookingsDTO} from './model/BookingsDTO';
import {BookingsComponent} from './bookings/bookings.component';
import {MatIconModule} from '@angular/material/icon';
import {environment} from '../../environments/environment';
import {MatTooltip} from '@angular/material/tooltip';
import {RouterLink} from '@angular/router';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

type BusyAction = 'upload' | 'import' | 'backup';

interface StatusMessage {
  kind: 'info' | 'danger';
  text: string;
}

@Component({
  selector: 'app-backend',
  templateUrl: './backend.component.html',
  imports: [
    BookingsComponent,
    MatIconModule,
    MatTooltip,
    RouterLink,
    MatProgressSpinnerModule
  ],
  styleUrl: './backend.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {class: 'ui-bg'}
})
export class BackendComponent {

  uploadedFile = signal<File | undefined>(undefined);
  importFile = signal<File | undefined>(undefined);
  responseData = signal<BookingsDTO | undefined>(undefined);
  busy = signal<BusyAction | null>(null);
  status = signal<StatusMessage | null>(null);

  hasBookings = computed(() => (this.responseData()?.bookingsPerMonth?.length ?? 0) > 0);

  private readonly http = inject(HttpClient);

  uploadFile(): void {
    const file = this.uploadedFile();
    if (!file || this.busy()) {
      return;
    }

    // Altes Ergebnis verwerfen, damit es bei einem Fehler nicht als Ergebnis der neuen Datei erscheint
    this.busy.set('upload');
    this.status.set(null);
    this.responseData.set(undefined);

    this.http.post<BookingsDTO>(`${environment.apiUrl}/camt-entries`, this.toFormData(file)).subscribe({
      next: (response: BookingsDTO) => {
        this.responseData.set(response);
        this.busy.set(null);
      },
      error: (error) => {
        console.error('Upload error:', error);
        this.status.set({kind: 'danger', text: 'Die Datei konnte nicht analysiert werden.'});
        this.busy.set(null);
      }
    });
  }

  importAndSaveFile(): void {
    const file = this.importFile();
    if (!file || this.busy()) {
      return;
    }

    this.busy.set('import');
    this.status.set(null);

    this.http.post(`${environment.apiUrl}/camt-entries/import`, this.toFormData(file)).subscribe({
      next: () => {
        this.status.set({kind: 'info', text: `${file.name} wurde zum Import eingereiht.`});
        this.busy.set(null);
      },
      error: (error) => {
        console.error('Import error:', error);
        this.status.set({kind: 'danger', text: 'Die Datei konnte nicht importiert werden.'});
        this.busy.set(null);
      }
    });
  }

  backupCostData(): void {
    if (this.busy()) {
      return;
    }

    this.busy.set('backup');
    this.status.set(null);

    this.http.post(`${environment.apiUrl}/export/costs`, '').subscribe({
      next: () => {
        this.status.set({kind: 'info', text: 'Kosten wurden exportiert und hochgeladen.'});
        this.busy.set(null);
      },
      error: (error) => {
        console.error('Export error:', error);
        this.status.set({kind: 'danger', text: 'Die Kosten konnten nicht exportiert werden.'});
        this.busy.set(null);
      }
    });
  }

  onFileSelected(event: Event): void {
    this.uploadedFile.set((event.target as HTMLInputElement).files?.[0]);
  }

  onImportFileSelected(event: Event): void {
    this.importFile.set((event.target as HTMLInputElement).files?.[0]);
  }

  private toFormData(file: File): FormData {
    const formData = new FormData();
    formData.append('file', file);
    return formData;
  }
}
