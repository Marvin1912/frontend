import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {catchError, map, of} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {TemperatureReading} from '../../models/temperature-reading.model';
import {TemperatureCardComponent} from '../temperature-card/temperature-card.component';
import {PlantsSummaryTileComponent} from '../plants-summary-tile/plants-summary-tile.component';

interface ClimateView {
  status: 'ready' | 'empty' | 'error';
  hero: TemperatureReading | null;
  rooms: TemperatureReading[];
}

@Component({
  selector: 'app-touch-dashboard',
  imports: [AsyncPipe, TemperatureCardComponent, PlantsSummaryTileComponent],
  templateUrl: './touch-dashboard.component.html',
  styleUrl: './touch-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchDashboardComponent {

  private climate = inject(ClimateService);

  view$ = this.climate.readings$.pipe(
    map(readings => this.toView(readings)),
    catchError(() => of<ClimateView>({status: 'error', hero: null, rooms: []}))
  );

  private toView(readings: TemperatureReading[]): ClimateView {
    if (!readings.length) return {status: 'empty', hero: null, rooms: []};
    const hero = readings.find(r => r.location === 'outdoor') ?? null;
    const rooms = readings.filter(r => r !== hero);
    return {status: 'ready', hero, rooms};
  }
}
