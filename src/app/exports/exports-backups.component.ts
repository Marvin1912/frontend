import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BackupRunService } from './services/backup/backup-run.service';
import { BackupRun } from './services/backup/backup-run.model';

@Component({
  selector: 'app-exports-backups',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './exports-backups.component.html',
  styleUrl: './exports-backups.component.css'
})
export class ExportsBackupsComponent implements OnInit {
  backupRuns: BackupRun[] = [];
  isLoading = true;
  error: string | null = null;
  displayedColumns: string[] = ['fileName', 'status', 'startedAt', 'finishedAt', 'durationMs', 'uploadSuccess'];
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  constructor(
    private backupRunService: BackupRunService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBackupRuns();
  }

  loadBackupRuns(): void {
    this.isLoading = true;
    this.error = null;

    this.backupRunService.getBackupRuns(this.pageSize, this.pageIndex * this.pageSize).subscribe({
      next: (page) => {
        this.backupRuns = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load backup runs: ' + err.message;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadBackupRuns();
  }

  formatDuration(ms: number | null): string {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  }

  formatDateTime(dt: string | null): string {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('de-DE');
  }
}
