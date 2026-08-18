import {ChangeDetectionStrategy, Component, DestroyRef, inject} from '@angular/core';
import {AsyncPipe, DatePipe} from '@angular/common';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {catchError, map, of, timer} from 'rxjs';
import {ClimateService} from '../../services/climate.service';
import {WeatherForecast} from '../../models/weather-forecast.model';

const DEFAULT_DISPLAY_MS = 30_000;

interface ForecastView {
  status: 'ready' | 'empty' | 'error';
  days: WeatherForecast[];
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

  view$ = this.climate.getForecast().pipe(
    map(days => ({status: days.length ? 'ready' : 'empty', days} as ForecastView)),
    catchError(() => of<ForecastView>({status: 'error', days: []}))
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

  coordinatesLabel(days: WeatherForecast[]): string | null {
    const first = days[0];
    if (!first) return null;
    const lat = this.formatCoordinate(first.latitude, 'N', 'S');
    const lon = this.formatCoordinate(first.longitude, 'E', 'W');
    return `${lat}, ${lon}`;
  }

  iconFor(weatherId: number): string {
    if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
    if (weatherId >= 300 && weatherId < 600) return 'water_drop';
    if (weatherId >= 600 && weatherId < 700) return 'ac_unit';
    if (weatherId >= 700 && weatherId < 800) return 'foggy';
    if (weatherId === 800) return 'wb_sunny';
    return 'cloud';
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
