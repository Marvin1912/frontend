import {Injectable} from '@angular/core';
import {ProblemGeneratorService} from './problem-generator.service';
import {ArithmeticSession} from '../model/arithmetic-session';
import {ArithmeticSettings} from '../model/arithmetic-settings';
import {SessionStatus} from '../model/arithmetic-enums';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {

  constructor(
    private problemGenerator: ProblemGeneratorService
  ) {
  }

  /**
   * Create a new arithmetic session with the given settings
   * @param settings The settings for the session
   * @returns A new arithmetic session
   */
  createSession(settings: ArithmeticSettings): ArithmeticSession {
    const problems = this.problemGenerator.generateMixedProblems(settings, settings.problemCount);
    const sessionId = this.generateSessionId();

    return {
      id: sessionId,
      createdAt: new Date(),
      startTime: null,
      endTime: null,
      status: SessionStatus.ACTIVE,
      settings,
      problems,
      currentProblemIndex: 0,
      score: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      totalTimeSpent: 0,
      problemsCompleted: 0,
      totalProblems: settings.problemCount,
      accuracy: 0,
      averageTimePerProblem: 0,
      isCompleted: false,
      isTimedOut: false
    };
  }

  /**
   * Start a session by setting the start time
   * @param session The session to start
   * @returns The updated session
   */
  startSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      startTime: new Date(),
      status: SessionStatus.ACTIVE
    };
  }

  /**
   * Update a session with new problem results and recalculate statistics
   * @param session The session to update
   * @returns The updated session
   */
  updateSession(session: ArithmeticSession): ArithmeticSession {
    const completedProblems = session.problems.filter(p => p.userAnswer !== null);
    const correctAnswers = completedProblems.filter(p => p.isCorrect);

    // Calculate metrics directly
    const score = correctAnswers.length;
    const accuracy = completedProblems.length > 0 ?
      Math.round((correctAnswers.length / completedProblems.length) * 100) : 0;
    const totalTime = completedProblems.reduce((sum, p) => sum + p.timeSpent, 0);
    const averageTime = completedProblems.length > 0 ?
      Math.round(totalTime / completedProblems.length) : 0;

    const isCompleted = completedProblems.length === session.totalProblems;
    const status = isCompleted ? SessionStatus.COMPLETED : session.status;

    return {
      ...session,
      score,
      correctAnswers: correctAnswers.length,
      incorrectAnswers: completedProblems.length - correctAnswers.length,
      problemsCompleted: completedProblems.length,
      accuracy,
      averageTimePerProblem: averageTime,
      totalTimeSpent: totalTime,
      isCompleted,
      status,
      endTime: isCompleted ? new Date() : null
    };
  }

  /**
   * Complete a session and set the end time
   * @param session The session to complete
   * @returns The completed session
   */
  completeSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      endTime: new Date(),
      status: SessionStatus.COMPLETED,
      isCompleted: true
    };
  }

  /**
   * Pause a session
   * @param session The session to pause
   * @returns The paused session
   */
  pauseSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      status: SessionStatus.PAUSED
    };
  }

  /**
   * Resume a paused session
   * @param session The session to resume
   * @returns The resumed session
   */
  resumeSession(session: ArithmeticSession): ArithmeticSession {
    return {
      ...session,
      status: SessionStatus.ACTIVE
    };
  }

  /**
   * Generate a unique session ID
   * @returns A unique identifier for a session
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}
