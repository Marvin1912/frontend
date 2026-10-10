import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {catchError, map, of, startWith, switchMap, timer} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {
  WeatherSensitivity,
  WeatherSensitivityLevel,
  WeatherSensitivityTrend
} from '../../models/weather-sensitivity.model';

const SENSITIVITY_REFRESH_MS = 10 * 60_000;

type Light = 'green' | 'yellow' | 'red';

interface SensitivityView {
  status: 'loading' | 'ready' | 'error';
  light?: Light;
  levelLabel?: string;
  trendArrow?: string;
  trendLabel?: string;
  reasons?: string[];
}

const LIGHTS: Record<WeatherSensitivityLevel, Light> = {
  KEINE: 'green',
  GERING: 'green',
  MITTEL: 'yellow',
  HOCH: 'red'
};

const LEVEL_LABELS: Record<WeatherSensitivityLevel, string> = {
  KEINE: 'Keine',
  GERING: 'Gering',
  MITTEL: 'Mittel',
  HOCH: 'Hoch'
};

const TRENDS: Record<WeatherSensitivityTrend, {arrow: string; label: string}> = {
  RISING: {arrow: '↑', label: 'zunehmend'},
  STABLE: {arrow: '→', label: 'stabil'},
  FALLING: {arrow: '↓', label: 'abnehmend'}
};

@Component({
  selector: 'app-weather-sensitivity-tile',
  imports: [AsyncPipe],
  templateUrl: './weather-sensitivity-tile.component.html',
  styleUrl: './weather-sensitivity-tile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherSensitivityTileComponent {

  private climate = inject(ClimateService);

  expanded = signal(false);

  // Polls on its own instead of using climate.weatherSensitivity$ so that a
  // failed request surfaces as an error state rather than an endless loading state.
  view$ = timer(0, SENSITIVITY_REFRESH_MS).pipe(
    switchMap(() => this.climate.getWeatherSensitivity().pipe(
      map(s => this.toView(s)),
      catchError(() => of<SensitivityView>({status: 'error'}))
    )),
    startWith<SensitivityView>({status: 'loading'})
  );

  toggle(): void {
    this.expanded.update(e => !e);
  }

  private toView(s: WeatherSensitivity): SensitivityView {
    const trend = TRENDS[s.trend] ?? TRENDS.STABLE;
    return {
      status: 'ready',
      light: LIGHTS[s.level] ?? 'green',
      levelLabel: LEVEL_LABELS[s.level] ?? s.level,
      trendArrow: trend.arrow,
      trendLabel: trend.label,
      reasons: s.reasons ?? []
    };
  }
}
