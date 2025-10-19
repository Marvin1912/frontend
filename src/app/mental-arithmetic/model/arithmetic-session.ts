import { ArithmeticProblem } from './arithmetic-problem';
import { ArithmeticSettings } from './arithmetic-settings';
import { SessionStatus, Difficulty, OperationType } from './arithmetic-enums';

/**
 * Interface representing a complete training session
 */
export interface ArithmeticSession {
  /** Unique identifier for the session */
  id: string;

  /** Timestamp when the session was created */
  createdAt: Date;

  /** Timestamp when the session was started */
  startTime: Date | null;

  /** Timestamp when the session was ended or completed */
  endTime: Date | null;

  /** Current status of the session */
  status: SessionStatus;

  /** The settings used for this session */
  settings: ArithmeticSettings;

  /** Array of all problems in this session */
  problems: ArithmeticProblem[];

  /** Index of the current problem (0-based) */
  currentProblemIndex: number;

  /** Total score achieved in this session */
  score: number;

  /** Number of correct answers */
  correctAnswers: number;

  /** Number of incorrect answers */
  incorrectAnswers: number;

  /** Total time spent on the session in milliseconds */
  totalTimeSpent: number;

  /** Number of problems completed */
  problemsCompleted: number;

  /** Total number of problems in the session */
  totalProblems: number;

  /** Accuracy percentage (0-100) */
  accuracy: number;

  /** Average time per problem in milliseconds */
  averageTimePerProblem: number;

  /** Whether the session was completed (all problems answered) */
  isCompleted: boolean;

  /** Whether the session was timed out */
  isTimedOut: boolean;

  /** Session notes or comments */
  notes?: string;
}