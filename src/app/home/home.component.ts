import { Component, ChangeDetectionStrategy } from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {environment} from "../../environments/environment";

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
    nodeVersion: environment.nodeVersion,
    npmVersion: '11.6.1',
    angularVersion: environment.angularVersion,
    projectVersion: '0.0.0',
    buildTime: environment.buildTime,
    environment: environment.production ? 'prod' : 'dev'
  };
}
