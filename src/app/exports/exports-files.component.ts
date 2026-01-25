import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ExportService } from './services/export.service';
import { FileService } from './services/file/file.service';
import { FileDeleteResponse, FileItem, FileItemTime, FileListResponse } from './services/file/file.model';

@Component({
  selector: 'app-exports-files',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './exports-files.component.html',
  styleUrl: './exports-files.component.css'
})
export class ExportsFilesComponent implements OnInit {
  // Files table properties
  files: FileItem[] = [];
  isLoadingFiles = false;
  isExporting = false;
  filesError: string | null = null;
  displayedColumns: string[] = ['name', 'size', 'modifiedTime', 'actions'];

  constructor(
    private fileService: FileService,
    private exportService: ExportService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoadingFiles = true;
    this.filesError = null;

    this.fileService.listFiles().subscribe({
      next: (response: FileListResponse) => {
        this.isLoadingFiles = false;
        if (response.success && response.files) {
          this.files = response.files;
        } else {
          this.filesError = 'Failed to load files: Invalid response format';
        }
      },
      error: (error) => {
        this.isLoadingFiles = false;
        this.filesError = 'Failed to load files: ' + error.message;
        console.error('Error loading files:', error);
      }
    });
  }

  exportVocabulary(): void {
    this.triggerExport(this.exportService.exportVocabulary(), 'Vocabulary');
  }

  exportCosts(): void {
    this.triggerExport(this.exportService.exportCosts(), 'Costs');
  }

  private triggerExport(obs: any, type: string): void {
    this.isExporting = true;
    obs.subscribe({
      next: () => {
        this.isExporting = false;
        this.snackBar.open(`${type} export triggered successfully`, 'Close', { duration: 3000 });
        this.loadFiles();
      },
      error: (error: any) => {
        this.isExporting = false;
        this.snackBar.open(`Failed to trigger ${type} export: ${error.message}`, 'Close', { duration: 5000 });
        console.error(`Error exporting ${type}:`, error);
      }
    });
  }

  // File utility methods
  formatFileSize(bytes?: number): string {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(dateObject?: FileItemTime): string {
    if (!dateObject) return '-';
    return new Date(dateObject.value).toLocaleString('de-DE');
  }

  openFile(webViewLink?: string): void {
    if (webViewLink) {
      window.open(webViewLink, '_blank');
    }
  }

  deleteFile(fileId: string, fileName: string): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete the file "${fileName}"? This action cannot be undone.`
    );

    if (confirmed) {
      this.fileService.deleteFile(fileId).subscribe({
        next: (response: FileDeleteResponse) => {
          if (response.success) {
            // Reload the files list after successful deletion
            this.loadFiles();
          } else {
            this.filesError = response.error || 'Failed to delete file';
          }
        },
        error: (error) => {
          this.filesError = 'Failed to delete file: ' + error.message;
          console.error('Error deleting file:', error);
        }
      });
    }
  }
}

