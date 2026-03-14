import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BackupRunPage } from './backup-run.model';

@Injectable({
  providedIn: 'root'
})
export class BackupRunService {
  host: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getBackupRuns(limit = 20, offset = 0): Observable<BackupRunPage> {
    return this.http.get<BackupRunPage>(`${this.host}/backups`, {
      params: { limit: limit.toString(), offset: offset.toString() }
    });
  }
}
