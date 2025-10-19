import { Injectable } from '@angular/core';
import { ArithmeticProblem, Difficulty, OperationType, ArithmeticSettings } from '../model';

@Injectable({
  providedIn: 'root'
})
export class ProblemGeneratorService {

  constructor() {}

  /**
   * Generate addition problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of addition problems
   */
  generateAdditionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createAdditionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  /**
   * Generate subtraction problems based on difficulty level
   * @param difficulty The difficulty level determining number of digits
   * @param count Number of problems to generate
   * @returns Array of subtraction problems
   */
  generateSubtractionProblems(difficulty: Difficulty, count: number): ArithmeticProblem[] {
    const problems: ArithmeticProblem[] = [];

    for (let i = 0; i < count; i++) {
      const problem = this.createSubtractionProblem(difficulty);
      problems.push(problem);
    }

    return problems;
  }

  /**
   * Generate mixed problems based on settings
   * @param settings The arithmetic settings containing operations and difficulty
   * @param count Number of problems to generate
   * @returns Array of mixed operation problems
   */
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

  /**
   * Create a single addition problem
   * @param difficulty The difficulty level for number generation
   * @returns A single addition problem
   */
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
      timeSpent: 0
    };
  }

  /**
   * Create a single subtraction problem
   * @param difficulty The difficulty level for number generation
   * @returns A single subtraction problem
   */
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
      timeSpent: 0
    };
  }

  /**
   * Generate random numbers based on difficulty level
   * @param difficulty The difficulty level
   * @returns A random number with appropriate number of digits
   */
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

  /**
   * Ensure subtraction results in positive numbers
   * @param num1 First number
   * @param num2 Second number
   * @returns Object with minuend (larger) and subtrahend (smaller)
   */
  private ensurePositiveResult(num1: number, num2: number): { minuend: number; subtrahend: number } {
    if (num1 >= num2) {
      return { minuend: num1, subtrahend: num2 };
    } else {
      return { minuend: num2, subtrahend: num1 };
    }
  }

  /**
   * Generate a unique problem ID
   * @returns A unique identifier for a problem
   */
  private generateProblemId(): string {
    return `problem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}