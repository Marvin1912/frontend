import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {ClimateService} from '../../services/climate.service';
import {TemperatureCardComponent} from '../temperature-card/temperature-card.component';

@Component({
  selector: 'app-touch-dashboard',
  imports: [AsyncPipe, TemperatureCardComponent],
  templateUrl: './touch-dashboard.component.html',
  styleUrl: './touch-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchDashboardComponent {

  private climate = inject(ClimateService);

  readings$ = this.climate.readings$;
}
