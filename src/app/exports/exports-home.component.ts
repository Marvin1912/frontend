import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

interface RecentExport {
  name: string;
  type: string;
  timestamp: Date;
  status: string;
}

@Component({
  selector: 'app-exports-home',
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './exports-home.component.html',
  styleUrl: './exports-home.component.css'
})
export class ExportsHomeComponent {
  private router = inject(Router);

  // Dummy data
  stats = {
    totalExports: 24,
    pendingExports: 2,
    completedExports: 20,
    failedExports: 2
  };

  recentExports: RecentExport[] = [
    { name: 'sensor_data_2024', type: 'InfluxDB', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'completed' },
    { name: 'temperature_logs', type: 'InfluxDB', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'completed' },
    { name: 'pressure_readings', type: 'InfluxDB', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: 'failed' },
    { name: 'monthly_report', type: 'InfluxDB', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'pending' }
  ];

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'accent';
      case 'pending': return 'primary';
      case 'failed': return 'warn';
      default: return 'primary';
    }
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }
}
