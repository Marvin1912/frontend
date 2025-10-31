import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { fadeInOut, rotate } from '../../animations/animations';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css'],
  animations: [
    fadeInOut,
    rotate
  ]
})
export class LoadingComponent {
  @Input() message: string = 'Laden...';
  @Input() size: number = 50;
  @Input() showIcon: boolean = false;
  @Input() icon: string = 'refresh';
  @Input() fullscreen: boolean = false;
  @Input() transparent: boolean = false;

  // Different loading types
  @Input() type: 'spinner' | 'dots' | 'pulse' = 'spinner';

  constructor() { }
}