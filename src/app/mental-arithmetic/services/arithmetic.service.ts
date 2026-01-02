import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {SessionManagerService} from './session-manager.service';
import {StorageService} from './storage.service';
import {ScoringService} from './scoring.service';
import {ArithmeticProblem} from '../model/arithmetic-problem';
import {ArithmeticSettings} from '../model/arithmetic-settings';
import {ArithmeticSession} from '../model/arithmetic-session';

@Injectable({
  providedIn: 'root'
})
export class ArithmeticService {
  constructor(
      private sessionManager: SessionManagerService,
      private storageService: StorageService,
      private scoringService: ScoringService
  ) {
  }

  createSession(settings: ArithmeticSettings): Observable<ArithmeticSession> {
    return this.sessionManager.createSession(settings);
  }

  startSession(sessionId: string): Observable<ArithmeticSession> {
    return this.sessionManager.startSession(sessionId);
  }

  updateSession(session: ArithmeticSession): Observable<ArithmeticSession> {
    return this.sessionManager.updateSession(session);
  }

  completeSession(sessionId: string): Observable<ArithmeticSession> {
    return this.sessionManager.completeSession(sessionId);
  }

  pauseSession(sessionId: string): Observable<ArithmeticSession> {
    return this.sessionManager.pauseSession(sessionId);
  }

  resumeSession(sessionId: string): Observable<ArithmeticSession> {
    return this.sessionManager.resumeSession(sessionId);
  }

  getSession(sessionId: string): Observable<ArithmeticSession> {
    return this.sessionManager.getSession(sessionId);
  }

  saveSessionToStorage(session: ArithmeticSession): Observable<ArithmeticSession> {
    return this.storageService.saveSession(session);
  }

  loadSessionsFromStorage(): Observable<ArithmeticSession[]> {
    return this.storageService.loadSessions();
  }

  deleteSessionFromStorage(sessionId: string): Observable<void> {
    return this.storageService.deleteSession(sessionId);
  }

  clearAllSessionsFromStorage(): Observable<void[]> {
    return this.storageService.clearAllSessions();
  }

  saveSettingsToStorage(settings: ArithmeticSettings): Observable<ArithmeticSettings> {
    return this.storageService.saveSettings(settings);
  }

  loadSettingsFromStorage(): Observable<ArithmeticSettings> {
    return this.storageService.loadSettings();
  }

  formatTime(milliseconds: number): string {
    return this.scoringService.formatTime(milliseconds);
  }

  formatDetailedTime(milliseconds: number): string {
    return this.scoringService.formatDetailedTime(milliseconds);
  }

  getCurrentProblem(session: ArithmeticSession): ArithmeticProblem | null {
    if (session.currentProblemIndex < 0 || session.currentProblemIndex >= session.problems.length) {
      return null;
    }
    return session.problems[session.currentProblemIndex];
  }

  checkAnswer(problem: ArithmeticProblem, userAnswer: number): boolean {
    return problem.answer === userAnswer;
  }

}
