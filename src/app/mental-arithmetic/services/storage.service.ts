import { Injectable } from '@angular/core';
import {ArithmeticSession} from '../model/arithmetic-session';
import {ArithmeticSettings} from '../model/arithmetic-settings';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly SESSIONS_KEY = 'arithmetic_sessions';
  private readonly SETTINGS_KEY = 'arithmetic_settings';
  private readonly MAX_SESSIONS = 100;

  saveSession(session: ArithmeticSession): void {
    try {
      const sessions = this.loadSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);

      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }

      // Keep only the last MAX_SESSIONS to prevent storage overflow
      const sortedSessions = sessions.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, this.MAX_SESSIONS);

      globalThis.localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sortedSessions));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  loadSessions(): ArithmeticSession[] {
    try {
      const stored = globalThis.localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) {
        return [];
      }

      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects and ensure all required properties
      return sessions.map((session: any): ArithmeticSession => ({
        id: session.id || '',
        createdAt: new Date(session.createdAt),
        startTime: session.startTime ? new Date(session.startTime) : null,
        endTime: session.endTime ? new Date(session.endTime) : null,
        status: session.status || 'CREATED',
        settings: session.settings || {
          operations: [],
          difficulty: 'EASY',
          timeLimit: null,
          problemCount: 10
        },
        problems: session.problems || [],
        currentProblemIndex: session.currentProblemIndex || 0,
        score: session.score || 0,
        correctAnswers: session.correctAnswers || 0,
        incorrectAnswers: session.incorrectAnswers || 0,
        totalTimeSpent: session.totalTimeSpent || 0,
        problemsCompleted: session.problemsCompleted || 0,
        totalProblems: session.totalProblems || 10,
        accuracy: session.accuracy || 0,
        averageTimePerProblem: session.averageTimePerProblem || 0,
        isCompleted: session.isCompleted || false,
        isTimedOut: session.isTimedOut || false,
        notes: session.notes || undefined
      }));
    } catch (error) {
      console.error('Error loading sessions from localStorage:', error);
      return [];
    }
  }

  deleteSession(sessionId: string): void {
    try {
      const sessions = this.loadSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      globalThis.localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
    }
  }

  clearAllSessions(): void {
    try {
      globalThis.localStorage.removeItem(this.SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing sessions from localStorage:', error);
    }
  }

  saveSettings(settings: ArithmeticSettings): void {
    try {
      globalThis.localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  loadSettings(): ArithmeticSettings | null {
    try {
      const stored = globalThis.localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return null;
    }
  }

}
