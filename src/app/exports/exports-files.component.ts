import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';

import {FileService} from './services/file/file.service';
import {FileDeleteResponse, FileItem, FileItemTime, FileListResponse} from './services/file/file.model';

@Component({
  selector: 'app-exports-files',
  imports: [
    RouterModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exports-files.component.html',
  styleUrl: './exports-files.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportsFilesComponent implements OnInit {

  files: FileItem[] = [];
  isLoadingFiles = false;
  filesError: string | null = null;
  displayedColumns: string[] = ['name', 'size', 'modifiedTime', 'actions'];

  private fileService = inject(FileService);
  private cdr = inject(ChangeDetectorRef);

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
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingFiles = false;
        this.filesError = 'Failed to load files: ' + error.message;
        this.cdr.markForCheck();
      }
    });
  }

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
            this.loadFiles();
          } else {
            this.filesError = response.error || 'Failed to delete file';
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          this.filesError = 'Failed to delete file: ' + error.message;
          this.cdr.markForCheck();
        }
      });
    }
  }
}
