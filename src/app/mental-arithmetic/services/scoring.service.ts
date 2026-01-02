import { Injectable } from '@angular/core';
import {ArithmeticProblem} from '../model/arithmetic-problem';

@Injectable({
  providedIn: 'root'
})
export class ScoringService {

  constructor() {}

  calculateScore(problems: ArithmeticProblem[]): number {
    return problems.filter(p => p.isCorrect).length;
  }

  calculateAccuracy(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const correctAnswers = answeredProblems.filter(p => p.isCorrect).length;
    return Math.round((correctAnswers / answeredProblems.length) * 100);
  }

  calculateAverageTimePerProblem(problems: ArithmeticProblem[]): number {
    const answeredProblems = problems.filter(p => p.userAnswer !== null);
    if (answeredProblems.length === 0) {
      return 0;
    }

    const totalTime = answeredProblems.reduce((sum, p) => sum + p.timeSpent, 0);
    return Math.round(totalTime / answeredProblems.length);
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

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
