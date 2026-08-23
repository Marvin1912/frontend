import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, combineLatest, map, of, timer} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {TemperatureReading} from '../../models/temperature-reading.model';
import {HourlyWeatherForecast} from '../../models/weather-forecast.model';
import {TemperatureCardComponent} from '../temperature-card/temperature-card.component';
import {PlantsSummaryTileComponent} from '../plants-summary-tile/plants-summary-tile.component';
import {PortfolioTileComponent} from '../portfolio-tile/portfolio-tile.component';

interface ClimateView {
  status: 'ready' | 'empty' | 'error';
  hero: TemperatureReading | null;
  rooms: TemperatureReading[];
  hourlyForecast: HourlyWeatherForecast[];
}

const ROOM_ROTATION_MS = 30_000;
const VISIBLE_INDOOR_COUNT = 2;

@Component({
  selector: 'app-touch-dashboard',
  imports: [AsyncPipe, RouterLink, TemperatureCardComponent, PlantsSummaryTileComponent, PortfolioTileComponent],
  templateUrl: './touch-dashboard.component.html',
  styleUrl: './touch-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchDashboardComponent {

  private climate = inject(ClimateService);

  view$ = combineLatest([
    this.climate.readings$,
    this.climate.hourlyForecast$,
    timer(0, ROOM_ROTATION_MS)
  ]).pipe(
    map(([readings, hourlyForecast, tick]) => this.toView(readings, hourlyForecast, tick)),
    catchError(() => of<ClimateView>({status: 'error', hero: null, rooms: [], hourlyForecast: []}))
  );

  private toView(readings: TemperatureReading[], hourlyForecast: HourlyWeatherForecast[], tick: number): ClimateView {
    if (!readings.length) return {status: 'empty', hero: null, rooms: [], hourlyForecast: []};
    const hero = readings.find(r => r.location === 'outdoor') ?? null;
    const indoor = readings.filter(r => r.location === 'indoor');
    return {status: 'ready', hero, rooms: this.windowFrom(indoor, tick), hourlyForecast};
  }

  private windowFrom(indoor: TemperatureReading[], tick: number): TemperatureReading[] {
    if (!indoor.length) return [];
    if (indoor.length <= VISIBLE_INDOOR_COUNT) return indoor;
    const start = tick % indoor.length;
    return Array.from({length: VISIBLE_INDOOR_COUNT}, (_, i) => indoor[(start + i) % indoor.length]);
  }
}
