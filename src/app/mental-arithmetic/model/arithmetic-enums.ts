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

/**
 * Helper functions for enum operations
 */
export class EnumHelpers {
  /**
   * Gets the display label for a difficulty level
   */
  static getDifficultyLabel(difficulty: Difficulty): string {
    switch (difficulty) {
      case Difficulty.EASY:
        return 'Easy (2-digit)';
      case Difficulty.MEDIUM:
        return 'Medium (3-digit)';
      case Difficulty.HARD:
        return 'Hard (4-digit)';
      default:
        return difficulty;
    }
  }

  /**
   * Gets the display label for an operation type
   */
  static getOperationLabel(operation: OperationType): string {
    switch (operation) {
      case OperationType.ADDITION:
        return 'Addition (+)';
      case OperationType.SUBTRACTION:
        return 'Subtraction (-)';
      case OperationType.MULTIPLICATION:
        return 'Multiplication (×)';
      case OperationType.DIVISION:
        return 'Division (÷)';
      default:
        return operation;
    }
  }

  /**
   * Gets the symbol for an operation type
   */
  static getOperationSymbol(operation: OperationType): string {
    switch (operation) {
      case OperationType.ADDITION:
        return '+';
      case OperationType.SUBTRACTION:
        return '-';
      case OperationType.MULTIPLICATION:
        return '×';
      case OperationType.DIVISION:
        return '÷';
      default:
        return '?';
    }
  }

  /**
   * Gets the digit count for a difficulty level
   */
  static getDigitCount(difficulty: Difficulty): number {
    switch (difficulty) {
      case Difficulty.EASY:
        return 2;
      case Difficulty.MEDIUM:
        return 3;
      case Difficulty.HARD:
        return 4;
      default:
        return 2;
    }
  }

  /**
   * Gets the number range for a difficulty level
   */
  static getNumberRange(difficulty: Difficulty): { min: number; max: number } {
    switch (difficulty) {
      case Difficulty.EASY:
        return { min: 10, max: 99 };
      case Difficulty.MEDIUM:
        return { min: 100, max: 999 };
      case Difficulty.HARD:
        return { min: 1000, max: 9999 };
      default:
        return { min: 10, max: 99 };
    }
  }
}