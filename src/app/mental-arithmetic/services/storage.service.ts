import { Injectable } from '@angular/core';
import { ArithmeticSession, ArithmeticSettings } from '../model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly SESSIONS_KEY = 'arithmetic_sessions';
  private readonly SETTINGS_KEY = 'arithmetic_settings';
  private readonly MAX_SESSIONS = 100;

  constructor() {}

  // ==================== SESSION STORAGE ====================

  /**
   * Save a session to localStorage
   * @param session The session to save
   */
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

  /**
   * Load all sessions from localStorage
   * @returns Array of stored sessions
   */
  loadSessions(): ArithmeticSession[] {
    try {
      const stored = globalThis.localStorage.getItem(this.SESSIONS_KEY);
      if (!stored) {
        return [];
      }

      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects
      return sessions.map((session: Partial<ArithmeticSession>) => ({
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
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.loadSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      globalThis.localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filteredSessions));
    } catch (error) {
      console.error('Error deleting session from localStorage:', error);
    }
  }

  /**
   * Clear all sessions from localStorage
   */
  clearAllSessions(): void {
    try {
      globalThis.localStorage.removeItem(this.SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing sessions from localStorage:', error);
    }
  }

  // ==================== SETTINGS STORAGE ====================

  /**
   * Save settings to localStorage
   * @param settings The settings to save
   */
  saveSettings(settings: ArithmeticSettings): void {
    try {
      globalThis.localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

  /**
   * Load settings from localStorage
   * @returns The saved settings or null if not found
   */
  loadSettings(): ArithmeticSettings | null {
    try {
      const stored = globalThis.localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear all settings from localStorage
   */
  clearSettings(): void {
    try {
      globalThis.localStorage.removeItem(this.SETTINGS_KEY);
    } catch (error) {
      console.error('Error clearing settings from localStorage:', error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if localStorage is available
   * @returns True if localStorage is available
   */
  isStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      globalThis.localStorage.setItem(testKey, 'test');
      globalThis.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the total number of stored sessions
   * @returns Number of stored sessions
   */
  getSessionCount(): number {
    return this.loadSessions().length;
  }

  /**
   * Check if settings are stored
   * @returns True if settings exist in storage
   */
  hasStoredSettings(): boolean {
    return this.loadSettings() !== null;
  }
}