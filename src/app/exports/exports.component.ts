import {Component, inject} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ExportService} from './services/export.service';

@Component({
  selector: 'app-exports',
  imports: [
    RouterModule,
    MatIconModule,
  ],
  templateUrl: './exports.component.html',
  styleUrl: './exports.component.css'
})
export class ExportsComponent {

  private exportService = inject(ExportService);
  private snackBar = inject(MatSnackBar);

  syncAnki() {
    this.exportService.syncAnki().subscribe({
      next: (res) => {
        if (res && 'ok' === res.status) {
          this.snackBar.open('Anki synchronisiert', 'OK', {duration: 3000});
        } else {
          this.snackBar.open('Synchronisierung fehlgeschlagen', 'OK', {duration: 3000});
        }
      },
      error: (err) => {
        this.snackBar.open('Synchronisierung fehlgeschlagen', err, {duration: 3000});
      }
    });
  }
}
