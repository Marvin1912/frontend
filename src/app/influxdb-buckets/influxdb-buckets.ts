import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InfluxBucketsService } from './services/influx-buckets.service';
import {InfluxBucket, InfluxBucketResponse, InfluxExportRequest, InfluxExportResponse} from './model/influx-bucket';

@Component({
  selector: 'app-influxdb-buckets',
  imports: [CommonModule, FormsModule],
  templateUrl: './influxdb-buckets.html',
  styleUrl: './influxdb-buckets.css'
})
export class InfluxdbBuckets implements OnInit {
  buckets: InfluxBucket[] = [];
  isLoading = false;
  error: string | null = null;

  // Export modal properties
  showExportModal = false;
  selectedBucket: InfluxBucket | null = null;
  isExporting = false;
  exportError: string | null = null;
  exportRequest: InfluxExportRequest = {
    buckets: [],
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
      buckets: [bucket.name],
      startTime: '',
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
      buckets: this.exportRequest.buckets,
      startTime: new Date(this.exportRequest.startTime).toISOString(),
      endTime: new Date(this.exportRequest.endTime).toISOString()
    };

    this.influxBucketsService.exportInfluxBuckets(request).subscribe({
      next: (response: InfluxExportResponse) => {
        this.isExporting = false;
        if (response.success) {
          this.closeExportModal();
          // You could add a success message here
          console.log('Export successful:', response.message);
        } else {
          // Handle backend error responses (like invalid bucket name)
          this.exportError = response.error || response.message || 'Export failed';
        }
      },
      error: (error) => {
        this.isExporting = false;
        // Handle HTTP errors and backend error responses
        if (error.error && error.error.error) {
          // Backend returned an error response with specific error message
          this.exportError = error.error.error;
        } else if (error.error && error.error.message) {
          // Backend returned an error response with message
          this.exportError = error.error.message;
        } else if (error.message) {
          // HTTP error or network error
          this.exportError = 'Export failed: ' + error.message;
        } else {
          // Generic error
          this.exportError = 'Export failed: Unknown error occurred';
        }
        console.error('Error exporting bucket:', error);
      }
    });
  }
}
