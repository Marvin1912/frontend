import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InfluxBucket } from '../model/influx-bucket';

@Injectable({
  providedIn: 'root'
})
export class InfluxBucketsService {
  private host: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAvailableBuckets(): Observable<InfluxBucket[]> {
    return this.http.get<InfluxBucket[]>(`${this.host}/export/influxdb/buckets`);
  }

  exportBuckets(request: any): Observable<any> {
    return this.http.post<any>(`${this.host}/export/influxdb`, request);
  }
}