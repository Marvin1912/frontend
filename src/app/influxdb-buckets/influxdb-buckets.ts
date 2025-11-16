import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfluxBucketsService } from './services/influx-buckets.service';
import {InfluxBucket, InfluxBucketResponse} from './model/influx-bucket';

@Component({
  selector: 'app-influxdb-buckets',
  imports: [CommonModule],
  templateUrl: './influxdb-buckets.html',
  styleUrl: './influxdb-buckets.css'
})
export class InfluxdbBuckets implements OnInit {
  buckets: InfluxBucket[] = [];
  isLoading = false;
  error: string | null = null;

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
}
