/**
 * Interface representing a single arithmetic problem in a training session
 */
export interface ArithmeticProblem {
  /** Unique identifier for the problem */
  id: string;

  /** The mathematical expression (e.g., "123 + 456") */
  expression: string;

  /** The correct answer to the problem */
  answer: number;

  /** The user's submitted answer (null if not yet answered) */
  userAnswer: number | null;

  /** Whether the user's answer is correct (null if not yet answered) */
  isCorrect: boolean | null;

  /** Time spent on this problem in milliseconds */
  timeSpent: number;

  /** Timestamp when the problem was presented */
  presentedAt: Date;

  /** Timestamp when the problem was answered (null if not yet answered) */
  answeredAt: Date | null;

  /** The operation type for this problem */
  operationType: OperationType;

  /** The difficulty level of this problem */
  difficulty: Difficulty;

  /** The first operand in the expression */
  operand1: number;

  /** The second operand in the expression */
  operand2: number;
}