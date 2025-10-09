import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    CommonModule,
    DatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly metadata = {
    nodeVersion: '24.10.0',
    npmVersion: '11.6.1',
    angularVersion: '20.2.8',
    projectVersion: '0.0.0',
    buildTime: new Date().toISOString(),
    environment: 'development'
  };
}
