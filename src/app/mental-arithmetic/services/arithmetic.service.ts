import { Injectable } from '@angular/core';
import { ArithmeticProblem, ArithmeticSession, Difficulty, OperationType, ArithmeticSettings, SessionStatus } from '../model';

@Injectable({
  providedIn: 'root'
})
export class ArithmeticService {
  constructor() {}

  /**
   * Generate addition problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of addition problems
   */
  generateAdditionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createAdditionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  /**
   * Generate subtraction problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of subtraction problems
   */
  generateSubtractionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createSubtractionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  /**
   * Generate mixed problems based on settings
   * @param settings The arithmetic settings containing operations and difficulty
   * @param count Number of problems to generate
   * @returns Array of mixed operation problems
   */
  generateMixedProblems(settings: ArithmeticSettings, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];
    const operations = settings.operations;

    if (operations.length === 0) {
      return problems;
    }

    for (let i = 0; i < count; i++) {
      // Randomly select an operation from the available operations
      const randomIndex = Math.floor(Math.random() * operations.length);
      const selectedOperation = operations[randomIndex];

      let problem: ArithmeticProblem;
      if (selectedOperation === OperationType.ADDITION) {
        problem = this.createAdditionProblem(settings.difficulty);
      } else if (selectedOperation === OperationType.SUBTRACTION) {
        problem = this.createSubtractionProblem(settings.difficulty);
      } else {
        // Default to addition for safety
        problem = this.createAdditionProblem(settings.difficulty);
      }

      problems.push(problem);
    }

