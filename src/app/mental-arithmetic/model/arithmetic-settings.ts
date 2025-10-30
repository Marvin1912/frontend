import { Difficulty, OperationType } from './arithmetic-enums';

export { Difficulty, OperationType };

/**
 * Interface representing settings for an arithmetic training session
 */
export interface ArithmeticSettings {
  /** Array of selected operation types */
  operations: OperationType[];

  /** Selected difficulty level */
  difficulty: Difficulty;

  /** Number of problems to generate (5-50) */
  problemCount: number;

  /** Optional time limit in minutes (null for unlimited) */
  timeLimit: number | null;

  /** Whether to show immediate feedback after each answer */
  showImmediateFeedback: boolean;

  /** Whether to allow pausing the session */
  allowPause: boolean;

  /** Whether to show a progress indicator */
  showProgress: boolean;

  /** Whether to show the timer */
  showTimer: boolean;

  /** Whether to enable sound effects (future feature) */
  enableSound: boolean;

  /** Whether to use a keypad for input (mobile-friendly) */
  useKeypad: boolean;

  /** Custom session name or description */
  sessionName?: string;

  /** Whether to shuffle problems randomly */
  shuffleProblems: boolean;

  /** Whether to repeat incorrect problems at the end */
  repeatIncorrectProblems: boolean;

  /** Maximum number of retries allowed per problem */
  maxRetries: number;

  /** Whether to show correct answer after incorrect attempts */
  showCorrectAnswer: boolean;

  /** Custom theme or display settings */
  displaySettings?: {
    /** Font size for problems (small, medium, large) */
    fontSize: 'small' | 'medium' | 'large';

    /** Whether to use high contrast mode */
    highContrast: boolean;
  };
}