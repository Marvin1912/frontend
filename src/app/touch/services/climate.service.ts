import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {EMPTY, Observable, catchError, shareReplay, switchMap, timer} from 'rxjs';
import {environment} from '../../../environments/environment';
import {TemperatureReading} from '../models/temperature-reading.model';
import {HourlyWeatherForecast, WeatherForecast} from '../models/weather-forecast.model';

@Injectable({
  providedIn: 'root'
})
export class ClimateService {

  host: string = environment.apiUrl;

  private http = inject(HttpClient);

  readings$: Observable<TemperatureReading[]> = timer(0, 60_000).pipe(
    switchMap(() => this.getReadings().pipe(
      catchError(() => EMPTY)
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );

  hourlyForecast$: Observable<HourlyWeatherForecast[]> = timer(0, 10 * 60_000).pipe(
    switchMap(() => this.getHourlyForecast().pipe(
      catchError(() => EMPTY)
    )),
    shareReplay({bufferSize: 1, refCount: true})
  );

  getReadings(): Observable<TemperatureReading[]> {
    return this.http.get<TemperatureReading[]>(`${this.host}/climate/readings`);
  }

  getForecast(): Observable<WeatherForecast[]> {
    return this.http.get<WeatherForecast[]>(`${this.host}/climate/forecast`);
  }

  getHourlyForecast(): Observable<HourlyWeatherForecast[]> {
    return this.http.get<HourlyWeatherForecast[]>(`${this.host}/climate/forecast/hourly`);
  }
}
