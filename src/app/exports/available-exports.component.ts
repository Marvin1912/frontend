import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfluxBucketsService } from './services/influx-buckets.service';
import { InfluxBucket, InfluxBucketResponse, InfluxExportRequest, InfluxExportResponse } from './model/influx-bucket';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-available-exports',
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './available-exports.component.html',
  styleUrl: './available-exports.component.css'
})
export class AvailableExportsComponent implements OnInit {
  buckets: InfluxBucket[] = [];
  isLoading = false;
  error: string | null = null;

  // Export modal properties
  showExportModal = false;
  selectedBucket: InfluxBucket | null = null;
  isExporting = false;
  exportError: string | null = null;
  exportRequest: InfluxExportRequest = {
    bucket: '',
    startTime: '',
    endTime: ''
  };

  constructor(private influxBucketsService: InfluxBucketsService) {}

  ngOnInit() {
    this.loadBuckets();
  }

  loadBuckets(): void {
    this.isLoading = true;
    this.error = null;

    this.influxBucketsService.getAvailableBuckets().subscribe({
      next: (response: InfluxBucketResponse) => {
        this.isLoading = false;
        if (response.success && response.buckets) {
          this.buckets = response.buckets;
        } else {
          this.error = 'Failed to load buckets: Invalid response format';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'Failed to load buckets: ' + error.message;
        console.error('Error loading buckets:', error);
      }
    });
  }

  // Export modal methods
  openExportModal(bucket: InfluxBucket): void {
    this.selectedBucket = bucket;
    this.exportRequest = {
      bucket: bucket.name,
      startTime: '2020-01-01T00:00:00',
      endTime: ''
    };
    this.exportError = null;
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
    this.selectedBucket = null;
    this.exportError = null;
  }

  exportBucket(): void {
    if (!this.selectedBucket || !this.exportRequest.startTime || !this.exportRequest.endTime) {
      this.exportError = 'Please fill in all required fields';
      return;
    }

    this.isExporting = true;
    this.exportError = null;

    // Convert datetime-local format to ISO format
    const request: InfluxExportRequest = {
      bucket: this.exportRequest.bucket,
      startTime: new Date(this.exportRequest.startTime).toISOString(),
      endTime: new Date(this.exportRequest.endTime).toISOString()
    };

    this.influxBucketsService.exportInfluxBucket(request).subscribe({
      next: (response: InfluxExportResponse) => {
        this.isExporting = false;
        if (response.success) {
          this.closeExportModal();
          console.log('Export successful:', response.message);
        } else {
          this.exportError = response.error || response.message || 'Export failed';
        }
      },
      error: (error) => {
        this.isExporting = false;
        if (error.error && error.error.error) {
          this.exportError = error.error.error;
        } else if (error.error && error.error.message) {
          this.exportError = error.error.message;
        } else if (error.message) {
          this.exportError = 'Export failed: ' + error.message;
        } else {
          this.exportError = 'Export failed: Unknown error occurred';
        }
        console.error('Error exporting bucket:', error);
      }
    });
  }
}
