import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {catchError, combineLatest, map, of, scan, timer} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {TemperatureReading} from '../../models/temperature-reading.model';
import {HourlyWeatherForecast} from '../../models/weather-forecast.model';
import {TemperatureCardComponent} from '../temperature-card/temperature-card.component';
import {PlantsSummaryTileComponent} from '../plants-summary-tile/plants-summary-tile.component';
import {PortfolioTileComponent} from '../portfolio-tile/portfolio-tile.component';
import {WeatherSensitivityTileComponent} from '../weather-sensitivity-tile/weather-sensitivity-tile.component';
import {VentilationState, ventilationAdvice} from '../../utils/ventilation.util';

interface ClimateView {
  status: 'ready' | 'empty' | 'error';
  hero: TemperatureReading | null;
  rooms: TemperatureReading[];
  hourlyForecast: HourlyWeatherForecast[];
  ventilation: ReadonlyMap<string, VentilationState>;
}

const ROOM_ROTATION_MS = 30_000;
const VISIBLE_INDOOR_COUNT = 4;

@Component({
  selector: 'app-touch-dashboard',
  imports: [AsyncPipe, RouterLink, TemperatureCardComponent, PlantsSummaryTileComponent, WeatherSensitivityTileComponent,
    PortfolioTileComponent],
  templateUrl: './touch-dashboard.component.html',
  styleUrl: './touch-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchDashboardComponent {

  private climate = inject(ClimateService);

  private ventilation$ = this.climate.readings$.pipe(
    scan((previous, readings) => ventilationAdvice(readings, previous), new Map<string, VentilationState>())
  );

  view$ = combineLatest([
    this.climate.readings$,
    this.climate.hourlyForecast$,
    this.ventilation$,
    timer(0, ROOM_ROTATION_MS)
  ]).pipe(
    map(([readings, hourlyForecast, ventilation, tick]) => this.toView(readings, hourlyForecast, ventilation, tick)),
    catchError(() => of<ClimateView>({status: 'error', hero: null, rooms: [], hourlyForecast: [], ventilation: new Map()}))
  );

  private toView(readings: TemperatureReading[], hourlyForecast: HourlyWeatherForecast[],
                 ventilation: ReadonlyMap<string, VentilationState>, tick: number): ClimateView {
    if (!readings.length) return {status: 'empty', hero: null, rooms: [], hourlyForecast: [], ventilation};
    const hero = readings.find(r => r.location === 'outdoor') ?? null;
    const indoor = readings.filter(r => r.location === 'indoor');
    return {status: 'ready', hero, rooms: this.windowFrom(indoor, tick), hourlyForecast, ventilation};
  }

  private windowFrom(indoor: TemperatureReading[], tick: number): TemperatureReading[] {
    if (!indoor.length) return [];
    if (indoor.length <= VISIBLE_INDOOR_COUNT) return indoor;
    const start = tick % indoor.length;
    return Array.from({length: VISIBLE_INDOOR_COUNT}, (_, i) => indoor[(start + i) % indoor.length]);
  }
}