    return problems;
  }

  /**
   * Create a single addition problem
   * @param difficulty The difficulty level for number generation
   * @returns A single addition problem
   */
  private createAdditionProblem(difficulty: Difficulty): ArithmeticProblem {
    const num1 = this.generateRandomDigits(difficulty);
    const num2 = this.generateRandomDigits(difficulty);
    const expression = `${num1} + ${num2}`;
    const answer = num1 + num2;

    return {
      id: this.generateProblemId(),
      expression,
      answer,
      userAnswer: null,
      isCorrect: false,
      timeSpent: 0
    };
  }

  /**
   * Create a single subtraction problem
   * @param difficulty The difficulty level for number generation
   * @returns A single subtraction problem
   */
  private createSubtractionProblem(difficulty: Difficulty): ArithmeticProblem {
    const num1 = this.generateRandomDigits(difficulty);
    const num2 = this.generateRandomDigits(difficulty);

    // Ensure positive result by making sure num1 >= num2
    const { minuend, subtrahend } = this.ensurePositiveResult(num1, num2);
    const expression = `${minuend} - ${subtrahend}`;
    const answer = minuend - subtrahend;

    return {
      id: this.generateProblemId(),
      expression,
      answer,
      userAnswer: null,
      isCorrect: false,
      timeSpent: 0
    };
  }

  /**
   * Generate random numbers based on difficulty level
   * @param difficulty The difficulty level
   * @returns A random number with appropriate number of digits
   */
  private generateRandomDigits(difficulty: Difficulty): number {
    let min: number;
    let max: number;

    switch (difficulty) {
      case Difficulty.EASY:
        // 2-digit numbers (10-99)
        min = 10;
        max = 99;
        break;
      case Difficulty.MEDIUM:
        // 3-digit numbers (100-999)
        min = 100;
        max = 999;
        break;
      case Difficulty.HARD:
        // 4-digit numbers (1000-9999)
        min = 1000;
        max = 9999;
        break;
      default:
        // Default to easy
        min = 10;
        max = 99;
        break;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Ensure subtraction results in positive numbers
   * @param num1 First number
   * @param num2 Second number
   * @returns Object with minuend (larger) and subtrahend (smaller)
   */
  private ensurePositiveResult(num1: number, num2: number): { minuend: number; subtrahend: number } {
    if (num1 >= num2) {
      return { minuend: num1, subtrahend: num2 };
    } else {
      return { minuend: num2, subtrahend: num1 };
    }
  }

  /**
   * Generate a unique problem ID
   * @returns A unique identifier for a problem
   */
  private generateProblemId(): string {
    return `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Create a new arithmetic session with the given settings
   * @param settings The settings for the session
   * @returns A new arithmetic session
   */
  createSession(settings: ArithmeticSettings): ArithmeticSession {
    const problems = this.generateMixedProblems(settings, settings.problemCount);
    const sessionId = this.generateSessionId();

    return {
      id: sessionId,
      createdAt: new Date(),
      startTime: null,
      endTime: null,
      status: SessionStatus.ACTIVE,
      settings,
      problems,
      currentProblemIndex: 0,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeSpent: 0,
      problemsCompleted: 0,
      totalProblems: settings.problemCount,
      accuracy: 0,
      averageTimePerProblem: 0,
      isCompleted: false,
      isTimedOut: false
    };
  }

  /**
   * Start a session by setting the start time
   * @param session The session to start
   * @returns The updated session
   */
  startSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      startTime: new Date(),
      status: SessionStatus.ACTIVE
    };
  }

  /**
   * Update a session with new problem results and recalculate statistics
   * @param session The session to update
   * @returns The updated session
   */
  updateSession(session: ArithmeticSession): ArithmeticSession {
    const completedProblems = session.problems.filter(p => p.userAnswer !== null);
    const correctAnswers = completedProblems.filter(p => p.isCorrect);

    const score = this.calculateScore(session.problems);
    const accuracy = this.calculateAccuracy(session.problems);
    const averageTime = this.calculateAverageTimePerProblem(session.problems);
    const totalTime = completedProblems.reduce((sum, p) => sum + p.timeSpent, 0);

    const isCompleted = completedProblems.length === session.totalProblems;
    const status = isCompleted ? SessionStatus.COMPLETED : session.status;

    return {
      ...session,
      score,
      correctAnswers: correctAnswers.length,
      incorrectAnswers: completedProblems.length - correctAnswers.length,
      problemsCompleted: completedProblems.length,
      accuracy,
      averageTimePerProblem: averageTime,
      totalTimeSpent: totalTime,
      isCompleted,
      status,
      endTime: isCompleted ? new Date() : null
    };
  }

  /**
   * Complete a session and set the end time
   * @param session The session to complete
   * @returns The completed session
   */
  completeSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      endTime: new Date(),
      status: SessionStatus.COMPLETED,
      isCompleted: true
    };
  }

  /**
   * Pause a session
   * @param session The session to pause
   * @returns The paused session
   */
  pauseSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      status: SessionStatus.PAUSED
    };
  }

  /**
   * Resume a paused session
   * @param session The session to resume
   * @returns The resumed session
   */
  resumeSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      status: SessionStatus.ACTIVE
    };
  }

  /**
   * Generate a unique session ID
   * @returns A unique identifier for a session
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== LOCAL STORAGE ====================

  /**
   * Save a session to localStorage
   * @param session The session to save
   */
  saveSessionToStorage(session: ArithmeticSession): void {
    try {
      const sessions = this.loadSessionsFromStorage();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Keep only the last 100 sessions to prevent storage overflow
      const sortedSessions = sessions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 100);

      localStorage.setItem('arithmetic_sessions', JSON.stringify(sortedSessions));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  /**
   * Load all sessions from localStorage
   * @returns Array of stored sessions
   */
  loadSessionsFromStorage(): ArithmeticSession[] {
    try {
      const stored = localStorage.getItem('arithmetic_sessions');
      if (!stored) {
        return [];
      }

      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        startTime: session.startTime ? new Date(session.startTime) : null,
        endTime: session.endTime ? new Date(session.endTime) : null
      }));
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      return [];
    }
  }

  /**
   * Delete a specific session from localStorage
   * @param sessionId The ID of the session to delete
   */
  deleteSessionFromStorage(sessionId: string): void {
    try {
      const sessions = this.loadSessionsFromStorage();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      localStorage.setItem('arithmetic_sessions', JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
    }
  }

  /**
   * Clear all sessions from localStorage
   */
  clearAllSessionsFromStorage(): void {
    try {
      localStorage.removeItem('arithmetic_sessions');
    } catch (error) {
      console.error('Error clearing sessions from localStorage:', error);
    }
  }

  /**
   * Save settings to localStorage
   * @param settings The settings to save
   */
  saveSettingsToStorage(settings: ArithmeticSettings): void {
    try {
      localStorage.setItem('arithmetic_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  /**
   * Load settings from localStorage
   * @returns The saved settings or default settings
   */
  loadSettingsFromStorage(): ArithmeticSettings | null {
    try {
      const stored = localStorage.getItem('arithmetic_settings');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return null;
    }
  }

  // ==================== SCORING AND TIMING ====================

  /**
   * Calculate the total score for a set of problems
   * @param problems Array of problems to score
   * @returns Total score (1 point per correct answer)
   */
  calculateScore(problems: ArithmeticProblem[]): number {
    return problems.filter(p => p.isCorrect).length;
  }

  /**
   * Calculate the accuracy percentage for a set of problems
   * @param problems Array of problems to calculate accuracy for
   * @returns Accuracy percentage (0-100)
   */
  calculateAccuracy(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const correctAnswers = answeredProblems.filter(p => p.isCorrect).length;
    return Math.round((correctAnswers / answeredProblems.length) * 100);
  }

  /**
   * Calculate the average time per problem
   * @param problems Array of problems to calculate time for
   * @returns Average time per problem in milliseconds
   */
  calculateAverageTimePerProblem(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const totalTime = answeredProblems.reduce((sum, p) => sum + p.timeSpent, 0);
    return Math.round(totalTime / answeredProblems.length);
  }

  /**
   * Format time in milliseconds to a human-readable format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1:23" or "0:45")
   */
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format time in milliseconds to a detailed format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1m 23s" or "45s")
   */
  formatDetailedTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }
}