import { Injectable } from '@angular/core';
import { ArithmeticProblem, ArithmeticSession, Difficulty, OperationType, ArithmeticSettings, SessionStatus } from '../model';
import { ProblemGeneratorService } from './problem-generator.service';
import { SessionManagerService } from './session-manager.service';
import { StorageService } from './storage.service';
import { ScoringService } from './scoring.service';

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

  /**
   * Generate addition problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of addition problems
   */
  generateAdditionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateAdditionProblems(difficulty, count);
  }

  /**
   * Generate subtraction problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of subtraction problems
   */
  generateSubtractionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateSubtractionProblems(difficulty, count);
  }

  /**
   * Generate mixed problems based on settings
   * @param settings The arithmetic settings containing operations and difficulty
   * @param count Number of problems to generate
   * @returns Array of mixed operation problems
   */
  generateMixedProblems(settings: ArithmeticSettings, count: number): ArithmeticProblem[] {
    return this.problemGenerator.generateMixedProblems(settings, count);
  }

  
  // ==================== SESSION MANAGEMENT (DELEGATED) ====================

  /**
   * Create a new arithmetic session with the given settings
   * @param settings The settings for the session
   * @returns A new arithmetic session
   */
  createSession(settings: ArithmeticSettings): ArithmeticSession {
    return this.sessionManager.createSession(settings);
  }

  /**
   * Start a session by setting the start time
   * @param session The session to start
   * @returns The updated session
   */
  startSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.startSession(session);
  }

  /**
   * Update a session with new problem results and recalculate statistics
   * @param session The session to update
   * @returns The updated session
   */
  updateSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.updateSession(session);
  }

  /**
   * Complete a session and set the end time
   * @param session The session to complete
   * @returns The completed session
   */
  completeSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.completeSession(session);
  }

  /**
   * Pause a session
   * @param session The session to pause
   * @returns The paused session
   */
  pauseSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.pauseSession(session);
  }

  /**
   * Resume a paused session
   * @param session The session to resume
   * @returns The resumed session
   */
  resumeSession(session: ArithmeticSession): ArithmeticSession {
    return this.sessionManager.resumeSession(session);
  }

  // ==================== LOCAL STORAGE (DELEGATED) ====================

  /**
   * Save a session to localStorage
   * @param session The session to save
   */
  saveSessionToStorage(session: ArithmeticSession): void {
    this.storageService.saveSession(session);
  }

  /**
   * Load all sessions from localStorage
   * @returns Array of stored sessions
   */
  loadSessionsFromStorage(): ArithmeticSession[] {
    return this.storageService.loadSessions();
  }

  /**
   * Delete a specific session from localStorage
   * @param sessionId The ID of the session to delete
   */
  deleteSessionFromStorage(sessionId: string): void {
    this.storageService.deleteSession(sessionId);
  }

  /**
   * Clear all sessions from localStorage
   */
  clearAllSessionsFromStorage(): void {
    this.storageService.clearAllSessions();
  }

  /**
   * Save settings to localStorage
   * @param settings The settings to save
   */
  saveSettingsToStorage(settings: ArithmeticSettings): void {
    this.storageService.saveSettings(settings);
  }

  /**
   * Load settings from localStorage
   * @returns The saved settings or null
   */
  loadSettingsFromStorage(): ArithmeticSettings | null {
    return this.storageService.loadSettings();
  }

  // ==================== SCORING AND TIMING (DELEGATED) ====================

  /**
   * Calculate the total score for a set of problems
   * @param problems Array of problems to score
   * @returns Total score (1 point per correct answer)
   */
  calculateScore(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateScore(problems);
  }

  /**
   * Calculate the accuracy percentage for a set of problems
   * @param problems Array of problems to calculate accuracy for
   * @returns Accuracy percentage (0-100)
   */
  calculateAccuracy(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateAccuracy(problems);
  }

  /**
   * Calculate the average time per problem
   * @param problems Array of problems to calculate time for
   * @returns Average time per problem in milliseconds
   */
  calculateAverageTimePerProblem(problems: ArithmeticProblem[]): number {
    return this.scoringService.calculateAverageTimePerProblem(problems);
  }

  /**
   * Format time in milliseconds to a human-readable format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1:23" or "0:45")
   */
  formatTime(milliseconds: number): string {
    return this.scoringService.formatTime(milliseconds);
  }

  /**
   * Format time in milliseconds to a detailed format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1m 23s" or "45s")
   */
  formatDetailedTime(milliseconds: number): string {
    return this.scoringService.formatDetailedTime(milliseconds);
  }

  // ==================== ADDITIONAL CONVENIENCE METHODS ====================

  /**
   * Get detailed statistics for a set of problems
   * @param problems Array of problems to analyze
   * @returns Detailed statistics object
   */
  getDetailedStats(problems: ArithmeticProblem[]) {
    return this.scoringService.getDetailedStats(problems);
  }

  /**
   * Calculate performance rating based on accuracy and speed
   * @param problems Array of problems to evaluate
   * @returns Performance rating (Excellent, Good, Average, Poor)
   */
  calculatePerformanceRating(problems: ArithmeticProblem[]): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    return this.scoringService.calculatePerformanceRating(problems);
  }

  /**
   * Check if localStorage is available
   * @returns True if localStorage is available
   */
  isStorageAvailable(): boolean {
    return this.storageService.isStorageAvailable();
  }

  /**
   * Get the total number of stored sessions
   * @returns Number of stored sessions
   */
  getSessionCount(): number {
    return this.storageService.getSessionCount();
  }

  /**
   * Check if settings are stored
   * @returns True if settings exist in storage
   */
  hasStoredSettings(): boolean {
    return this.storageService.hasStoredSettings();
  }
}