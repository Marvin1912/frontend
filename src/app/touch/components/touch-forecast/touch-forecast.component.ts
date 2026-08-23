import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import {AsyncPipe, DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {Observable, catchError, combineLatest, map, of, timer} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {HourlyWeatherForecast, WeatherForecast} from '../../models/weather-forecast.model';
import {weatherIconFor} from '../../utils/weather-icon.util';

const DEFAULT_DISPLAY_MS = 30_000;

interface ForecastSection<T> {
  status: 'ready' | 'empty' | 'error';
  items: T[];
}

interface ForecastView {
  hourly: ForecastSection<HourlyWeatherForecast>;
  daily: ForecastSection<WeatherForecast>;
}

@Component({
  selector: 'app-touch-forecast',
  imports: [AsyncPipe, DatePipe, MatIconModule],
  templateUrl: './touch-forecast.component.html',
  styleUrl: './touch-forecast.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TouchForecastComponent {

  private climate = inject(ClimateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private readonly displayMs = this.resolveDisplayMs();

  view$ = combineLatest([
    this.toSection(this.climate.getHourlyForecast()),
    this.toSection(this.climate.getForecast())
  ]).pipe(
    map(([hourly, daily]) => ({hourly, daily} as ForecastView))
  );

  remainingSeconds$ = timer(0, 1000).pipe(
    map(tick => Math.max(0, Math.ceil((this.displayMs - tick * 1000) / 1000)))
  );

  constructor() {
    timer(this.displayMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/touch']));
  }

  round(value: number): number {
    return Math.round(value);
  }

  coordinatesLabel(view: ForecastView): string | null {
    const first = view.daily.items[0] ?? view.hourly.items[0];
    if (!first) return null;
    const lat = this.formatCoordinate(first.latitude, 'N', 'S');
    const lon = this.formatCoordinate(first.longitude, 'E', 'W');
    return `${lat}, ${lon}`;
  }

  iconFor(weatherId: number): string {
    return weatherIconFor(weatherId);
  }

  private toSection<T>(source: Observable<T[]>): Observable<ForecastSection<T>> {
    return source.pipe(
      map(items => ({status: items.length ? 'ready' : 'empty', items} as ForecastSection<T>)),
      catchError(() => of<ForecastSection<T>>({status: 'error', items: []}))
    );
  }

  private formatCoordinate(value: number, positiveSuffix: string, negativeSuffix: string): string {
    return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positiveSuffix : negativeSuffix}`;
  }

  private resolveDisplayMs(): number {
    const raw = this.route.snapshot.queryParamMap.get('durationMs');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DISPLAY_MS;
  }
}
