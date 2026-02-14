import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private host: string = environment.apiUrl;
  private ankiUrl: string = environment.ankiUrl;

  constructor(private http: HttpClient) { }

  exportVocabulary(): Observable<any> {
    return this.http.post(`${this.host}/export/vocabulary`, {});
  }

  exportCosts(): Observable<any> {
    return this.http.post(`${this.host}/export/costs`, {});
  }

  syncAnki(): Observable<any> {
    return this.http.post(`${this.ankiUrl}/sync`, {});
  }
}
