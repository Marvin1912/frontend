import { ArithmeticProblem } from './arithmetic-problem';
import { ArithmeticSettings } from './arithmetic-settings';
import { SessionStatus } from './arithmetic-enums';

export interface ArithmeticSession {
  id: string;
  createdAt: Date;
  startTime: Date | null;
  endTime: Date | null;
  status: SessionStatus;
  settings: ArithmeticSettings;
  problems: ArithmeticProblem[];
  currentProblemIndex: number;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  totalTimeSpent: number;
  problemsCompleted: number;
  totalProblems: number;
  accuracy: number;
  averageTimePerProblem: number;
  isCompleted: boolean;
  isTimedOut: boolean;
  notes?: string;
}