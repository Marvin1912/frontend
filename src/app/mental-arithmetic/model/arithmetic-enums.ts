/**
 * Enum for difficulty levels in arithmetic training
 */
export enum Difficulty {
  /** Easy: 2-digit numbers (10-99) */
  EASY = 'EASY',

  /** Medium: 3-digit numbers (100-999) */
  MEDIUM = 'MEDIUM',

  /** Hard: 4-digit numbers (1000-9999) */
  HARD = 'HARD'
}

/**
 * Enum for arithmetic operation types
 */
export enum OperationType {
  /** Addition operation */
  ADDITION = 'ADDITION',

  /** Subtraction operation */
  SUBTRACTION = 'SUBTRACTION',

  /** Multiplication operation (future feature) */
  MULTIPLICATION = 'MULTIPLICATION',

  /** Division operation (future feature) */
  DIVISION = 'DIVISION'
}

/**
 * Enum for session status
 */
export enum SessionStatus {
  /** Session created but not started */
  CREATED = 'CREATED',

  /** Session currently active */
  ACTIVE = 'ACTIVE',

  /** Session paused by user */
  PAUSED = 'PAUSED',

  /** Session completed successfully */
  COMPLETED = 'COMPLETED',

  /** Session timed out */
  TIMED_OUT = 'TIMED_OUT',

  /** Session cancelled by user */
  CANCELLED = 'CANCELLED'
}
