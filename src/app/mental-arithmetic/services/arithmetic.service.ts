import {Injectable} from '@angular/core';
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

  createSession(settings: ArithmeticSettings): ArithmeticSession {
    return this.sessionManager.createSession(settings);
  }

  startSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.startSession(session);
  }

  updateSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.updateSession(session);
  }

  completeSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.completeSession(session);
  }

  pauseSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.pauseSession(session);
  }

  resumeSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.resumeSession(session);
  }

  saveSessionToStorage(session: ArithmeticSession): void {
    this.storageService.saveSession(session);
  }

  loadSessionsFromStorage(): ArithmeticSession[] {
    return this.storageService.loadSessions();
  }

  deleteSessionFromStorage(sessionId: string): void {
    this.storageService.deleteSession(sessionId);
  }

  clearAllSessionsFromStorage(): void {
    this.storageService.clearAllSessions();
  }

  saveSettingsToStorage(settings: ArithmeticSettings): void {
    this.storageService.saveSettings(settings);
  }

  loadSettingsFromStorage(): ArithmeticSettings | null {
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
