import { Injectable } from '@angular/core';
import { ProblemGeneratorService } from './problem-generator.service';
import { SessionManagerService } from './session-manager.service';
import { StorageService } from './storage.service';
import { ScoringService } from './scoring.service';
import {Difficulty} from '../model/arithmetic-enums';
import {ArithmeticProblem} from '../model/arithmetic-problem';
import {ArithmeticSettings} from '../model/arithmetic-settings';
import {ArithmeticSession} from '../model/arithmetic-session';

@Injectable({
  providedIn: 'root'
})
export class ArithmeticService {
  constructor(
    private problemGenerator: ProblemGeneratorService,
    private sessionManager: SessionManagerService,
    private storageService: StorageService,
    private scoringService: ScoringService
  ) {}

  // ==================== PROBLEM GENERATION (DELEGATED) ====================

  generateAdditionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateAdditionProblems(difficulty, count);
  }

  generateSubtractionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateSubtractionProblems(difficulty, count);
  }

  generateMixedProblems(settings: ArithmeticSettings, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateMixedProblems(settings, count);
  }


  // ==================== SESSION MANAGEMENT (DELEGATED) ====================

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

  // ==================== LOCAL STORAGE (DELEGATED) ====================

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

  // ==================== SCORING AND TIMING (DELEGATED) ====================

  calculateScore(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateScore(problems);
  }

  calculateAccuracy(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateAccuracy(problems);
  }

  calculateAverageTimePerProblem(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateAverageTimePerProblem(problems);
  }

  formatTime(milliseconds: number): string {
    return this.scoringService.formatTime(milliseconds);
  }

  formatDetailedTime(milliseconds: number): string {
    return this.scoringService.formatDetailedTime(milliseconds);
  }

  // ==================== ADDITIONAL CONVENIENCE METHODS ====================

  getCurrentProblem(session: ArithmeticSession): ArithmeticProblem | null {
    if (session.currentProblemIndex < 0 || session.currentProblemIndex >= session.problems.length) {
      return null;
    }
    return session.problems[session.currentProblemIndex];
  }

  checkAnswer(problem: ArithmeticProblem, userAnswer: number): boolean {
    return problem.answer === userAnswer;
  }

  getDetailedStats(problems: ArithmeticProblem[]) {
    return this.scoringService.getDetailedStats(problems);
  }

  calculatePerformanceRating(problems: ArithmeticProblem[]): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    return this.scoringService.calculatePerformanceRating(problems);
  }

  isStorageAvailable(): boolean {
    return this.storageService.isStorageAvailable();
  }

  getSessionCount(): number {
    return this.storageService.getSessionCount();
  }

  hasStoredSettings(): boolean {
    return this.storageService.hasStoredSettings();
  }
}
