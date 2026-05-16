import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, switchMap, timer} from 'rxjs';
import {environment} from '../../../environments/environment';
import {TemperatureReading} from '../models/temperature-reading.model';

@Injectable({
  providedIn: 'root'
})
export class ClimateService {

  host: string = environment.apiUrl;

  readings$: Observable<TemperatureReading[]> = timer(0, 60_000).pipe(
    switchMap(() => this.getReadings())
  );

  constructor(private http: HttpClient) {
  }

  getReadings(): Observable<TemperatureReading[]> {
    return this.http.get<TemperatureReading[]>(`${this.host}/climate/readings`);
  }
}
