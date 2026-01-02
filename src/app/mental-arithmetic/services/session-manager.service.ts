import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ArithmeticApiService} from './arithmetic-api.service';
import {ArithmeticSession} from '../model/arithmetic-session';
import {ArithmeticSettings} from '../model/arithmetic-settings';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {

  constructor(
    private apiService: ArithmeticApiService
  ) {
  }

  createSession(settings: ArithmeticSettings): Observable<ArithmeticSession> {
    return this.apiService.createSession(settings);
  }

  startSession(sessionId: string): Observable<ArithmeticSession> {
    return this.apiService.startSession(sessionId);
  }

  updateSession(session: ArithmeticSession): Observable<ArithmeticSession> {
    return this.apiService.updateSession(session);
  }

  completeSession(sessionId: string): Observable<ArithmeticSession> {
    return this.apiService.completeSession(sessionId);
  }

  pauseSession(sessionId: string): Observable<ArithmeticSession> {
    return this.apiService.pauseSession(sessionId);
  }

  resumeSession(sessionId: string): Observable<ArithmeticSession> {
    return this.apiService.resumeSession(sessionId);
  }

  getSession(sessionId: string): Observable<ArithmeticSession> {
    return this.apiService.getSession(sessionId);
  }
}
