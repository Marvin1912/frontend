import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {InfluxBucketResponse, InfluxExportRequest, InfluxExportResponse} from '../model/influx-bucket';

@Injectable({
  providedIn: 'root'
})
export class InfluxBucketsService {
  private host: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAvailableBuckets(): Observable<InfluxBucketResponse> {
    return this.http.get<InfluxBucketResponse>(`${this.host}/export/influxdb/buckets`);
  }

  exportInfluxBucket(request: InfluxExportRequest): Observable<InfluxExportResponse> {
    return this.http.post<InfluxExportResponse>(`${this.host}/export/influxdb`, request);
  }

}
