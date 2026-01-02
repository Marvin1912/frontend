import { Difficulty, OperationType } from './arithmetic-enums';

export { Difficulty, OperationType };

export interface ArithmeticSettings {
  operations: OperationType[];

  difficulty: Difficulty;

  problemCount: number;

  timeLimit: number | null;

  showImmediateFeedback: boolean;

  allowPause: boolean;

  showProgress: boolean;

  showTimer: boolean;

  enableSound: boolean;

  useKeypad: boolean;

  sessionName?: string;

  shuffleProblems: boolean;

  repeatIncorrectProblems: boolean;

  maxRetries: number;

  showCorrectAnswer: boolean;

  displaySettings?: {
    fontSize: 'small' | 'medium' | 'large';

    highContrast: boolean;
  };
}