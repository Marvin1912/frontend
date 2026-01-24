import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private host: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  exportVocabulary(): Observable<any> {
    return this.http.get(`${this.host}/export/vocabulary`);
  }

  exportCosts(): Observable<any> {
    return this.http.get(`${this.host}/export/costs`);
  }
}
