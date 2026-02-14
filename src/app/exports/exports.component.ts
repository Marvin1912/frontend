import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {ExportService} from "./services/export.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './exports.component.html',
  styleUrl: './exports.component.css'
})
export class ExportsComponent {

  constructor(
      private exportService: ExportService,
      private snackBar: MatSnackBar
  ) {
  }

  syncAnki() {
    this.exportService.syncAnki().subscribe({
      next: (res) => {
        if (res && "ok" === res.status) {
          this.snackBar.open('Anki synchronisiert', 'OK', {duration: 3000});
        } else {
          this.snackBar.open('Synchronisierung fehlgeschlagen', 'OK', {duration: 3000});
        }
      },
      error: (err) => {
        this.snackBar.open('Synchronisierung fehlgeschlagen', err, {duration: 3000});
      }
    })
  }

}
