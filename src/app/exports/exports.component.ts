import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileService } from './services/file/file.service';
import { FileItem, FileItemTime, FileListResponse, FileDeleteResponse } from './services/file/file.model';

@Component({
  selector: 'app-exports',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './exports.component.html',
  styleUrl: './exports.component.css'
})
export class ExportsComponent implements OnInit {
  // Files table properties
  files: FileItem[] = [];
  isLoadingFiles = false;
  filesError: string | null = null;
  displayedColumns: string[] = ['name', 'size', 'modifiedTime', 'actions'];

  constructor(private fileService: FileService) {}

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

  // File utility methods
  formatFileSize(bytes?: number): string {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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
    const confirmed = window.confirm(`Are you sure you want to delete the file "${fileName}"? This action cannot be undone.`);

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
