import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ExportHistory } from './model/influx-bucket';

@Component({
  selector: 'app-export-history',
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule],
  templateUrl: './export-history.component.html',
  styleUrl: './export-history.component.css'
})
export class ExportHistoryComponent implements OnInit {
  // Dummy data - will be replaced with REST service
  exports: ExportHistory[] = [
    {
      id: '1',
      name: 'sensor_data_2024',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'completed',
      fileCount: 12
    },
    {
      id: '2',
      name: 'temperature_logs',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'completed',
      fileCount: 5
    },
    {
      id: '3',
      name: 'pressure_readings',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      status: 'failed',
      fileCount: 0
    },
    {
      id: '4',
      name: 'monthly_report',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'pending',
      fileCount: 0
    },
    {
      id: '5',
      name: 'hourly_metrics',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
      status: 'completed',
      fileCount: 24
    },
    {
      id: '6',
      name: 'daily_summary',
      type: 'InfluxDB',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      status: 'completed',
      fileCount: 7
    }
  ];

  isLoading = false;
  error: string | null = null;
  displayedColumns: string[] = ['name', 'type', 'timestamp', 'fileCount', 'status', 'actions'];

  ngOnInit() {
    this.loadExportHistory();
  }

  loadExportHistory(): void {
    this.isLoading = true;
    this.error = null;

    // Simulate API call with timeout
    setTimeout(() => {
      this.isLoading = false;
      // In future, replace with actual REST service:
      // this.exportHistoryService.getHistory().subscribe({...})
    }, 500);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'accent';
      case 'pending': return 'primary';
      case 'failed': return 'warn';
      default: return 'primary';
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleString('de-DE');
  }

  retryExport(id: string): void {
    console.log('Retry export:', id);
    // TODO: Implement retry functionality when REST service is available
  }

  deleteExport(id: string, name: string): void {
    const confirmed = window.confirm(`Are you sure you want to delete the export "${name}"?`);
    if (confirmed) {
      console.log('Delete export:', id);
      // TODO: Implement delete functionality when REST service is available
    }
  }
}
