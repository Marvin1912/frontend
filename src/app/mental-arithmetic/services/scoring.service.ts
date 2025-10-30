import { Injectable } from '@angular/core';
import {ArithmeticProblem} from '../model/arithmetic-problem';

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  constructor() {}

  /**
   * Calculate the total score for a set of problems
   * @param problems Array of problems to score
   * @returns Total score (1 point per correct answer)
   */
  calculateScore(problems: ArithmeticProblem[]): number {
    return problems.filter(p => p.isCorrect).length;
  }

  /**
   * Calculate the accuracy percentage for a set of problems
   * @param problems Array of problems to calculate accuracy for
   * @returns Accuracy percentage (0-100)
   */
  calculateAccuracy(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const correctAnswers = answeredProblems.filter(p => p.isCorrect).length;
    return Math.round((correctAnswers / answeredProblems.length) * 100);
  }

  /**
   * Calculate the average time per problem
   * @param problems Array of problems to calculate time for
   * @returns Average time per problem in milliseconds
   */
  calculateAverageTimePerProblem(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const totalTime = answeredProblems.reduce((sum, p) => sum + p.timeSpent, 0);
    return Math.round(totalTime / answeredProblems.length);
  }

  /**
   * Format time in milliseconds to a human-readable format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1:23" or "0:45")
   */
  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format time in milliseconds to a detailed format
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string (e.g., "1m 23s" or "45s")
   */
  formatDetailedTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Calculate performance rating based on accuracy and speed
   * @param problems Array of problems to evaluate
   * @returns Performance rating (Excellent, Good, Average, Poor)
   */
  calculatePerformanceRating(problems: ArithmeticProblem[]): 'Excellent' | 'Good' | 'Average' | 'Poor' {
    const accuracy = this.calculateAccuracy(problems);
    const avgTime = this.calculateAverageTimePerProblem(problems);

    // Performance thresholds (can be adjusted based on requirements)
    const accuracyThreshold = {
      excellent: 90,
      good: 75,
      average: 60
    };

    const timeThreshold = {
      excellent: 5000, // 5 seconds
      good: 10000,     // 10 seconds
      average: 15000   // 15 seconds
    };

    if (accuracy >= accuracyThreshold.excellent && avgTime <= timeThreshold.excellent) {
      return 'Excellent';
    } else if (accuracy >= accuracyThreshold.good && avgTime <= timeThreshold.good) {
      return 'Good';
    } else if (accuracy >= accuracyThreshold.average && avgTime <= timeThreshold.average) {
      return 'Average';
    } else {
      return 'Poor';
    }
  }

  /**
   * Get detailed statistics for a set of problems
   * @param problems Array of problems to analyze
   * @returns Detailed statistics object
   */
  getDetailedStats(problems: ArithmeticProblem[]) {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    const correctProblems = problems.filter(p => p.isCorrect);
    const incorrectProblems = answeredProblems.filter(p => !p.isCorrect);

    return {
      totalProblems: problems.length,
      answeredProblems: answeredProblems.length,
      correctAnswers: correctProblems.length,
      incorrectAnswers: incorrectProblems.length,
      accuracy: this.calculateAccuracy(problems),
      score: this.calculateScore(problems),
      averageTimePerProblem: this.calculateAverageTimePerProblem(problems),
      totalTimeSpent: answeredProblems.reduce((sum, p) => sum + p.timeSpent, 0),
      performanceRating: this.calculatePerformanceRating(problems),
      fastestTime: answeredProblems.length > 0 ? Math.min(...answeredProblems.map(p => p.timeSpent)) : 0,
      slowestTime: answeredProblems.length > 0 ? Math.max(...answeredProblems.map(p => p.timeSpent)) : 0
    };
  }
}
