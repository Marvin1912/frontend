import { Injectable } from '@angular/core';
import {ArithmeticProblem} from '../model/arithmetic-problem';
import {Difficulty, OperationType} from '../model/arithmetic-enums';
import {ArithmeticSettings} from '../model/arithmetic-settings';

@Injectable({
  providedIn: 'root'
})
export class ProblemGeneratorService {

  constructor() {}

  generateAdditionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createAdditionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  generateSubtractionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createSubtractionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  generateMixedProblems(settings: ArithmeticSettings, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];
    const operations = settings.operations;

    if (operations.length === 0) {
      return problems;
    }

    for (let i = 0; i < count; i++) {
      // Randomly select an operation from the available operations
      const randomIndex = Math.floor(Math.random() * operations.length);
      const selectedOperation = operations[randomIndex];

      let problem: ArithmeticProblem;
      if (selectedOperation === OperationType.ADDITION) {
        problem = this.createAdditionProblem(settings.difficulty);
      } else if (selectedOperation === OperationType.SUBTRACTION) {
        problem = this.createSubtractionProblem(settings.difficulty);
      } else {
        // Default to addition for safety
        problem = this.createAdditionProblem(settings.difficulty);
      }

      problems.push(problem);
    }

    return problems;
  }

  private createAdditionProblem(difficulty: Difficulty): ArithmeticProblem {
    const num1 = this.generateRandomDigits(difficulty);
    const num2 = this.generateRandomDigits(difficulty);
    const expression = `${num1} + ${num2}`;
    const answer = num1 + num2;

    return {
      id: this.generateProblemId(),
      expression,
      answer,
      userAnswer: null,
      isCorrect: false,
      timeSpent: 0,
      presentedAt: new Date(),
      answeredAt: null,
      operationType: OperationType.ADDITION,
      difficulty,
      operand1: num1,
      operand2: num2
    };
  }

  private createSubtractionProblem(difficulty: Difficulty): ArithmeticProblem {
    const num1 = this.generateRandomDigits(difficulty);
    const num2 = this.generateRandomDigits(difficulty);

    // Ensure positive result by making sure num1 >= num2
    const { minuend, subtrahend } = this.ensurePositiveResult(num1, num2);
    const expression = `${minuend} - ${subtrahend}`;
    const answer = minuend - subtrahend;

    return {
      id: this.generateProblemId(),
      expression,
      answer,
      userAnswer: null,
      isCorrect: false,
      timeSpent: 0,
      presentedAt: new Date(),
      answeredAt: null,
      operationType: OperationType.SUBTRACTION,
      difficulty,
      operand1: minuend,
      operand2: subtrahend
    };
  }

  private generateRandomDigits(difficulty: Difficulty): number {
    let min: number;
    let max: number;

    switch (difficulty) {
      case Difficulty.EASY:
        // 2-digit numbers (10-99)
        min = 10;
        max = 99;
        break;
      case Difficulty.MEDIUM:
        // 3-digit numbers (100-999)
        min = 100;
        max = 999;
        break;
      case Difficulty.HARD:
        // 4-digit numbers (1000-9999)
        min = 1000;
        max = 9999;
        break;
      default:
        // Default to easy
        min = 10;
        max = 99;
        break;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private ensurePositiveResult(num1: number, num2: number): { minuend: number; subtrahend: number } {
    if (num1 >= num2) {
      return { minuend: num1, subtrahend: num2 };
    } else {
      return { minuend: num2, subtrahend: num1 };
    }
  }

  private generateProblemId(): string {
    return `problem_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
