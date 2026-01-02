import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArithmeticSession } from '../model/arithmetic-session';
import { ArithmeticSettings } from '../model/arithmetic-settings';
import { ArithmeticApiService } from './arithmetic-api.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private apiService: ArithmeticApiService) {}

  saveSession(session: ArithmeticSession): Observable<ArithmeticSession> {
    return this.apiService.updateSession(session);
  }

  loadSessions(): Observable<ArithmeticSession[]> {
    return this.apiService.getSessions();
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.apiService.deleteSession(sessionId);
  }

  clearAllSessions(): Observable<void[]> {
    return new Observable(observer => {
      this.apiService.getSessions().subscribe(sessions => {
        const deleteObservables = sessions.map(s => this.apiService.deleteSession(s.id));
        observer.next(Promise.all(deleteObservables.map(o => o.toPromise())) as unknown as void[]);
        observer.complete();
      });
    });
  }

  saveSettings(settings: ArithmeticSettings): Observable<ArithmeticSettings> {
    return this.apiService.updateSettings(settings);
  }

  loadSettings(): Observable<ArithmeticSettings> {
    return this.apiService.getSettings();
  }
}
