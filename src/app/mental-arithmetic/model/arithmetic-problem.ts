import { OperationType, Difficulty } from './arithmetic-enums';

export interface ArithmeticProblem {
  id: string;

  expression: string;

  answer: number;

  userAnswer: number | null;

  isCorrect: boolean | null;

  timeSpent: number;

  presentedAt: Date;

  answeredAt: Date | null;

  operationType: OperationType;

  difficulty: Difficulty;

  operand1: number;

  operand2: number;
}